import { BuildingDef } from '../types/game';

export const CITY_BUILDINGS: BuildingDef[] = [
  {
    id: 'bilangan',
    title: 'Bab 1: Bilangan',
    shortTitle: 'BAB 1 · BILANGAN',
    subtitle: 'Pecahan, Desimal, Persen, KPK, FPB & Diskon (12 Soal TKA)',
    x: -17,
    z: 22,
    frontX: -9.5,
    frontZ: 22,
    facingAngle: Math.PI / 2,
    color: '#2563EB',
    accentColor: '#60A5FA',
    questionIds: [1, 2, 3, 4, 5, 6, 7, 15, 16, 19, 23, 24]
  },
  {
    id: 'geometri',
    title: 'Bab 2: Geometri',
    shortTitle: 'BAB 2 · GEOMETRI',
    subtitle: 'Bangun Datar, Sudut 180°, Kubus & Balok (7 Soal TKA)',
    x: 17,
    z: 22,
    frontX: 9.5,
    frontZ: 22,
    facingAngle: -Math.PI / 2,
    color: '#059669',
    accentColor: '#34D399',
    questionIds: [11, 12, 13, 18, 20, 21, 25]
  },
  {
    id: 'pengukuran',
    title: 'Bab 3: Pengukuran',
    shortTitle: 'BAB 3 · PENGUKURAN',
    subtitle: 'Tangga Satuan Berat, Volume, Waktu & Kecepatan (4 Soal TKA)',
    x: -17,
    z: -16,
    frontX: -9.5,
    frontZ: -16,
    facingAngle: Math.PI / 2,
    color: '#D97706',
    accentColor: '#FBBF24',
    questionIds: [8, 9, 10, 17]
  },
  {
    id: 'data',
    title: 'Bab 4: Data',
    shortTitle: 'BAB 4 · DATA',
    subtitle: 'Tabel Frekuensi, Piktogram, Selisih & Rata-Rata (2 Soal TKA)',
    x: 17,
    z: -16,
    frontX: 9.5,
    frontZ: -16,
    facingAngle: -Math.PI / 2,
    color: '#7C3AED',
    accentColor: '#A78BFA',
    questionIds: [14, 22]
  },
  {
    id: 'strategi',
    title: 'Bab 5: Strategi & Panggung Kelas',
    shortTitle: 'BAB 5 · STRATEGI',
    subtitle: 'Strategi Soal Cerita, Buku Saku Lengkap, Mode Guru & 25 Soal',
    x: -17,
    z: -38,
    frontX: -9.5,
    frontZ: -38,
    facingAngle: Math.PI / 2,
    color: '#0284C7',
    accentColor: '#38BDF8',
    questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
  },
  {
    id: 'versus',
    title: 'Arena Duel Versus 1v1',
    shortTitle: 'GEDUNG VERSUS 1v1',
    subtitle: 'Tanding Cepat 1v1 Real-Time PvP & Lawan Bot (125 Soal Acak)',
    x: 0,
    z: -56,
    frontX: 0,
    frontZ: -45.5,
    facingAngle: 0,
    color: '#DC2626',
    accentColor: '#F59E0B',
    isVersus: true,
    questionIds: []
  }
];
