import React, { useState } from 'react';
import {
  COMPANION_OPTIONS,
  CompanionId,
  PlayerIdentity,
  SHIRT_COLOR_OPTIONS
} from '../../types/game';
import { KOTA_LABEL } from '../../data/tkaData';
import { sound, voice } from '../../utils/sound';
import { Volume2, Sparkles, Gamepad2, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  initialIdentity: PlayerIdentity;
  googleLoading: boolean;
  googleError: string | null;
  onGoogleLogin: (draft: {
    name: string;
    school: string;
    className: string;
    shirtColor: string;
    companion: CompanionId;
  }) => void;
  onGuestEnter: (draft: {
    name: string;
    school: string;
    className: string;
    shirtColor: string;
    companion: CompanionId;
  }) => void;
}

const SOFT_SELL_TEXT =
  'Bosan belajar matematika yang cuma gitu-gitu aja? Di sini, rumus dan hitungan berubah jadi petualangan interaktif! Karya inovasi pembelajaran digital persembahan Tim Guru SMP Kemala Bhayangkari 7 Porong — tempat di mana belajar nggak cuma soal papan tulis, tapi juga eksplorasi teknologi masa depan.';

const SOFT_SELL_VOICE = `${SOFT_SELL_TEXT} Apakah sudah siap menjelajahi Kota Matematika 3D? Isi namamu atau masuk dengan Google untuk menyimpan progres petualangan secara otomatis!`;

