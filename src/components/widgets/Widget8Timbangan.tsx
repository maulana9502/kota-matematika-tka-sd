import React, { useState, useRef, useEffect } from 'react';
import { sound, formatAngkaID } from '../../utils/sound';
import { MimoMood } from '../MimoMascot';

export interface WidgetProps {
  stage: number; // 0: Cerita, 1: Mainkan, 2: Temukan, 3: Langkah, 4: Jawab
  modeKelas: 'maju-satu' | 'berdua' | 'tim' | 'guru';
  langkahAktif: number;
  isContoh?: boolean;
  onMimoReact: (mood: MimoMood, pesan: string) => void;
  onWowTriggered?: () => void;
}

interface SembakoItem {
  id: string;
  nama: string;
  labelUnit: string;
  unitAsli: 'kg' | 'hg' | 'g';
  nilaiAsli: number;
  gram: number;
  warna: string;
  kategori: 'beras' | 'gula' | 'mi';
}

const SEMBAKO_LATIHAN: SembakoItem[] = [
  { id: 'beras1', nama: 'Beras', labelUnit: '2 kg', unitAsli: 'kg', nilaiAsli: 2, gram: 2000, warna: '#0284C7', kategori: 'beras' },
  { id: 'gula1', nama: 'Gula 1', labelUnit: '4 hg', unitAsli: 'hg', nilaiAsli: 4, gram: 400, warna: '#D97706', kategori: 'gula' },
  { id: 'gula2', nama: 'Gula 2', labelUnit: '4 hg', unitAsli: 'hg', nilaiAsli: 4, gram: 400, warna: '#D97706', kategori: 'gula' },
  { id: 'gula3', nama: 'Gula 3', labelUnit: '4 hg', unitAsli: 'hg', nilaiAsli: 4, gram: 400, warna: '#D97706', kategori: 'gula' },
  { id: 'mi1', nama: 'Mi 1', labelUnit: '80 g', unitAsli: 'g', nilaiAsli: 80, gram: 80, warna: '#059669', kategori: 'mi' },
  { id: 'mi2', nama: 'Mi 2', labelUnit: '80 g', unitAsli: 'g', nilaiAsli: 80, gram: 80, warna: '#059669', kategori: 'mi' },
  { id: 'mi3', nama: 'Mi 3', labelUnit: '80 g', unitAsli: 'g', nilaiAsli: 80, gram: 80, warna: '#059669', kategori: 'mi' },
  { id: 'mi4', nama: 'Mi 4', labelUnit: '80 g', unitAsli: 'g', nilaiAsli: 80, gram: 80, warna: '#059669', kategori: 'mi' },
  { id: 'mi5', nama: 'Mi 5', labelUnit: '80 g', unitAsli: 'g', nilaiAsli: 80, gram: 80, warna: '#059669', kategori: 'mi' },
  { id: 'mi6', nama: 'Mi 6', labelUnit: '80 g', unitAsli: 'g', nilaiAsli: 80, gram: 80, warna: '#059669', kategori: 'mi' }
];

const SEMBAKO_CONTOH: SembakoItem[] = [
  { id: 'beras1', nama: 'Beras', labelUnit: '1 kg', unitAsli: 'kg', nilaiAsli: 1, gram: 1000, warna: '#0284C7', kategori: 'beras' },
  { id: 'gula1', nama: 'Gula 1', labelUnit: '5 hg', unitAsli: 'hg', nilaiAsli: 5, gram: 500, warna: '#D97706', kategori: 'gula' },
  { id: 'gula2', nama: 'Gula 2', labelUnit: '5 hg', unitAsli: 'hg', nilaiAsli: 5, gram: 500, warna: '#D97706', kategori: 'gula' },
  { id: 'mi1', nama: 'Mi 1', labelUnit: '100 g', unitAsli: 'g', nilaiAsli: 100, gram: 100, warna: '#059669', kategori: 'mi' },
  { id: 'mi2', nama: 'Mi 2', labelUnit: '100 g', unitAsli: 'g', nilaiAsli: 100, gram: 100, warna: '#059669', kategori: 'mi' },
  { id: 'mi3', nama: 'Mi 3', labelUnit: '100 g', unitAsli: 'g', nilaiAsli: 100, gram: 100, warna: '#059669', kategori: 'mi' },
  { id: 'mi4', nama: 'Mi 4', labelUnit: '100 g', unitAsli: 'g', nilaiAsli: 100, gram: 100, warna: '#059669', kategori: 'mi' },
  { id: 'mi5', nama: 'Mi 5', labelUnit: '100 g', unitAsli: 'g', nilaiAsli: 100, gram: 100, warna: '#059669', kategori: 'mi' }
];

