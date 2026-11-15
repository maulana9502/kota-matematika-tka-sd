import React, { useState } from 'react';
import { TkaQuestion } from '../data/tkaData';
import { sound } from '../utils/sound';

interface TeacherPanelProps {
  question?: TkaQuestion;
  frozen: boolean;
  onToggleFreeze: () => void;
  onClose: () => void;
}

const PERAN_KELOMPOK = [
  { peran: 'Pemegang Alat', tugas: 'Menggerakkan panggung di layar IFP atau mouse sesuai kesepakatan kelompok.' },
  { peran: 'Pencatat', tugas: 'Mencatat angka, satuan, dan hasil percobaan di papan atau buku.' },
  { peran: 'Penjelas', tugas: 'Menceritakan alasan jawaban kelompok kepada teman sekelas.' },
  { peran: 'Penguji', tugas: 'Mengecek ulang satuan dan memastikan tidak ada langkah yang terlewat.' }
];

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  question,
  frozen,
  onToggleFreeze,
  onClose
}) => {
  const [jumlahAbsen, setJumlahAbsen] = useState(36);
  const [terpilih, setTerpilih] = useState<string | null>(null);
  const [peranAcak, setPeranAcak] = useState<{ siswa: string; peran: string; tugas: string }[]>([]);
  const [temuanInput, setTemuanInput] = useState('');
  const [temuanList, setTemuanList] = useState<string[]>([
    'Kelompok 1: Satuan berat harus disamakan ke gram sebelum dijumlahkan.'
  ]);
  const [mariSalahFixed, setMariSalahFixed] = useState(false);

  const acakSiswa = () => {
    sound.unlock();
    sound.pop();
    const maxAbsen = Math.max(4, Math.min(45, jumlahAbsen || 36));
    const numbers = Array.from({ length: maxAbsen }, (_, i) => i + 1);
    const picked = numbers[Math.floor(Math.random() * numbers.length)];
    setTerpilih(`Absen No. ${picked}`);

    // Pick 4 unique random absen numbers for roles
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    setPeranAcak(
      PERAN_KELOMPOK.map((p, idx) => ({
        siswa: `Absen No. ${shuffled[idx % shuffled.length]}`,
        peran: p.peran,
        tugas: p.tugas
      }))
    );
  };

  const tambahTemuan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!temuanInput.trim()) return;
    sound.click();
    setTemuanList((prev) => [temuanInput.trim(), ...prev]);
    setTemuanInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full overflow-y-auto p-6 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mode Guru & Alat Kelas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kendali diskusi kelas, pengacak peran, dan catatan temuan lokal
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="min-h-[48px] px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm cursor-pointer"
          >
            Tutup
          </button>
        </div>

        {/* Freeze Screen & Offline HTML Download */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              sound.click();
              onToggleFreeze();
            }}
            className={`min-h-[64px] rounded-xl font-bold text-sm px-4 cursor-pointer border-2 transition-colors ${
              frozen
                ? 'bg-amber-500 border-amber-600 text-slate-950'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-blue-500'
            }`}
          >
            {frozen ? 'Buka Bekuan Layar' : 'Bekukan Layar untuk Diskusi'}
          </button>
          <a
            href="/tka-sd-tahap1.html"
            download="tka-sd-tahap1.html"
            className="min-h-[64px] rounded-xl font-bold text-sm px-4 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-center"
          >
            Unduh HTML Mandiri Offline (Tahap 1)
          </a>
        </div>

        {/* Kartu Guru for current question */}
        {question?.kartuGuru && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Kartu Guru — Soal {question.id} ({question.widget.namaPanggung})
            </h3>
            <div>
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400">Pertanyaan Pemantik</div>
              <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{question.kartuGuru.pemantik}</p>
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Kesalahan Konsep yang Diwaspadai</div>
              <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 mt-0.5 space-y-1">
                {question.kartuGuru.salahKonsep.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Kapan Berhenti untuk Diskusi</div>
              <p className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{question.kartuGuru.kapanBerhenti}</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Kegiatan Kelas Fisik</div>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{question.kartuGuru.kegiatanKelas}</p>
            </div>
          </div>
        )}

        {/* Mari Salah: Mimo makes a deliberate misconception */}
        {question?.kartuGuru?.mariSalah && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
                Mari Salah (Temukan Kekeliruan Mimo!)
              </h3>
              <button
                type="button"
                onClick={() => {
                  sound.ding();
                  setMariSalahFixed((v) => !v);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold cursor-pointer"
              >
                {mariSalahFixed ? 'Sembunyikan Koreksi' : 'Bongkar Kesalahan!'}
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {question.kartuGuru.mariSalah.klaimMimo}
            </p>
            {mariSalahFixed && (
              <div className="rounded-xl bg-white dark:bg-slate-900 p-3 border border-amber-200 dark:border-amber-700 text-sm space-y-1">
                <div className="font-bold text-amber-800 dark:text-amber-300">
                  Kekeliruan: {question.kartuGuru.mariSalah.kesalahan}
                </div>
                <div className="text-emerald-800 dark:text-emerald-300 font-semibold">
                  Perbaikan: {question.kartuGuru.mariSalah.perbaikan}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pengacak Nomor Absen 1-36 & Kartu Peran */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Pengacak Nomor Absen (1–{jumlahAbsen}) & Kartu Peran
          </h3>
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300" htmlFor="max-absen-input">
              Jumlah Siswa di Kelas:
            </label>
            <input
              id="max-absen-input"
              type="number"
              min={4}
              max={45}
              value={jumlahAbsen}
              onChange={(e) => setJumlahAbsen(Number(e.target.value) || 36)}
              className="w-24 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-mono-num font-bold text-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            type="button"
            onClick={acakSiswa}
            className="min-h-[52px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
          >
            Acak Nomor Absen (1–{jumlahAbsen}) & 4 Peran
          </button>
          {terpilih && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-3 text-center">
              <div className="text-xs text-blue-700 dark:text-blue-300 font-semibold">Giliran Maju Sekarang:</div>
              <div className="text-xl font-bold text-blue-950 dark:text-blue-100">{terpilih}</div>
            </div>
          )}
          {peranAcak.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {peranAcak.map((item) => (
                <div
                  key={item.peran}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2.5"
                >
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-400">{item.peran}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.siswa}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.tugas}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Papan Temuan Kelas */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Papan Temuan Kelas</h3>
          <form onSubmit={tambahTemuan} className="flex gap-2">
            <input
              type="text"
              value={temuanInput}
              onChange={(e) => setTemuanInput(e.target.value)}
              placeholder="Catat temuan kelompok di sini..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm cursor-pointer"
            >
              Catat
            </button>
          </form>
          <ul className="space-y-2">
            {temuanList.map((t, i) => (
              <li
                key={i}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-800 dark:text-slate-200"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          Pintasan papan ketik laptop: Panah Kanan / Spasi (Lanjut) · Panah Kiri (Mundur) · M (Bisukan) · F (Layar Penuh).
        </div>
      </div>
    </div>
  );
};
