import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../../utils/sound';
import { WidgetProps } from './Widget8Timbangan';

export const Widget20Tanah: React.FC<WidgetProps> = ({
  stage,
  modeKelas,
  langkahAktif,
  isContoh = false,
  onMimoReact,
  onWowTriggered
}) => {
  const [shiftH, setShiftH] = useState(0);
  const [shiftV, setShiftV] = useState(0);
  const [wowFired, setWowFired] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const activePointers = useRef<Map<number, 'H' | 'V'>>(new Map());

  // Dimensions: Latihan (20m x 12m, cut 5m) vs Contoh Guru (10m x 6m, cut 2m)
  const p = isContoh ? 10 : 20;
  const l = isContoh ? 6 : 12;
  const k = isContoh ? 2 : 5;
  const keliling = 2 * (p + l);

  const scale = isContoh ? 36 : 18;
  const x0 = 90;
  const y0 = 48;
  const W = p * scale; // 360
  const H = l * scale; // 216
  const C = k * scale; // 90 (latihan) or 72 (contoh)

  useEffect(() => {
    setShiftH(0);
    setShiftV(0);
    setWowFired(false);
  }, [isContoh]);

  const innerHorizY = y0 + C * (1 - shiftH);
  const innerVertX = x0 + W - C * (1 - shiftV);

  const isCompleted = shiftH > 0.92 && shiftV > 0.92;

  useEffect(() => {
    if (isCompleted && !wowFired) {
      setShiftH(1);
      setShiftV(1);
      setWowFired(true);
      sound.ding();
      onWowTriggered?.();
      onMimoReact(
        'kaget',
        `WAH! Kedua sisi lekukan kolam pas menutup garis putus-putus! Sekarang hitung panjang total sisi atas, sisi kanan, dan kelilingnya sendiri ya!`
      );
    }
  }, [isCompleted, wowFired, onMimoReact, onWowTriggered]);

  useEffect(() => {
    if (stage !== 3 || !isContoh) return;
    if (langkahAktif === 0) {
      setShiftH(1);
      setShiftV(0);
    } else if (langkahAktif >= 1) {
      setShiftH(1);
      setShiftV(1);
    }
  }, [stage, langkahAktif, isContoh]);

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 540,
      y: ((clientY - rect.top) / rect.height) * 320
    };
  };

  const handleEdgePointerDown = (axis: 'H' | 'V', e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.unlock();
    sound.click();
    activePointers.current.set(e.pointerId, axis);
  };

  const handleSvgPointerMove = (e: React.PointerEvent) => {
    const axis = activePointers.current.get(e.pointerId);
    if (!axis) return;
    const pt = clientToSvg(e.clientX, e.clientY);
    if (axis === 'H') {
      const val = Math.max(0, Math.min(1, (y0 + C - pt.y) / C));
      setShiftH(val);
      if (val < 0.92) setWowFired(false);
    } else {
      const val = Math.max(0, Math.min(1, (pt.x - (x0 + W - C)) / C));
      setShiftV(val);
      if (val < 0.92) setWowFired(false);
    }
  };

  const handleSvgPointerUp = (e: React.PointerEvent) => {
    if (activePointers.current.has(e.pointerId)) {
      activePointers.current.delete(e.pointerId);
    }
  };

  const toggleShift = (axis: 'H' | 'V') => {
    sound.unlock();
    sound.pop();
    if (axis === 'H') {
      const next = shiftH > 0.5 ? 0 : 1;
      setShiftH(next);
      if (next === 0) setWowFired(false);
      onMimoReact('berpikir', next === 1 ? `Sisi mendatar ${k} m digeser ke atas! Amati gabungan garis atas bersama ${p - k} m!` : 'Sisi mendatar kembali ke lekukan kolam.');
    } else {
      const next = shiftV > 0.5 ? 0 : 1;
      setShiftV(next);
      if (next === 0) setWowFired(false);
      onMimoReact('berpikir', next === 1 ? `Sisi tegak ${k} m digeser ke kanan! Amati gabungan garis kanan bersama ${l - k} m!` : 'Sisi tegak kembali ke lekukan kolam.');
    }
  };

  const resetAll = () => {
    sound.unlock();
    sound.pop();
    setShiftH(0);
    setShiftV(0);
    setWowFired(false);
    onMimoReact('senang', 'Kolam kembali di sudut. Coba geser lagi dua garis dalamnya!');
  };

  const lPath = `M ${x0} ${y0} L ${x0 + W - C} ${y0} L ${x0 + W - C} ${y0 + C} L ${x0 + W} ${y0 + C} L ${x0 + W} ${y0 + H} L ${x0} ${y0 + H} Z`;

  return (
    <div className="flex flex-col gap-4 select-none">
      {modeKelas === 'berdua' && (
        <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
          <div className="rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-3 py-2 text-sky-900 dark:text-sky-100 text-center">
            Siswa 1: Tarik garis mendatar biru ({k} m) ke atas
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-2 text-amber-900 dark:text-amber-100 text-center">
            Siswa 2: Tarik garis tegak kuning ({k} m) ke kanan
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center gap-3">
        <svg
          ref={svgRef}
          viewBox="0 0 540 320"
          onPointerMove={handleSvgPointerMove}
          onPointerUp={handleSvgPointerUp}
          onPointerCancel={handleSvgPointerUp}
          className="w-full max-w-[660px] h-auto touch-stage"
        >
          <rect x={x0} y={y0} width={W} height={H} fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeDasharray="8 6" />
          <rect x={x0 + W - C} y={y0} width={C} height={C} fill="#BAE6FD" opacity="0.7" />
          <text x={x0 + W - C / 2} y={y0 + C / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0369A1">
            Kolam
          </text>
          <text x={x0 + W - C / 2} y={y0 + C / 2 + 13} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0369A1" className="font-mono-num">
            {k} m × {k} m
          </text>

          <path d={lPath} fill="#BBF7D0" stroke="#15803D" strokeWidth="3" />

          <line x1={x0} y1={y0 + H} x2={x0 + W} y2={y0 + H} stroke="#059669" strokeWidth="5" strokeLinecap="round" />
          <text x={x0 + W / 2} y={y0 + H + 24} textAnchor="middle" fontSize="16" fontWeight="800" className="fill-emerald-700 dark:fill-emerald-400 font-mono-num">
            {p} m
          </text>

          <line x1={x0} y1={y0} x2={x0} y2={y0 + H} stroke="#059669" strokeWidth="5" strokeLinecap="round" />
          <text x={x0 - 28} y={y0 + H / 2 + 5} textAnchor="middle" fontSize="16" fontWeight="800" className="fill-emerald-700 dark:fill-emerald-400 font-mono-num">
            {l} m
          </text>

          <line x1={x0} y1={y0} x2={x0 + W - C} y2={y0} stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
          <text x={x0 + (W - C) / 2} y={y0 - 12} textAnchor="middle" fontSize="15" fontWeight="800" className="fill-sky-700 dark:fill-sky-400 font-mono-num">
            {p - k} m
          </text>

          <line x1={x0 + W} y1={y0 + C} x2={x0 + W} y2={y0 + H} stroke="#D97706" strokeWidth="5" strokeLinecap="round" />
          <text x={x0 + W + 24} y={y0 + C + (H - C) / 2 + 5} textAnchor="middle" fontSize="15" fontWeight="800" className="fill-amber-700 dark:fill-amber-400 font-mono-num">
            {l - k} m
          </text>

          {shiftH > 0.05 && (
            <line x1={x0 + W - C} y1={y0 + C} x2={x0 + W} y2={y0 + C} stroke="#0284C7" strokeWidth="2" strokeDasharray="4 4" />
          )}
          {shiftV > 0.05 && (
            <line x1={x0 + W - C} y1={y0} x2={x0 + W - C} y2={y0 + C} stroke="#D97706" strokeWidth="2" strokeDasharray="4 4" />
          )}

          <g onPointerDown={(e) => handleEdgePointerDown('H', e)} className="cursor-grab active:cursor-grabbing">
            <rect x={x0 + W - C - 8} y={innerHorizY - 26} width={C + 16} height="52" fill="transparent" />
            <line x1={x0 + W - C} y1={innerHorizY} x2={x0 + W} y2={innerHorizY} stroke="#0284C7" strokeWidth="7" strokeLinecap="round" />
            <circle cx={x0 + W - C / 2} cy={innerHorizY} r="13" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x={x0 + W - C / 2} y={innerHorizY + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFFFF">↑</text>
            <text x={x0 + W - C / 2} y={innerHorizY - 17} textAnchor="middle" fontSize="14" fontWeight="800" className="fill-sky-700 dark:fill-sky-300 font-mono-num">
              {k} m
            </text>
          </g>

          <g onPointerDown={(e) => handleEdgePointerDown('V', e)} className="cursor-grab active:cursor-grabbing">
            <rect x={innerVertX - 26} y={y0 - 8} width="52" height={C + 16} fill="transparent" />
            <line x1={innerVertX} y1={y0} x2={innerVertX} y2={y0 + C} stroke="#D97706" strokeWidth="7" strokeLinecap="round" />
            <circle cx={innerVertX} cy={y0 + C / 2} r="13" fill="#D97706" stroke="#FFFFFF" strokeWidth="2.5" />
            <text x={innerVertX} y={y0 + C / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFFFF">→</text>
            <text x={innerVertX + 24} y={y0 + C / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="800" className="fill-amber-700 dark:fill-amber-300 font-mono-num">
              {k} m
            </text>
          </g>

          {wowFired && (
            <rect x={x0} y={y0} width={W} height={H} fill="none" stroke="#10B981" strokeWidth="6" rx="4" className="animate-pulse" />
          )}
        </svg>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 px-3 py-2">
            <div className="text-xs font-semibold text-sky-800 dark:text-sky-300">Petunjuk Sisi Atas</div>
            <div className="font-mono-num text-base font-bold text-sky-950 dark:text-sky-100">
              {p - k} m + {k} m = ? m
            </div>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2">
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">Petunjuk Sisi Kanan</div>
            <div className="font-mono-num text-base font-bold text-amber-950 dark:text-amber-100">
              {l - k} m + {k} m = ? m
            </div>
          </div>
          <div
            className={`rounded-xl border px-3 py-2 ${
              wowFired
                ? 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-400 text-emerald-950 dark:text-emerald-100'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="text-xs font-semibold">Rumus Pemandu Keliling</div>
            <div className="font-mono-num text-base font-bold">
              2 × (atas + kanan) = ? m
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => toggleShift('H')}
            className="min-h-[64px] px-5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm cursor-pointer active:scale-95 transition-transform"
          >
            {shiftH > 0.5 ? `Kembalikan Sisi Mendatar ${k} m` : `Geser Sisi Mendatar ${k} m ke Atas`}
          </button>
          <button
            type="button"
            onClick={() => toggleShift('V')}
            className="min-h-[64px] px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm cursor-pointer active:scale-95 transition-transform"
          >
            {shiftV > 0.5 ? `Kembalikan Sisi Tegak ${k} m` : `Geser Sisi Tegak ${k} m ke Kanan`}
          </button>
          <button
            type="button"
            onClick={resetAll}
            className="min-h-[64px] px-4 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-sm cursor-pointer"
          >
            Ulangi
          </button>
        </div>
      </div>
    </div>
  );
};