interface BrassWeight {
  uid: string;
  gram: number;
  label: string;
}

const WEIGHT_TEMPLATES = [
  { gram: 1000, label: '1 kg' },
  { gram: 500, label: '500 g' },
  { gram: 200, label: '200 g' },
  { gram: 100, label: '100 g' },
  { gram: 50, label: '50 g' },
  { gram: 20, label: '20 g' },
  { gram: 10, label: '10 g' }
];

const TANGGA_SATUAN = [
  { unit: 'kg', nama: 'kilogram', faktor: 1000 },
  { unit: 'hg', nama: 'hektogram (ons)', faktor: 100 },
  { unit: 'dag', nama: 'dekagram', faktor: 10 },
  { unit: 'g', nama: 'gram', faktor: 1 }
] as const;

export const Widget8Timbangan: React.FC<WidgetProps> = ({
  stage,
  modeKelas,
  langkahAktif,
  isContoh = false,
  onMimoReact,
  onWowTriggered
}) => {
  const SEMBAKO_LIST = isContoh ? SEMBAKO_CONTOH : SEMBAKO_LATIHAN;
  const targetTotal = isContoh ? 2500 : 3680;

  const [leftIds, setLeftIds] = useState<string[]>(['beras1']);
  const [rightWeights, setRightWeights] = useState<BrassWeight[]>([
    { uid: 'w-init-1', gram: 1000, label: '1 kg' }
  ]);
  const [ladderItem, setLadderItem] = useState<SembakoItem | null>(SEMBAKO_LIST[1]);
  const [parcelOpened, setParcelOpened] = useState(false);
  const [draggingWeight, setDraggingWeight] = useState<{
    pointerId: number;
    gram: number;
    label: string;
    x: number;
    y: number;
  } | null>(null);
  const [draggingSembako, setDraggingSembako] = useState<{
    pointerId: number;
    item: SembakoItem;
    x: number;
    y: number;
  } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const rightPanRef = useRef<SVGGElement | null>(null);
  const leftPanRef = useRef<SVGGElement | null>(null);
  const ladderRef = useRef<HTMLDivElement | null>(null);

  // Reset cleanly when switching between Contoh Guru and Soal Latihan
  useEffect(() => {
    setLeftIds(['beras1']);
    setRightWeights(
      isContoh
        ? [{ uid: 'w-c-1', gram: 1000, label: '1 kg' }]
        : [
            { uid: 'w-l-1', gram: 1000, label: '1 kg' },
            { uid: 'w-l-2', gram: 1000, label: '1 kg' }
          ]
    );
    setLadderItem(isContoh ? SEMBAKO_CONTOH[1] : SEMBAKO_LATIHAN[1]);
    setParcelOpened(false);
  }, [isContoh]);

  const leftGram = leftIds.reduce((sum, id) => {
    const it = SEMBAKO_LIST.find((x) => x.id === id);
    return sum + (it ? it.gram : 0);
  }, 0);
  const rightGram = rightWeights.reduce((sum, w) => sum + w.gram, 0);

  const diff = rightGram - leftGram;
  const targetAngle = Math.max(-18, Math.min(18, diff / 85));
  const [beamAngle, setBeamAngle] = useState(0);
  const velRef = useRef(0);
  const angleRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const step = () => {
      const stiffness = 0.12;
      const damping = 0.78;
      const force = (targetAngle - angleRef.current) * stiffness;
      velRef.current = (velRef.current + force) * damping;
      angleRef.current += velRef.current;
      setBeamAngle(angleRef.current);
      if (Math.abs(targetAngle - angleRef.current) > 0.04 || Math.abs(velRef.current) > 0.04) {
        raf = requestAnimationFrame(step);
      } else {
        angleRef.current = targetAngle;
        setBeamAngle(targetAngle);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [targetAngle]);

  const isBalanced = leftGram > 0 && leftGram === rightGram;
  const isFullPackageBalanced = leftIds.length === SEMBAKO_LIST.length && rightGram === targetTotal;

  useEffect(() => {
    if (isFullPackageBalanced && !parcelOpened) {
      setParcelOpened(true);
      sound.ding();
      onWowTriggered?.();
      onMimoReact(
        'kaget',
        `TING! Kiri dan kanan sudah SEIMBANG sempurna! Sekarang hitung jumlah semua anak timbangan di piring kanan untuk menemukan berat totalnya!`
      );
    } else if (isBalanced && leftIds.length < SEMBAKO_LIST.length && leftGram > 0) {
      sound.ding();
      onMimoReact('senang', `Pas seimbang! Coba tambahkan sembako lain di piring kiri.`);
    }
  }, [isBalanced, isFullPackageBalanced, leftGram, leftIds.length, parcelOpened, SEMBAKO_LIST.length, onMimoReact, onWowTriggered]);

  useEffect(() => {
    if (stage !== 3) return;
    if (langkahAktif === 0) {
      setLadderItem(SEMBAKO_LIST[1]);
    } else if (langkahAktif === 1 && isContoh) {
      setLeftIds(SEMBAKO_LIST.map((s) => s.id));
      setRightWeights(
        isContoh
          ? [
              { uid: 'sc1', gram: 1000, label: '1 kg' },
              { uid: 'sc2', gram: 1000, label: '1 kg' },
              { uid: 'sc3', gram: 500, label: '500 g' }
            ]
          : [
              { uid: 's1', gram: 1000, label: '1 kg' },
              { uid: 's2', gram: 1000, label: '1 kg' },
              { uid: 's3', gram: 1000, label: '1 kg' },
              { uid: 's4', gram: 500, label: '500 g' },
              { uid: 's5', gram: 100, label: '100 g' },
              { uid: 's6', gram: 50, label: '50 g' },
              { uid: 's7', gram: 20, label: '20 g' },
              { uid: 's8', gram: 10, label: '10 g' }
            ]
      );
    }
  }, [stage, langkahAktif, isContoh, SEMBAKO_LIST]);

  const toggleLeftItem = (item: SembakoItem) => {
    sound.unlock();
    setLadderItem(item);
    setLeftIds((prev) => {
      const exists = prev.includes(item.id);
      if (exists) {
        sound.pop();
        setParcelOpened(false);
        return prev.filter((id) => id !== item.id);
      } else {
        sound.click();
        onMimoReact('berpikir', `${item.nama} (${item.labelUnit}) naik ke piring kiri! Cek tangganya jika ingin ubah ke gram.`);
        return [...prev, item.id];
      }
    });
  };

  const addRightWeight = (gram: number, label: string) => {
    sound.unlock();
    sound.click();
    setRightWeights((prev) => [...prev, { uid: `w-${Date.now()}-${Math.random()}`, gram, label }]);
  };

  const removeRightWeight = (uid: string) => {
    sound.unlock();
    sound.pop();
    setParcelOpened(false);
    setRightWeights((prev) => prev.filter((w) => w.uid !== uid));
  };

  const loadAllSembako = () => {
    sound.unlock();
    sound.pop();
    setLeftIds(SEMBAKO_LIST.map((s) => s.id));
    onMimoReact('berpikir', 'Semua isi paket sudah di piring kiri! Ayo seimbangkan piring kanan!');
  };

  const resetScale = () => {
    sound.unlock();
    sound.pop();
    setLeftIds([]);
    setRightWeights([]);
    setParcelOpened(false);
    onMimoReact('senang', 'Timbangan dikosongkan. Ayo mulai menimbang lagi!');
  };

  const handleWeightPointerDown = (e: React.PointerEvent, gram: number, label: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.unlock();
    setDraggingWeight({ pointerId: e.pointerId, gram, label, x: e.clientX, y: e.clientY });
  };

  const handleSembakoPointerDown = (e: React.PointerEvent, item: SembakoItem) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    sound.unlock();
    setDraggingSembako({ pointerId: e.pointerId, item, x: e.clientX, y: e.clientY });
  };

  const handleGlobalPointerMove = (e: React.PointerEvent) => {
    if (draggingWeight && e.pointerId === draggingWeight.pointerId) {
      setDraggingWeight((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
    }
    if (draggingSembako && e.pointerId === draggingSembako.pointerId) {
      setDraggingSembako((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
    }
  };

  const handleGlobalPointerUp = (e: React.PointerEvent) => {
    if (draggingWeight && e.pointerId === draggingWeight.pointerId) {
      addRightWeight(draggingWeight.gram, draggingWeight.label);
      setDraggingWeight(null);
    }

    if (draggingSembako && e.pointerId === draggingSembako.pointerId) {
      const ladRect = ladderRef.current?.getBoundingClientRect();
      if (
        ladRect &&
        e.clientX >= ladRect.left &&
        e.clientX <= ladRect.right &&
        e.clientY >= ladRect.top &&
        e.clientY <= ladRect.bottom
      ) {
        sound.ding();
        setLadderItem(draggingSembako.item);
        onMimoReact(
          'senang',
          `Tangga satuan: ${draggingSembako.item.labelUnit} berada di tangga ${draggingSembako.item.unitAsli.toUpperCase()}. Hitung turun berapa tangga ke gram (× 10 tiap tangga)!`
        );
      } else {
        toggleLeftItem(draggingSembako.item);
      }
      setDraggingSembako(null);
    }
  };

  const rad = (beamAngle * Math.PI) / 180;
  const armLen = 155;
  const leftPanX = 280 - Math.cos(rad) * armLen;
  const leftPanY = 122 - Math.sin(rad) * armLen;
  const rightPanX = 280 + Math.cos(rad) * armLen;
  const rightPanY = 122 + Math.sin(rad) * armLen;

  const sugarCount = leftIds
    .map((id) => SEMBAKO_LIST.find((x) => x.id === id))
    .filter((x) => x?.kategori === 'gula').length;

  const miCount = leftIds
    .map((id) => SEMBAKO_LIST.find((x) => x.id === id))
    .filter((x) => x?.kategori === 'mi').length;

  return (
    <div
      ref={stageRef}
      onPointerMove={handleGlobalPointerMove}
      onPointerUp={handleGlobalPointerUp}
      onPointerCancel={handleGlobalPointerUp}
      className="touch-pan-y relative flex flex-col gap-4 select-none"
    >
      {modeKelas === 'berdua' && (
        <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
          <div className="rounded-xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 px-3 py-2 text-sky-900 dark:text-sky-100 text-center">
            Siswa Kiri: Ketuk / seret sembako ke piring kiri
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-2 text-amber-900 dark:text-amber-100 text-center">
            Siswa Kanan: Seret / ketuk anak timbangan ke piring kanan
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {isContoh ? 'Sembako (Contoh Guru)' : 'Tumpukan Sembako'}
            </span>
            <button
              type="button"
              onClick={loadAllSembako}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 underline cursor-pointer px-2 py-1"
            >
              Muat Semua
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {SEMBAKO_LIST.map((item) => {
              const onPan = leftIds.includes(item.id);
              const highlight =
                (stage === 3 && langkahAktif === 2 && item.kategori === 'mi') ||
                (stage === 3 && langkahAktif === 3 && item.kategori === 'gula');
              return (
                <button
                  key={item.id}
                  type="button"
                  onPointerDown={(e) => handleSembakoPointerDown(e, item)}
                  className={`min-h-[64px] rounded-xl border-2 px-2 py-1.5 text-left transition-transform active:scale-95 cursor-pointer flex flex-col justify-center ${
                    onPan
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                  } ${highlight ? 'ring-4 ring-amber-400' : ''}`}
                >
                  <div className="text-xs font-bold truncate">{item.nama}</div>
                  <div className="font-mono-num text-sm font-semibold">{item.labelUnit}</div>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300">
            Ketuk untuk naik/turun timbangan, atau seret ke tangga satuan di bawah.
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between text-sm px-2">
            <div className="font-mono-num font-bold text-sky-700 dark:text-sky-400">
              Kiri: {leftIds.length} sembako
            </div>
            <div
              className={`font-bold px-3 py-1 rounded-lg text-xs ${
                isBalanced
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isBalanced ? 'SEIMBANG!' : diff > 0 ? 'Kanan Lebih Berat' : leftGram > rightGram ? 'Kiri Lebih Berat' : 'Kosong'}
            </div>
            <div className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
              Kanan: {rightWeights.length} anak timbangan
            </div>
          </div>

          <svg viewBox="0 0 560 280" className="w-full max-w-[540px] h-auto">
            <path d="M210 262 L350 262 L332 240 L228 240 Z" fill="#334155" />
            <rect x="271" y="122" width="18" height="122" rx="6" fill="#475569" />
            <circle cx="280" cy="122" r="14" fill={isBalanced ? '#10B981' : '#F59E0B'} stroke="#0F172A" strokeWidth="3" />

            <g transform={`rotate(${beamAngle}, 280, 122)`}>
              <rect
                x="115"
                y="115"
                width="330"
                height="14"
                rx="7"
                fill={isBalanced ? '#10B981' : '#64748B'}
                stroke="#0F172A"
                strokeWidth="2.5"
              />
              <circle cx="125" cy="122" r="6" fill="#0F172A" />
              <circle cx="435" cy="122" r="6" fill="#0F172A" />
              <polygon points="280,82 273,115 287,115" fill={isBalanced ? '#10B981' : '#EF4444'} />
            </g>

            <g ref={leftPanRef} transform={`translate(${leftPanX}, ${leftPanY})`}>
              <line x1="0" y1="0" x2="-48" y2="75" stroke="#94A3B8" strokeWidth="2.5" />
              <line x1="0" y1="0" x2="48" y2="75" stroke="#94A3B8" strokeWidth="2.5" />
              <path d="M-62 75 Q0 95 62 75 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
              {leftIds.slice(0, 10).map((id, idx) => {
                const it = SEMBAKO_LIST.find((s) => s.id === id);
                if (!it) return null;
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                return (
                  <g key={id} transform={`translate(${-42 + col * 22}, ${54 - row * 18})`}>
                    <rect width="20" height="16" rx="3" fill={it.warna} stroke="#FFFFFF" strokeWidth="1.5" />
                  </g>
                );
              })}
              <text x="0" y="106" textAnchor="middle" fontSize="13" fontWeight="700" className="fill-slate-700 dark:fill-slate-200 font-mono-num">
                {leftIds.length} barang
              </text>
            </g>

            <g ref={rightPanRef} transform={`translate(${rightPanX}, ${rightPanY})`}>
              <line x1="0" y1="0" x2="-48" y2="75" stroke="#94A3B8" strokeWidth="2.5" />
              <line x1="0" y1="0" x2="48" y2="75" stroke="#94A3B8" strokeWidth="2.5" />
              <path d="M-62 75 Q0 95 62 75 Z" fill="#D97706" stroke="#B45309" strokeWidth="2.5" />
              {rightWeights.slice(0, 12).map((w, idx) => {
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                return (
                  <g
                    key={w.uid}
                    onClick={() => removeRightWeight(w.uid)}
                    className="cursor-pointer"
                    transform={`translate(${-42 + col * 22}, ${53 - row * 18})`}
                  >
                    <rect width="20" height="17" rx="4" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5" />
                    <text x="10" y="12" textAnchor="middle" fontSize="8" fontWeight="700" fill="#451A03">
                      {w.gram >= 1000 ? '1k' : w.gram}
                    </text>
                  </g>
                );
              })}
              <text x="0" y="106" textAnchor="middle" fontSize="13" fontWeight="700" className="fill-slate-700 dark:fill-slate-200 font-mono-num">
                Ketuk batu untuk lepas
              </text>
            </g>

            {parcelOpened && (
              <g className="animate-celebrate-pop">
                <rect x="120" y="12" width="320" height="46" rx="12" fill="#ECFDF5" stroke="#10B981" strokeWidth="2.5" />
                <text x="280" y="33" textAnchor="middle" fontSize="14" fontWeight="800" fill="#065F46">
                  SEIMBANG SEMPURNA!
                </text>
                <text x="280" y="50" textAnchor="middle" fontSize="11" fontWeight="600" fill="#047857">
                  Jumlahkan semua batu timbangan di kanan untuk tahu totalnya!
                </text>
              </g>
            )}
          </svg>

          <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-mono-num text-slate-600 dark:text-slate-300">
              Di kiri: <strong>{sugarCount} gula</strong> · <strong>{miCount} mi</strong> · batu di kanan: <strong>{rightWeights.length} buah</strong>
            </span>
            <button
              type="button"
              onClick={resetScale}
              className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              Kosongkan Timbangan
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Anak Timbangan</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Seret / Ketuk</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {WEIGHT_TEMPLATES.map((wt) => (
              <button
                key={wt.gram}
                type="button"
                onPointerDown={(e) => handleWeightPointerDown(e, wt.gram, wt.label)}
                className="min-h-[64px] rounded-xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-100 font-mono-num font-bold text-base flex flex-col items-center justify-center shadow-sm hover:bg-amber-200 active:scale-95 transition-transform cursor-grab"
              >
                <span>{wt.label}</span>
                <span className="text-[11px] font-sans font-medium opacity-80">
                  {wt.gram >= 1000 ? '= 1.000 g' : '+ taruh'}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-600 dark:text-slate-300">
            Anak timbangan di piring kanan: {rightWeights.length} buah.
          </div>
        </div>
      </div>

      <div
        ref={ladderRef}
        className={`rounded-2xl border p-4 transition-colors ${
          stage === 3 && langkahAktif === 0
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 ring-2 ring-amber-400'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Tangga Konversi Satuan Berat (turun 1 tangga = × 10)
          </div>
          {ladderItem && (
            <div className="font-mono-num text-sm font-bold text-blue-700 dark:text-blue-400">
              Posisi awal: {ladderItem.nama} ({ladderItem.labelUnit}) → hitung sendiri berapa gram!
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {TANGGA_SATUAN.map((step, idx) => {
            const isOrigin = ladderItem?.unitAsli === step.unit;
            const originIdx = TANGGA_SATUAN.findIndex((s) => s.unit === ladderItem?.unitAsli);
            const stepsDown = originIdx >= 0 ? idx - originIdx : -1;
            return (
              <div
                key={step.unit}
                style={{ marginTop: `${idx * 6}px` }}
                className={`rounded-xl border p-2.5 text-center transition-all ${
                  isOrigin
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : step.unit === 'g'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold uppercase">{step.unit}</div>
                <div className="font-mono-num text-base font-bold mt-0.5">
                  {isOrigin && ladderItem
                    ? formatAngkaID(ladderItem.nilaiAsli)
                    : stepsDown > 0
                      ? `× ${formatAngkaID(Math.pow(10, stepsDown))}`
                      : '—'}
                </div>
                <div className="text-[11px] opacity-80 truncate">{step.nama}</div>
              </div>
            );
          })}
        </div>
      </div>

      {draggingWeight && (
        <div
          style={{ left: draggingWeight.x - 42, top: draggingWeight.y - 32 }}
          className="fixed z-50 pointer-events-none w-[84px] h-[64px] rounded-xl bg-amber-300 border-2 border-amber-700 text-amber-950 font-mono-num font-bold flex items-center justify-center shadow-lg"
        >
          {draggingWeight.label}
        </div>
      )}
      {draggingSembako && (
        <div
          style={{ left: draggingSembako.x - 48, top: draggingSembako.y - 32 }}
          className="fixed z-50 pointer-events-none px-3 h-[64px] rounded-xl bg-blue-600 border-2 border-blue-800 text-white font-bold flex items-center justify-center shadow-lg"
        >
          {draggingSembako.item.nama} ({draggingSembako.item.labelUnit})
        </div>
      )}
    </div>
  );
};
