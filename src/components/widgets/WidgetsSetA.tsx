import React, { useState, useEffect, useRef } from 'react';
import { sound, formatAngkaID } from '../../utils/sound';
import { WidgetProps } from './Widget8Timbangan';

// ==================== SOAL 1: MESIN RODA GIGI TIGA BENTUK + GARIS BILANGAN GESER ====================
export const Widget1MesinBentuk: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [sliderVal, setSliderVal] = useState(0); // -1 to 2
  const [pinChecked, setPinChecked] = useState<'idle' | 'ok' | 'wrong'>('idle');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    setCheckedIds([]);
    setSliderVal(0);
    setPinChecked('idle');
  }, [isContoh]);

  const cards = isContoh
    ? [
        { id: 0, raw: '100%', clue: '100/100 = ?', jenis: 'Persen', isMul: false },
        { id: 1, raw: '− 1', clue: 'Kurangi 1', jenis: 'Bilangan Bulat', isMul: false },
        { id: 2, raw: '+ 2 × 0,5', clue: 'Dahulukan × !', jenis: 'Perkalian', isMul: true },
        { id: 3, raw: '+ 1/2', clue: 'Ubah 1 ÷ 2 = ?', jenis: 'Pecahan', isMul: false }
      ]
    : [
        { id: 0, raw: '150%', clue: '150/100 = ?', jenis: 'Persen', isMul: false },
        { id: 1, raw: '− 2', clue: 'Kurangi 2', jenis: 'Bilangan Bulat', isMul: false },
        { id: 2, raw: '+ 3 × 0,25', clue: 'Dahulukan × !', jenis: 'Perkalian', isMul: true },
        { id: 3, raw: '+ 1/2', clue: 'Ubah 1 ÷ 2 = ?', jenis: 'Pecahan', isMul: false }
      ];

  const hasil = isContoh ? 1.5 : 0.75;

  const valToX = (v: number) => 40 + ((v + 1) / 3) * 440;
  const clientXToVal = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const xSvg = ((clientX - rect.left) / rect.width) * 520;
    const raw = ((xSvg - 40) / 440) * 3 - 1;
    const snapped = Math.round(raw * 4) / 4; // snap 0.25
    return Math.max(-1, Math.min(2, snapped));
  };

  const handleMarkerMove = (val: number) => {
    setSliderVal(val);
    setPinChecked('idle');
    sound.pop();
  };

  const toggleToken = (id: number) => {
    sound.pop();
    setCheckedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length === 4) {
        onMimoReact('senang', 'Bagus! Semua petunjuk suku terbuka. Hitung nilainya satu per satu lalu geser pin garis bilangan!');
      }
      return next;
    });
  };

  const checkPin = () => {
    sound.unlock();
    if (Math.abs(sliderVal - hasil) < 0.01) {
      setPinChecked('ok');
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `PAS! Posisi ${formatAngkaID(sliderVal, 2)} tepat di garis bilangan! Sekarang nyatakan dalam bentuk pecahan biasa ya!`);
    } else {
      setPinChecked('wrong');
      sound.softWrong();
      onMimoReact('bingung', `Pin di ${formatAngkaID(sliderVal, 2)} belum tepat. Ingat dahulukan perkalian sebelum penjumlahan dan pengurangan!`);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            Mesin Roda Gigi Tiga Bentuk — Ketuk tiap kartu untuk cek petunjuk operasi, lalu geser pin garis bilangan!
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ingat aturan urutan operasi: kerjakan perkalian terlebih dahulu sebelum penjumlahan & pengurangan!
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.click();
            setCheckedIds([]);
            setSliderVal(0);
            setPinChecked('idle');
          }}
          className="min-h-[48px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Interactive Gear Token Conveyor */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => {
          const isOpen = checkedIds.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleToken(c.id)}
              className={`min-h-[104px] rounded-2xl border-2 p-3 flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95 ${
                c.isMul && isOpen
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 shadow-xs'
                  : isOpen
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>{c.jenis}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10l2.1 2.1m0-14.2l-2.1 2.1m-10 10l-2.1 2.1" />
                </svg>
              </div>
              <div className="font-mono-num text-xl font-extrabold text-slate-900 dark:text-white">
                {c.raw}
              </div>
              <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                {isOpen ? c.clue : 'Ketuk cek petunjuk'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Draggable Number Line */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
          <span className="text-slate-700 dark:text-slate-200">
            Geser penunjuk biru di garis bilangan ke letak hasil hitunganmu, lalu tekan Uji Pin!
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-mono-num px-2.5 py-1 rounded-lg ${pinChecked === 'ok' ? 'bg-emerald-600 text-white' : 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'}`}>
              Posisi Pin: {formatAngkaID(sliderVal, 2)}
            </span>
            <button
              type="button"
              onClick={checkPin}
              className="min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
            >
              Uji Posisi Pin
            </button>
          </div>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 520 105"
          className="w-full max-w-[640px] mx-auto touch-stage cursor-ew-resize"
          onPointerDown={(e) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            handleMarkerMove(clientXToVal(e.clientX));
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            handleMarkerMove(clientXToVal(e.clientX));
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
        >
          <line x1="40" y1="62" x2="480" y2="62" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          {[-1, -0.5, 0, 0.25, 0.5, 0.75, 1, 1.5, 2].map((v) => {
            const x = valToX(v);
            const major = Number.isInteger(v) || v === 0.5 || v === 1.5 || v === 0.75;
            return (
              <g key={v}>
                <line x1={x} y1={major ? 50 : 56} x2={x} y2={major ? 74 : 68} stroke="#64748B" strokeWidth={major ? 2.5 : 1.5} />
                {(Number.isInteger(v) || v === 0.5 || v === 0.75 || v === 1.5) && (
                  <text x={x} y="92" textAnchor="middle" fontSize="11" fontWeight="700" className="fill-slate-700 dark:fill-slate-300 font-mono-num">
                    {formatAngkaID(v, 2)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Draggable Flag Pin */}
          <g transform={`translate(${valToX(sliderVal)}, 0)`}>
            <line x1="0" y1="22" x2="0" y2="62" stroke={pinChecked === 'ok' ? '#059669' : '#2563EB'} strokeWidth="4" />
            <circle cx="0" cy="62" r="10" fill={pinChecked === 'ok' ? '#10B981' : '#2563EB'} stroke="#FFFFFF" strokeWidth="3" />
            <rect x="-32" y="4" width="64" height="24" rx="8" fill={pinChecked === 'ok' ? '#059669' : '#1D4ED8'} />
            <text x="0" y="20" textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
              {formatAngkaID(sliderVal, 2)}
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

// ==================== SOAL 2: TOKO MENTARI (GUNTING GESER PITA DISKON) ====================
export const Widget2TokoMentari: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [cutPct, setCutPct] = useState(0); // 0 to 100
  const [cutDone, setCutDone] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    setCutPct(0);
    setCutDone(false);
  }, [isContoh]);

  const diskon = isContoh ? 10 : 20;
  const hargaKomik = isContoh ? 10000 : 20000;
  const item1Nama = isContoh ? 'Penggaris (1/2 komik)' : 'Buku Gambar (1/2 komik)';
  const item2Nama = isContoh ? 'Pensil (1× komik)' : 'Buku Tulis (0,75× komik)';

  const updateCutFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    setCutPct(pct);
    if (pct >= 88 && !cutDone) {
      setCutDone(true);
      sound.tear();
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `KREK! Pita diskon ${diskon}% terpotong jatuh! Sekarang hitung harga masing-masing barang, jumlahkan, lalu hitung sisa persen yang dibayar!`);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">
            Toko Mentari — Harga Komik: Rp{formatAngkaID(hargaKomik)} · Diskon {diskon}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Geser gunting ke kanan di atas pita harga untuk memotong diskon {diskon}%!
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (cutDone) {
              sound.click();
              setCutDone(false);
              setCutPct(0);
            } else {
              sound.tear();
              sound.ding();
              setCutPct(100);
              setCutDone(true);
              onMimoReact('kaget', `KREK! Diskon ${diskon}% terpotong! Hitung dulu harga masing-masing barang dan totalnya ya!`);
            }
          }}
          className="min-h-[52px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
        >
          {cutDone ? 'Sambung Ulang Pita' : `Gunting Pita Diskon ${diskon}%`}
        </button>
      </div>

      {/* Petunjuk Harga Barang (tanpa membocorkan hasil hitungan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">{item1Nama}</div>
          <div className="font-mono-num text-base font-extrabold mt-1 text-slate-900 dark:text-white">
            1/2 × Rp{formatAngkaID(hargaKomik)} = Rp?
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">{item2Nama}</div>
          <div className="font-mono-num text-base font-extrabold mt-1 text-slate-900 dark:text-white">
            {isContoh ? '1' : '0,75'} × Rp{formatAngkaID(hargaKomik)} = Rp?
          </div>
        </div>
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-300 dark:border-blue-700">
          <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
            {cutDone ? 'Bagian yang Harus Dibayar' : 'Total Sebelum Diskon'}
          </div>
          <div className="font-mono-num text-lg font-extrabold mt-1 text-slate-900 dark:text-white">
            {cutDone ? `100% − ${diskon}% = ?% dari Total` : 'Barang 1 + Barang 2 = Rp?'}
          </div>
        </div>
      </div>

      {/* Draggable Scissor Cut Zone */}
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 space-y-3">
        <div className="flex justify-between text-xs font-bold">
          <span>Geser Gunting Sepanjang Pita ({cutPct}%)</span>
          {cutDone && <span className="text-emerald-700 dark:text-emerald-400">Bagian diskon −{diskon}% terlepas!</span>}
        </div>

        <div
          ref={trackRef}
          className="relative h-16 rounded-xl touch-stage cursor-ew-resize select-none"
          onPointerDown={(e) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            updateCutFromClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            updateCutFromClientX(e.clientX);
          }}
          onPointerUp={() => {
            draggingRef.current = false;
          }}
        >
          <div className="h-14 w-full rounded-xl overflow-hidden flex border-2 border-slate-300 dark:border-slate-600">
            <div
              style={{ width: `${100 - diskon}%` }}
              className="bg-emerald-600 text-white font-mono-num font-bold flex items-center justify-center text-sm"
            >
              Bagian Bayar (100% − {diskon}% = ?%)
            </div>
            <div
              style={{ width: `${diskon}%` }}
              className={`bg-amber-400 text-slate-950 font-mono-num font-bold flex items-center justify-center text-xs transition-all duration-500 ${
                cutDone ? 'opacity-25 translate-y-6 rotate-6' : ''
              }`}
            >
              −{diskon}%
            </div>
          </div>

          {/* Cut dashed trail */}
          <div
            style={{ width: `${cutPct}%` }}
            className="absolute top-6 left-0 h-1 border-b-2 border-dashed border-rose-600 pointer-events-none"
          />

          {/* Draggable SVG Scissor Handle */}
          <div
            style={{ left: `calc(${cutPct}% - 22px)` }}
            className="absolute top-1 w-11 h-11 rounded-full bg-white dark:bg-slate-900 border-2 border-rose-600 shadow-md flex items-center justify-center pointer-events-none"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 3: DAPUR JUS (TEKO MIRING TUANG CAIRAN ANIMASI) ====================
export const Widget3DapurJus: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [poured, setPoured] = useState(0);
  const [tilting, setTilting] = useState(false);

  useEffect(() => {
    setPoured(0);
    setTilting(false);
  }, [isContoh]);

  const wadahCount = isContoh ? 4 : 6;
  const literPerWadah = isContoh ? 2 : 2.5;
  const totalLiter = wadahCount * literPerWadah;
  const bigBottles = isContoh ? 12 : 25;
  const smallBottles = isContoh ? 8 : 10;
  const bigFilled = Math.round((poured / wadahCount) * bigBottles);
  const smallFilled = Math.round((poured / wadahCount) * smallBottles);
  const pouredLiter = poured * literPerWadah;

  const pourOne = () => {
    if (poured >= wadahCount) return;
    sound.pop();
    setTilting(true);
    setTimeout(() => setTilting(false), 380);
    const next = poured + 1;
    setPoured(next);
    if (next === wadahCount) {
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `Semua ${wadahCount} teko sudah tertuang! Sekarang hitung total liternya, volume botol besar, lalu berapa botol kecil yang tersisa!`);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">
            Dapur Jus — {wadahCount} Teko × {formatAngkaID(literPerWadah, 1)} L = ? Liter
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ketuk teko untuk memiringkan & menuang jus ke botol besar (1/2 L) dan botol kecil (1/4 L)!
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={poured >= wadahCount}
            onClick={pourOne}
            className="min-h-[52px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-sm cursor-pointer"
          >
            Tuang 1 Teko ({poured}/{wadahCount})
          </button>
          <button
            type="button"
            onClick={() => { sound.click(); setPoured(0); }}
            className="min-h-[52px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Animated Pitcher + Stream SVG + Bottles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        <button
          type="button"
          onClick={pourOne}
          className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 p-4 flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
        >
          <svg viewBox="0 0 180 140" className="w-44 h-36">
            {/* Pitcher group with tilt animation */}
            <g transform={tilting ? 'translate(85, 55) rotate(-32) translate(-70, -55)' : 'translate(10, 10)'} className="transition-transform duration-300">
              <path d="M40 30 L105 30 L120 42 L105 50 L100 108 L45 108 Z" fill="#FDE68A" stroke="#D97706" strokeWidth="4" strokeLinejoin="round" />
              <path d="M44 55 L102 55 L98 105 L47 105 Z" fill="#F59E0B" />
              <path d="M40 40 C18 40, 18 90, 42 90" fill="none" stroke="#B45309" strokeWidth="6" strokeLinecap="round" />
              <text x="72" y="84" textAnchor="middle" fontSize="13" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
                {formatAngkaID(literPerWadah, 1)} L
              </text>
            </g>
            {tilting && (
              <path d="M126 52 Q145 85 142 132" fill="none" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" />
            )}
          </svg>
          <div className="font-mono-num font-bold text-sm text-amber-900 dark:text-amber-200">
            Tertuang: {poured} dari {wadahCount} teko (@ {formatAngkaID(literPerWadah, 1)} L)
          </div>
        </button>

        <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
          <div className="text-xs font-bold mb-2">
            Botol Besar @ 1/2 L ({bigFilled} botol terisi)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: bigBottles }).map((_, i) => {
              const full = i < bigFilled;
              return (
                <div key={i} className="w-6 h-12 rounded-md border-2 border-amber-700/60 bg-white dark:bg-slate-900 relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-amber-500 transition-all duration-300 ${
                      full ? 'h-[82%]' : 'h-0'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 p-4">
          <div className="text-xs font-bold mb-2">
            Botol Kecil @ 1/4 L ({smallFilled} botol terisi)
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            {Array.from({ length: smallBottles }).map((_, i) => {
              const full = i < smallFilled;
              return (
                <div key={i} className="w-5 h-8 rounded-md border-2 border-sky-700/60 bg-white dark:bg-slate-900 relative overflow-hidden">
                  <div
                    className={`absolute bottom-0 left-0 right-0 bg-sky-500 transition-all duration-300 ${
                      full ? 'h-[82%]' : 'h-0'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 4: PETAK KEBUN (PILIH BIBIT & TANAM SENDIRI DI 12 PETAK) ====================
export const Widget4PetakKebun: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  type Crop = 'kosong' | 'jagung' | 'kedelai' | 'singkong';
  const [brush, setBrush] = useState<'jagung' | 'kedelai' | 'singkong'>('jagung');
  const [plots, setPlots] = useState<Crop[]>(Array(12).fill('kosong'));

  useEffect(() => {
    setPlots(Array(12).fill('kosong'));
  }, [isContoh]);

  const totalHa = isContoh ? 6 : 4.8;
  const targetJagung = isContoh ? 6 : 3; // 1/2 vs 1/4 of 12
  const targetKedelai = 4; // 1/3 of 12
  const targetSingkong = 12 - targetJagung - targetKedelai; // 2 vs 5

  const countJagung = plots.filter((p) => p === 'jagung').length;
  const countKedelai = plots.filter((p) => p === 'kedelai').length;
  const countSingkong = plots.filter((p) => p === 'singkong').length;

  const isMatched =
    countJagung === targetJagung && countKedelai === targetKedelai && countSingkong === targetSingkong;

  const paintPlot = (idx: number) => {
    sound.pop();
    setPlots((prev) => {
      const next = [...prev];
      next[idx] = next[idx] === brush ? 'kosong' : brush;
      const nj = next.filter((p) => p === 'jagung').length;
      const nk = next.filter((p) => p === 'kedelai').length;
      const ns = next.filter((p) => p === 'singkong').length;
      if (nj === targetJagung && nk === targetKedelai && ns === targetSingkong) {
        sound.ding();
        onWowTriggered?.();
        onMimoReact(
          'kaget',
          `Lahan 12 petak penuh sesuai soal! Sekarang hitung berapa hektar tiap petak, lalu jumlahkan luas Kedelai + Singkong!`
        );
      }
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">
            Kebun Tani {formatAngkaID(totalHa, 1)} Ha (12 Petak Sama Besar · 1 Petak = ? ha)
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Pilih bibit di bawah, lalu ketuk petak tanah untuk menanam ({isContoh ? '1/2' : '1/4'} Jagung, 1/3 Kedelai, sisa Singkong)!
          </div>
        </div>
        <button
          type="button"
          onClick={() => { sound.click(); setPlots(Array(12).fill('kosong')); }}
          className="min-h-[48px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
        >
          Bersihkan
        </button>
      </div>

      {/* Seed Brush Selector */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { id: 'jagung' as const, label: `Jagung (${countJagung} petak)`, cls: 'bg-amber-400 border-amber-600 text-slate-950' },
          { id: 'kedelai' as const, label: `Kedelai (${countKedelai} petak)`, cls: 'bg-emerald-500 border-emerald-700 text-white' },
          { id: 'singkong' as const, label: `Singkong (${countSingkong} petak)`, cls: 'bg-sky-500 border-sky-700 text-white' }
        ].map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => { sound.click(); setBrush(b.id); }}
            className={`min-h-[48px] rounded-xl border-2 font-bold text-xs px-2 cursor-pointer transition-all ${
              brush === b.id ? `${b.cls} ring-2 ring-blue-600` : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
            }`}
          >
            Bibit {b.label}
          </button>
        ))}
      </div>

      {/* 12 Soil Plots */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {plots.map((crop, i) => {
          const style =
            crop === 'jagung'
              ? 'bg-amber-400 border-amber-700 text-slate-950'
              : crop === 'kedelai'
                ? 'bg-emerald-500 border-emerald-700 text-white'
                : crop === 'singkong'
                  ? 'bg-sky-500 border-sky-700 text-white'
                  : 'bg-amber-50/70 dark:bg-slate-800 border-dashed border-amber-400/70 text-slate-500';
          return (
            <button
              key={i}
              type="button"
              onClick={() => paintPlot(i)}
              className={`min-h-[70px] rounded-xl border-2 flex flex-col items-center justify-center font-bold text-xs cursor-pointer active:scale-95 transition-transform ${style}`}
            >
              <span className="uppercase">{crop === 'kosong' ? `Petak ${i + 1}` : crop}</span>
              <span className="font-mono-num text-[11px]">{crop === 'kosong' ? 'ketuk tanam' : '1/12 bagian'}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold font-mono-num">
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40">
          Jagung: {countJagung} petak
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
          Kedelai: {countKedelai} petak
        </div>
        <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40">
          Singkong: {countSingkong} petak
        </div>
      </div>
      {isMatched && (
        <div className="text-center text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
          ✓ Semua 12 petak sudah ditanam tepat sesuai pecahan soal! Hitung luas hektar bagian Kedelai + Singkong ya!
        </div>
      )}
    </div>
  );
};

// ==================== SOAL 5: LINTASAN KOLAM RENANG 3 PERENANG (KPK) ====================
export const Widget5KalenderRenang: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const s1 = isContoh ? 2 : 4;
  const s2 = isContoh ? 3 : 6;
  const s3 = isContoh ? 4 : 8;
  const kpk = isContoh ? 12 : 24;
  const maxDay = isContoh ? 14 : 26;

  const [pos, setPos] = useState<[number, number, number]>([0, 0, 0]);
  useEffect(() => setPos([0, 0, 0]), [isContoh]);

  const swimmers = [
    { name: 'Perenang A', step: s1, color: '#0284C7', bg: 'bg-sky-600' },
    { name: 'Perenang B', step: s2, color: '#D97706', bg: 'bg-amber-600' },
    { name: 'Perenang C', step: s3, color: '#E11D48', bg: 'bg-rose-600' }
  ];

  const allAtKpk = pos[0] === kpk && pos[1] === kpk && pos[2] === kpk;

  const jumpSwimmer = (idx: number) => {
    setPos((prev) => {
      const next = [...prev] as [number, number, number];
      const step = swimmers[idx].step;
      next[idx] = next[idx] + step > maxDay ? 0 : next[idx] + step;
      if (next[0] === kpk && next[1] === kpk && next[2] === kpk) {
        sound.ding();
        onWowTriggered?.();
        onMimoReact('kaget', `BYUR! Ketiga perenang bertemu tepat di pelampung hari ke-${kpk} (KPK)!`);
      } else {
        sound.pop();
      }
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">
            Kolam Renang KPK — Ketuk tiap perenang untuk melompat tiap {s1}, {s2}, dan {s3} hari!
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Temukan pelampung ke berapa ketiganya mendarat bersama!
          </div>
        </div>
        <button
          type="button"
          onClick={() => { sound.click(); setPos([0, 0, 0]); }}
          className="min-h-[48px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* 3-Lane Swimming Pool Track */}
      <div className="rounded-2xl bg-sky-100/80 dark:bg-sky-950/50 border-2 border-sky-300 dark:border-sky-800 p-3 space-y-2.5 overflow-x-auto">
        {swimmers.map((sw, idx) => {
          const curDay = pos[idx];
          const pct = (curDay / maxDay) * 100;
          return (
            <div key={sw.name} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => jumpSwimmer(idx)}
                className={`min-h-[48px] w-36 shrink-0 rounded-xl ${sw.bg} text-white font-bold text-xs px-2 cursor-pointer active:scale-95 transition-transform`}
              >
                {sw.name} (+{sw.step} hr)
              </button>
              <div className="flex-1 min-w-[320px] h-12 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-sky-200 dark:border-sky-800 relative flex items-center px-2">
                {/* KPK vertical marker line — only lights up once students align all 3 swimmers */}
                {allAtKpk && (
                  <div
                    style={{ left: `${(kpk / maxDay) * 100}%` }}
                    className="absolute top-0 bottom-0 w-1.5 bg-emerald-500 animate-pulse"
                  />
                )}
                {/* Jump dots */}
                {Array.from({ length: Math.floor(maxDay / sw.step) }).map((_, m) => {
                  const d = (m + 1) * sw.step;
                  const visited = d <= curDay;
                  return (
                    <div
                      key={d}
                      style={{ left: `${(d / maxDay) * 100}%` }}
                      className={`absolute -translate-x-1/2 w-5 h-5 rounded-full text-[9px] font-mono-num font-bold flex items-center justify-center ${
                        visited ? `${sw.bg} text-white` : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {d}
                    </div>
                  );
                })}
                {/* Swimmer Avatar */}
                <div
                  style={{ left: `${pct}%` }}
                  className="absolute -translate-x-1/2 top-0.5 px-2 py-0.5 rounded-full bg-slate-900 text-white font-mono-num text-[10px] font-extrabold shadow-sm transition-all duration-300"
                >
                  Hari {curDay}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== SOAL 6: TANG PEMOTONG KAWAT DI ATAS PENGGARIS ====================
export const Widget6GuntingKawat: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [cuts, setCuts] = useState(0);
  useEffect(() => setCuts(0), [isContoh]);

  const totalLen = isContoh ? 100 : 250;
  const pieceLen = isContoh ? 15 : 18;
  const maxCuts = Math.floor(totalLen / pieceLen);
  const used = cuts * pieceLen;
  const rem = totalLen - used;
  const cutRatio = used / totalLen;

  const snipOne = () => {
    if (cuts >= maxCuts) {
      sound.softWrong();
      onMimoReact('bingung', `Kawat yang tersisa tidak cukup lagi untuk 1 gantungan (${pieceLen} cm)! Hitung berapa potong yang didapat dan berapa sisa cm-nya!`);
      return;
    }
    sound.tear();
    const next = cuts + 1;
    setCuts(next);
    if (next === maxCuts) {
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `JEPRET! Potongan terakhir selesai dan kawat tersisa kurang dari ${pieceLen} cm! Sekarang hitung jumlah potongan dan sisanya!`);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold font-mono-num">
          Kawat {totalLen} cm · Tiap Gantungan {pieceLen} cm · Sudah Dipotong: {cuts} buah
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={snipOne}
            className="min-h-[52px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
          >
            Jepret Potong {pieceLen} cm
          </button>
          <button
            type="button"
            onClick={() => { sound.click(); setCuts(0); }}
            className="min-h-[52px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Wire on Brass Ruler SVG */}
      <svg viewBox="0 0 600 130" className="w-full">
        {/* Brass Ruler */}
        <rect x="20" y="70" width="560" height="36" rx="6" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
        {[0, 0.25, 0.5, 0.75, 1].map((r) => {
          const x = 20 + r * 560;
          return (
            <g key={r}>
              <line x1={x} y1="70" x2={x} y2="85" stroke="#92400E" strokeWidth="2" />
              <text x={x} y="100" textAnchor="middle" fontSize="11" fontWeight="700" fill="#78350F" className="font-mono-num">
                {Math.round(r * totalLen)} cm
              </text>
            </g>
          );
        })}

        {/* Remaining uncut steel wire */}
        <line
          x1={20 + cutRatio * 560}
          y1="52"
          x2="580"
          y2="52"
          stroke={cuts === maxCuts ? '#EA580C' : '#475569'}
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Cut wire segments */}
        {Array.from({ length: cuts }).map((_, i) => {
          const x1 = 20 + (i * pieceLen / totalLen) * 560;
          const w = (pieceLen / totalLen) * 560 - 3;
          return (
            <rect key={i} x={x1} y="44" width={Math.max(6, w)} height="14" rx="4" fill="#2563EB" />
          );
        })}

        {/* Wire Cutter Plier Icon moving along the wire */}
        <g transform={`translate(${20 + cutRatio * 560}, 16)`}>
          <circle cx="0" cy="14" r="14" fill="#DC2626" />
          <text x="0" y="18" textAnchor="middle" fontSize="12" fontWeight="800" fill="#FFFFFF">✂</text>
        </g>
      </svg>

      <div className="flex justify-between text-xs font-mono-num font-bold">
        <span className="text-blue-700 dark:text-blue-300">Potongan selesai: {cuts} gantungan (@ {pieceLen} cm)</span>
        <span className={cuts === maxCuts ? 'text-amber-700 dark:text-amber-300 font-extrabold' : 'text-slate-600 dark:text-slate-400'}>
          {cuts === maxCuts ? 'Sisa < 18 cm (tak cukup lagi!)' : 'Masih bisa dipotong lagi'}
        </span>
      </div>
    </div>
  );
};

// ==================== SOAL 7: BAN BERJALAN GUDANG BUKU KE TRUK ====================
export const Widget7GudangBuku: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [packed, setPacked] = useState(0);
  useEffect(() => setPacked(0), [isContoh]);

  const kelasLabels = isContoh ? ['Kelas 5 (15 siswa)', 'Kelas 6 (25 siswa)'] : ['4A (26 siswa)', '4B (34 siswa)', '4C (40 siswa)'];
  const siswa = isContoh ? 40 : 100;
  const perSiswa = isContoh ? 2 : 3;
  const totalBuku = siswa * perSiswa;
  const perDus = isContoh ? 20 : 25;
  const maxDus = totalBuku / perDus;
  const slotCount = maxDus + 3; // extra empty slots so students don't guess from grid count

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold font-mono-num">
            {kelasLabels.join(' + ')} · Setiap siswa dapat {perSiswa} buku
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            1 dus memuat {perDus} buku — Muat dus satu per satu sampai semua siswa kebagian!
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (packed >= maxDus) {
                sound.softWrong();
                onMimoReact('bingung', 'Semua siswa sudah kebagian buku! Tidak perlu tambah dus lagi.');
                return;
              }
              sound.pop();
              const next = packed + 1;
              setPacked(next);
              if (next === maxDus) {
                sound.ding();
                onWowTriggered?.();
                onMimoReact('bersorak', 'Pas! Semua buku untuk seluruh siswa sudah masuk ke dalam dus di truk! Hitung total dusnya ya!');
              }
            }}
            className="min-h-[52px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
          >
            + Muat 1 Dus ({packed} dus)
          </button>
          <button
            type="button"
            onClick={() => { sound.click(); setPacked(0); }}
            className="min-h-[52px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Conveyor + Truck Graphic */}
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Array.from({ length: slotCount }).map((_, i) => {
            const loaded = i < packed;
            const excess = i >= maxDus;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (excess) {
                    sound.softWrong();
                    onMimoReact('bingung', 'Slot ini kelebihan — semua jatah buku siswa sudah cukup!');
                    return;
                  }
                  sound.pop();
                  setPacked(i + 1);
                  if (i + 1 === maxDus) {
                    sound.ding();
                    onWowTriggered?.();
                    onMimoReact('bersorak', 'Pas! Semua buku sudah dimuat ke dalam truk!');
                  }
                }}
                className={`min-h-[68px] rounded-xl border-2 flex flex-col items-center justify-center font-mono-num font-bold text-xs cursor-pointer transition-all ${
                  loaded
                    ? 'bg-amber-600 border-amber-800 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:border-blue-400'
                }`}
              >
                <span>Dus #{i + 1}</span>
                <span>{loaded ? `${perDus} buku ✓` : 'Kosong'}</span>
              </button>
            );
          })}
        </div>
        {/* Conveyor Track */}
        <div className="h-5 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-between px-4 text-[11px] font-bold text-slate-800 dark:text-slate-100">
          <span>Status Gudang: {packed === maxDus ? 'Semua jatah buku sudah terangkut!' : 'Masih ada buku menunggu dimuat'}</span>
          <span>Dimuat: {packed} dus (@ {perDus} buku)</span>
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 9: SETIR MOBIL PETA PERJALANAN ====================
export const Widget9PetaPerjalanan: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [km, setKm] = useState(0);
  const [rest, setRest] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const draggingRef = useRef(false);

  const totalKm = isContoh ? 100 : 150;
  const speed = isContoh ? 50 : 60;
  const startMin = isContoh ? 8 * 60 : 7 * 60 + 30;
  useEffect(() => { setKm(0); setRest(false); }, [isContoh]);

  const driveMin = Math.round((km / speed) * 60);
  const currMin = startMin + driveMin + (rest ? 30 : 0);
  const hh = String(Math.floor(currMin / 60)).padStart(2, '0');
  const mm = String(currMin % 60).padStart(2, '0');

  const updateKmFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xSvg = ((clientX - rect.left) / rect.width) * 560;
    const ratio = Math.max(0, Math.min(1, (xSvg - 50) / 460));
    const step = isContoh ? 25 : 30;
    const snapped = Math.round((ratio * totalKm) / step) * step;
    setKm(snapped);
    sound.pop();
    if (snapped === totalKm && rest) {
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `Mobil tiba di tujuan setelah menempuh ${totalKm} km dan beristirahat 30 menit! Hitung sendiri pukul berapa sampainya!`);
    }
  };

  const carX = 50 + (km / totalKm) * 460;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-bold">
          Jarak {totalKm} km · Kecepatan {speed} km/jam · Berangkat pukul {isContoh ? '08.00' : '07.30'}
        </div>
        <div className="font-mono-num text-base font-extrabold px-4 py-2 rounded-xl bg-blue-600 text-white">
          Waktu Tiba = ? (Hitung Jarak ÷ Kecepatan + Istirahat)
        </div>
      </div>

      {/* Draggable Highway Road SVG */}
      <svg
        ref={svgRef}
        viewBox="0 0 560 120"
        className="w-full rounded-2xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 touch-stage cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateKmFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          updateKmFromClientX(e.clientX);
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        {/* Road */}
        <rect x="30" y="65" width="500" height="30" rx="14" fill="#334155" />
        <line x1="45" y1="80" x2="515" y2="80" stroke="#FACC15" strokeWidth="3" strokeDasharray="12 10" />
        {/* Rest Area Sign halfway */}
        <rect x="262" y="24" width="36" height="28" rx="6" fill={rest ? '#F59E0B' : '#94A3B8'} />
        <text x="280" y="42" textAnchor="middle" fontSize="10" fontWeight="800" fill="#FFFFFF">REST</text>
        {/* Start & Finish */}
        <text x="50" y="112" textAnchor="middle" fontSize="11" fontWeight="700" className="fill-slate-700 dark:fill-slate-300 font-mono-num">0 km</text>
        <text x="510" y="112" textAnchor="middle" fontSize="11" fontWeight="700" className="fill-slate-700 dark:fill-slate-300 font-mono-num">{totalKm} km</text>

        {/* Car SVG */}
        <g transform={`translate(${carX - 24}, 48)`}>
          <rect x="4" y="12" width="40" height="16" rx="5" fill="#2563EB" />
          <path d="M12 12 L18 2 L32 2 L38 12 Z" fill="#60A5FA" />
          <circle cx="13" cy="29" r="5" fill="#0F172A" />
          <circle cx="35" cy="29" r="5" fill="#0F172A" />
        </g>
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono-num text-xs font-bold">
          Ditempuh: {km} km {rest ? '+ 30 menit istirahat' : '(belum istirahat)'}
        </div>
        <button
          type="button"
          onClick={() => {
            sound.click();
            const nextRest = !rest;
            setRest(nextRest);
            if (km === totalKm && nextRest) {
              sound.ding();
              onWowTriggered?.();
              onMimoReact('kaget', `Bagus! Mobil sudah menempuh ${totalKm} km dan istirahat 30 menit. Sekarang hitung pukul berapa sampai di rumah nenek!`);
            }
          }}
          className={`min-h-[52px] px-5 rounded-xl font-bold text-sm border-2 cursor-pointer ${
            rest ? 'bg-amber-500 border-amber-600 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
          }`}
        >
          {rest ? '✓ Istirahat 30 Menit Aktif' : '+ Tambah Istirahat 30 Menit'}
        </button>
      </div>
    </div>
  );
};

