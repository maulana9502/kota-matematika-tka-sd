import React, { useState, useEffect, useRef } from 'react';
import { sound, formatAngkaID } from '../../utils/sound';
import { WidgetProps } from './Widget8Timbangan';

// ==================== SOAL 13: DETEKTIF BANGUN + CERMIN & KACA PEMBESAR SIFAT ====================
export const Widget13DetektifBangun: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [cluesOn, setCluesOn] = useState<number[]>([]);
  const [mirrorOn, setMirrorOn] = useState(false);
  const [pickedSuspect, setPickedSuspect] = useState<string | null>(null);

  useEffect(() => {
    setCluesOn([]);
    setMirrorOn(false);
    setPickedSuspect(null);
  }, [isContoh]);

  const clues = isContoh
    ? [
        { id: 1, text: 'Syarat 1: Keempat sisinya sama panjang' },
        { id: 2, text: 'Syarat 2: Keempat sudutnya siku-siku (90°)' }
      ]
    : [
        { id: 1, text: 'Syarat 1: Dua pasang sisi sejajar' },
        { id: 2, text: 'Syarat 2: Sisi berdekatan TIDAK sama panjang' },
        { id: 3, text: 'Syarat 3: Keempat sudutnya siku-siku (90°)' }
      ];

  const correctId = isContoh ? 'persegi' : 'persegipanjang';

  const shapes = [
    {
      id: 'persegi',
      nama: 'Persegi',
      pass: (active: number[]) => (isContoh ? true : !active.includes(2)),
      renderSvg: (winner: boolean) => (
        <svg viewBox="0 0 110 90" className="w-28 h-24 mx-auto">
          <rect x="25" y="15" width="60" height="60" fill={winner ? '#A7F3D0' : '#E0F2FE'} stroke="#0F172A" strokeWidth="3" />
          <rect x="25" y="15" width="10" height="10" fill="none" stroke="#2563EB" strokeWidth="2" />
          <rect x="75" y="15" width="10" height="10" fill="none" stroke="#2563EB" strokeWidth="2" />
          <rect x="25" y="65" width="10" height="10" fill="none" stroke="#2563EB" strokeWidth="2" />
          <rect x="75" y="65" width="10" height="10" fill="none" stroke="#2563EB" strokeWidth="2" />
          <line x1="55" y1="11" x2="55" y2="19" stroke="#DC2626" strokeWidth="2.5" />
          <line x1="55" y1="71" x2="55" y2="79" stroke="#DC2626" strokeWidth="2.5" />
          <line x1="21" y1="45" x2="29" y2="45" stroke="#DC2626" strokeWidth="2.5" />
          <line x1="81" y1="45" x2="89" y2="45" stroke="#DC2626" strokeWidth="2.5" />
          {mirrorOn && <line x1="55" y1="6" x2="55" y2="84" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" />}
        </svg>
      )
    },
    {
      id: 'persegipanjang',
      nama: 'Persegi panjang',
      pass: (active: number[]) => (isContoh ? !active.includes(1) : true),
      renderSvg: (winner: boolean) => (
        <svg viewBox="0 0 110 90" className="w-28 h-24 mx-auto">
          <rect x="12" y="22" width="86" height="46" fill={winner ? '#A7F3D0' : '#E0F2FE'} stroke="#0F172A" strokeWidth="3" />
          <rect x="12" y="22" width="9" height="9" fill="none" stroke="#2563EB" strokeWidth="2" />
          <rect x="89" y="22" width="9" height="9" fill="none" stroke="#2563EB" strokeWidth="2" />
          <rect x="12" y="59" width="9" height="9" fill="none" stroke="#2563EB" strokeWidth="2" />
          <rect x="89" y="59" width="9" height="9" fill="none" stroke="#2563EB" strokeWidth="2" />
          <line x1="53" y1="18" x2="53" y2="26" stroke="#DC2626" strokeWidth="2.2" />
          <line x1="57" y1="18" x2="57" y2="26" stroke="#DC2626" strokeWidth="2.2" />
          <line x1="8" y1="45" x2="16" y2="45" stroke="#059669" strokeWidth="2.2" />
          {mirrorOn && <line x1="55" y1="10" x2="55" y2="80" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" />}
        </svg>
      )
    },
    {
      id: 'miring',
      nama: isContoh ? 'Belah ketupat' : 'Jajargenjang',
      pass: (active: number[]) => (isContoh ? !active.includes(2) : !active.includes(3)),
      renderSvg: () => (
        <svg viewBox="0 0 110 90" className="w-28 h-24 mx-auto">
          {isContoh ? (
            <polygon points="55,12 95,45 55,78 15,45" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3" />
          ) : (
            <polygon points="24,22 96,22 80,68 8,68" fill="#FEF3C7" stroke="#0F172A" strokeWidth="3" />
          )}
          {mirrorOn && isContoh && <line x1="55" y1="6" x2="55" y2="84" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" />}
        </svg>
      )
    },
    {
      id: 'trapesium',
      nama: 'Trapesium',
      pass: (active: number[]) => !active.includes(1),
      renderSvg: () => (
        <svg viewBox="0 0 110 90" className="w-28 h-24 mx-auto">
          <polygon points="28,22 82,22 98,68 12,68" fill="#FCE7F3" stroke="#0F172A" strokeWidth="3" />
          {mirrorOn && <line x1="55" y1="12" x2="55" y2="78" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" />}
        </svg>
      )
    }
  ];

  const toggleClue = (id: number) => {
    sound.click();
    setCluesOn((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (next.length === clues.length) {
        onMimoReact('berpikir', 'Semua syarat sudah menyala! Sekarang ketuk kartu bangun yang menurutmu memenuhi semua syarat tersebut!');
      }
      return next;
    });
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-bold">
          Detektif Bangun — Nyalakan syarat sifat bangun & cermin simetri, lalu ketuk bangun yang cocok!
        </div>
        <button
          type="button"
          onClick={() => {
            sound.pop();
            setMirrorOn((m) => !m);
          }}
          className={`min-h-[44px] px-4 rounded-xl border-2 text-xs font-bold cursor-pointer ${
            mirrorOn ? 'bg-amber-500 border-amber-600 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
          }`}
        >
          {mirrorOn ? 'Cermin Lipat: Aktif' : 'Nyalakan Cermin Simetri'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {clues.map((c) => {
          const on = cluesOn.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleClue(c.id)}
              className={`min-h-[52px] px-4 rounded-xl border-2 font-semibold text-xs md:text-sm cursor-pointer ${
                on
                  ? 'bg-blue-600 border-blue-700 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              {on ? '✓ ' : ''}{c.text}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {shapes.map((sh) => {
          const isPickedCorrect = pickedSuspect === sh.id && sh.id === correctId;
          const isPickedWrong = pickedSuspect === sh.id && sh.id !== correctId;
          return (
            <button
              key={sh.nama}
              type="button"
              onClick={() => {
                setPickedSuspect(sh.id);
                if (sh.id === correctId) {
                  sound.ding();
                  onWowTriggered?.();
                  onMimoReact('kaget', `BENAR! ${sh.nama} memenuhi semua syarat pada kartu petunjuk!`);
                } else {
                  sound.softWrong();
                  onMimoReact('bingung', `${sh.nama} belum memenuhi semua syarat. Periksa tanda siku-siku dan tanda panjang sisinya lagi!`);
                }
              }}
              className={`rounded-2xl border-2 p-3 text-center transition-all cursor-pointer active:scale-95 ${
                isPickedCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-400'
                  : isPickedWrong
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-blue-400'
              }`}
            >
              {sh.renderSvg(isPickedCorrect)}
              <div className="font-bold text-sm mt-1">{sh.nama}</div>
              <div className="text-[11px] font-semibold mt-0.5">
                {isPickedCorrect ? '★ COCOK SEMUA SYARAT' : isPickedWrong ? 'Belum memenuhi syarat' : 'Ketuk untuk pilih'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ==================== SOAL 14: TANGKI BATANG BISA DITARIK + PIPA RATA-RATA AIR ====================
export const Widget14KantorBerita: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const targetVals = isContoh ? [10, 20, 15, 20, 15] : [30, 45, 25, 45, 35];
  const avg = targetVals.reduce((a, b) => a + b, 0) / targetVals.length;
  const maxV = isContoh ? 25 : 50;

  const [bars, setBars] = useState<number[]>(targetVals);
  const [leveled, setLeveled] = useState(false);

  useEffect(() => {
    setBars(targetVals);
    setLeveled(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContoh]);

  const currentAvg = +(bars.reduce((a, b) => a + b, 0) / bars.length).toFixed(1);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">Tangki Data Pengunjung Perpustakaan</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ketuk tombol +/- di tiap hari untuk mengubah air, lalu buka keran rata-rata untuk melihat air merata!
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              sound.ding();
              setLeveled((l) => !l);
              onWowTriggered?.();
              onMimoReact('kaget', 'Rata-rata seperti air yang meratakan semua tangki! Hitung sendiri tinggi rata-ratanya dari jumlah semua pengunjung dibagi banyak hari ya!');
            }}
            className="min-h-[52px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs md:text-sm cursor-pointer"
          >
            {leveled ? 'Tutup Keran (Lihat Data Asli)' : 'Buka Pipa Rata-Rata'}
          </button>
          <button
            type="button"
            onClick={() => {
              sound.click();
              setBars(targetVals);
              setLeveled(false);
            }}
            className="min-h-[52px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            Data Soal
          </button>
        </div>
      </div>

      {/* Interactive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-center border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="p-2 border-b border-slate-200 dark:border-slate-700">Hari</th>
              {days.map((d) => (
                <th key={d} className="p-2 border-b border-slate-200 dark:border-slate-700">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 font-bold">Pengunjung</td>
              {bars.map((v, i) => (
                <td key={i} className="p-2 font-mono-num font-bold text-blue-700 dark:text-blue-400">
                  {v}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Connected Water Tanks */}
      <div className="relative pt-4">
        {/* Average dashed line without spoiling the exact number */}
        {leveled && (
          <div
            style={{ bottom: `${(currentAvg / maxV) * 160 + 44}px` }}
            className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500 z-10 pointer-events-none flex justify-end"
          >
            <span className="bg-emerald-600 text-white text-[10px] font-mono-num font-bold px-2 py-0.5 rounded -mt-5">
              Tinggi Merata = ? (Hitung: Jumlah ÷ 5)
            </span>
          </div>
        )}
        <div className="h-48 flex items-end justify-around gap-2.5 border-b-4 border-slate-400 dark:border-slate-600 pb-1">
          {bars.map((v, i) => {
            const shown = leveled ? currentAvg : v;
            return (
              <div key={days[i]} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="font-mono-num text-xs font-extrabold">{leveled ? '?' : v}</span>
                <div className="w-full max-w-[60px] h-36 rounded-t-xl border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 relative overflow-hidden flex items-end">
                  <div
                    style={{ height: `${Math.min(100, (shown / maxV) * 100)}%` }}
                    className={`w-full transition-all duration-500 ${leveled ? 'bg-emerald-500' : 'bg-sky-500'}`}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={leveled}
                    onClick={() => {
                      sound.pop();
                      setBars((prev) => prev.map((x, idx) => (idx === i ? Math.max(0, x - 5) : x)));
                    }}
                    className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 disabled:opacity-40 text-xs font-bold cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-[11px] font-bold">{days[i].slice(0, 3)}</span>
                  <button
                    type="button"
                    disabled={leveled}
                    onClick={() => {
                      sound.pop();
                      setBars((prev) => prev.map((x, idx) => (idx === i ? Math.min(maxV, x + 5) : x)));
                    }}
                    className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 disabled:opacity-40 text-xs font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 15: KERANJANG BUAH & TIRAI KAIN GESER ====================
export const Widget15KeranjangBuah: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [revealPct, setRevealPct] = useState(0); // 0 covered -> 100 uncovered
  const [weighedCount, setWeighedCount] = useState(0);
  const coverRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    setRevealPct(0);
    setWeighedCount(0);
  }, [isContoh]);

  const totalKg = isContoh ? 2 : 4;
  const apelKg = isContoh ? 1 : 1.3;
  const jmlJeruk = isContoh ? 4 : 9;
  const sisaJeruk = +(totalKg - apelKg).toFixed(2);
  const perJeruk = +(sisaJeruk / jmlJeruk).toFixed(2);
  const uncovered = revealPct >= 75;

  const updateDrag = (clientX: number) => {
    const el = coverRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, Math.round(((clientX - rect.left) / rect.width) * 100)));
    setRevealPct(pct);
    if (pct >= 75 && !uncovered) {
      sound.tear();
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `Kain tersingkap! Ada ${jmlJeruk} buah jeruk! Hitung dulu sisa beratnya (${totalKg} − ${formatAngkaID(apelKg, 1)}), lalu bagi ${jmlJeruk}!`);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold font-mono-num">
            Total {totalKg} kg = Apel ({formatAngkaID(apelKg, 1)} kg) + {jmlJeruk} Jeruk
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Geser kain penutup ke kanan untuk melihat isi jeruk, lalu hitung berat setiap jeruknya!
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.tear();
            setRevealPct(uncovered ? 0 : 100);
            if (!uncovered) onMimoReact('kaget', `Ada ${jmlJeruk} jeruk di keranjang! Hitung berat per jeruknya ya!`);
          }}
          className="min-h-[48px] px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
        >
          {uncovered ? 'Tutup Tirai Kain' : 'Buka Tirai Penuh'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-bold">Keranjang Apel (Diketahui)</div>
          <div className="font-mono-num text-3xl font-extrabold text-rose-700 dark:text-rose-400 my-2">
            {formatAngkaID(apelKg, 1)} kg
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            Sisa berat untuk jeruk = {totalKg} − {formatAngkaID(apelKg, 1)} = <strong>? kg</strong>
          </div>
        </div>

        {/* Draggable Cloth Curtain over Oranges */}
        <div
          ref={coverRef}
          className="relative rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 p-4 overflow-hidden touch-stage"
          onPointerDown={(e) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            updateDrag(e.clientX);
          }}
          onPointerMove={(e) => {
            if (!draggingRef.current) return;
            updateDrag(e.clientX);
          }}
          onPointerUp={() => { draggingRef.current = false; }}
        >
          <div className="font-bold text-center text-sm mb-2">
            {jmlJeruk} Buah Jeruk (Ketuk untuk menghitung: {weighedCount}/{jmlJeruk} jeruk)
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: jmlJeruk }).map((_, i) => {
              const lit = i < weighedCount;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.pop();
                    setWeighedCount(i + 1);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-mono-num text-xs font-extrabold border-2 cursor-pointer transition-transform active:scale-95 ${
                    lit
                      ? 'bg-emerald-500 border-emerald-700 text-white'
                      : 'bg-amber-400 border-amber-600 text-slate-950'
                  }`}
                >
                  ? kg
                </button>
              );
            })}
          </div>

          {/* Sliding Checkered Cloth */}
          {!uncovered && (
            <div
              style={{ transform: `translateX(${revealPct}%)` }}
              className="absolute inset-0 bg-amber-800/90 text-white flex flex-col items-center justify-center p-4 pointer-events-none transition-transform duration-75"
            >
              <span className="font-extrabold text-sm">Kain Penutup Jeruk</span>
              <span className="text-xs opacity-90 mt-1">Geser ke kanan → ({revealPct}%)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 16: BALAP SEPEDA 4 JALUR (GESER SENDIRI POSISI KM TIAP ANAK) ====================
export const Widget16LintasanSepeda: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const targetKm = isContoh ? 10 : 12;
  const targetFracLabel = isContoh ? '1/2' : '5/8';
  const targetVal = isContoh ? 5 : 7.5;
  const riders = isContoh
    ? [
        { nama: 'Ani', label: '0,8 bagian', km: 8, color: '#2563EB' },
        { nama: 'Budi', label: '30% bagian', km: 3, color: '#D97706' },
        { nama: 'Cici', label: '2/5 bagian', km: 4, color: '#9333EA' },
        { nama: 'Dedi', label: '5 km', km: 5, color: '#059669' }
      ]
    : [
        { nama: 'Ani', label: '0,75 bagian', km: 9, color: '#2563EB' },
        { nama: 'Budi', label: '50% bagian', km: 6, color: '#D97706' },
        { nama: 'Cici', label: '2/3 bagian', km: 8, color: '#9333EA' },
        { nama: 'Dedi', label: '7,5 km', km: 7.5, color: '#059669' }
      ];

  const [placedKm, setPlacedKm] = useState<number[]>([0, 0, 0, 0]);
  const [checkedStatus, setCheckedStatus] = useState<'idle' | 'ok' | 'wrong'>('idle');

  useEffect(() => {
    setPlacedKm([0, 0, 0, 0]);
    setCheckedStatus('idle');
  }, [isContoh]);

  const checkPositions = () => {
    sound.unlock();
    const allMatch = riders.every((rd, i) => Math.abs(placedKm[i] - rd.km) < 0.1);
    if (allMatch) {
      setCheckedStatus('ok');
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `HEBAT! Semua 4 pesepeda ditempatkan dengan tepat! Sekarang hitung ${targetFracLabel} × ${targetKm} km dan lihat siapa yang tepat di jarak itu!`);
    } else {
      setCheckedStatus('wrong');
      sound.softWrong();
      onMimoReact('bingung', `Ada jarak pesepeda yang belum pas dengan perhitungannya terhadap ${targetKm} km. Coba cek ulang perkalian pecahannya!`);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <div className="text-sm font-bold">
            Lintasan Sepeda {targetKm} km — Target jarak: {targetFracLabel} dari {targetKm} km (= ? km)
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Hitung jarak masing-masing anak lalu geser slider sepedanya ke km yang sesuai, kemudian tekan Uji Posisi!
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={checkPositions}
            className="min-h-[48px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
          >
            Uji Posisi Sepeda
          </button>
          <button
            type="button"
            onClick={() => { sound.click(); setPlacedKm([0, 0, 0, 0]); setCheckedStatus('idle'); }}
            className="min-h-[48px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {riders.map((rd, idx) => {
          const val = placedKm[idx];
          const pct = (val / targetKm) * 100;
          const isExactTarget = checkedStatus === 'ok' && Math.abs(val - targetVal) < 0.1;
          return (
            <div key={rd.nama} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>{rd.nama} ({rd.label})</span>
                <span className="font-mono-num text-blue-700 dark:text-blue-300">
                  Digeser ke: {formatAngkaID(val, 1)} km
                </span>
              </div>
              <div className="h-7 rounded-full bg-white dark:bg-slate-900 relative overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  style={{ width: `${Math.max(4, pct)}%`, backgroundColor: isExactTarget ? '#059669' : rd.color }}
                  className="h-full transition-all duration-150 flex items-center justify-end pr-2 text-xs font-bold text-white"
                >
                  🚲
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={targetKm}
                step={0.5}
                value={val}
                onChange={(e) => {
                  sound.pop();
                  const nextVal = Number(e.target.value);
                  setCheckedStatus('idle');
                  setPlacedKm((prev) => prev.map((x, i) => (i === idx ? nextVal : x)));
                }}
                className="w-full accent-blue-600 cursor-pointer h-6"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== SOAL 17: KRAN TANGKI AIR & DERETAN EMBER ====================
export const Widget17TangkiEmber: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [embers, setEmbers] = useState(0);
  useEffect(() => setEmbers(0), [isContoh]);

  const hl = isContoh ? 0.6 : 1.2;
  const totalL = hl * 100;
  const capL = isContoh ? 10 : 15;
  const maxEmber = totalL / capL;
  const sisaL = totalL - embers * capL;
  const pctLeft = (sisaL / totalL) * 100;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <span className="text-sm font-bold font-mono-num">
          Tangki {formatAngkaID(hl, 1)} hl (= ? liter) · Ember {capL} liter · Terisi: {embers} ember
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={embers >= maxEmber}
            onClick={() => {
              sound.pop();
              const next = embers + 1;
              setEmbers(next);
              if (next === (isContoh ? 2 : 5)) {
                sound.ding();
                onWowTriggered?.();
                onMimoReact('senang', `Diambil ${next} ember (@ ${capL} L)! Sekarang ubah ${formatAngkaID(hl, 1)} hl ke liter lalu kurangi air di ${next} ember itu!`);
              } else if (next === maxEmber) {
                sound.ding();
                onWowTriggered?.();
                onMimoReact('kaget', `Tangki tepat habis setelah mengisi ${maxEmber} ember!`);
              }
            }}
            className="min-h-[52px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white font-bold text-sm cursor-pointer"
          >
            Buka Kran Isi 1 Ember ({embers} terisi)
          </button>
          <button
            type="button"
            onClick={() => { sound.click(); setEmbers(0); }}
            className="min-h-[52px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
          >
            Isi Penuh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Calibrated Water Tank without revealing remaining liter number */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center">
          <div className="w-28 h-36 rounded-2xl border-4 border-slate-500 bg-white dark:bg-slate-900 relative overflow-hidden flex items-end">
            <div
              style={{ height: `${pctLeft}%` }}
              className="w-full bg-sky-500 transition-all duration-500 flex items-center justify-center text-white font-mono-num font-extrabold text-xs"
            >
              {sisaL > 0 ? '? L' : '0 L'}
            </div>
          </div>
          <div className="font-mono-num font-bold text-xs mt-2">
            Kapasitas penuh: {formatAngkaID(hl, 1)} hl · Diambil: {embers} × {capL} L
          </div>
        </div>

        {/* Buckets Grid */}
        <div className="md:col-span-2 flex flex-wrap gap-2.5 justify-center md:justify-start">
          {Array.from({ length: maxEmber }).map((_, i) => {
            const filled = i < embers;
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  sound.pop();
                  setEmbers(i + 1);
                }}
                className={`w-18 h-20 rounded-b-2xl rounded-t-md border-2 flex flex-col items-center justify-center font-mono-num text-xs font-bold cursor-pointer transition-all ${
                  filled
                    ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}
              >
                <span>Ember {i + 1}</span>
                <span>{filled ? `${capL} L` : 'Kosong'}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 18: DADU 3D ISOMETRIK + UJI TEBAKAN CERMIN BAWAH ====================
export const Widget18DaduPutar: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [atas, setAtas] = useState(isContoh ? 6 : 5);
  const [guess, setGuess] = useState<number | null>(null);
  const [mirrorStatus, setMirrorStatus] = useState<'hidden' | 'ok' | 'wrong'>('hidden');

  useEffect(() => {
    setAtas(isContoh ? 6 : 5);
    setGuess(null);
    setMirrorStatus('hidden');
  }, [isContoh]);

  const bawah = 7 - atas;

  const verifyMirror = () => {
    sound.unlock();
    if (guess === null) {
      sound.softWrong();
      onMimoReact('berpikir', 'Pilih dulu tebakan angka sisi bawah (1 sampai 6) sebelum menguji cermin!');
      return;
    }
    if (guess === bawah) {
      setMirrorStatus('ok');
      sound.ding();
      onWowTriggered?.();
      onMimoReact('kaget', `TEPAT! Pantulan cermin cocok! Karena jumlah dua sisi berlawanan pada dadu standar selalu sama (${atas} + ${guess} = 7)!`);
    } else {
      setMirrorStatus('wrong');
      sound.softWrong();
      onMimoReact('bingung', `Cermin menolak! Jumlah ${atas} + ${guess} belum sama dengan jumlah sepasang sisi berlawanan dadu standar. Coba hitung lagi!`);
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center gap-4">
      <div className="text-center space-y-1">
        <div className="text-sm font-bold">
          Dadu 3D & Cermin Sisi Bawah — Hitung dulu angka sisi bawahnya, lalu uji di cermin!
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300">
          Petunjuk pemandu: Pada dadu standar, jumlah angka dua sisi yang berhadapan selalu sama! (1+2+3+4+5+6 ÷ 3 pasang = ?)
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* 3D Die + Mirror SVG */}
        <svg viewBox="0 0 220 210" className="w-52 h-52">
          <polygon points="110,20 175,55 110,90 45,55" fill="#FEF3C7" stroke="#B45309" strokeWidth="3" />
          <polygon points="45,55 110,90 110,150 45,115" fill="#FDE68A" stroke="#B45309" strokeWidth="3" />
          <polygon points="110,90 175,55 175,115 110,150" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />

          <text x="110" y="61" textAnchor="middle" fontSize="22" fontWeight="900" fill="#0F172A" className="font-mono-num">
            {atas}
          </text>
          <text x="78" y="110" textAnchor="middle" fontSize="14" fontWeight="800" fill="#78350F" className="font-mono-num">
            {atas === 3 ? 2 : 3}
          </text>
          <text x="142" y="110" textAnchor="middle" fontSize="14" fontWeight="800" fill="#FFFFFF" className="font-mono-num">
            {atas === 4 ? 1 : 4}
          </text>

          {/* Reflection Mirror underneath */}
          <ellipse
            cx="110"
            cy="182"
            rx="72"
            ry="18"
            fill={mirrorStatus === 'ok' ? '#A7F3D0' : mirrorStatus === 'wrong' ? '#FECDD3' : '#CBD5E1'}
            stroke={mirrorStatus === 'ok' ? '#059669' : mirrorStatus === 'wrong' ? '#E11D48' : '#0284C7'}
            strokeWidth="3"
          />
          <text x="110" y="187" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0F172A" className="font-mono-num">
            {mirrorStatus === 'ok'
              ? `Cermin: ${bawah} ✓`
              : mirrorStatus === 'wrong'
                ? `Bukan ${guess}!`
                : guess !== null
                  ? `Tebakan: ${guess}`
                  : 'Cermin Bawah (?)'}
          </text>
        </svg>

        <div className="flex flex-col gap-3 items-center md:items-start">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">1. Pilih Angka Sisi Atas Dadu:</div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  sound.pop();
                  setAtas(n);
                  setMirrorStatus('hidden');
                }}
                className={`min-h-[48px] w-11 rounded-xl border-2 font-mono-num font-bold cursor-pointer ${
                  atas === n ? 'bg-blue-600 border-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 pt-1">
            2. Menurutmu, Angka Berapa di Sisi Bawah?
          </div>
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  sound.click();
                  setGuess(n);
                  setMirrorStatus('hidden');
                }}
                className={`min-h-[48px] w-11 rounded-xl border-2 font-mono-num font-bold cursor-pointer ${
                  guess === n ? 'bg-amber-500 border-amber-600 text-slate-950' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={verifyMirror}
            className="min-h-[54px] px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer mt-1"
          >
            Uji Pantulan Cermin Bawah
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 19: RODA POTONG PIZZA / LOYANG KUE PECAHAN ====================
export const Widget19LoyangKue: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const total = isContoh ? 8 : 16;
  const targetCok = isContoh ? 2 : 6;
  const targetKun = isContoh ? 2 : 4;
  const simpLabel = isContoh ? '1/2' : '5/8';

  type SliceKind = 'stroberi' | 'cokelat' | 'kuning';
  const makeInitialSlices = (): SliceKind[] =>
    Array.from({ length: total }).map((_, i) =>
      i < targetCok ? 'cokelat' : i < targetCok + targetKun ? 'kuning' : 'stroberi'
    );

  const [slices, setSlices] = useState<SliceKind[]>(makeInitialSlices);
  const [brush, setBrush] = useState<SliceKind>('cokelat');
  const [mergedGroup, setMergedGroup] = useState(false);

  useEffect(() => {
    setSlices(makeInitialSlices());
    setMergedGroup(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isContoh]);

  const cokCount = slices.filter((s) => s === 'cokelat').length;
  const kunCount = slices.filter((s) => s === 'kuning').length;
  const totalPilih = cokCount + kunCount;

  const describeWedge = (idx: number, count: number, r = 95) => {
    const a1 = ((idx / count) * 2 * Math.PI) - Math.PI / 2;
    const a2 = (((idx + 1) / count) * 2 * Math.PI) - Math.PI / 2;
    const x1 = 110 + r * Math.cos(a1);
    const y1 = 110 + r * Math.sin(a1);
    const x2 = 110 + r * Math.cos(a2);
    const y2 = 110 + r * Math.sin(a2);
    return `M 110 110 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <div className="text-sm font-bold font-mono-num">
            Roda Pizza / Kue ({total} Potong): {cokCount} Cokelat + {kunCount} Kuning
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ketuk potongan kue untuk mengubah rasa, lalu tekan Gabung Garis untuk melihat bentuk pecahan paling sederhana!
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.ding();
            setMergedGroup((m) => !m);
            onWowTriggered?.();
            onMimoReact('kaget', `Lihat! Tiap 2 potong digabung menjadi 1 bagian lebih besar! Sekarang hitung ada berapa bagian berwarna dari total bagian!`);
          }}
          className="min-h-[52px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm cursor-pointer"
        >
          {mergedGroup ? `Tampilkan ${total} Garis Potong` : 'Gabung Tiap 2 Potong Jadi 1 Bagian Besar'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <svg viewBox="0 0 220 220" className="w-56 h-56 mx-auto">
          <circle cx="110" cy="110" r="102" fill="#FDE68A" stroke="#D97706" strokeWidth="4" />
          {slices.map((kind, i) => {
            const fill =
              kind === 'cokelat' ? '#78350F' : kind === 'kuning' ? '#FACC15' : '#FDA4AF';
            return (
              <path
                key={i}
                d={describeWedge(i, total)}
                fill={fill}
                stroke={mergedGroup && i % 2 === 1 ? 'transparent' : '#FFFFFF'}
                strokeWidth={mergedGroup ? '2.5' : '1.8'}
                className="cursor-pointer hover:opacity-90"
                onClick={() => {
                  sound.pop();
                  setSlices((prev) => prev.map((x, idx) => (idx === i ? brush : x)));
                }}
              />
            );
          })}
          {mergedGroup &&
            Array.from({ length: total / 2 }).map((_, j) => {
              const ang = ((j / (total / 2)) * 2 * Math.PI) - Math.PI / 2;
              return (
                <line
                  key={j}
                  x1="110"
                  y1="110"
                  x2={110 + 95 * Math.cos(ang)}
                  y2={110 + 95 * Math.sin(ang)}
                  stroke="#0F172A"
                  strokeWidth="2.8"
                />
              );
            })}
        </svg>

        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold">Pilih Rasa Kuas untuk Ketuk Potongan:</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cokelat' as const, label: 'Cokelat', cls: 'bg-amber-900 text-white' },
              { id: 'kuning' as const, label: 'Kuning', cls: 'bg-yellow-400 text-slate-950' },
              { id: 'stroberi' as const, label: 'Stroberi', cls: 'bg-rose-300 text-rose-950' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => { sound.click(); setBrush(b.id); }}
                className={`min-h-[48px] rounded-xl border-2 font-bold text-xs cursor-pointer ${
                  brush === b.id ? `${b.cls} border-blue-600 ring-2 ring-blue-500` : `${b.cls} border-transparent opacity-80`
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              setSlices(makeInitialSlices());
            }}
            className="min-h-[44px] px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-xs cursor-pointer"
          >
            Kembalikan Komposisi Soal ({targetCok} Cokelat + {targetKun} Kuning)
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 21: DENAH LAHAN PARKIR & MOTOR ====================
export const Widget21LahanParkir: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const p = isContoh ? 5 : 9;
  const l = 4;
  const luas = p * l; // 20 or 36
  const perMotor = isContoh ? 2 : 1.5;
  const cap = luas / perMotor; // 10 or 24
  const initialParked = isContoh ? 6 : 15;
  const [bays, setBays] = useState<boolean[]>(() =>
    Array.from({ length: cap }).map((_, i) => i < initialParked)
  );

  useEffect(() => {
    setBays(Array.from({ length: cap }).map((_, i) => i < initialParked));
  }, [cap, initialParked]);

  const parkedCount = bays.filter(Boolean).length;
  const spareCount = cap - parkedCount;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <div className="text-sm font-bold font-mono-num">
            Lahan {p} m × {l} m (= ? m²) · Tiap motor butuh {formatAngkaID(perMotor, 1)} m²
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Sudah ada {initialParked} motor terparkir. Ketuk petak kosong untuk memarkir motor tambahan sampai penuh, lalu hitung berapa tambahan motornya!
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.click();
            setBays(Array.from({ length: cap }).map((_, i) => i < initialParked));
          }}
          className="min-h-[48px] px-3 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
        >
          Reset ({initialParked} Motor)
        </button>
      </div>

      {/* Top-down Asphalt Parking Grid */}
      <div className="rounded-2xl bg-slate-800 p-4 border-4 border-slate-600">
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {bays.map((occupied, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                sound.pop();
                setBays((prev) => {
                  const next = prev.map((v, idx) => (idx === i ? !v : v));
                  if (next.every(Boolean)) {
                    sound.ding();
                    onWowTriggered?.();
                  }
                  return next;
                });
              }}
              className={`min-h-[58px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center font-mono-num text-xs font-bold cursor-pointer transition-all ${
                occupied
                  ? 'bg-emerald-600 border-amber-300 text-white'
                  : 'bg-slate-700 border-slate-400 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <span>{occupied ? '🏍️' : `P${i + 1}`}</span>
              <span className="text-[10px]">{occupied ? 'Terisi' : 'Kosong'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== SOAL 22: MENJUMLAHKAN ANAK & BUKU LITERASI ====================
export const Widget22PekanLiterasi: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const valPerIcon = isContoh ? 2 : 4;
  const rows = isContoh
    ? [
        { nama: 'Ani', n: 3 },
        { nama: 'Budi', n: 2 },
        { nama: 'Cici', n: 4 }
      ]
    : [
        { nama: 'Rina', n: 5 },
        { nama: 'Dika', n: 3 },
        { nama: 'Siti', n: 6 }
      ];

  const [revealed, setRevealed] = useState<Record<string, number>>({});
  useEffect(() => setRevealed({}), [isContoh]);

  const targetTotal = rows.reduce((s, r) => s + r.n * valPerIcon, 0);
  const totalCount = rows.reduce((s, r) => s + (revealed[r.nama] || 0) * valPerIcon, 0);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <div className="text-sm font-bold">
            Pekan Literasi — 1 ikon siswa & tumpukan buku = {valPerIcon} buku
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Ketuk ikon anak di setiap baris untuk menjumlahkan seluruh buku yang dibaca!
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.click();
            setRevealed({});
          }}
          className="min-h-[48px] px-4 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold text-xs cursor-pointer"
        >
          Reset Ikon
        </button>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const count = revealed[r.nama] || 0;
          return (
            <div key={r.nama} className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="w-16 font-bold text-sm">{r.nama}</div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: r.n }).map((_, idx) => {
                  const on = idx < count;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sound.pop();
                        setRevealed((prev) => {
                          const next = { ...prev, [r.nama]: idx + 1 };
                          const sum = rows.reduce((s, row) => s + (next[row.nama] || 0) * valPerIcon, 0);
                          if (sum === targetTotal) {
                            sound.ding();
                            onWowTriggered?.();
                            onMimoReact('kaget', 'Semua ikon sudah ditandai! Sekarang kalikan banyak ikon dengan nilai 1 ikon, lalu jumlahkan semuanya!');
                          }
                          return next;
                        });
                      }}
                      className={`min-w-[54px] h-14 px-2 rounded-xl border-2 font-mono-num font-bold text-xs flex flex-col items-center justify-center cursor-pointer transition-all ${
                        on
                          ? 'bg-emerald-600 border-emerald-700 text-white scale-105'
                          : 'bg-blue-600 border-blue-700 text-white opacity-80'
                      }`}
                    >
                      <span>{on ? `×${valPerIcon}` : '👧📚'}</span>
                      <span className="text-[10px]">{on ? 'ditandai' : 'ketuk'}</span>
                    </button>
                  );
                })}
              </div>
              <div className="font-mono-num font-bold text-xs ml-auto text-slate-600 dark:text-slate-300">
                {count} / {r.n} ikon (@ {valPerIcon} buku)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== SOAL 23: BUKU TERBUKA & TABUNG PERSENTASE BERGELOMBANG ====================
export const Widget23BukuCerita: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const [day, setDay] = useState(0); // 0, 1 (Senin), 2 (Selasa)
  useEffect(() => setDay(0), [isContoh]);

  const totalHal = isContoh ? 100 : 200;
  const senin = isContoh ? 20 : 50;
  const sisa = totalHal - senin;
  const selasa = isContoh ? sisa / 4 : sisa / 3; // 20 or 50
  const dibaca = day === 0 ? 0 : day === 1 ? senin : senin + selasa;
  const pct = Math.round((dibaca / totalHal) * 100);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="text-sm font-bold font-mono-num">
        Buku Cerita {totalHal} halaman — Amati kemajuan membaca di buku & tabung ukur!
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Open Book Visual without leaking computed Selasa pages or % */}
        <div className="md:col-span-2 rounded-2xl bg-amber-50 dark:bg-slate-800/70 border-2 border-amber-300 dark:border-slate-700 p-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-amber-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-500">Halaman Terbaca</div>
            <div className="font-mono-num text-2xl font-extrabold text-emerald-600 mt-1">
              {day === 0 ? '0' : day === 1 ? `${senin} hal` : `${senin} + ? hal`}
            </div>
            <div className="text-xs mt-1 text-slate-600 dark:text-slate-300">
              {day === 0 ? 'Belum mulai' : day === 1 ? `Senin: ${senin} hal` : `Senin (${senin}) + Selasa (${isContoh ? '1/4' : '1/3'} dari sisa)`}
            </div>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-amber-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-500">Total Halaman Buku</div>
            <div className="font-mono-num text-2xl font-extrabold text-amber-600 mt-1">{totalHal}</div>
            <div className="text-xs mt-1 text-slate-600 dark:text-slate-300">
              {day >= 1 ? `Sisa setelah Senin = ${totalHal} − ${senin} = ? hal` : 'Mulai balik halaman'}
            </div>
          </div>
        </div>

        {/* Percentage Liquid Tube with scale markers (0..100%) */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-36 rounded-2xl border-4 border-slate-400 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-end">
            <div
              style={{ height: `${pct}%` }}
              className="w-full bg-emerald-600 transition-all duration-500 flex items-center justify-center text-white font-mono-num font-extrabold text-sm"
            >
              {pct > 0 ? '?%' : ''}
            </div>
          </div>
          <span className="text-xs font-bold font-mono-num">Tabung Persen: ? % dari {totalHal} hal</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            sound.pop();
            setDay(1);
            onMimoReact('berpikir', `Senin membaca ${senin} halaman! Sekarang hitung dulu berapa sisa halaman yang belum dibaca!`);
          }}
          className="min-h-[52px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
        >
          1. Balik Halaman Hari Senin ({senin} hal)
        </button>
        <button
          type="button"
          onClick={() => {
            sound.ding();
            setDay(2);
            onWowTriggered?.();
            onMimoReact('kaget', `Selasa membaca ${isContoh ? '1/4' : '1/3'} dari sisa halaman! Hitung halaman hari Selasa, jumlahkan dengan Senin, lalu ubah ke persen!`);
          }}
          className="min-h-[52px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
        >
          2. Balik Halaman Hari Selasa ({isContoh ? '1/4' : '1/3'} sisa)
        </button>
      </div>
    </div>
  );
};

// ==================== SOAL 24: MEJA KEMAS PARSEL PITA EMAS (FPB) ====================
export const Widget24PackingParsel: React.FC<WidgetProps> = ({ isContoh = false, onMimoReact, onWowTriggered }) => {
  const permen = isContoh ? 12 : 48;
  const cokelat = isContoh ? 18 : 36;
  const fpb = isContoh ? 6 : 12;
  const [bags, setBags] = useState(isContoh ? 3 : 6);

  useEffect(() => {
    setBags(isContoh ? 3 : 6);
  }, [isContoh]);

  const sisaP = permen % bags;
  const sisaC = cokelat % bags;
  const valid = sisaP === 0 && sisaC === 0;
  const isMax = bags === fpb;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold font-mono-num">
          {permen} Permen & {cokelat} Cokelat · Dicoba: {bags} kantong parsel
        </span>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-lg ${
            valid
              ? 'bg-emerald-100 text-emerald-900'
              : 'bg-amber-100 text-amber-900'
          }`}
        >
          {valid ? 'Habis rata tanpa sisa! Cek apakah masih ada jumlah kantong lebih besar!' : `Ada sisa (${sisaP} permen, ${sisaC} cokelat)`}
        </span>
      </div>

      <input
        type="range"
        min={2}
        max={isContoh ? 12 : 18}
        value={bags}
        onChange={(e) => {
          const v = Number(e.target.value);
          setBags(v);
          if (v === fpb) {
            sound.ding();
            onWowTriggered?.();
            onMimoReact('senang', `Di ${v} kantong habis tanpa sisa! Coba geser lebih ke kanan lagi, apakah masih bisa dibagi rata? Jika tidak bisa, itulah jumlah terbanyaknya (FPB)!`);
          } else {
            sound.pop();
          }
        }}
        className="w-full accent-blue-600 cursor-pointer h-8"
      />

      {/* Visual Parcel Bags */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {Array.from({ length: bags }).map((_, i) => (
          <div
            key={i}
            className={`rounded-xl border-2 p-2 text-center font-mono-num text-xs ${
              valid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
            }`}
          >
            <div className="font-bold">Kantong {i + 1}</div>
            <div>🍬 {Math.floor(permen / bags)} · 🍫 {Math.floor(cokelat / bags)}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 text-center font-mono-num text-xs">
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 font-bold">
          Piring Sisa Permen: {sisaP} buah
        </div>
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 font-bold">
          Piring Sisa Cokelat: {sisaC} buah
        </div>
      </div>
    </div>
  );
};
