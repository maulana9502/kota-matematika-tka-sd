import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../../utils/sound';
import { WidgetProps } from './Widget8Timbangan';

interface CornerState {
  id: 'A' | 'B' | 'C';
  deg: number;
  label: string;
  warna: string;
  torn: boolean;
  placed: boolean;
}

export const Widget25Sudut: React.FC<WidgetProps> = ({
  stage,
  modeKelas,
  langkahAktif,
  isContoh = false,
  onMimoReact,
  onWowTriggered
}) => {
  const degA = isContoh ? 40 : 50;
  const degB = degA * 2; // 80 or 100
  const degC = 180 - degA - degB; // 60 or 30

  const makeInitial = (): CornerState[] => [
    { id: 'A', deg: degA, label: `∠A = ${degA}°`, warna: '#0284C7', torn: false, placed: false },
    { id: 'B', deg: degB, label: `∠B = 2 × ∠A`, warna: '#D97706', torn: false, placed: false },
    { id: 'C', deg: degC, label: `∠C = ?`, warna: '#059669', torn: false, placed: false }
  ];

  const [corners, setCorners] = useState<CornerState[]>(makeInitial);
  const [wowFired, setWowFired] = useState(false);

  const [dragMap, setDragMap] = useState<Record<string, { x: number; y: number; pointerId: number }>>({});
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCorners([
      { id: 'A', deg: degA, label: `∠A = ${degA}°`, warna: '#0284C7', torn: false, placed: false },
      { id: 'B', deg: degB, label: `∠B = 2 × ∠A`, warna: '#D97706', torn: false, placed: false },
      { id: 'C', deg: degC, label: `∠C = ?`, warna: '#059669', torn: false, placed: false }
    ]);
    setWowFired(false);
  }, [isContoh, degA, degB, degC]);

  const allPlaced = corners.every((c) => c.placed);

  useEffect(() => {
    if (allPlaced && !wowFired) {
      setWowFired(true);
      sound.ding();
      onWowTriggered?.();
      onMimoReact(
        'kaget',
        `180° MENYALA! Lihat, tiga sobekan sudut selalu pas membentuk garis lurus 180°! Sekarang hitung dulu besar ∠B (2 × ∠A), lalu cari ∠C!`
      );
    }
  }, [allPlaced, wowFired, onMimoReact, onWowTriggered]);

  useEffect(() => {
    if (stage !== 3 || !isContoh) return;
    if (langkahAktif === 0) {
      setCorners([
        { id: 'A', deg: degA, label: `∠A = ${degA}°`, warna: '#0284C7', torn: true, placed: false },
        { id: 'B', deg: degB, label: `∠B = 2 × ∠A`, warna: '#D97706', torn: true, placed: false },
        { id: 'C', deg: degC, label: `∠C = ?`, warna: '#059669', torn: false, placed: false }
      ]);
      setWowFired(false);
    } else if (langkahAktif >= 1) {
      setCorners([
        { id: 'A', deg: degA, label: `∠A = ${degA}°`, warna: '#0284C7', torn: true, placed: true },
        { id: 'B', deg: degB, label: `∠B = 2 × ∠A`, warna: '#D97706', torn: true, placed: true },
        { id: 'C', deg: degC, label: `∠C = ?`, warna: '#059669', torn: true, placed: true }
      ]);
    }
  }, [stage, langkahAktif, isContoh, degA, degB, degC]);

  const tearCorner = (id: 'A' | 'B' | 'C') => {
    sound.unlock();
    sound.tear();
    setCorners((prev) => prev.map((c) => (c.id === id ? { ...c, torn: true } : c)));
    const target = corners.find((c) => c.id === id);
    if (target && !target.torn) {
      onMimoReact('senang', `Krek! Sudut ${id} disobek! Sekarang ketuk atau seret sudut ${id} ke garis lurus 180°!`);
    }
  };

  const placeCornerInDock = (id: 'A' | 'B' | 'C') => {
    sound.unlock();
    sound.click();
    setCorners((prev) => prev.map((c) => (c.id === id ? { ...c, torn: true, placed: true } : c)));
  };

  const handleCornerPointerDown = (c: CornerState, e: React.PointerEvent) => {
    e.stopPropagation();
    sound.unlock();
    if (!c.torn) {
      tearCorner(c.id);
      return;
    }
    if (c.placed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragMap((prev) => ({
      ...prev,
      [c.id]: { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
    }));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const entry = Object.entries(dragMap).find(([, v]) => v.pointerId === e.pointerId);
    if (!entry) return;
    const [id] = entry;
    setDragMap((prev) => ({ ...prev, [id]: { ...prev[id], x: e.clientX, y: e.clientY } }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const entry = Object.entries(dragMap).find(([, v]) => v.pointerId === e.pointerId);
    if (!entry) return;
    const [id] = entry;
    placeCornerInDock(id as 'A' | 'B' | 'C');
    setDragMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const resetAll = () => {
    sound.unlock();
    sound.pop();
    setCorners(makeInitial());
    setWowFired(false);
    onMimoReact('senang', 'Segitiga utuh kembali! Ayo sobek ketiga sudutnya.');
  };

  const sectorPath = (startDeg: number, spanDeg: number, radius: number, cx: number, cy: number) => {
    const a1 = (startDeg * Math.PI) / 180;
    const a2 = ((startDeg - spanDeg) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(a1);
    const y1 = cy - radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy - radius * Math.sin(a2);
    const largeArc = spanDeg > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const cornerA = corners[0];
  const cornerB = corners[1];
  const cornerC = corners[2];

  // Top vertex shifts slightly between 40-80-60 and 50-100-30
  const bx = isContoh ? 310 : 245;
  const by = isContoh ? 55 : 45;

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="touch-pan-y flex flex-col gap-4 select-none"
    >
      {modeKelas === 'berdua' && (
        <div className="rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-3 py-2 text-sky-900 dark:text-sky-100 text-center text-sm font-semibold">
          Mode Berdua: Dua siswa bisa menyobek dan menaruh sudut A, B, atau C bersamaan!
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center gap-3">
        <div className="w-full flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-bold text-slate-800 dark:text-slate-100">
            Segitiga Kertas ABC — Ketuk tiap sudut untuk menyobek, lalu taruh di garis 180°
          </span>
          <button
            type="button"
            onClick={resetAll}
            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-xs text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            Sambung Ulang Segitiga
          </button>
        </div>

        <svg viewBox="0 0 560 225" className="w-full max-w-[580px] h-auto">
          <polygon points={`90,190 ${bx},${by} 470,190`} fill="#FEF3C7" stroke="#B45309" strokeWidth="2.5" />

          {!cornerA.placed && (
            <g
              onPointerDown={(e) => handleCornerPointerDown(cornerA, e)}
              transform={cornerA.torn ? 'translate(-14, 6) rotate(-6, 90, 190)' : ''}
              className="cursor-pointer transition-transform"
            >
              <polygon points="90,190 144,145 162,190" fill="#0284C7" opacity="0.88" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="144" y1="145" x2="162" y2="190" stroke="#0F172A" strokeWidth="2.5" strokeDasharray="5 4" />
              <text x="122" y="178" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                A: {degA}°
              </text>
              {!cornerA.torn && (
                <text x="115" y="132" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0284C7">
                  ✂ Ketuk sobek
                </text>
              )}
            </g>
          )}

          {!cornerB.placed && (
            <g
              onPointerDown={(e) => handleCornerPointerDown(cornerB, e)}
              transform={cornerB.torn ? `translate(0, -14) rotate(5, ${bx}, ${by})` : ''}
              className="cursor-pointer transition-transform"
            >
              <polygon
                points={`${bx},${by} ${bx - 47},${by + 44} ${bx + 54},${by + 39}`}
                fill="#D97706"
                opacity="0.9"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <line x1={bx - 47} y1={by + 44} x2={bx + 54} y2={by + 39} stroke="#0F172A" strokeWidth="2.5" strokeDasharray="5 4" />
              <text x={bx + 2} y={by + 30} textAnchor="middle" fontSize="11.5" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                B: 2×∠A
              </text>
              {!cornerB.torn && (
                <text x={bx} y={by - 15} textAnchor="middle" fontSize="11" fontWeight="700" fill="#B45309">
                  ✂ Ketuk sobek
                </text>
              )}
            </g>
          )}

          {!cornerC.placed && (
            <g
              onPointerDown={(e) => handleCornerPointerDown(cornerC, e)}
              transform={cornerC.torn ? 'translate(14, 6) rotate(6, 470, 190)' : ''}
              className="cursor-pointer transition-transform"
            >
              <polygon points="470,190 404,147 392,190" fill="#059669" opacity="0.9" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="404" y1="147" x2="392" y2="190" stroke="#0F172A" strokeWidth="2.5" strokeDasharray="5 4" />
              <text x="424" y="179" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                C: ?
              </text>
              {!cornerC.torn && (
                <text x="438" y="132" textAnchor="middle" fontSize="11" fontWeight="700" fill="#047857">
                  ✂ Ketuk sobek
                </text>
              )}
            </g>
          )}
        </svg>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[580px]">
          {corners.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => (!c.torn ? tearCorner(c.id) : !c.placed ? placeCornerInDock(c.id) : undefined)}
              disabled={c.placed}
              className={`min-h-[64px] rounded-xl border-2 px-3 py-2 font-bold text-sm transition-transform active:scale-95 cursor-pointer ${
                c.placed
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 cursor-default'
                  : c.torn
                    ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-blue-500'
              }`}
            >
              <div>Sudut {c.id}</div>
              <div className="text-xs font-normal">
                {c.placed ? 'Sudah di garis lurus' : c.torn ? 'Taruh ke garis 180°' : 'Sobek Sudut'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={dockRef}
        className={`rounded-2xl border p-4 flex flex-col items-center transition-colors ${
          wowFired
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-400'
            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
          Penggaris Sudut Lurus (180°) — Jajarkan ketiga sobekan sudut di sini
        </div>

        <svg viewBox="0 0 460 165" className="w-full max-w-[460px] h-auto">
          <path d="M 80 140 A 150 150 0 0 1 380 140" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="40" y1="140" x2="420" y2="140" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          <circle cx="230" cy="140" r="5" fill="#0F172A" />

          {cornerA.placed && (
            <g className="animate-celebrate-pop">
              <path d={sectorPath(180, degA, 125, 230, 140)} fill="#0284C7" opacity="0.88" stroke="#FFFFFF" strokeWidth="2" />
              <text x="148" y="118" textAnchor="middle" fontSize="14" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                {degA}°
              </text>
            </g>
          )}

          {cornerB.placed && (
            <g className="animate-celebrate-pop">
              <path d={sectorPath(180 - degA, degB, 125, 230, 140)} fill="#D97706" opacity="0.9" stroke="#FFFFFF" strokeWidth="2" />
              <text x="235" y="65" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                2×∠A
              </text>
            </g>
          )}

          {cornerC.placed && (
            <g className="animate-celebrate-pop">
              <path d={sectorPath(degC, degC, 125, 230, 140)} fill="#059669" opacity="0.9" stroke="#FFFFFF" strokeWidth="2" />
              <text x="315" y="122" textAnchor="middle" fontSize="14" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                ?°
              </text>
            </g>
          )}

          {wowFired && (
            <g className="animate-celebrate-pop">
              <path d="M 85 140 A 145 145 0 0 1 375 140" fill="none" stroke="#10B981" strokeWidth="5" />
              <rect x="145" y="146" width="170" height="18" rx="6" fill="#065F46" />
              <text x="230" y="159" textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                ∠A + ∠B + ∠C = 180°
              </text>
            </g>
          )}
        </svg>
      </div>

      {Object.entries(dragMap).map(([id, pos]) => (
        <div
          key={id}
          style={{ left: pos.x - 36, top: pos.y - 36 }}
          className="fixed z-50 pointer-events-none w-[72px] h-[72px] rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg"
        >
          Sudut {id}
        </div>
      ))}
    </div>
  );
};
