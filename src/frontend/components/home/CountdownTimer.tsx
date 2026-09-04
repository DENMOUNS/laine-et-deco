import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endDate: string;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate, compact }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(endDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-white">
        <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-0.5">
          <span className="text-xs font-bold text-amber-300">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-white/70 font-sans">h</span>
        </div>
        <span className="text-white/50 text-[10px]">:</span>
        <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-0.5">
          <span className="text-xs font-bold text-amber-300">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-white/70 font-sans">m</span>
        </div>
        <span className="text-white/50 text-[10px]">:</span>
        <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-0.5">
          <span className="text-xs font-bold text-amber-300">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-white/70 font-sans">s</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {[
        { label: 'Heures', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center text-xl font-bold text-accent shadow-sm border border-primary/10">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};
