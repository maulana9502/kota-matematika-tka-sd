import React, { useState } from 'react';
import { BUKU_SAKU_MATERI } from '../data/tkaData';
import { sound, formatAngkaID } from '../utils/sound';

interface BukuSakuProps {
  onBack: () => void;
}

export const BukuSaku: React.FC<BukuSakuProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('bilangan');
  // Mini interactive 1: Equivalent fraction multiplier
  const [fracMult, setFracMult] = useState<number>(2);
  // Mini interactive 2: Unit ladder converter
  const [beratKg, setBeratKg] = useState<number>(2.5);
  // Mini interactive 3: Triangle angle slider
  const [angleA, setAngleA] = useState<number>(50);

  const activeSection = BUKU_SAKU_MATERI.find((m) => m.id === activeTab) || BUKU_SAKU_MATERI[0];
  const angleB = Math.min(120, Math.max(20, angleA * 2 > 160 ? 60 : angleA));
  const angleC = 180 - angleA - angleB;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Buku Saku Materi Matematika TKA SD
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Ringkasan materi resmi beserta alat coba kecil untuk kelas 6 SD.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            sound.click();
            onBack();
          }}
          className="min-h-[64px] px-5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm cursor-pointer hover:opacity-90"
        >
          Kembali ke Peta Soal
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800/80">
        {BUKU_SAKU_MATERI.map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => {
              sound.click();
              setActiveTab(sec.id);
            }}
            className={`min-h-[52px] px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === sec.id
                ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
              }`}
          >
            {sec.judul}
          </button>
        ))}
      </div>

      {/* Interactive Mini-Example matching active section */}
      {activeTab === 'bilangan' && (
        <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-bold text-blue-900 dark:text-blue-200">
              Coba Interaktif: Pecahan Senilai dari 1/2
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              Geser pengali untuk melihat pembilang dan penyebut dikali bilangan yang sama:
            </p>
            <div className="mt-3 flex items-center gap-3">
              <label htmlFor="frac-mult" className="text-sm font-semibold font-mono-num">
                Pengali: ×{fracMult}
              </label>
              <input
                id="frac-mult"
                type="range"
                min={1}
                max={8}
                value={fracMult}
                onChange={(e) => {
                  sound.pop();
                  setFracMult(Number(e.target.value));
                }}
                className="w-48 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-6 py-4 rounded-xl border border-blue-200 dark:border-blue-700 font-mono-num text-2xl font-bold">
            <span>1/2</span>
            <span className="text-slate-400">=</span>
            <span className="text-blue-600 dark:text-blue-400">
              {fracMult}/{fracMult * 2}
            </span>
            <span className="text-slate-400">=</span>
            <span className="text-emerald-600 dark:text-emerald-400">50%</span>
          </div>
        </div>
      )}

      {activeTab === 'pengukuran' && (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold text-amber-950 dark:text-amber-200">
              Coba Interaktif: Konverter Tangga Berat (kg → g)
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="berat-kg" className="font-mono-num text-sm font-bold">
                Berat: {formatAngkaID(beratKg, 1)} kg
              </label>
              <input
                id="berat-kg"
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={beratKg}
                onChange={(e) => {
                  sound.pop();
                  setBeratKg(Number(e.target.value));
                }}
                className="w-44 accent-amber-600 cursor-pointer"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 font-mono-num text-center">
            <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-slate-500">kg</div>
              <div className="text-lg font-bold">{formatAngkaID(beratKg, 1)}</div>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-slate-500">hg (ons)</div>
              <div className="text-lg font-bold">{formatAngkaID(beratKg * 10, 1)}</div>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-slate-500">dag</div>
              <div className="text-lg font-bold">{formatAngkaID(beratKg * 100, 1)}</div>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-amber-200 dark:border-amber-800">
              <div className="text-xs text-slate-500">g</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {formatAngkaID(beratKg * 1000, 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'geometri' && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
              Coba Interaktif: Jumlah Tiga Sudut Segitiga Selalu 180°
            </div>
            <div className="mt-2 flex items-center gap-3">
              <label htmlFor="sudut-a" className="text-sm font-mono-num font-semibold">
                Ubah Sudut A: {angleA}°
              </label>
              <input
                id="sudut-a"
                type="range"
                min={25}
                max={85}
                value={angleA}
                onChange={(e) => {
                  sound.pop();
                  setAngleA(Number(e.target.value));
                }}
                className="w-44 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
          <div className="font-mono-num text-base md:text-lg font-bold bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-emerald-200 dark:border-emerald-700">
            {angleA}° + {angleB}° + {angleC}° = <span className="text-emerald-700 dark:text-emerald-400">180°</span>
          </div>
        </div>
      )}

      {/* Material Points */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{activeSection.judul}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{activeSection.subjudul}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeSection.poin.map((p) => (
            <div
              key={p.judul}
              className="rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="font-bold text-slate-900 dark:text-slate-100 text-base">{p.judul}</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">{p.isi}</p>
            </div>
          ))}
        </div>

        {activeSection.tabelRumus && (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  <th className="py-3 px-4 font-bold">Bangun datar</th>
                  <th className="py-3 px-4 font-bold">Keliling</th>
                  <th className="py-3 px-4 font-bold">Luas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeSection.tabelRumus.map((r) => (
                  <tr key={r.bangun}>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{r.bangun}</td>
                    <td className="py-3 px-4 font-mono-num text-slate-700 dark:text-slate-300">{r.keliling}</td>
                    <td className="py-3 px-4 font-mono-num text-slate-700 dark:text-slate-300">{r.luas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
