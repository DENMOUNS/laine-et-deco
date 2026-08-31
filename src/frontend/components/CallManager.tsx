import React, { useEffect, useState, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldAlert, Check, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { callService } from '../services/callService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

export const CallManager: React.FC = () => {
  const { user, currentUserDoc, userRole } = useAuthStore();
  const isStaff = ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client'].includes(userRole);

  // États de l'appel
  const [callState, setCallState] = useState<'idle' | 'prompt_name' | 'ringing_out' | 'ringing_in' | 'connected' | 'rejected' | 'ended'>('idle');
  const [callerNameInput, setCallerNameInput] = useState('');
  const [callerName, setCallerName] = useState('');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ id: string; callerName: string; callerId: string } | null>(null);

  // Médias
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Éléments Audio HTML distants (pour entendre l'autre correspondant)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // Timers et Synthèse Audio
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<any>(null);
  const currentHangUpRef = useRef<(() => void) | null>(null);

  // Synthèse de sonneries via Web Audio API (Pas besoin de fichiers externes, fonctionne 100 % hors-ligne)
  const startRingtone = (type: 'incoming' | 'outgoing') => {
    try {
      if (typeof window === 'undefined') return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const playTone = () => {
        if (!audioCtx || audioCtx.state === 'closed') return;
        
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'incoming') {
          // Double carillon luxueux (Do6 et Sol6)
          osc1.frequency.value = 1046.50; // C6
          osc2.frequency.value = 1567.98; // G6
          
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          
          osc1.start();
          osc2.start();
          osc1.stop(audioCtx.currentTime + 1.2);
          osc2.stop(audioCtx.currentTime + 1.2);
        } else {
          // Tonalité de retour d'appel européenne classique (425Hz)
          osc1.frequency.value = 425;
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 1.0);
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
          
          osc1.start();
          osc1.stop(audioCtx.currentTime + 1.5);
        }
      };

      playTone();
      ringIntervalRef.current = setInterval(playTone, type === 'incoming' ? 1800 : 4000);
    } catch (e) {
      console.warn('Web Audio non supporté ou bloqué:', e);
    }
  };

  const stopRingtone = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  // Écouter le signal de début d'appel global (venant du chat ou du header)
  useEffect(() => {
    const handleStartCallSignal = () => {
      if (callState !== 'idle') return;

      if (user) {
        // Utilisateur connecté : lancer l'appel directement
        const name = currentUserDoc?.name || user.displayName || user.email?.split('@')[0] || 'Client Laine & Déco';
        initiateOutgoingCall(name);
      } else {
        toast.error("Veuillez vous connecter pour passer un appel vocal avec notre équipe.");
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    };

    window.addEventListener('app:start-call', handleStartCallSignal);
    return () => window.removeEventListener('app:start-call', handleStartCallSignal);
  }, [callState, user, currentUserDoc]);

  // Écouter les appels entrants (Staff uniquement)
  useEffect(() => {
    if (!isStaff) return;

    const unsubscribe = callService.listenForIncomingCalls(
      (incoming) => {
        // Un nouvel appel arrive et nous ne sommes pas déjà en appel
        if (callState === 'idle') {
          setIncomingCall(incoming);
          setCallState('ringing_in');
          startRingtone('incoming');
        }
      },
      (cancelledCallId) => {
        // L'appelant a raccroché avant qu'on réponde
        if (incomingCall && incomingCall.id === cancelledCallId) {
          stopRingtone();
          setCallState('ended');
          setIncomingCall(null);
          toast.info('L\'appelant a raccroché.');
          setTimeout(() => setCallState('idle'), 3000);
        }
      }
    );

    return () => unsubscribe();
  }, [isStaff, callState, incomingCall]);

  // Gérer le minuteur d'appel
  useEffect(() => {
    if (callState === 'connected') {
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  // Gérer le flux audio distant
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => console.warn('Lecture audio distante bloquée:', err));
    }
  }, [remoteStream]);

  // Formater la durée en MM:SS
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Lancer l'appel (Client)
  const initiateOutgoingCall = async (nameToUse: string) => {
    setCallerName(nameToUse);
    setCallState('ringing_out');
    startRingtone('outgoing');

    const uid = user?.uid || `anon-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const { callId, hangUp } = await callService.startCall(
        uid,
        nameToUse,
        (stream) => {
          stopRingtone();
          setRemoteStream(stream);
        },
        (status) => {
          if (status === 'connected') {
            stopRingtone();
            setCallState('connected');
          } else if (status === 'rejected') {
            stopRingtone();
            setCallState('rejected');
            toast.error('L\'équipe Laine & Déco n\'est pas disponible pour le moment.');
            setTimeout(() => setCallState('idle'), 3000);
          } else if (status === 'ended') {
            stopRingtone();
            setCallState('ended');
            setTimeout(() => setCallState('idle'), 3000);
          }
        },
        (stream) => setLocalStream(stream)
      );

      setActiveCallId(callId);
      currentHangUpRef.current = hangUp;
    } catch (err: any) {
      stopRingtone();
      setCallState('idle');
      toast.error(err.message || 'Une erreur est survenue lors de l\'établissement de l\'appel.');
    }
  };

  // Répondre à l'appel (Staff / Admin)
  const handleAnswerCall = async () => {
    if (!incomingCall) return;
    stopRingtone();

    try {
      const { hangUp } = await callService.answerCall(
        incomingCall.id,
        (stream) => setRemoteStream(stream),
        (status) => {
          if (status === 'connected') {
            setCallState('connected');
          } else if (status === 'ended') {
            setCallState('ended');
            setTimeout(() => setCallState('idle'), 3000);
          }
        },
        (stream) => setLocalStream(stream)
      );

      setActiveCallId(incomingCall.id);
      currentHangUpRef.current = hangUp;
    } catch (err: any) {
      setCallState('idle');
      toast.error(err.message || 'Erreur lors de la prise de l\'appel.');
    }
  };

  // Refuser l'appel (Staff)
  const handleRejectCall = async () => {
    if (!incomingCall) return;
    stopRingtone();
    await callService.rejectCall(incomingCall.id);
    setCallState('idle');
    setIncomingCall(null);
  };

  // Raccrocher
  const handleHangUp = () => {
    stopRingtone();
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

  // Activer/Désactiver le Micro
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      {/* Élément audio invisible pour restituer le flux de voix distant */}
      <audio ref={remoteAudioRef} className="hidden" autoPlay playsInline />

      <AnimatePresence>
        {callState !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/80 backdrop-blur-md z-[150] flex items-center justify-center p-4"
          >
            {/* Boîte de dialogue ou module d'appel */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-sm p-6 text-center text-stone-100 shadow-2xl relative overflow-hidden"
            >
              {/* Effet lumineux décoratif premium (Laine & Déco chaleureux) */}
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* ÉTAPE : Saisir son nom */}
              {callState === 'prompt_name' && (
                <div className="space-y-6 py-4">
                  <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Phone size={28} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Appel Vocal Direct</h3>
                    <p className="text-stone-400 text-xs mt-1.5 px-4 leading-relaxed">
                      Échangez gratuitement et en direct avec Landry ou un conseiller de l'équipe pour vos questions de tricot et commandes.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Votre prénom ou nom"
                      value={callerNameInput}
                      onChange={(e) => setCallerNameInput(e.target.value)}
                      className="w-full bg-stone-850 border border-stone-750 rounded-2xl py-3 px-4 text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-white"
                      maxLength={30}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCallState('idle')}
                        className="flex-1 bg-stone-800 hover:bg-stone-750 text-stone-300 font-semibold py-3 rounded-2xl text-xs transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        disabled={!callerNameInput.trim()}
                        onClick={() => initiateOutgoingCall(callerNameInput.trim())}
                        className="flex-1 bg-accent hover:bg-accent-dark disabled:bg-stone-800 disabled:text-stone-500 text-white font-semibold py-3 rounded-2xl text-xs transition-colors shadow-md shadow-accent/20"
                      >
                        Appeler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE : Appel sortant (Ringing Out) */}
              {callState === 'ringing_out' && (
                <div className="space-y-8 py-6">
                  <div className="relative flex justify-center">
                    {/* Cercles de pulsation animés */}
                    <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-accent/20 opacity-75"></span>
                    <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-accent/5 opacity-50"></span>
                    <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center relative shadow-lg">
                      <Phone className="animate-bounce" size={32} />
                    </div>
                  </div>
                  <div>
                    <p className="text-accent text-xs font-bold uppercase tracking-widest animate-pulse">Appel en cours...</p>
                    <h3 className="font-serif text-2xl font-bold mt-2">Laine & Déco</h3>
                    <p className="text-stone-400 text-xs mt-1">Sourcing & Conseil à Douala</p>
                  </div>
                  <button
                    onClick={handleHangUp}
                    className="mx-auto w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                    aria-label="Raccrocher"
                  >
                    <PhoneOff size={24} />
                  </button>
                </div>
              )}

              {/* ÉTAPE : Appel entrant (Ringing In) */}
              {callState === 'ringing_in' && incomingCall && (
                <div className="space-y-8 py-6">
                  <div className="relative flex justify-center">
                    <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-emerald-500/20 opacity-75"></span>
                    <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-emerald-500/5 opacity-50"></span>
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center relative shadow-lg">
                      <Phone size={32} className="animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest animate-pulse">Appel Vocal Entrant</p>
                    <h3 className="font-serif text-2xl font-bold mt-2">{incomingCall.callerName}</h3>
                    <p className="text-stone-400 text-xs mt-1">Conseil client en ligne</p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleRejectCall}
                      className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Refuser l'appel"
                    >
                      <X size={24} />
                    </button>
                    <button
                      onClick={handleAnswerCall}
                      className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Décrocher"
                    >
                      <Check size={24} />
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE : Connecté (Connected) */}
              {callState === 'connected' && (
                <div className="space-y-8 py-6">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 bg-stone-800 border-2 border-accent/20 rounded-full flex items-center justify-center relative shadow-inner overflow-hidden">
                      {/* Vagues sonores animées */}
                      <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
                        <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_100ms] h-10"></span>
                        <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_200ms] h-14"></span>
                        <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_300ms] h-8"></span>
                        <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_400ms] h-12"></span>
                      </div>
                      <Phone className="text-accent" size={32} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs">
                      <Clock size={13} />
                      <span>{formatDuration(duration)}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold mt-1.5">
                      {isStaff ? (incomingCall?.callerName || 'Client') : 'Laine & Déco'}
                    </h3>
                    <p className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold mt-1">Connexion Directe Établie</p>
                  </div>
                  <div className="flex justify-center items-center gap-6">
                    {/* Sourdine */}
                    <button
                      onClick={toggleMute}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                        isMuted ? 'bg-red-500/25 text-red-400 border border-red-500/50' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
                      }`}
                      title={isMuted ? 'Activer le micro' : 'Couper le micro'}
                    >
                      {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    {/* Raccrocher */}
                    <button
                      onClick={handleHangUp}
                      className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                      title="Raccrocher"
                    >
                      <PhoneOff size={24} />
                    </button>

                    {/* Haut-parleur simulé */}
                    <button
                      onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
                        !isSpeakerOn ? 'bg-stone-850/50 text-stone-500' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
                      }`}
                      title="Haut-parleur"
                    >
                      {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE : Rejeté (Rejected) */}
              {callState === 'rejected' && (
                <div className="space-y-6 py-6 text-red-400">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert size={32} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Ligne Occupée</h3>
                    <p className="text-stone-400 text-xs mt-1.5">L'équipe n'est pas disponible pour le moment.</p>
                  </div>
                </div>
              )}

              {/* ÉTAPE : Terminé (Ended) */}
              {callState === 'ended' && (
                <div className="space-y-6 py-6 text-stone-400 animate-pulse">
                  <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto">
                    <PhoneOff size={28} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">Appel Terminé</h3>
                    <p className="text-stone-500 text-xs mt-1.5">Merci de votre échange avec Laine & Déco.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
