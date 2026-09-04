import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { callService } from '../services/callService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { callAudio } from './call/callAudio';
import { CallPromptNameDialog } from './call/CallPromptNameDialog';
import { CallRingingOutDialog } from './call/CallRingingOutDialog';
import { CallRingingInDialog } from './call/CallRingingInDialog';
import { CallConnectedDialog } from './call/CallConnectedDialog';
import { CallStatusFeedbackDialog } from './call/CallStatusFeedbackDialog';

export const CallManager: React.FC = () => {
  const { user, currentUserDoc, userRole } = useAuthStore();
  const staffRoles = ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client'];
  const isStaff = Boolean(
    user && (
      staffRoles.includes(userRole) ||
      staffRoles.includes(currentUserDoc?.role) ||
      user.email === 'landrymoutongo97@gmail.com'
    )
  );

  // Call states
  const [callState, setCallState] = useState<'idle' | 'prompt_name' | 'ringing_out' | 'ringing_in' | 'connected' | 'rejected' | 'ended'>('idle');
  const [callerNameInput, setCallerNameInput] = useState('');
  const [callerName, setCallerName] = useState('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ id: string; callerName: string; callerId: string; offer?: any } | null>(null);

  // Refs to preserve fresh state in subscriptions
  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  const incomingCallRef = useRef(incomingCall);
  incomingCallRef.current = incomingCall;

  const isAnsweringRef = useRef(false);

  // Streams & controls
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Remote HTML Audio element
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Timer & teardown
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<any>(null);
  const currentHangUpRef = useRef<(() => void) | null>(null);

  // Handle global call start events
  useEffect(() => {
    const handleStartCallSignal = () => {
      if (callState !== 'idle') return;

      if (user) {
        const name = currentUserDoc?.name || user.displayName || user.email?.split('@')[0] || 'Client Laine & Déco';
        initiateOutgoingCall(name);
      } else {
        toast.error("Veuillez vous connecter pour passer un appel vocal avec notre équipe.");
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };

    const handleStartCallToUserSignal = (e: CustomEvent) => {
      if (callState !== 'idle') return;
      const { targetUserName } = e.detail || {};
      const nameToUse = targetUserName ? `Client (${targetUserName})` : 'Client';
      initiateOutgoingCall(nameToUse);
    };

    window.addEventListener('app:start-call', handleStartCallSignal);
    window.addEventListener('app:start-call-to-user', handleStartCallToUserSignal as any);
    return () => {
      window.removeEventListener('app:start-call', handleStartCallSignal);
      window.removeEventListener('app:start-call-to-user', handleStartCallToUserSignal as any);
    };
  }, [callState, user, currentUserDoc]);

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Listen for incoming calls (staff only)
  useEffect(() => {
    if (!user || !isStaff) return;

    const currentUid = user.uid;

    const unsubscribe = callService.listenForIncomingCalls(
      currentUid,
      (incoming) => {
        if (callStateRef.current === 'idle') {
          setIncomingCall(incoming);
          setCallState('ringing_in');
          callAudio.startRingtone('incoming');

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              const notif = new Notification("📞 APPEL VOCAL ENTRANT - Laine & Déco", {
                body: `${incoming.callerName || 'Un correspondant'} vous appelle ! Cliquez pour répondre.`,
                icon: '/favicon.ico',
                requireInteraction: true
              });
              notif.onclick = () => {
                window.focus();
                notif.close();
              };
            } catch (err) {
              console.warn("Notification error:", err);
            }
          }
        }
      },
      (callId, answeredBy) => {
        if (callStateRef.current === 'ringing_in' && incomingCallRef.current?.id === callId) {
          callAudio.stopRingtone();
          setCallState('idle');
          setIncomingCall(null);
          toast.info(`Appel pris en charge par ${answeredBy?.name || 'un autre conseiller'}`);
        }
      },
      (callId) => {
        if (callStateRef.current === 'ringing_in' && incomingCallRef.current?.id === callId) {
          callAudio.stopRingtone();
          setCallState('idle');
          setIncomingCall(null);
        }
      }
    );

    return () => unsubscribe();
  }, [user, isStaff]);

  // Handle peer hangup or cancellation in Firestore
  useEffect(() => {
    if (!activeCallId && !incomingCall?.id) return;
    const callDocId = activeCallId || incomingCall?.id;
    if (!callDocId || !db) return;

    const callRef = doc(db, 'calls', callDocId);
    const unsub = onSnapshot(
      callRef,
      (snapshot) => {
        const data = snapshot.data();
        if (!data) return;

        if (data.status === 'rejected' && callStateRef.current === 'ringing_out') {
          callAudio.stopRingtone();
          setCallState('rejected');
          setTimeout(() => setCallState('idle'), 3000);
        } else if (data.status === 'ended' && callStateRef.current !== 'idle' && callStateRef.current !== 'ended') {
          callAudio.stopRingtone();
          setCallState('ended');
          setLocalStream(null);
          setRemoteStream(null);
          setActiveCallId(null);
          setIncomingCall(null);
          setTimeout(() => setCallState('idle'), 3000);
        }
      },
      (error) => {
        console.warn('[CallManager] Call status listener error:', error);
      }
    );

    return () => unsub();
  }, [activeCallId, incomingCall?.id]);

  // Audio stream assignment
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((e) => {
        console.warn("[CallManager] Lecture audio distant bloquée:", e);
      });
    }
  }, [remoteStream]);

  // Call duration counter
  useEffect(() => {
    if (callState === 'connected') {
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callState]);

  // Screen Wake Lock
  useEffect(() => {
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && callState !== 'idle') {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn('[CallManager] Wake Lock non accordé ou non supporté:', err);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockSentinel) {
        try {
          await wakeLockSentinel.release();
        } catch (_) {}
        wakeLockSentinel = null;
      }
    };

    if (callState !== 'idle') {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && callState !== 'idle') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [callState]);

  // Start outgoing call
  const initiateOutgoingCall = async (nameToUse: string) => {
    setCallerName(nameToUse);
    setCallState('ringing_out');
    callAudio.startRingtone('outgoing');

    const uid = user?.uid || `anon-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const { callId, hangUp } = await callService.startCall(
        uid,
        nameToUse,
        (stream) => {
          callAudio.stopRingtone();
          setRemoteStream(stream);
        },
        (status) => {
          if (status === 'connected') {
            callAudio.stopRingtone();
            setCallState('connected');
          } else if (status === 'rejected') {
            callAudio.stopRingtone();
            setCallState('rejected');
            toast.error("L'équipe Laine & Déco n'est pas disponible pour le moment.");
            setTimeout(() => setCallState('idle'), 3000);
          } else if (status === 'ended') {
            callAudio.stopRingtone();
            setCallState('ended');
            setTimeout(() => setCallState('idle'), 3000);
          }
        },
        (stream) => setLocalStream(stream)
      );

      setActiveCallId(callId);
      currentHangUpRef.current = hangUp;
    } catch (err: any) {
      callAudio.stopRingtone();
      setCallState('idle');
      toast.error(err.message || "Une erreur est survenue lors de l'établissement de l'appel.");
    }
  };

  // Answer call
  const handleAnswerCall = async () => {
    if (!incomingCall) return;
    isAnsweringRef.current = true;
    callAudio.stopRingtone();

    const adminName = currentUserDoc?.name || user?.displayName || user?.email?.split('@')[0] || 'Conseiller Laine & Déco';
    const adminUid = user?.uid || '';

    try {
      const { hangUp } = await callService.answerCall(
        incomingCall.id,
        adminName,
        adminUid,
        incomingCall.offer,
        (stream) => setRemoteStream(stream),
        (status) => {
          if (status === 'connected') {
            setCallState('connected');
            isAnsweringRef.current = false;
          } else if (status === 'ended') {
            setCallState('ended');
            isAnsweringRef.current = false;
            setTimeout(() => setCallState('idle'), 3000);
          }
        },
        (stream) => setLocalStream(stream)
      );

      setActiveCallId(incomingCall.id);
      currentHangUpRef.current = hangUp;
    } catch (err: any) {
      isAnsweringRef.current = false;
      callAudio.stopRingtone();
      setCallState('idle');
      setIncomingCall(null);
      toast.error(err.message || "Erreur lors de la prise de l'appel.");
    }
  };

  // Reject call
  const handleRejectCall = async () => {
    if (!incomingCall) return;
    callAudio.stopRingtone();
    await callService.rejectCall(incomingCall.id);
    setCallState('idle');
    setIncomingCall(null);
  };

  // Hang up
  const handleHangUp = () => {
    callAudio.stopRingtone();
    if (currentHangUpRef.current) {
      currentHangUpRef.current();
      currentHangUpRef.current = null;
    }
    setCallState('ended');
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCallId(null);
    setIncomingCall(null);
    setTimeout(() => setCallState('idle'), 3000);
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const displayName = isStaff ? (incomingCall?.callerName || 'Client') : 'Laine & Déco';

  return (
    <>
      {/* Invisible remote audio output element */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline 
        style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1, opacity: 0.01, pointerEvents: 'none' }} 
      />

      <AnimatePresence>
        {callState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm p-6 text-center text-stone-100 shadow-2xl relative overflow-hidden"
            >
              {/* Warm decorative ambient glow */}
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {callState === 'prompt_name' && (
                <CallPromptNameDialog
                  callerNameInput={callerNameInput}
                  onCallerNameChange={setCallerNameInput}
                  onCancel={() => setCallState('idle')}
                  onInitiateCall={(name) => initiateOutgoingCall(name)}
                />
              )}

              {callState === 'ringing_out' && (
                <CallRingingOutDialog onHangUp={handleHangUp} />
              )}

              {callState === 'ringing_in' && incomingCall && (
                <CallRingingInDialog
                  incomingCall={incomingCall}
                  onRejectCall={handleRejectCall}
                  onAnswerCall={handleAnswerCall}
                />
              )}

              {callState === 'connected' && (
                <CallConnectedDialog
                  displayName={displayName}
                  duration={duration}
                  isMuted={isMuted}
                  isSpeakerOn={isSpeakerOn}
                  onToggleMute={toggleMute}
                  onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
                  onHangUp={handleHangUp}
                />
              )}

              {(callState === 'rejected' || callState === 'ended') && (
                <CallStatusFeedbackDialog status={callState} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CallManager;