export const LoginScreen: React.FC<LoginScreenProps> = ({
  initialIdentity,
  googleLoading,
  googleError,
  onGoogleLogin,
  onGuestEnter
}) => {
  const [name, setName] = useState(initialIdentity.name || '');
  const [school, setSchool] = useState(initialIdentity.school || 'SDN / SMP Kemala Bhayangkari 7 Porong');
  const [className, setClassName] = useState(initialIdentity.className || '6A');
  const [shirtColor, setShirtColor] = useState(initialIdentity.shirtColor || '#2563EB');
  const [companion, setCompanion] = useState<CompanionId>(initialIdentity.companion || 'garuda');
  const [formError, setFormError] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);

  const playIntroVoice = () => {
    sound.unlock();
    sound.pop();
    sound.setMuted(false);
    sound.setMusicEnabled(true);
    sound.startMusic();
    voice.setEnabled(true);
    voice.speak(SOFT_SELL_VOICE, true);
    setVoiceActive(true);
  };

  const handleSubmitGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Tuliskan Nama Lengkap Siswa terlebih dahulu ya.');
      return;
    }
    setFormError(null);
    sound.unlock();
    sound.pop();
    sound.setMusicEnabled(true);
    sound.startMusic();
    onGuestEnter({
      name: name.trim(),
      school: school.trim() || 'SD Kelas 6',
      className: className.trim() || '6',
      shirtColor,
      companion
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden flex flex-col justify-between text-white">
      {/* Original School Courtyard Background + Thin Dark Scrim for Form Contrast */}
      <div className="fixed inset-0 -z-10">
        <img
          src="/assets/aistudio/Gemini_Generated_Image_l149tl149tl149tl_027ee563.jpg"
          alt="Halaman Sekolah"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
      </div>

      {/* Top Corner Logos (Transparent, NO boxy borders, non-overlapping, hidden once entering 3D city) */}
      <header className="relative z-10 w-full px-4 sm:px-8 pt-4 flex items-center justify-between gap-4 pointer-events-none">
        {/* Higher-tier Logo at Top-Left */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <img
            src="/assets/aistudio/657031cc5d8eb_b91b42be.png"
            alt="Logo Yayasan Kemala Bhayangkari"
            referrerPolicy="no-referrer"
            className="w-14 h-14 sm:w-18 sm:h-18 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.65)]"
          />
          <div className="hidden sm:block drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              Yayasan Kemala Bhayangkari
            </div>
            <div className="text-sm font-extrabold text-white">
              Kota Matematika 3D
            </div>
          </div>
        </div>

        {/* Second Logo at Top-Right (Transparent SVG Emblem, NO boxy background) */}
        <div className="flex items-center gap-2.5 text-right pointer-events-auto">
          <div className="hidden sm:block drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
              Karya Inovasi Pembelajaran Digital
            </div>
            <div className="text-sm font-extrabold text-white">
              SMP Kemala Bhayangkari 7 Porong
            </div>
          </div>
          <svg
            viewBox="0 0 64 64"
            className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.75)]"
            aria-label="Lambang Tim Guru SMP Kemala Bhayangkari 7 Porong"
          >
            <path
              d="M32 4 L56 14 V31 C56 46 45 56 32 60 C19 56 8 46 8 31 V14 Z"
              fill="#1E3A8A"
              fillOpacity="0.88"
              stroke="#FBBF24"
              strokeWidth="2.8"
            />
            <path
              d="M32 11 L49 18 V30 C49 41 41 49 32 52 C23 49 15 41 15 30 V18 Z"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="1.2"
            />
            <text
              x="32"
              y="32"
              textAnchor="middle"
              fill="#FBBF24"
              fontSize="13"
              fontWeight="900"
              fontFamily="sans-serif"
            >
              SMP 7
            </text>
            <text
              x="32"
              y="43"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="800"
              fontFamily="sans-serif"
            >
              PORONG
            </text>
          </svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Soft-Selling Intro & Voice Over */}
        <section className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/95 text-slate-950 font-extrabold text-xs tracking-wide shadow-md">
            <Sparkles className="w-4 h-4" />
            <span>{KOTA_LABEL} · KELAS 6 SD</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-black leading-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)]">
            Petualangan Kota 3D Persiapan TKA SD
          </h1>

          <div className="rounded-2xl bg-slate-900/82 border border-white/15 p-4 sm:p-5 space-y-3 shadow-xl">
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
              “{SOFT_SELL_TEXT}”
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={playIntroVoice}
                className="min-h-[46px] px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition-transform active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>{voiceActive ? 'Putar Ulang Suara Pembuka & Backsound' : 'Apakah Sudah Siap? Putar Suara Pembuka'}</span>
              </button>
              <span className="text-xs text-sky-200 font-semibold">
                25 Soal Interaktif + 5 Bab Materi + Arena Duel 1v1 (125 Soal)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-xl bg-slate-900/80 border border-white/15 p-3">
              <div className="text-lg font-black text-amber-300 font-mono-num">6 Gedung</div>
              <div className="text-[11px] text-slate-200 font-semibold">Kota 3D Terbuka</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-white/15 p-3">
              <div className="text-lg font-black text-emerald-300 font-mono-num">25 Widget</div>
              <div className="text-[11px] text-slate-200 font-semibold">Manipulatif IFP</div>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-white/15 p-3">
              <div className="text-lg font-black text-sky-300 font-mono-num">PvP 1v1</div>
              <div className="text-[11px] text-slate-200 font-semibold">Multiplayer Real-Time</div>
            </div>
          </div>
        </section>

        {/* Right Column: Login & Identity Form */}
        <section className="lg:col-span-6">
          <form
            onSubmit={handleSubmitGuest}
            className="rounded-3xl bg-white text-slate-900 p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4"
          >
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900">
                Identitas Penjelajah & Avatar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Lengkapi data dirimu untuk tampil di papan nama 3D dan arsip guru.
              </p>
            </div>

            {/* Google Sign-In Official gsi-material-button style */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={googleLoading}
                onClick={() => {
                  sound.unlock();
                  sound.click();
                  onGoogleLogin({
                    name: name.trim() || 'Siswa Hebat',
                    school: school.trim() || 'SD/SMP Kemala Bhayangkari 7 Porong',
                    className: className.trim() || '6A',
                    shirtColor,
                    companion
                  });
                }}
                className="w-full min-h-[48px] px-4 rounded-xl bg-white hover:bg-slate-50 border border-[#747775] text-[#1f1f1f] font-semibold text-sm flex items-center justify-center gap-3 cursor-pointer shadow-xs transition-colors disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>
                  {googleLoading ? 'Menghubungkan Akun Google...' : 'Masuk dengan Google (Simpan Cloud & Google Sheets)'}
                </span>
              </button>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Progres bab, piala 3D, dan pengiriman Google Sheets tersimpan otomatis saat masuk Google.</span>
              </div>
              {googleError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-800 font-semibold">
                  {googleError}
                </div>
              )}
            </div>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200" />
              <span className="shrink mx-3 text-xs font-bold text-slate-400 uppercase">Atau Masuk Langsung</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="login-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  id="login-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Bima Pratama"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="login-school" className="block text-xs font-bold text-slate-700 mb-1">
                  Asal Sekolah
                </label>
                <input
                  id="login-school"
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Nama SD / Sekolah"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="login-class" className="block text-xs font-bold text-slate-700 mb-1">
                  Kelas
                </label>
                <input
                  id="login-class"
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Contoh: 6A"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:outline-none text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Quick Shirt Color & Companion Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">Warna Baju Avatar</div>
                <div className="flex flex-wrap gap-2">
                  {SHIRT_COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.label}
                      onClick={() => {
                        sound.click();
                        setShirtColor(c.hex);
                      }}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-lg cursor-pointer transition-transform ${
                        shirtColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-85 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">Karakter Pendamping 3D</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {COMPANION_OPTIONS.map((comp) => (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => {
                        sound.click();
                        setCompanion(comp.id);
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-bold cursor-pointer transition-colors ${
                        companion === comp.id
                          ? 'bg-blue-50 border-blue-600 text-blue-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {comp.nama}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formError && (
              <div className="rounded-xl bg-amber-50 border border-amber-300 px-3 py-2 text-xs font-bold text-amber-900">
                {formError}
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[54px] rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-display font-black text-base sm:text-lg flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-transform active:scale-[0.99]"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Masuk ke Kota 3D</span>
            </button>
          </form>
        </section>
      </main>

      <footer className="relative z-10 px-4 py-3 text-center text-xs text-slate-300 font-medium">
        Media Pembelajaran Interaktif Kelas 6 SD · Soal Latihan Bermodel TKA · Tim Guru SMP Kemala Bhayangkari 7 Porong
      </footer>
    </div>
  );
};
