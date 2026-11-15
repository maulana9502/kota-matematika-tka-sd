import React, { useState } from 'react';
import { sound } from '../utils/sound';

export type MimoMood = 'senang' | 'bingung' | 'kaget' | 'berpikir' | 'bersorak';

interface MimoMascotProps {
  mood: MimoMood;
  pesan: string;
  onEasterEgg?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const MimoMascot: React.FC<MimoMascotProps> = ({
  mood,
  pesan,
  onEasterEgg,
  size = 'md'
}) => {
  const [tapCount, setTapCount] = useState(0);
  const [dizzy, setDizzy] = useState(false);

  const handleTap = () => {
    sound.unlock();
    const next = tapCount + 1;
    if (next >= 5) {
      setTapCount(0);
      setDizzy(true);
      sound.giggle();
      onEasterEgg?.();
      setTimeout(() => setDizzy(false), 2600);
    } else {
      setTapCount(next);
      sound.pop();
    }
  };

  const dim = size === 'sm' ? 68 : size === 'lg' ? 110 : 84;
  const activeMood: MimoMood = dizzy ? 'kaget' : mood;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={handleTap}
        title="Ketuk Mimo!"
        aria-label="Maskot Mimo — ketuk beberapa kali untuk kejutan"
        className="relative shrink-0 rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-blue-600 transition-transform active:scale-95 cursor-pointer"
      >
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 120 120"
          className={activeMood === 'bersorak' ? 'animate-bounce' : 'animate-float-gentle'}
        >
          {/* Antenna / Sprout */}
          <path
            d="M60 22 C60 12, 72 8, 76 14 C79 18, 69 24, 60 22 Z"
            fill="#10B981"
            stroke="#047857"
            strokeWidth="2.5"
          />
          <line x1="60" y1="22" x2="60" y2="33" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />

          {/* Arms */}
          {activeMood === 'bersorak' ? (
            <>
              <path d="M24 64 C12 44, 18 32, 26 36" fill="none" stroke="#1D4ED8" strokeWidth="8" strokeLinecap="round" />
              <path d="M96 64 C108 44, 102 32, 94 36" fill="none" stroke="#1D4ED8" strokeWidth="8" strokeLinecap="round" />
            </>
          ) : activeMood === 'berpikir' ? (
            <>
              <path d="M24 68 C16 74, 22 86, 30 82" fill="none" stroke="#1D4ED8" strokeWidth="8" strokeLinecap="round" />
              <path d="M96 68 C102 78, 80 86, 70 84" fill="none" stroke="#1D4ED8" strokeWidth="8" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M24 68 C14 72, 16 84, 24 84" fill="none" stroke="#1D4ED8" strokeWidth="8" strokeLinecap="round" />
              <path d="M96 68 C106 72, 104 84, 96 84" fill="none" stroke="#1D4ED8" strokeWidth="8" strokeLinecap="round" />
            </>
          )}

          {/* Round Body */}
          <circle cx="60" cy="69" r="37" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3.5" />
          {/* Soft Belly Highlight */}
          <ellipse cx="60" cy="82" rx="22" ry="16" fill="#93C5FD" opacity="0.5" />

          {/* Cheeks */}
          <circle cx="37" cy="72" r="5" fill="#F472B6" opacity="0.65" />
          <circle cx="83" cy="72" r="5" fill="#F472B6" opacity="0.65" />

          {/* Eyes */}
          {dizzy ? (
            <>
              <text x="40" y="66" fontSize="16" fontWeight="bold" fill="#0F172A">@</text>
              <text x="68" y="66" fontSize="16" fontWeight="bold" fill="#0F172A">@</text>
            </>
          ) : activeMood === 'bingung' ? (
            <>
              <circle cx="46" cy="60" r="6" fill="#FFFFFF" />
              <circle cx="47" cy="61" r="3" fill="#0F172A" />
              <circle cx="74" cy="57" r="7.5" fill="#FFFFFF" />
              <circle cx="73" cy="56" r="3.5" fill="#0F172A" />
              <path d="M40 49 L52 52" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M68 48 Q75 43 81 48" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
            </>
          ) : activeMood === 'kaget' ? (
            <>
              <circle cx="46" cy="58" r="8" fill="#FFFFFF" />
              <circle cx="46" cy="58" r="3.2" fill="#0F172A" />
              <circle cx="74" cy="58" r="8" fill="#FFFFFF" />
              <circle cx="74" cy="58" r="3.2" fill="#0F172A" />
            </>
          ) : activeMood === 'berpikir' ? (
            <>
              <circle cx="46" cy="59" r="6.5" fill="#FFFFFF" />
              <circle cx="48" cy="56" r="3" fill="#0F172A" />
              <circle cx="74" cy="59" r="6.5" fill="#FFFFFF" />
              <circle cx="76" cy="56" r="3" fill="#0F172A" />
            </>
          ) : activeMood === 'bersorak' ? (
            <>
              <path d="M39 60 Q46 52 53 60" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M67 60 Q74 52 81 60" fill="none" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="46" cy="59" r="6.5" fill="#FFFFFF" />
              <circle cx="47" cy="59" r="3.3" fill="#0F172A" />
              <circle cx="48.5" cy="57.5" r="1.2" fill="#FFFFFF" />
              <circle cx="74" cy="59" r="6.5" fill="#FFFFFF" />
              <circle cx="75" cy="59" r="3.3" fill="#0F172A" />
              <circle cx="76.5" cy="57.5" r="1.2" fill="#FFFFFF" />
            </>
          )}

          {/* Mouth */}
          {activeMood === 'kaget' ? (
            <ellipse cx="60" cy="77" rx="5.5" ry="7" fill="#0F172A" />
          ) : activeMood === 'bingung' ? (
            <path d="M51 77 Q56 73 61 77 T70 76" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          ) : activeMood === 'berpikir' ? (
            <line x1="53" y1="77" x2="66" y2="76" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
          ) : activeMood === 'bersorak' ? (
            <path d="M48 73 Q60 88 72 73 Z" fill="#0F172A" />
          ) : (
            <path d="M50 74 Q60 83 70 74" fill="none" stroke="#0F172A" strokeWidth="3.2" strokeLinecap="round" />
          )}

          {/* Cheer sparkles when bersorak */}
          {activeMood === 'bersorak' && (
            <>
              <circle cx="16" cy="28" r="3.5" fill="#F59E0B" />
              <circle cx="104" cy="28" r="3.5" fill="#F59E0B" />
              <circle cx="60" cy="8" r="3" fill="#10B981" />
            </>
          )}
        </svg>
      </button>

      <div className="flex-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 shadow-sm">
        <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5">
          {dizzy ? 'Mimo (Kegelian!)' : 'Mimo'}
        </div>
        <p className="text-base md:text-lg font-medium text-slate-800 dark:text-slate-100 leading-snug">
          {dizzy ? 'Hehe, geli sekali! Mimo sampai pusing angka nih. Nih, bonus stiker buat kelas!' : pesan}
        </p>
      </div>
    </div>
  );
};
