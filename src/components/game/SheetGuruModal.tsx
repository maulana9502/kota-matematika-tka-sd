import React, { useEffect, useState } from 'react';
import { ArchiveRow } from '../../types/game';
import { loadCloudArchives } from '../../utils/firebaseClient';
import { sound } from '../../utils/sound';
import { FileSpreadsheet, Download, Mail, RefreshCw, X } from 'lucide-react';

interface SheetGuruModalProps {
  teacherEmail: string;
  onUpdateTeacherEmail: (email: string) => void;
  onClose: () => void;
}

export const SheetGuruModal: React.FC<SheetGuruModalProps> = ({
  teacherEmail,
  onUpdateTeacherEmail,
  onClose
}) => {
  const [entries, setEntries] = useState<ArchiveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [emailDraft, setEmailDraft] = useState(teacherEmail);
  const [emailSavedMsg, setEmailSavedMsg] = useState(false);

  const fetchArchives = async () => {
    setLoading(true);
    try {
      const [localRes, cloudRows] = await Promise.all([
        fetch('/api/archive').then((r) => (r.ok ? r.json() : { entries: [] })),
        loadCloudArchives().catch(() => [])
      ]);
      const localRows: ArchiveRow[] = Array.isArray(localRes.entries) ? localRes.entries : [];
      const mergedMap = new Map<string, ArchiveRow>();
      for (const row of [...cloudRows, ...localRows]) {
        mergedMap.set(row.id, row);
      }
      const sorted = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setEntries(sorted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const filtered = entries.filter((e) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      e.studentName.toLowerCase().includes(q) ||
      e.school.toLowerCase().includes(q) ||
      e.className.toLowerCase().includes(q) ||
      e.chapterTitle.toLowerCase().includes(q)
    );
  });

  const downloadCsv = () => {
    sound.click();
    const header = ['Waktu', 'Nama Siswa', 'Sekolah', 'Kelas', 'Bab', 'Aktivitas', 'Skor PG', 'Refleksi Tertulis', 'Sinkron Sheets'];
    const lines = [
      header.join(','),
      ...filtered.map((r) =>
        [
          new Date(r.createdAt).toLocaleString('id-ID'),
          r.studentName,
          r.school,
          r.className,
          r.chapterTitle,
          r.questionLabel,
          r.pgScore,
          r.reflectionText,
          r.syncedToSheet ? 'Ya' : 'Lokal/Cloud'
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      )
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arsip-kota-matematika-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-5xl max-h-[92dvh] rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black">
                Sheet Guru — Rekap Arsip Belajar & Google Sheets
              </h2>
              <p className="text-xs text-slate-300">
                Rekap otomatis jawaban siswa, refleksi tertulis (tanpa foto), dan unduh CSV.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Teacher Email Share Settings */}
          <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-blue-950 font-semibold">
              <Mail className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Email Guru Tujuan Berbagi Otomatis Google Sheets:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="email"
                value={emailDraft}
                onChange={(e) => {
                  setEmailDraft(e.target.value);
                  setEmailSavedMsg(false);
                }}
                placeholder="emailguru@gmail.com"
                className="flex-1 sm:w-64 min-h-[38px] px-3 rounded-xl border border-blue-300 bg-white text-xs font-semibold text-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  sound.pop();
                  onUpdateTeacherEmail(emailDraft.trim());
                  setEmailSavedMsg(true);
                }}
                className="min-h-[38px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                {emailSavedMsg ? 'Tersimpan ✓' : 'Simpan Email'}
              </button>
            </div>
          </div>

          {/* Filter & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Cari nama siswa, sekolah, kelas, atau bab..."
              className="flex-1 min-w-[220px] min-h-[42px] px-3.5 rounded-xl border border-slate-300 text-sm"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.click();
                  fetchArchives();
                }}
                className="min-h-[42px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Segarkan</span>
              </button>
              <button
                type="button"
                onClick={downloadCsv}
                className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh CSV ({filtered.length})</span>
              </button>
            </div>
          </div>

          {/* Archive Table */}
          {loading ? (
            <div className="py-12 text-center text-sm font-semibold text-slate-500">Memuat data arsip...</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center text-sm text-slate-600">
              Belum ada kiriman tugas/refleksi. Siswa dapat mengirim hasil belajar dari Terminal Google Sheet di dalam setiap gedung bab.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="py-3 px-3 font-bold">Waktu</th>
                    <th className="py-3 px-3 font-bold">Siswa</th>
                    <th className="py-3 px-3 font-bold">Sekolah & Kelas</th>
                    <th className="py-3 px-3 font-bold">Bab & Soal</th>
                    <th className="py-3 px-3 font-bold">Skor</th>
                    <th className="py-3 px-3 font-bold">Refleksi Tertulis</th>
                    <th className="py-3 px-3 font-bold">Google Sheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono-num text-xs text-slate-500 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{row.studentName}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {row.school} · <strong>{row.className}</strong>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">
                        <div className="font-bold">{row.chapterTitle}</div>
                        <div className="text-xs text-slate-500">{row.questionLabel}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono-num font-black text-blue-700">{row.pgScore}</td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs">{row.reflectionText}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                            row.syncedToSheet
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {row.syncedToSheet ? 'Terkirim' : 'Arsip Kota'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
