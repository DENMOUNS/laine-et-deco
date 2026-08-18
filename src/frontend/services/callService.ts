import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where 
} from 'firebase/firestore';
import { initFirebase } from '../../backend/firebase';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

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
 * Conçu spécifiquement pour être gratuit et autonome sur le forfait Firebase Spark.
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
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      onLocalStream(localStream);
    } catch (err) {
      console.error('Impossible d\'accéder au microphone:', err);
      throw new Error('Microphone inaccessible. Veuillez autoriser l\'accès pour appeler.');
    }

    const peerConnection = new RTCPeerConnection(configuration);

    // Ajouter le flux local à la connexion
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Écouter le flux distant
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    // Créer une session d'appel dans Firestore
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

    // Créer l'offre WebRTC (SDP)
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type
    };

    // Enregistrer l'offre dans Firestore
    await setDoc(callRef, {
      callerId,
      callerName,
      status: 'ringing',
      createdAt: serverTimestamp(),
      offer
    });

    onStateChange('ringing');

    // Écouter les changements d'état de l'appel (réponse de l'admin)
    const unsubscribeCall = onSnapshot(callRef, async (snapshot) => {
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
        onStateChange('connected');
      }
    });

    // Écouter les candidats ICE de l'admin (callee)
    const unsubscribeCalleeCandidates = onSnapshot(calleeCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate).catch((err) =>
            console.warn('Erreur ajout candidat ICE distant:', err)
          );
        }
      });
    });

    const cleanup = () => {
      unsubscribeCall();
      unsubscribeCalleeCandidates();

      // Arrêter le micro local
      localStream.getTracks().forEach((track) => track.stop());

      // Fermer la connexion WebRTC
      peerConnection.close();
    };

    const hangUp = () => {
      cleanup();
      // Mettre à jour Firestore
      updateDoc(callRef, { status: 'ended' })
        .then(() => deleteDoc(callRef))
        .catch(() => {});
    };

    return { callId, hangUp };
  },

  /**
   * Écoute en continu les appels entrants pour les administrateurs (Côté Admin).
   */
  listenForIncomingCalls(
    onIncomingCall: (call: { id: string; callerName: string; callerId: string }) => void,
    onCallCancelled: (callId: string) => void
  ): () => void {
    const { db } = initFirebase();
    if (!db) return () => {};

    const callsCollection = collection(db, 'calls');
    const q = query(callsCollection, where('status', '==', 'ringing'));

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          if (data) {
            onIncomingCall({
              id: change.doc.id,
              callerName: data.callerName,
              callerId: data.callerId
            });
          }
        } else if (change.type === 'removed' || change.type === 'modified') {
          const data = change.doc.data();
          if (data && (data.status === 'ended' || data.status === 'rejected' || change.type === 'removed')) {
            onCallCancelled(change.doc.id);
          }
        }
      });
    });
  },

  /**
   * Répond à un appel entrant (Côté Admin).
   */
  async answerCall(
    callId: string,
    onRemoteStream: (stream: MediaStream) => void,
    onStateChange: (state: 'connected' | 'ended') => void,
    onLocalStream: (stream: MediaStream) => void
  ): Promise<{ hangUp: () => void }> {
    const { db } = initFirebase();
    if (!db) throw new Error('Firebase non initialisé');

    // 1. Obtenir le flux audio local
    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      onLocalStream(localStream);
    } catch (err) {
      console.error('Microphone inaccessible:', err);
      throw new Error('Microphone inaccessible. Veuillez autoriser l\'accès.');
    }

    const peerConnection = new RTCPeerConnection(configuration);

    // Ajouter le flux local à la connexion
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    // Écouter le flux distant
    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    const callRef = doc(db, 'calls', callId);
    const callerCandidatesCollection = collection(db, `calls/${callId}/callerCandidates`);
    const calleeCandidatesCollection = collection(db, `calls/${callId}/calleeCandidates`);

    // Collecter les candidats ICE locaux (admin) et les envoyer à Firestore
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(calleeCandidatesCollection, event.candidate.toJSON()).catch((err) =>
          console.warn('Erreur envoi candidat ICE admin:', err)
        );
      }
    };

    // Lire l'offre du client
    const response = await fetch(`/api/entity/calls/${callId}`);
    let offer;
    if (response.ok) {
      const docData = await response.json().catch(() => null);
      if (docData?.offer) {
        offer = docData.offer;
      }
    }

    if (!offer) {
      // Fallback direct sur Firestore si l'API est absente ou lente
      const { getDoc } = await import('firebase/firestore');
      const snap = await getDoc(callRef);
      offer = snap.data()?.offer;
    }

    if (!offer) {
      localStream.getTracks().forEach((track) => track.stop());
      peerConnection.close();
      throw new Error('Offre de connexion introuvable.');
    }

    // Appliquer l'offre distante
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // Créer la réponse WebRTC
    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    const answer = {
      sdp: answerDescription.sdp,
      type: answerDescription.type
    };

    // Mettre à jour la session dans Firestore comme connectée avec notre réponse
    await updateDoc(callRef, {
      answer,
      status: 'connected'
    });

    onStateChange('connected');

    // Écouter les changements de la session (si le client raccroche)
    const unsubscribeCall = onSnapshot(callRef, (snapshot) => {
      const data = snapshot.data();
      if (!data || data.status === 'ended' || data.status === 'rejected') {
        onStateChange('ended');
        cleanup();
      }
    });

    // Écouter les candidats ICE du client (caller)
    const unsubscribeCallerCandidates = onSnapshot(callerCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate).catch((err) =>
            console.warn('Erreur ajout candidat ICE distant:', err)
          );
        }
      });
    });

    const cleanup = () => {
      unsubscribeCall();
      unsubscribeCallerCandidates();

      // Arrêter le micro local
      localStream.getTracks().forEach((track) => track.stop());

      // Fermer la connexion
      peerConnection.close();
    };

    const hangUp = () => {
      cleanup();
      // Marquer fin d'appel
      updateDoc(callRef, { status: 'ended' })
        .then(() => deleteDoc(callRef))
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
    await updateDoc(callRef, { status: 'rejected' });
    // Supprimer après un léger délai pour que le client reçoive l'état rejeté
    setTimeout(() => {
      deleteDoc(callRef).catch(() => {});
    }, 1500);
  }
};
