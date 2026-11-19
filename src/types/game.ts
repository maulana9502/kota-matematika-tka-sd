export type CompanionId = 'garuda' | 'robot' | 'kucing' | 'naga';

export type WeatherType = 'Cerah' | 'Berawan' | 'Hujan' | 'Badai' | 'Terik';

export type TimeOfDayMode = 'auto' | 'pagi' | 'siang' | 'sore' | 'malam';

export type ResolvedTimeOfDay = 'pagi' | 'siang' | 'sore' | 'malam';

export type HatStyle = 'default' | 'topi-sekolah' | 'topi-juara' | 'bando-pintar';

export type ChapterId = 'bilangan' | 'geometri' | 'pengukuran' | 'data' | 'strategi';

export type BuildingId = ChapterId | 'versus';

export type StationId = 'materi' | 'soal' | 'sheet' | 'keluar';

export interface AvatarAppearance {
  shirtColor: string;
  pantsColor: string;
  hairColor: string;
  hatStyle: HatStyle;
  companion: CompanionId;
}

export interface PlayerIdentity extends AvatarAppearance {
  uid: string;
  name: string;
  school: string;
  className: string;
  isGoogleUser: boolean;
  email?: string;
}

export interface PlayerProgress {
  completedQuestions: number[];
  completedContoh: number[];
  completedSteps: number[];
  chapterMastery: Record<ChapterId, number>;
  bintangBersama: number;
  versusWins: number;
  level: number;
}

export type UserRole = 'student' | 'spectator' | 'admin';

export interface OnlinePlayer {
  id: string;
  name: string;
  school: string;
  className: string;
  shirtColor: string;
  pantsColor: string;
  hairColor: string;
  hatStyle: string;
  companion: CompanionId;
  x: number;
  y: number;
  z: number;
  rotY: number;
  moving: boolean;
  level: number;
  completedCount: number;
  insideBuildingId: string;
  isSpectator?: boolean;
}

export interface BuildingDef {
  id: BuildingId;
  title: string;
  shortTitle: string;
  subtitle: string;
  x: number;
  z: number;
  frontX: number;
  frontZ: number;
  facingAngle: number;
  color: string;
  accentColor: string;
  isVersus?: boolean;
  questionIds: number[];
}

export interface VersusQuestion {
  id: number;
  topic: string;
  teks: string;
  opsi: [string, string, string, string];
  kunciIndex: number;
  pembahasan: string;
}

export interface ArchiveRow {
  id: string;
  uid: string;
  studentName: string;
  school: string;
  className: string;
  chapterId: string;
  chapterTitle: string;
  questionLabel: string;
  pgScore: number;
  reflectionText: string;
  syncedToSheet: boolean;
  createdAt: string;
}

export interface CompanionMeta {
  id: CompanionId;
  nama: string;
  julukan: string;
  warnaUtama: string;
  warnaAksen: string;
}

export const COMPANION_OPTIONS: CompanionMeta[] = [
  { id: 'garuda', nama: 'Garuda Mini', julukan: 'Penjaga Langit Angka', warnaUtama: '#D97706', warnaAksen: '#DC2626' },
  { id: 'robot', nama: 'Robot Pustaka', julukan: 'Asisten Hitung Cepat', warnaUtama: '#0284C7', warnaAksen: '#38BDF8' },
  { id: 'kucing', nama: 'Kucing Cerdas', julukan: 'Detektif Logika', warnaUtama: '#F59E0B', warnaAksen: '#FEF3C7' },
  { id: 'naga', nama: 'Naga Aksara', julukan: 'Sahabat Geometri', warnaUtama: '#059669', warnaAksen: '#FBBF24' }
];

export const SHIRT_COLOR_OPTIONS = [
  { label: 'Biru Sekolah', hex: '#2563EB' },
  { label: 'Merah Berani', hex: '#DC2626' },
  { label: 'Hijau Zamrud', hex: '#059669' },
  { label: 'Kuning Emas', hex: '#D97706' },
  { label: 'Ungu Kreatif', hex: '#7C3AED' },
  { label: 'Oranye Ceria', hex: '#EA580C' },
  { label: 'Biru Langit', hex: '#0284C7' },
  { label: 'Merah Muda', hex: '#DB2777' }
];

export const PANTS_COLOR_OPTIONS = [
  { label: 'Biru Tua', hex: '#1E293B' },
  { label: 'Abu-Abu', hex: '#475569' },
  { label: 'Cokelat Pramuka', hex: '#78350F' },
  { label: 'Merah Hati', hex: '#7F1D1D' }
];

export const INTERIOR_TROPHY_MILESTONES = [
  { threshold: 2, label: 'Karpet Belajar' },
  { threshold: 4, label: 'Sofa & Meja Baca' },
  { threshold: 6, label: 'Rak Piala & Tanaman Hias' },
  { threshold: 8, label: 'Lampu Kristal & Pigura Prestasi' },
  { threshold: 10, label: 'Monumen Kristal Juara' }
];
