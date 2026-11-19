import React, { useEffect, useState } from 'react';
import { OnlinePlayer } from '../../types/game';
import { sound } from '../../utils/sound';
import {
  Shield,
  Eye,
  Snowflake,
  Megaphone,
  FileSpreadsheet,
  GraduationCap,
  RefreshCw,
  Users,
  X
} from 'lucide-react';

interface ProgressOverviewRow {
  uid: string;
  name: string;
  school: string;
  className: string;
  completedQuestions: number[];
  bintangBersama: number;
  versusWins: number;
  level: number;
  updatedAt: string;
}

interface AdminGuruModalProps {
  adminPass: string;
  onlinePlayers: OnlinePlayer[];
  isSpectator: boolean;
  frozenAll: boolean;
  onToggleSpectator: () => void;
  onSpectatePlayer: (playerId: string) => void;
  onBroadcastFreeze: (freeze: boolean) => void;
  onBroadcastAnnouncement: (text: string, speak: boolean) => void;
  onOpenSheetGuru: () => void;
  onOpenTeacherPanel: () => void;
  onClose: () => void;
}

export const AdminGuruModal: React.FC<AdminGuruModalProps> = ({
  adminPass,
  onlinePlayers,
  isSpectator,
  frozenAll,
  onToggleSpectator,
  onSpectatePlayer,
  onBroadcastFreeze,
  onBroadcastAnnouncement,
  onOpenSheetGuru,
  onOpenTeacherPanel,
  onClose
}) => {
  const [progressList, setProgressList] = useState<ProgressOverviewRow[]>([]);
  const [archiveCount, setArchiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [speakAnnouncement, setSpeakAnnouncement] = useState(true);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-admin-pass': adminPass }
      });
      if (res.ok) {
        const data = (await res.json()) as {
          progressList?: ProgressOverviewRow[];
          archiveCount?: number;
        };
        setProgressList(Array.isArray(data.progressList) ? data.progressList : []);
        setArchiveCount(Number(data.archiveCount || 0));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.trim()) return;
    sound.pop();
    onBroadcastAnnouncement(announcement.trim(), speakAnnouncement);
    setSentNotice(`Pengumuman terkirim ke ${onlinePlayers.length} perangkat online!`);
    setAnnouncement('');
    window.setTimeout(() => setSentNotice(null), 3000);
  };

  const activeStudents = onlinePlayers.filter((p) => !p.isSpectator);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/82 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-5xl max-h-[92dvh] rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-black">
                Panel Admin Guru — SMP Kemala Bhayangkari 7 Porong
              </h2>
              <p className="text-xs text-slate-300">
                Pantau siswa real-time, mode spectator, kendali layar kelas, dan rekap progres.
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50">
          {/* Top Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => {
                sound.pop();
                onToggleSpectator();
                onClose();
              }}
              className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-colors ${
                isSpectator
                  ? 'bg-sky-600 border-sky-700 text-white'
                  : 'bg-white border-slate-200 hover:border-sky-500 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm">
                <Eye className="w-4 h-4" />
                <span>{isSpectator ? 'Keluar Mode Spectator' : 'Masuk Mode Spectator'}</span>
              </div>
              <p className={`text-xs mt-1 ${isSpectator ? 'text-sky-100' : 'text-slate-600'}`}>
                Terbang bebas melihat aktivitas siswa di Kota 3D.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.pop();
                onBroadcastFreeze(!frozenAll);
              }}
              className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-colors ${
                frozenAll
                  ? 'bg-amber-500 border-amber-600 text-slate-950'
                  : 'bg-white border-slate-200 hover:border-amber-500 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2 font-black text-sm">
                <Snowflake className="w-4 h-4" />
                <span>{frozenAll ? 'Buka Bekuan Layar Siswa' : 'Bekukan Layar Siswa'}</span>
              </div>
              <p className={`text-xs mt-1 ${frozenAll ? 'text-slate-900' : 'text-slate-600'}`}>
                Hentikan layar semua siswa sejenak untuk diskusi kelas.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.click();
                onClose();
                onOpenSheetGuru();
              }}
              className="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-emerald-500 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Rekap Sheet Guru ({archiveCount})</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Lihat kiriman refleksi siswa, atur email guru & unduh CSV.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.click();
                onClose();
                onOpenTeacherPanel();
              }}
              className="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-indigo-500 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Alat Kelas & Absen 1–36</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Pengacak nomor absen, kartu guru & unduh HTML offline.
              </p>
            </button>
          </div>

          {/* Live Teacher Announcement Broadcast */}
          <form
            onSubmit={handleSendAnnouncement}
            className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <Megaphone className="w-4 h-4 text-rose-600" />
                <span>Kirim Arahan / Pengumuman Live ke Layar Siswa</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={speakAnnouncement}
                  onChange={(e) => setSpeakAnnouncement(e.target.checked)}
                  className="accent-blue-600"
                />
                <span>Bacakan dengan Suara Pemandu</span>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Contoh: Silakan masuk ke Gedung Bab 2 Geometri dan kerjakan Soal 11!"
                className="flex-1 min-w-[220px] min-h-[42px] px-3.5 rounded-xl border border-slate-300 text-sm"
              />
              <button
                type="submit"
                className="min-h-[42px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
              >
                Kirim ke Semua Siswa
              </button>
            </div>
            {sentNotice && (
              <div className="text-xs font-bold text-emerald-700">{sentNotice}</div>
            )}
          </form>

          {/* Live Online Students Monitor */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Siswa Aktif di Kota 3D ({activeStudents.length})</span>
              </div>
              <button
                type="button"
                onClick={loadOverview}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Segarkan</span>
              </button>
            </div>

            {activeStudents.length === 0 ? (
              <div className="text-xs text-slate-500 py-3">
                Belum ada siswa lain yang terhubung saat ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {activeStudents.map((st) => (
                  <div
                    key={st.id}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {st.name} <span className="text-xs text-blue-700">· Lv.{st.level}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Kelas {st.className} · {st.school}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-700">
                        {st.completedCount}/25 Soal ·{' '}
                        {st.insideBuildingId ? `Di Gedung ${st.insideBuildingId}` : 'Di Jalanan Kota'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        sound.pop();
                        onSpectatePlayer(st.id);
                        onClose();
                      }}
                      className="min-h-[38px] px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Pantau 3D</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Progress Table Across Class */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
            <div className="font-black text-sm text-slate-900">
              Rekap Progres Semua Siswa Tersimpan ({progressList.length})
            </div>
            {loading ? (
              <div className="text-xs text-slate-500 py-4">Memuat progres siswa...</div>
            ) : progressList.length === 0 ? (
              <div className="text-xs text-slate-500 py-3">Belum ada data progres siswa tersimpan.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Nama</th>
                      <th className="py-2.5 px-3 font-bold">Sekolah & Kelas</th>
                      <th className="py-2.5 px-3 font-bold">Level</th>
                      <th className="py-2.5 px-3 font-bold">Soal Selesai</th>
                      <th className="py-2.5 px-3 font-bold">Bintang</th>
                      <th className="py-2.5 px-3 font-bold">Menang Duel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {progressList.map((row) => (
                      <tr key={row.uid} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">{row.name}</td>
                        <td className="py-2 px-3 text-slate-700">
                          {row.school} · <strong>{row.className}</strong>
                        </td>
                        <td className="py-2 px-3 font-mono-num font-bold text-blue-700">Lv.{row.level}</td>
                        <td className="py-2 px-3 font-mono-num font-bold text-emerald-700">
                          {(row.completedQuestions || []).length}/25
                        </td>
                        <td className="py-2 px-3 font-mono-num text-amber-700">★ {row.bintangBersama}</td>
                        <td className="py-2 px-3 font-mono-num text-rose-700">{row.versusWins}×</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
