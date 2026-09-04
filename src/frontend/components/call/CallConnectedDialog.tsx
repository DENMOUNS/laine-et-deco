import React from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Clock } from 'lucide-react';

interface CallConnectedDialogProps {
  displayName: string;
  duration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleSpeaker: () => void;
  onHangUp: () => void;
}

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const CallConnectedDialog: React.FC<CallConnectedDialogProps> = ({
  displayName,
  duration,
  isMuted,
  isSpeakerOn,
  onToggleMute,
  onToggleSpeaker,
  onHangUp,
}) => {
  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-stone-800 border-2 border-accent/20 rounded-full flex items-center justify-center relative shadow-inner overflow-hidden">
          {/* Animated sound waves */}
          <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-20">
            <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_100ms] h-10" />
            <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_200ms] h-14" />
            <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_300ms] h-8" />
            <span className="w-1 bg-accent rounded animate-[pulse_1s_infinite_400ms] h-12" />
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
          {displayName}
        </h3>
        <p className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold mt-1">Connexion Directe Établie</p>
      </div>
      <div className="flex justify-center items-center gap-6">
        {/* Mute */}
        <button
          type="button"
          onClick={onToggleMute}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isMuted ? 'bg-red-500/25 text-red-400 border border-red-500/50' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
          }`}
          title={isMuted ? 'Activer le micro' : 'Couper le micro'}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Hang up */}
        <button
          type="button"
          onClick={onHangUp}
          className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          title="Raccrocher"
        >
          <PhoneOff size={24} />
        </button>

        {/* Speaker toggle */}
        <button
          type="button"
          onClick={onToggleSpeaker}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            !isSpeakerOn ? 'bg-stone-850/50 text-stone-500' : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
          }`}
          title="Haut-parleur"
        >
          {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </div>
  );
};
