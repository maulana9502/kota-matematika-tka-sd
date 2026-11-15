import React, { useState, useEffect, useMemo, useRef } from 'react';
import { STEP_CHALLENGES } from '../data/stepChallenges';
import { sound } from '../utils/sound';
import { MimoMood } from './MimoMascot';

interface StepBlockChallengeProps {
  questionId: number;
  isContoh: boolean;
  langkahAktif: number;
  onLangkahChange: (nextStep: number) => void;
  onMimoReact: (mood: MimoMood, pesan: string) => void;
  onProceedToAnswer: () => void;
}

// Deterministic Fisher-Yates shuffle so tray order is mixed consistently per question & mode
function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed + 17;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const StepBlockChallenge: React.FC<StepBlockChallengeProps> = ({
  questionId,
  isContoh,
  langkahAktif,
  onLangkahChange,
  onMimoReact,
  onProceedToAnswer
}) => {
  const challengeData = STEP_CHALLENGES[questionId];
  const challenge = isContoh ? challengeData.contoh : challengeData.latihan;
  const totalSteps = challenge.steps.length;

  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [dragBlock, setDragBlock] = useState<{
    text: string;
    pointerId: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);

  const activeDropRef = useRef<HTMLDivElement | null>(null);
  const suppressClickRef = useRef<boolean>(false);

  useEffect(() => {
    setSolvedCount(0);
    setWrongMsg(null);
    onLangkahChange(0);
  }, [questionId, isContoh, onLangkahChange]);

  useEffect(() => {
    if (activeDropRef.current) {
      activeDropRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [solvedCount]);

  const trayBlocks = useMemo(() => {
    const combined = [
      ...challenge.steps.map((s) => s.jawabanBenar),
      ...challenge.pengecoh
    ];
    // Deduplicate just in case, then shuffle
    const unique = Array.from(new Set(combined));
    return shuffleWithSeed(unique, questionId * 13 + (isContoh ? 100 : 7));
  }, [challenge, questionId, isContoh]);

  const placedAnswers = useMemo(
    () => new Set(challenge.steps.slice(0, solvedCount).map((s) => s.jawabanBenar)),
    [challenge.steps, solvedCount]
  );

  const allDone = solvedCount >= totalSteps;
  const currentActiveStep = !allDone ? challenge.steps[solvedCount] : null;

  const tryPlaceBlock = (blockText: string) => {
    if (allDone) return;
    sound.unlock();
    const currentStep = challenge.steps[solvedCount];
    if (blockText === currentStep.jawabanBenar) {
      sound.ding();
      setWrongMsg(null);
      const nextSolved = solvedCount + 1;
      setSolvedCount(nextSolved);
      onLangkahChange(Math.min(totalSteps - 1, nextSolved));
      if (nextSolved >= totalSteps) {
        sound.clap();
        onMimoReact(
          'bersorak',
          'Luar biasa! Kamu berhasil menyusun semua langkah dari nol dengan tepat! Sekarang siap ke Coba Jawab!'
        );
      } else {
        onMimoReact(
          'senang',
          `Tepat! ${currentStep.penjelasan} Sekarang cek arahan untuk ${challenge.steps[nextSolved].judul}!`
        );
      }
    } else {
      sound.softWrong();
      const msg = `Balok "${blockText}" belum pas untuk ${currentStep.judul}. Periksa kembali arahannya: ${currentStep.arahan}`;
      setWrongMsg(msg);
      onMimoReact('bingung', `Hampir! Hati-hati ada balok pengecoh. Cek ulang hitungan pada ${currentStep.judul}!`);
    }
  };

  const handleBlockClick = (text: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    tryPlaceBlock(text);
  };

  const handleDragStart = (text: string, e: React.PointerEvent, forceTouchDrag = false) => {
    if (allDone) return;
    // On touch/pen screens, only start drag when grabbing the explicit drag grip so normal taps & vertical scrolling NEVER fail.
    if (e.pointerType !== 'mouse' && !forceTouchDrag) return;
    if (forceTouchDrag) {
      e.stopPropagation();
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore if capture unsupported
    }
    sound.unlock();
    setDragBlock({
      text,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      moved: false
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragBlock || e.pointerId !== dragBlock.pointerId) return;
    const dist = Math.hypot(e.clientX - dragBlock.startX, e.clientY - dragBlock.startY);
    setDragBlock((prev) =>
      prev
        ? {
            ...prev,
            x: e.clientX,
            y: e.clientY,
            moved: prev.moved || dist > 12
          }
        : null
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragBlock || e.pointerId !== dragBlock.pointerId) return;
    const current = dragBlock;
    setDragBlock(null);

    if (!current.moved) {
      // Let native onClick handle clean tap/click without double firing
      return;
    }

    // Prevent trailing native click event after a real drag gesture
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 80);

    const rect = activeDropRef.current?.getBoundingClientRect();
    if (
      rect &&
      e.clientX >= rect.left - 32 &&
      e.clientX <= rect.right + 32 &&
      e.clientY >= rect.top - 32 &&
      e.clientY <= rect.bottom + 32
    ) {
      tryPlaceBlock(current.text);
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDragBlock(null)}
      className="touch-pan-y rounded-2xl bg-white/92 dark:bg-slate-900/92 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 select-none"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            Susun Langkah Sendiri dari Nol ({isContoh ? 'Peragaan Guru' : 'Giliran Siswa'})
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Ikuti arahan di tiap langkah lalu <strong>ketuk langsung balok jawaban</strong> (atau seret ikon <strong>⋮⋮</strong>) ke kotak aktif. Awas, ada <strong>{challenge.pengecoh.length} balok pengecoh</strong>!
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isContoh && !allDone && (
            <button
              type="button"
              onClick={() => tryPlaceBlock(challenge.steps[solvedCount].jawabanBenar)}
              className="min-h-[44px] px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer touch-manipulation"
            >
              Peragakan Langkah {solvedCount + 1} (Guru)
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              sound.click();
              setSolvedCount(0);
              setWrongMsg(null);
              onLangkahChange(0);
            }}
            className="min-h-[44px] px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer touch-manipulation"
          >
            Ulangi Susun Langkah
          </button>
        </div>
      </div>

      {/* Sequential Step Slots (cleanly scrollable on mobile viewports) */}
      <div className="max-h-[38dvh] sm:max-h-none overflow-y-auto overscroll-y-contain pr-1 space-y-2.5 sm:space-y-3">
        {challenge.steps.map((step, i) => {
          const isSolved = i < solvedCount;
          const isActive = i === solvedCount && !allDone;
          const isLocked = i > solvedCount;

          return (
            <div
              key={step.judul}
              ref={isActive ? activeDropRef : undefined}
              className={`rounded-2xl border-2 p-3.5 sm:p-4 transition-all ${
                isSolved
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                  : isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-300 dark:ring-blue-700'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
                <div className="space-y-1 flex-1">
                  <div className="text-xs font-extrabold text-blue-700 dark:text-blue-300">
                    {step.judul} {isSolved ? '✓ Selesai' : isActive ? '· Langkah Aktif Sekarang' : '· Menunggu'}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {isLocked ? 'Selesaikan langkah sebelumnya terlebih dahulu untuk membuka arahan ini.' : step.arahan}
                  </div>
                  {isSolved && (
                    <div className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200 pt-0.5">
                      Alasan: {step.penjelasan}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {isSolved ? (
                    <div className="min-h-[48px] sm:min-h-[54px] px-4 sm:px-5 rounded-xl bg-emerald-600 text-white font-mono-num font-extrabold text-xs sm:text-sm flex items-center justify-center shadow-xs">
                      {step.jawabanBenar}
                    </div>
                  ) : isActive ? (
                    <div className="min-h-[48px] sm:min-h-[58px] min-w-[180px] sm:min-w-[210px] px-3 sm:px-4 rounded-xl border-2 border-dashed border-blue-500 bg-white/90 dark:bg-slate-900/90 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center text-center">
                      {dragBlock ? 'Lepaskan balok di sini!' : 'Ketuk balok di bawah atau seret ke sini'}
                    </div>
                  ) : (
                    <div className="min-h-[42px] sm:min-h-[48px] min-w-[120px] sm:min-w-[140px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 text-xs font-semibold flex items-center justify-center">
                      Terkunci
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {wrongMsg && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-400 px-4 py-3 text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200">
          {wrongMsg}
        </div>
      )}

      {/* Tray of Answer Blocks + Distractors */}
      {!allDone ? (
        <div className="rounded-2xl bg-slate-100/95 dark:bg-slate-800/85 border border-slate-200 dark:border-slate-700 p-3.5 sm:p-4 space-y-2.5">
          {currentActiveStep && (
            <div className="rounded-xl bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 px-3 py-2 text-xs sm:text-sm text-blue-950 dark:text-blue-100">
              <span className="font-extrabold">{currentActiveStep.judul}:</span> {currentActiveStep.arahan}
            </div>
          )}
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
            Ketuk salah satu balok di bawah ({trayBlocks.length - placedAnswers.size} balok tersisa · termasuk {challenge.pengecoh.length} pengecoh):
          </div>
          <div className="max-h-[34dvh] sm:max-h-none overflow-y-auto overscroll-y-contain pr-1 flex flex-wrap gap-2 sm:gap-2.5">
            {trayBlocks.map((text) => {
              const used = placedAnswers.has(text);
              if (used) return null;
              return (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleBlockClick(text)}
                  onPointerDown={(e) => handleDragStart(text, e, false)}
                  className="touch-manipulation min-h-[52px] sm:min-h-[58px] pl-2.5 pr-3.5 sm:pl-3 sm:pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 active:border-blue-600 active:bg-blue-50 dark:active:bg-blue-950/40 text-slate-900 dark:text-white font-mono-num font-bold text-xs sm:text-sm shadow-xs cursor-pointer flex items-center gap-2 transition-colors text-left"
                >
                  <span
                    aria-hidden="true"
                    onPointerDown={(e) => handleDragStart(text, e, true)}
                    title="Seret balok"
                    className="touch-none px-1.5 py-2 -my-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing text-xs leading-none shrink-0"
                  >
                    ⋮⋮
                  </span>
                  <span>{text}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 animate-celebrate-pop">
          <div>
            <div className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
              Semua {totalSteps} langkah berhasil disusun sendiri!
            </div>
            <div className="text-sm text-emerald-800 dark:text-emerald-300">
              {langkahAktif >= 0 ? 'Sekarang uji pemahamanmu di tahap Coba Jawab!' : ''}
            </div>
          </div>
          <button
            type="button"
            onClick={onProceedToAnswer}
            className="min-h-[52px] sm:min-h-[56px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer touch-manipulation"
          >
            Lanjut ke Coba Jawab →
          </button>
        </div>
      )}

      {dragBlock && dragBlock.moved && (
        <div
          style={{ left: dragBlock.x - 80, top: dragBlock.y - 28 }}
          className="fixed z-50 pointer-events-none min-w-[160px] min-h-[54px] px-4 rounded-xl bg-blue-600 border-2 border-white text-white font-mono-num font-extrabold text-sm flex items-center justify-center shadow-2xl"
        >
          {dragBlock.text}
        </div>
      )}
    </div>
  );
};
