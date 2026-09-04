import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { initFirebase } from '../../backend/firebase';

const configuration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

async function safeSetDoc(docRef: any, data: any) {
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    console.warn('[callService] safeSetDoc error ignored:', err);
  }
}

export interface CallSession {
  id: string;
  callerId: string;
  callerName: string;
  status: 'ringing' | 'connected' | 'rejected' | 'ended';
  createdAt: any;
  offer?: any;
  answer?: any;
}

/**
 * Service pour gérer les appels voix WebRTC avec signalement Firestore.
 * Optimisé pour la rapidité (<1s) et la stabilité audio sur tous types de réseau.
 */
export const callService = {
  /**
   * Initialise et commence un appel vocal (Côté Client / Acheteur).
   */
  async startCall(
    callerId: string,
    callerName: string,
    onRemoteStream: (stream: MediaStream) => void,
    onStateChange: (state: 'ringing' | 'connected' | 'rejected' | 'ended') => void,
    onLocalStream: (stream: MediaStream) => void
  ): Promise<{ callId: string; hangUp: () => void }> {
    const { db } = initFirebase();
    if (!db) throw new Error('Firebase non initialisé');

    // 1. Obtenir le flux audio local
    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      onLocalStream(localStream);
    } catch (err) {
      console.error('Impossible d\'accéder au microphone:', err);
      throw new Error('Microphone inaccessible. Veuillez autoriser l\'accès pour appeler.');
    }

    const peerConnection = new RTCPeerConnection(configuration);

    // Ajouter les pistes audio au PeerConnection
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Recevoir le flux audio distant
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    const callRef = doc(collection(db, 'calls'));
    const callId = callRef.id;

    const callerCandidatesCollection = collection(db, `calls/${callId}/callerCandidates`);
    const calleeCandidatesCollection = collection(db, `calls/${callId}/calleeCandidates`);

    // Collecter les candidats ICE locaux et les envoyer à Firestore
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(callerCandidatesCollection, event.candidate.toJSON()).catch((err) =>
          console.warn('Erreur envoi candidat ICE:', err)
        );
      }
    };

    // Créer l'offre WebRTC
    const offerDescription = await peerConnection.createOffer({ offerToReceiveAudio: true });
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type
    };

    // Enregistrer le document d'appel dans Firestore avec l'offre
    await setDoc(callRef, {
      callerId,
      callerName,
      status: 'ringing',
      createdAt: serverTimestamp(),
      offer
    });

    onStateChange('ringing');

    // File d'attente pour les candidats de l'admin
    const pendingCalleeCandidates: RTCIceCandidate[] = [];

    // Écouter les candidats de l'admin
    const unsubscribeCalleeCandidates = onSnapshot(
      calleeCandidatesCollection,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            if (peerConnection.remoteDescription) {
              peerConnection.addIceCandidate(candidate).catch((err) =>
                console.warn('Erreur ajout candidat ICE distant:', err)
              );
            } else {
              pendingCalleeCandidates.push(candidate);
            }
          }
        });
      },
      (err) => {
        console.warn('[callService] Callee candidates listener note:', err);
      }
    );

    // Écouter le document d'appel pour la réponse de l'admin
    const unsubscribeCall = onSnapshot(
      callRef,
      async (snapshot) => {
        const data = snapshot.data();
        if (!data) return;

        if (data.status === 'rejected') {
          onStateChange('rejected');
          cleanup();
        } else if (data.status === 'ended') {
          onStateChange('ended');
          cleanup();
        } else if (data.status === 'connected' && data.answer && !peerConnection.currentRemoteDescription) {
          const answerDescription = new RTCSessionDescription(data.answer);
          await peerConnection.setRemoteDescription(answerDescription);

          // Appliquer les candidats en attente
          pendingCalleeCandidates.forEach((cand) => {
            peerConnection.addIceCandidate(cand).catch((err) =>
              console.warn('Erreur ajout candidat ICE différé:', err)
            );
          });
          pendingCalleeCandidates.length = 0;

          onStateChange('connected');
        }
      },
      (err) => {
        console.warn('[callService] Call document listener note:', err);
      }
    );

    const cleanup = () => {
      unsubscribeCall();
      unsubscribeCalleeCandidates();

      localStream.getTracks().forEach((track) => track.stop());
      peerConnection.close();
    };

    const hangUp = () => {
      cleanup();
      safeSetDoc(callRef, { status: 'ended' })
        .then(() => deleteDoc(callRef).catch(() => {}))
        .catch(() => {});
    };

    return { callId, hangUp };
  },

  /**
   * Écoute en continu les appels entrants pour les administrateurs (Côté Admin).
   */
  listenForIncomingCalls(
    currentAdminUid: string,
    onIncomingCall: (call: { id: string; callerName: string; callerId: string; offer?: any }) => void,
    onCallAnsweredByOther: (callId: string, answeredBy?: { uid?: string; name?: string }) => void,
    onCallCancelled: (callId: string) => void
  ): () => void {
    const { db } = initFirebase();
    if (!db) return () => {};

    const callsCollection = collection(db, 'calls');

    return onSnapshot(callsCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        const docId = change.doc.id;

        // Ignorer les appels périmés (> 3 minutes)
        if (data?.createdAt) {
          const createdAtMs = data.createdAt.toMillis ? data.createdAt.toMillis() : Date.now();
          if (Date.now() - createdAtMs > 180000) return;
        }

        if (change.type === 'added' || change.type === 'modified') {
          if (data && data.status === 'ringing') {
            onIncomingCall({
              id: docId,
              callerName: data.callerName || 'Client',
              callerId: data.callerId || '',
              offer: data.offer
            });
          } else if (data && data.status === 'connected') {
            if (data.answeredBy?.uid && currentAdminUid && data.answeredBy.uid === currentAdminUid) {
              return;
            }
            onCallAnsweredByOther(docId, data.answeredBy);
          } else if (data && (data.status === 'ended' || data.status === 'rejected')) {
            onCallCancelled(docId);
          }
        } else if (change.type === 'removed') {
          onCallCancelled(docId);
        }
      });
    }, (err) => {
      console.warn('[callService] Error listening for calls:', err);
    });
  },

  /**
   * Répond à un appel entrant (Côté Admin).
   */
  async answerCall(
    callId: string,
    adminName: string,
    adminUid: string,
    cachedOffer: any | undefined,
    onRemoteStream: (stream: MediaStream) => void,
    onStateChange: (state: 'connected' | 'ended') => void,
    onLocalStream: (stream: MediaStream) => void
  ): Promise<{ hangUp: () => void }> {
    const { db } = initFirebase();
    if (!db) throw new Error('Firebase non initialisé');

    const callRef = doc(db, 'calls', callId);

    // Récupérer l'offre SDP
    let offer = cachedOffer;
    if (!offer) {
      const snap = await getDoc(callRef);
      if (snap.exists()) {
        offer = snap.data()?.offer;
      }
    }

    if (!offer) {
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 200));
        const snap = await getDoc(callRef);
        if (snap.exists() && snap.data()?.offer) {
          offer = snap.data()?.offer;
          break;
        }
      }
    }

    if (!offer) {
      throw new Error('Cet appel n\'existe plus ou l\'offre initiale a expiré.');
    }

    // Obtenir le flux audio local de l'admin
    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      onLocalStream(localStream);
    } catch (err) {
      console.error('Microphone inaccessible:', err);
      safeSetDoc(callRef, { status: 'ended' });
      throw new Error('Microphone inaccessible. Veuillez autoriser l\'accès.');
    }

    const peerConnection = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    const callerCandidatesCollection = collection(db, `calls/${callId}/callerCandidates`);
    const calleeCandidatesCollection = collection(db, `calls/${callId}/calleeCandidates`);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(calleeCandidatesCollection, event.candidate.toJSON()).catch((err) =>
          console.warn('Erreur envoi candidat ICE admin:', err)
        );
      }
    };

    const pendingCallerCandidates: RTCIceCandidate[] = [];

    const unsubscribeCallerCandidates = onSnapshot(
      callerCandidatesCollection,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            if (peerConnection.remoteDescription) {
              peerConnection.addIceCandidate(candidate).catch((err) =>
                console.warn('Erreur ajout candidat ICE distant:', err)
              );
            } else {
              pendingCallerCandidates.push(candidate);
            }
          }
        });
      },
      (err) => {
        console.warn('[callService] Caller candidates listener note:', err);
      }
    );

    // Définir l'offre distante
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // Vider les candidats du caller en attente
    pendingCallerCandidates.forEach((cand) => {
      peerConnection.addIceCandidate(cand).catch((err) =>
        console.warn('Erreur ajout candidat ICE différé admin:', err)
      );
    });
    pendingCallerCandidates.length = 0;

    // Créer la réponse WebRTC
    const answerDescription = await peerConnection.createAnswer({ offerToReceiveAudio: true });
    await peerConnection.setLocalDescription(answerDescription);

    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type
    };

    // Mettre à jour la session dans Firestore avec la réponse SDP et le statut connecté
    await safeSetDoc(callRef, {
      answer,
      status: 'connected',
      answeredBy: {
        uid: adminUid || '',
        name: adminName || 'Conseiller Laine & Déco'
      }
    });

    onStateChange('connected');

    const unsubscribeCall = onSnapshot(
      callRef,
      (snapshot) => {
        const data = snapshot.data();
        if (!data || data.status === 'ended' || data.status === 'rejected') {
          onStateChange('ended');
          cleanup();
        }
      },
      (err) => {
        console.warn('[callService] Incoming call document listener note:', err);
      }
    );

    const cleanup = () => {
      unsubscribeCall();
      unsubscribeCallerCandidates();

      localStream.getTracks().forEach((track) => track.stop());
      peerConnection.close();
    };

    const hangUp = () => {
      cleanup();
      safeSetDoc(callRef, { status: 'ended' })
        .then(() => deleteDoc(callRef).catch(() => {}))
        .catch(() => {});
    };

    return { hangUp };
  },

  /**
   * Refuse un appel entrant (Côté Admin).
   */
  async rejectCall(callId: string): Promise<void> {
    const { db } = initFirebase();
    if (!db) return;
    const callRef = doc(db, 'calls', callId);
    await safeSetDoc(callRef, { status: 'rejected' });
    setTimeout(() => {
      deleteDoc(callRef).catch(() => {});
    }, 1500);
  }
};