// ==================== SOAL 10: JAM ANALOG PUTAR LANGSUNG ====================
export const Widget10JamDimas: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const startMin = isContoh ? 7 * 60 : 6 * 60 + 50;
  const acts = isContoh
    ? [
        { label: 'Berangkat', add: 0 },
        { label: '+ 20 menit ke lapangan', add: 20 },
        { label: '+ 1 jam latihan', add: 60 },
        { label: '+ 10 menit istirahat', add: 10 }
      ]
    : [
        { label: 'Berangkat', add: 0 },
        { label: '+ 40 menit ke lapangan', add: 40 },
        { label: '+ 1 jam 45 menit latihan', add: 105 },
        { label: '+ 25 menit istirahat', add: 25 }
      ];

  const [step, setStep] = useState(0);
  const [manualAdded, setManualAdded] = useState(0);
  const [draggingClock, setDraggingClock] = useState(false);

  useEffect(() => {
    setStep(0);
    setManualAdded(0);
  }, [isContoh]);

  const stepAdded = acts.slice(0, step + 1).reduce((s, a) => s + a.add, 0);
  const totalAdded = Math.max(stepAdded, manualAdded);
  const totalMin = startMin + totalAdded;
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  const minAngle = (mm / 60) * 360;
  const hrAngle = ((hh % 12) + mm / 60) * 30;
  const targetAdded = acts.reduce((s, a) => s + a.add, 0);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col md:flex-row items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <svg viewBox="0 0 180 180" className="w-48 h-48 shrink-0">
          <circle cx="90" cy="90" r="80" fill="#F8FAFC" stroke="#1E293B" strokeWidth="5" />
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
            const ang = (i * 30 * Math.PI) / 180;
            return (
              <text
                key={n}
                x={90 + 62 * Math.sin(ang)}
                y={94 - 62 * Math.cos(ang)}
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fill="#0F172A"
              >
                {n}
              </text>
            );
          })}
          <line
            x1="90"
            y1="90"
            x2={90 + 38 * Math.sin((hrAngle * Math.PI) / 180)}
            y2={90 - 38 * Math.cos((hrAngle * Math.PI) / 180)}
            stroke="#0F172A"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <line
            x1="90"
            y1="90"
            x2={90 + 58 * Math.sin((minAngle * Math.PI) / 180)}
            y2={90 - 58 * Math.cos((minAngle * Math.PI) / 180)}
            stroke="#2563EB"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="90" cy="90" r="6" fill="#0F172A" />
        </svg>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              sound.pop();
              const next = Math.max(0, totalAdded - 5);
              setManualAdded(next);
              setDraggingClock(!draggingClock);
            }}
            className="min-h-[40px] px-3 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-bold cursor-pointer"
          >
            −5 mnt
          </button>
          <button
            type="button"
            onClick={() => {
              sound.pop();
              const next = Math.min(targetAdded + 30, totalAdded + 5);
              setManualAdded(next);
              if (next === targetAdded) {
                sound.ding();
                onWowTriggered?.();
              }
            }}
            className="min-h-[40px] px-3 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
          >
            +5 mnt
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 w-full">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-base font-extrabold text-blue-700 dark:text-blue-400">
            Baca Jarum Jam & Menit di Jam Analog! (Mulai pukul {isContoh ? '07.00' : '06.50'})
          </div>
          <span className="text-xs font-bold text-slate-500">
            Ketuk tombol waktu di bawah
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {acts.map((a, i) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                sound.click();
                setStep(i);
                setManualAdded(0);
                if (i === acts.length - 1) {
                  sound.ding();
                  onWowTriggered?.();
                  onMimoReact('kaget', 'Semua kegiatan selesai! Lihat posisi jarum pendek dan jarum panjangnya — pukul berapa itu?');
                }
              }}
              className={`min-h-[56px] rounded-xl border-2 px-3 py-2 text-left text-xs font-bold cursor-pointer ${
                i <= step && manualAdded <= stepAdded
                  ? 'bg-blue-600 border-blue-700 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== HELPER: ISOMETRIC 3D UNIT CUBE SVG ====================
function IsoCube({ x, y, size = 14, color = '#38BDF8', overflow = false }: { x: number; y: number; size?: number; color?: string; overflow?: boolean }) {
  const dx = size * 0.86;
  const dy = size * 0.48;
  const fillTop = overflow ? '#FB7185' : color;
  const fillLeft = overflow ? '#E11D48' : '#0284C7';
  const fillRight = overflow ? '#BE123C' : '#0369A1';
  return (
    <g transform={`translate(${x}, ${y})`}>
      <polygon points={`0,0 ${dx},${dy} 0,${dy * 2} ${-dx},${dy}`} fill={fillTop} stroke="#FFFFFF" strokeWidth="0.7" />
      <polygon points={`${-dx},${dy} 0,${dy * 2} 0,${dy * 2 + size} ${-dx},${dy + size}`} fill={fillLeft} stroke="#FFFFFF" strokeWidth="0.7" />
      <polygon points={`0,${dy * 2} ${dx},${dy} ${dx},${dy + size} 0,${dy * 2 + size}`} fill={fillRight} stroke="#FFFFFF" strokeWidth="0.7" />
    </g>
  );
}

// ==================== SOAL 11: RAKITAN KUBUS 3D ISOMETRIK ====================
export const Widget11KotakKubus: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const target = isContoh ? 24 : 72;
  const boxes = isContoh
    ? [
        { id: 'a', p: 4, l: 3, t: 2 },
        { id: 'b', p: 6, l: 2, t: 2 },
        { id: 'c', p: 4, l: 3, t: 3 }
      ]
    : [
        { id: 'a', p: 6, l: 4, t: 3 },
        { id: 'b', p: 8, l: 3, t: 3 },
        { id: 'c', p: 6, l: 4, t: 4 }
      ];

  const [selected, setSelected] = useState(0);
  const [layersFilled, setLayersFilled] = useState(0);

  useEffect(() => {
    setSelected(0);
    setLayersFilled(0);
  }, [isContoh]);

  const b = boxes[selected];
  const perLayer = b.p * b.l;
  const cubesShown = layersFilled * perLayer;
  const fullVol = b.p * b.l * b.t;
  const pas = fullVol === target;

  // Render isometric blocks layer by layer (visual scaled grid capped neatly for clarity)
  const cubes: { ix: number; iy: number; iz: number; countIdx: number }[] = [];
  let count = 0;
  for (let z = 0; z < layersFilled; z++) {
    for (let y = 0; y < b.l; y++) {
      for (let x = 0; x < b.p; x++) {
        count++;
        cubes.push({ ix: x, iy: y, iz: z, countIdx: count });
      }
    }
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="text-sm font-bold">
        Target: Tepat {target} Kubus Satuan — Pilih kotak lalu susun lapisan kubus 3D satu per satu!
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {boxes.map((bx, i) => (
          <button
            key={bx.id}
            type="button"
            onClick={() => {
              sound.click();
              setSelected(i);
              setLayersFilled(0);
            }}
            className={`min-h-[56px] rounded-xl border-2 font-mono-num font-bold text-xs md:text-sm cursor-pointer ${
              selected === i
                ? 'bg-blue-600 border-blue-700 text-white'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
            }`}
          >
            Kotak {bx.id.toUpperCase()}: {bx.p}×{bx.l}×{bx.t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-center">
          <svg viewBox="0 0 360 220" className="w-full max-w-[360px] h-52">
            {cubes.length === 0 ? (
              <text x="180" y="115" textAnchor="middle" fontSize="13" fontWeight="700" className="fill-slate-400">
                Ketuk "Tambah 1 Lapisan" untuk menumpuk kubus 3D
              </text>
            ) : (
              cubes.map((c, idx) => {
                const size = isContoh ? 16 : 11;
                const sx = 175 + (c.ix - c.iy) * size * 0.86;
                const sy = 155 + (c.ix + c.iy) * size * 0.48 - c.iz * size;
                return (
                  <IsoCube
                    key={idx}
                    x={sx}
                    y={sy}
                    size={size}
                    color={pas && layersFilled === b.t ? '#10B981' : '#38BDF8'}
                    overflow={c.countIdx > target}
                  />
                );
              })
            )}
          </svg>
        </div>

        <div className="flex flex-col gap-3">
          <div className="font-mono-num text-base font-bold">
            Ukuran kotak: {b.p} × {b.l} × {b.t} (Alas = {b.p} × {b.l} kubus)
          </div>
          <div className="font-mono-num text-lg font-extrabold">
            Terisi {layersFilled}/{b.t} lapis —{' '}
            <span className={cubesShown > target ? 'text-rose-600' : cubesShown === target && layersFilled === b.t ? 'text-emerald-600' : 'text-blue-600'}>
              {cubesShown > target ? 'Meluap melebihi target!' : cubesShown === target && layersFilled === b.t ? 'Pas menutup sempurna!' : 'Hitung total kubusnya'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={layersFilled >= b.t}
              onClick={() => {
                const next = layersFilled + 1;
                setLayersFilled(next);
                const nextVol = next * perLayer;
                if (next === b.t && nextVol === target) {
                  sound.ding();
                  onWowTriggered?.();
                  onMimoReact('kaget', `PAS! Kotak ${b.id.toUpperCase()} terisi penuh ${b.t} lapis tanpa kelebihan atau kekurangan! Hitung volumenya!`);
                } else if (nextVol > target) {
                  sound.softWrong();
                  onMimoReact('bingung', `Waduh, lihat kubus merah yang meluap! Kotak ini terlalu besar dari ${target} kubus!`);
                } else {
                  sound.pop();
                }
              }}
              className="min-h-[52px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-sm cursor-pointer"
            >
              + Tambah 1 Lapisan Kubus
            </button>
            <button
              type="button"
              onClick={() => { sound.click(); setLayersFilled(0); }}
              className="min-h-[52px] px-4 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
            >
              Kosongkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 12: BONGKAR PASANG BAK 3D ====================
export const Widget12BongkarBak: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [reshaped, setReshaped] = useState(false);
  useEffect(() => setReshaped(false), [isContoh]);

  const s = isContoh ? 2 : 3;
  const volCube = s * s * s; // 8 or 27
  const newP = 6;
  const newL = 1;
  const newT = s;
  const volNew = newP * newL * newT; // 12 or 18

  const blocks: { ix: number; iy: number; iz: number }[] = [];
  if (!reshaped) {
    for (let z = 0; z < s; z++) {
      for (let y = 0; y < s; y++) {
        for (let x = 0; x < s; x++) {
          blocks.push({ ix: x, iy: y, iz: z });
        }
      }
    }
  } else {
    for (let z = 0; z < newT; z++) {
      for (let y = 0; y < newL; y++) {
        for (let x = 0; x < newP; x++) {
          blocks.push({ ix: x, iy: y, iz: z });
        }
      }
    }
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <span className="text-sm font-bold font-mono-num">
          {reshaped
            ? `Balok Baru: panjang 2×rusuk, lebar ${isContoh ? '1/2' : '1/3'}×rusuk, tinggi tetap → Hitung volumenya!`
            : `Bak Kubus: panjang rusuk ${s} m → Hitung volumenya!`}
        </span>
        <button
          type="button"
          onClick={() => {
            sound.pop();
            const next = !reshaped;
            setReshaped(next);
            if (next) {
              sound.ding();
              onWowTriggered?.();
              onMimoReact('kaget', `Kubus rusuk ${s} m dibongkar menjadi balok memanjang! Amati ukuran panjang, lebar, tingginya lalu bandingkan volumenya!`);
            }
          }}
          className="min-h-[52px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
        >
          {reshaped ? 'Kembalikan ke Bentuk Kubus' : 'Bongkar & Susun Ulang ke Balok'}
        </button>
      </div>

      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-3 flex justify-center">
        <svg viewBox="0 0 380 185" className="w-full max-w-[420px] h-48">
          {blocks.map((c, idx) => {
            const size = 16;
            const originX = reshaped ? 115 : 190;
            const originY = reshaped ? 115 : 115;
            const sx = originX + (c.ix - c.iy) * size * 0.86;
            const sy = originY + (c.ix + c.iy) * size * 0.48 - c.iz * size;
            return (
              <IsoCube
                key={idx}
                x={sx}
                y={sy}
                size={size}
                color={reshaped ? '#F59E0B' : '#38BDF8'}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
