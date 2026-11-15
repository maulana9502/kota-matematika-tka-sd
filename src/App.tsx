import React, { useState, useEffect, useCallback } from 'react';
import {
  TKA_QUESTIONS,
  TkaQuestion,
  QuestionTopic,
  KOTA_LABEL
} from './data/tkaData';
import { sound, voice } from './utils/sound';
import { MimoMascot, MimoMood } from './components/MimoMascot';
import { Widget8Timbangan } from './components/widgets/Widget8Timbangan';
import { Widget20Tanah } from './components/widgets/Widget20Tanah';
import { Widget25Sudut } from './components/widgets/Widget25Sudut';
import {
  Widget1MesinBentuk,
  Widget2TokoMentari,
  Widget3DapurJus,
  Widget4PetakKebun,
  Widget5KalenderRenang,
  Widget6GuntingKawat,
  Widget7GudangBuku,
  Widget9PetaPerjalanan,
  Widget10JamDimas,
  Widget11KotakKubus,
  Widget12BongkarBak
} from './components/widgets/WidgetsSetA';
import {
  Widget13DetektifBangun,
  Widget14KantorBerita,
  Widget15KeranjangBuah,
  Widget16LintasanSepeda,
  Widget17TangkiEmber,
  Widget18DaduPutar,
  Widget19LoyangKue,
  Widget21LahanParkir,
  Widget22PekanLiterasi,
  Widget23BukuCerita,
  Widget24PackingParsel
} from './components/widgets/WidgetsSetB';
import { BukuSaku } from './components/BukuSaku';
import { TeacherPanel } from './components/TeacherPanel';
import { StepBlockChallenge } from './components/StepBlockChallenge';

type ViewMode = 'map' | 'question' | 'buku';
type ClassroomMode = 'maju-satu' | 'berdua' | 'tim' | 'guru';
type FaseKelas = 'contoh-guru' | 'giliran-siswa';
type FormatSiswa = 'individu' | 'kelompok';

const STAGE_NAMES = ['1. Cerita', '2. Mainkan', '3. Temukan', '4. Susun Langkah', '5. Coba Jawab'];
const TOTAL_ABSEN_KELAS = 36;
const SOFT_SELL_COPY =
  'Bosan belajar matematika yang cuma gitu-gitu aja? Di sini, rumus dan hitungan berubah jadi petualangan interaktif! Karya inovasi pembelajaran digital persembahan Tim Guru SMP Kemala Bhayangkari 7 Porong — tempat di mana belajar nggak cuma soal papan tulis, tapi juga eksplorasi teknologi masa depan.';
const SOFT_SELL_VOICE_OVER = `${SOFT_SELL_COPY} Klik salah satu dari 25 panggung soal di peta untuk memulai peragaan guru lalu giliran siswa maju ke depan kelas!`;

const FLOATING_SYMBOLS = [
  { sym: '+', top: '12%', left: '6%', cls: 'animate-drift-1' },
  { sym: '×', top: '22%', left: '88%', cls: 'animate-drift-2' },
  { sym: '½', top: '48%', left: '4%', cls: 'animate-drift-2' },
  { sym: '180°', top: '65%', left: '91%', cls: 'animate-drift-1' },
  { sym: '÷', top: '78%', left: '10%', cls: 'animate-drift-1' },
  { sym: '%', top: '34%', left: '92%', cls: 'animate-drift-1' },
  { sym: '△', top: '82%', left: '84%', cls: 'animate-drift-2' },
  { sym: '=', top: '15%', left: '48%', cls: 'animate-drift-2' }
];

export default function App() {
  const [ready, setReady] = useState<boolean>(false);
  const [view, setView] = useState<ViewMode>('map');
  const [activeId, setActiveId] = useState<number>(8);
  const [stage, setStage] = useState<number>(0);
  const [langkahAktif, setLangkahAktif] = useState<number>(0);

  // Classroom 2-phase flow: Teacher Demo (Angka Cantik) -> Student Turn (Individu / Kelompok)
  const [faseKelas, setFaseKelas] = useState<FaseKelas>('contoh-guru');
  const [formatSiswa, setFormatSiswa] = useState<FormatSiswa>('individu');
  const [absenMaju, setAbsenMaju] = useState<number>(() => Math.floor(Math.random() * TOTAL_ABSEN_KELAS) + 1);
  const [kelompokMaju, setKelompokMaju] = useState<number>(1);

  const [modeKelas, setModeKelas] = useState<ClassroomMode>('maju-satu');
  const [timGiliran, setTimGiliran] = useState<'A' | 'B'>('A');
  const [bintangBersama, setBintangBersama] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('kota_mat_bintang') || '0');
    } catch {
      return 0;
    }
  });
  const [stickers, setStickers] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('kota_mat_stickers');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [dark, setDark] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(() => sound.isMuted());
  const [musicOn, setMusicOn] = useState<boolean>(() => sound.isMusicEnabled());
  const [voiceOn, setVoiceOn] = useState<boolean>(() => voice.isEnabled());
  const [teacherOpen, setTeacherOpen] = useState<boolean>(false);
  const [frozen, setFrozen] = useState<boolean>(false);
  const [topicFilter, setTopicFilter] = useState<'Semua' | QuestionTopic>('Semua');

  // Mimo reaction state
  const [mimoMood, setMimoMood] = useState<MimoMood>('senang');
  const [mimoText, setMimoText] = useState<string>('');

  // Question answering state
  const [pgChoice, setPgChoice] = useState<string | null>(null);
  const [pgkChoices, setPgkChoices] = useState<string[]>([]);
  const [catChoices, setCatChoices] = useState<Record<string, boolean>>({});
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ tipe: 'ok' | 'coba'; teks: string } | null>(null);
  const [celebrating, setCelebrating] = useState<boolean>(false);

  const activeQuestion: TkaQuestion =
    TKA_QUESTIONS.find((q) => q.id === activeId) || TKA_QUESTIONS[7];

  const isContoh = faseKelas === 'contoh-guru';
  const currentTeksSoal = isContoh ? activeQuestion.contohGuru.teksSoal : activeQuestion.teksSoal;
  const currentOpsi = isContoh ? activeQuestion.contohGuru.opsi : activeQuestion.opsi;
  const currentPernyataan = isContoh
    ? activeQuestion.contohGuru.pernyataanKategori
    : activeQuestion.pernyataanKategori;
  const currentKunci = isContoh ? activeQuestion.contohGuru.kunciJawaban : activeQuestion.kunciJawaban;
  const currentPembahasan = isContoh
    ? activeQuestion.contohGuru.pembahasanSingkat
    : activeQuestion.pembahasanSingkat;

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  // Stop speech when leaving page
  useEffect(() => {
    return () => {
      sound.stopMusic();
      voice.stop();
    };
  }, []);

  const handleMimoReact = useCallback((mood: MimoMood, pesan: string) => {
    setMimoMood(mood);
    setMimoText(pesan);
  }, []);

  const resetAnswerBox = () => {
    setPgChoice(null);
    setPgkChoices([]);
    setCatChoices({});
    setHintLevel(0);
    setFeedback(null);
    setCelebrating(false);
    setLangkahAktif(0);
  };

  const handleReadyStart = (withAudio: boolean) => {
    sound.unlock();
    if (withAudio) {
      sound.setMuted(false);
      setMuted(false);
      sound.setMusicEnabled(true);
      setMusicOn(true);
      voice.setEnabled(true);
      setVoiceOn(true);
      sound.pop();
      sound.startMusic();
      voice.speak(SOFT_SELL_VOICE_OVER, true);
    } else {
      sound.stopMusic();
      voice.stop();
      setMusicOn(false);
    }
    setReady(true);
  };

  const openQuestion = (id: number) => {
    sound.unlock();
    sound.click();
    if (musicOn && !muted) sound.startMusic();
    const q = TKA_QUESTIONS.find((item) => item.id === id);
    if (!q) return;
    setActiveId(id);
    setFaseKelas('contoh-guru');
    setStage(0);
    resetAnswerBox();
    setMimoMood('senang');
    setMimoText(`Guru peragakan dulu dengan angka cantik! ${q.ceritaMimo}`);
    setView('question');
    if (voiceOn) {
      voice.speak(`Soal ${q.id}, ${q.widget.namaPanggung}. ${q.ceritaMimo}`);
    }
  };

  const switchFaseKelas = (next: FaseKelas) => {
    sound.unlock();
    sound.pop();
    setFaseKelas(next);
    resetAnswerBox();
    if (next === 'contoh-guru') {
      setMimoMood('senang');
      setMimoText('Mode Peragaan Guru aktif! Gunakan angka cantik ini untuk menjelaskan konsep di depan kelas.');
    } else {
      setMimoMood('bersorak');
      const siapa =
        formatSiswa === 'individu'
          ? `Giliran Nomor Absen ${absenMaju} maju ke depan!`
          : `Giliran Kelompok ${kelompokMaju} maju ke depan!`;
      setMimoText(`${siapa} Ayo selesaikan soal latihan utamanya!`);
      if (voiceOn) {
        voice.speak(`${siapa} ${activeQuestion.teksSoal}`);
      }
    }
  };

  const acakSiswaKeDepan = () => {
    sound.unlock();
    sound.pop();
    if (formatSiswa === 'individu') {
      let picked = Math.floor(Math.random() * TOTAL_ABSEN_KELAS) + 1;
      if (picked === absenMaju) {
        picked = (picked % TOTAL_ABSEN_KELAS) + 1;
      }
      setAbsenMaju(picked);
      setMimoMood('bersorak');
      setMimoText(`Ayo nomor absen ${picked}, silakan maju ke depan dan susun langkahnya dari nol!`);
      if (voiceOn) voice.speak(`Ayo nomor absen ${picked}, silakan maju ke depan kelas.`);
    } else {
      const nextKel = (kelompokMaju % 4) + 1;
      setKelompokMaju(nextKel);
      setMimoMood('bersorak');
      setMimoText(`Giliran Kelompok ${nextKel} maju bersama ke depan kelas!`);
      if (voiceOn) voice.speak(`Giliran Kelompok ${nextKel} maju bersama ke depan.`);
    }
  };

  const awardSticker = (qid: number) => {
    setStickers((prev) => {
      if (prev.includes(qid)) return prev;
      const next = [...prev, qid];
      try {
        localStorage.setItem('kota_mat_stickers', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setBintangBersama((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('kota_mat_bintang', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const goStage = useCallback(
    (nextStage: number) => {
      sound.unlock();
      sound.click();
      if (musicOn && !muted) sound.startMusic();
      const clamped = Math.max(0, Math.min(4, nextStage));
      setStage(clamped);
      if (clamped === 0) {
        setMimoMood('senang');
        setMimoText(activeQuestion.ceritaMimo);
      } else if (clamped === 1) {
        setMimoMood('senang');
        setMimoText('Ayo gerakkan panggungnya! Tidak ada benar atau salah di sini, cukup amati apa yang terjadi.');
      } else if (clamped === 2) {
        setMimoMood('berpikir');
        setMimoText(activeQuestion.pertanyaanTemukan);
        if (voiceOn) voice.speak(activeQuestion.pertanyaanTemukan);
      } else if (clamped === 3) {
        setLangkahAktif(0);
        setMimoMood('senang');
        setMimoText('Ikuti petunjuk pemandu lalu geser balok jawaban yang tepat ke setiap langkah — hati-hati ada balok pengecoh!');
      } else if (clamped === 4) {
        setMimoMood('berpikir');
        setMimoText('Sekarang giliran mencoba soalnya! Baca pelan-pelan ya.');
        if (voiceOn) voice.speak(currentTeksSoal);
      }
    },
    [activeQuestion, musicOn, muted, voiceOn, currentTeksSoal]
  );

  const toggleMute = useCallback(() => {
    const next = !muted;
    sound.setMuted(next);
    setMuted(next);
    if (!next) {
      sound.unlock();
      sound.pop();
      if (musicOn && view === 'question') sound.startMusic();
    }
  }, [muted, musicOn, view]);

  const toggleMusic = useCallback(() => {
    sound.unlock();
    const next = !musicOn;
    sound.setMusicEnabled(next);
    setMusicOn(next);
    sound.click();
  }, [musicOn]);

  const toggleVoice = useCallback(() => {
    sound.unlock();
    const next = !voiceOn;
    voice.setEnabled(next);
    setVoiceOn(next);
    sound.click();
    if (next && view === 'question') {
      voice.speak(currentTeksSoal, true);
    }
  }, [voiceOn, view, currentTeksSoal]);

  const toggleFullscreen = useCallback(() => {
    sound.click();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'm') {
        toggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (view === 'question') {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          e.preventDefault();
          if (stage < 4) goStage(stage + 1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (stage > 0) goStage(stage - 1);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [view, stage, goStage, toggleMute, toggleFullscreen]);

  const checkAnswer = () => {
    sound.unlock();
    const q = activeQuestion;

    if (q.bentuk === 'PG' && currentOpsi) {
      if (!pgChoice) return;
      if (pgChoice === currentKunci) {
        sound.clap();
        setCelebrating(true);
        if (!isContoh) awardSticker(q.id);
        const msg = `Hebat! Pilihan ${pgChoice} tepat sekali! ${currentPembahasan}`;
        setMimoMood('bersorak');
        setMimoText(msg);
        setFeedback({ tipe: 'ok', teks: `Benar! ${currentPembahasan}` });
        if (voiceOn) voice.speak(msg);
        if (modeKelas === 'tim') setTimGiliran((t) => (t === 'A' ? 'B' : 'A'));
      } else {
        sound.softWrong();
        const opt = currentOpsi.find((o) => o.id === pgChoice);
        const msg = opt?.feedbackSalah || 'Belum tepat, yuk periksa lagi langkahnya di panggung!';
        setMimoMood('bingung');
        setMimoText(msg);
        setFeedback({ tipe: 'coba', teks: msg });
        if (voiceOn) voice.speak(msg);
      }
      return;
    }

    if (q.bentuk === 'PGK' && currentOpsi) {
      if (pgkChoices.length === 0) return;
      const expected = [...(currentKunci as string[])].sort();
      const got = [...pgkChoices].sort();
      const same = expected.length === got.length && expected.every((v, i) => v === got[i]);
      if (same) {
        sound.clap();
        setCelebrating(true);
        if (!isContoh) awardSticker(q.id);
        const msg = `Tepat sekali! Semua pernyataan yang benar berhasil dipilih! ${currentPembahasan}`;
        setMimoMood('bersorak');
        setMimoText(msg);
        setFeedback({ tipe: 'ok', teks: `Benar! ${currentPembahasan}` });
        if (voiceOn) voice.speak(msg);
        if (modeKelas === 'tim') setTimGiliran((t) => (t === 'A' ? 'B' : 'A'));
      } else {
        sound.softWrong();
        const wrongOptId = got.find((id) => !expected.includes(id));
        const wrongOpt = currentOpsi.find((o) => o.id === wrongOptId);
        const msg = wrongOpt?.feedbackSalah
          ? wrongOpt.feedbackSalah
          : 'Jumlah pilihan yang benar belum pas. Cek satu per satu tiap pernyataan ya!';
        setMimoMood('bingung');
        setMimoText(msg);
        setFeedback({ tipe: 'coba', teks: msg });
        if (voiceOn) voice.speak(msg);
      }
      return;
    }

    if (q.bentuk === 'PGK_KATEGORI' && currentPernyataan) {
      const allAnswered = currentPernyataan.every((p) => typeof catChoices[p.id] === 'boolean');
      if (!allAnswered) {
        sound.softWrong();
        setFeedback({ tipe: 'coba', teks: 'Pilih Benar atau Salah untuk ketiga pernyataan terlebih dahulu ya.' });
        return;
      }
      const wrongStmt = currentPernyataan.find((p) => catChoices[p.id] !== p.kunci);
      if (!wrongStmt) {
        sound.clap();
        setCelebrating(true);
        if (!isContoh) awardSticker(q.id);
        const msg = `Luar biasa! Ketiga pernyataan Benar atau Salah dijawab dengan tepat!`;
        setMimoMood('bersorak');
        setMimoText(msg);
        setFeedback({ tipe: 'ok', teks: `Benar semua! ${currentPembahasan}` });
        if (voiceOn) voice.speak(msg);
        if (modeKelas === 'tim') setTimGiliran((t) => (t === 'A' ? 'B' : 'A'));
      } else {
        sound.softWrong();
        const msg = `Pernyataan ${wrongStmt.id}: ${wrongStmt.feedbackSalah}`;
        setMimoMood('bingung');
        setMimoText(msg);
        setFeedback({ tipe: 'coba', teks: msg });
        if (voiceOn) voice.speak(msg);
      }
    }
  };

  const renderWidget = (q: TkaQuestion) => {
    const props = {
      stage,
      modeKelas,
      langkahAktif,
      isContoh,
      onMimoReact: handleMimoReact,
      onWowTriggered: () => {
        if (!isContoh) awardSticker(q.id);
      }
    };

    switch (q.id) {
      case 1: return <Widget1MesinBentuk {...props} />;
      case 2: return <Widget2TokoMentari {...props} />;
      case 3: return <Widget3DapurJus {...props} />;
      case 4: return <Widget4PetakKebun {...props} />;
      case 5: return <Widget5KalenderRenang {...props} />;
      case 6: return <Widget6GuntingKawat {...props} />;
      case 7: return <Widget7GudangBuku {...props} />;
      case 8: return <Widget8Timbangan {...props} />;
      case 9: return <Widget9PetaPerjalanan {...props} />;
      case 10: return <Widget10JamDimas {...props} />;
      case 11: return <Widget11KotakKubus {...props} />;
      case 12: return <Widget12BongkarBak {...props} />;
      case 13: return <Widget13DetektifBangun {...props} />;
      case 14: return <Widget14KantorBerita {...props} />;
      case 15: return <Widget15KeranjangBuah {...props} />;
      case 16: return <Widget16LintasanSepeda {...props} />;
      case 17: return <Widget17TangkiEmber {...props} />;
      case 18: return <Widget18DaduPutar {...props} />;
      case 19: return <Widget19LoyangKue {...props} />;
      case 20: return <Widget20Tanah {...props} />;
      case 21: return <Widget21LahanParkir {...props} />;
      case 22: return <Widget22PekanLiterasi {...props} />;
      case 23: return <Widget23BukuCerita {...props} />;
      case 24: return <Widget24PackingParsel {...props} />;
      case 25: return <Widget25Sudut {...props} />;
      default: return null;
    }
  };

  const filteredQuestions =
    topicFilter === 'Semua'
      ? TKA_QUESTIONS
      : TKA_QUESTIONS.filter((q) => q.elemen === topicFilter);

  return (
    <div className="relative min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors overflow-x-clip">
      {/* Animated School Courtyard Background Layer + Drifting Clouds + Floating Math + Walking Kids (follows active viewport on laptop & mobile) */}
      <div className="fixed inset-0 w-full h-[100dvh] -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <img
          src="/assets/aistudio/Gemini_Generated_Image_l149tl149tl149tl_027ee563.jpg"
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[center_58%] sm:object-center contrast-[1.05] saturate-[1.06] animate-bg-pan"
        />
        {/* Light measured scrim so the SMP Kemala Bhayangkari campus courtyard stays clearly visible while keeping layout structured */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/32 via-white/24 to-slate-100/38 dark:from-slate-950/70 dark:via-slate-950/64 dark:to-slate-950/76" />

        {/* Drifting Fluffy Clouds along the visible top sky below the header */}
        <div className="absolute top-[4.25rem] sm:top-20 left-0 w-24 sm:w-36 md:w-44 opacity-65 dark:opacity-22 animate-cloud-1">
          <svg viewBox="0 0 180 70" className="w-full h-auto fill-white dark:fill-slate-400">
            <path d="M35 55 H145 C160 55 170 45 170 34 C170 23 160 15 148 16 C142 6 128 2 115 8 C105 -2 85 -1 75 11 C61 7 44 14 40 27 C24 27 14 37 14 45 C14 52 23 55 35 55 Z" />
          </svg>
        </div>
        <div className="absolute top-24 sm:top-28 left-0 w-20 sm:w-32 md:w-36 opacity-55 dark:opacity-18 animate-cloud-2">
          <svg viewBox="0 0 180 70" className="w-full h-auto fill-white dark:fill-slate-400">
            <path d="M35 55 H145 C160 55 170 45 170 34 C170 23 160 15 148 16 C142 6 128 2 115 8 C105 -2 85 -1 75 11 C61 7 44 14 40 27 C24 27 14 37 14 45 C14 52 23 55 35 55 Z" />
          </svg>
        </div>
        <div className="absolute top-20 sm:top-24 left-0 w-22 sm:w-34 md:w-40 opacity-60 dark:opacity-20 animate-cloud-3">
          <svg viewBox="0 0 180 70" className="w-full h-auto fill-white dark:fill-slate-400">
            <path d="M35 55 H145 C160 55 170 45 170 34 C170 23 160 15 148 16 C142 6 128 2 115 8 C105 -2 85 -1 75 11 C61 7 44 14 40 27 C24 27 14 37 14 45 C14 52 23 55 35 55 Z" />
          </svg>
        </div>

        {/* Subtle moving mathematical motifs so the stage always feels alive */}
        {FLOATING_SYMBOLS.map((item, idx) => (
          <span
            key={idx}
            style={{ top: item.top, left: item.left }}
            className={`absolute font-display font-extrabold text-2xl sm:text-3xl md:text-5xl text-blue-700/18 dark:text-sky-300/18 select-none ${item.cls}`}
          >
            {item.sym}
          </span>
        ))}

        {/* Gentle Walking School Children along the very bottom viewport edge (follows screen cleanly on HP & laptop) */}
        <div className="absolute bottom-1.5 pb-[env(safe-area-inset-bottom)] left-0 opacity-55 sm:opacity-60 dark:opacity-38 animate-walk-ltr">
          <svg viewBox="0 0 54 64" className="w-8 h-9 sm:w-10 sm:h-11 md:w-11 md:h-12 animate-walk-bob">
            {/* Backpack */}
            <rect x="8" y="25" width="12" height="18" rx="4" fill="#1D4ED8" />
            {/* Body */}
            <rect x="18" y="24" width="16" height="20" rx="5" fill="#F59E0B" />
            {/* Head */}
            <circle cx="26" cy="14" r="9" fill="#FDBA74" />
            <path d="M17 12 C18 4, 34 4, 35 12 Z" fill="#1E293B" />
            {/* Legs */}
            <line x1="22" y1="44" x2="18" y2="59" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="44" x2="35" y2="59" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute bottom-1.5 pb-[env(safe-area-inset-bottom)] left-0 opacity-50 sm:opacity-55 dark:opacity-34 animate-walk-ltr-2">
          <svg viewBox="0 0 54 64" className="w-7 h-8 sm:w-9 sm:h-10 md:w-10 md:h-11 animate-walk-bob">
            <rect x="8" y="25" width="11" height="17" rx="4" fill="#E11D48" />
            <rect x="18" y="24" width="15" height="20" rx="5" fill="#10B981" />
            <circle cx="26" cy="14" r="9" fill="#FDBA74" />
            <path d="M16 14 C16 5, 36 5, 36 14 L34 22 L18 22 Z" fill="#0F172A" />
            <line x1="22" y1="44" x2="19" y2="58" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
            <line x1="29" y1="44" x2="33" y2="58" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="absolute bottom-1.5 pb-[env(safe-area-inset-bottom)] left-0 opacity-50 sm:opacity-55 dark:opacity-34 animate-walk-rtl">
          <svg viewBox="0 0 54 64" className="w-7 h-8 sm:w-9 sm:h-10 md:w-10 md:h-11 animate-walk-bob">
            <rect x="8" y="26" width="11" height="16" rx="4" fill="#0284C7" />
            <rect x="18" y="24" width="15" height="20" rx="5" fill="#2563EB" />
            <circle cx="26" cy="14" r="9" fill="#FDBA74" />
            <path d="M17 12 C18 4, 34 4, 35 12 Z" fill="#334155" />
            <line x1="22" y1="44" x2="17" y2="58" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
            <line x1="30" y1="44" x2="35" y2="58" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Top Navigation Bar (Clean 3-zone layout with Yayasan Kemala Bhayangkari logo) */}
      <header className="sticky top-0 z-30 bg-white/88 dark:bg-slate-900/88 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-8 h-14 sm:h-16 flex items-center justify-between gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => {
            sound.click();
            setView('map');
          }}
          className="flex items-center gap-2 sm:gap-3 font-display text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          <img
            src="/assets/aistudio/657031cc5d8eb_b91b42be.png"
            alt="Logo Yayasan Kemala Bhayangkari"
            referrerPolicy="no-referrer"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg bg-white p-0.5 border border-slate-200"
          />
          <span className="hidden sm:inline">Kota Matematika</span>
        </button>

        <nav className="flex items-center gap-3 sm:gap-5 md:gap-7 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => {
              sound.click();
              voice.stop();
              setView('map');
            }}
            className={`hover:text-slate-950 dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'map' ? 'text-blue-700 dark:text-blue-400 underline underline-offset-4' : ''
            }`}
          >
            Peta Soal
          </button>
          <button
            type="button"
            onClick={() => openQuestion(activeId)}
            className={`hover:text-slate-950 dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'question' ? 'text-blue-700 dark:text-blue-400 underline underline-offset-4' : ''
            }`}
          >
            Panggung Soal
          </button>
          <button
            type="button"
            onClick={() => {
              sound.click();
              voice.stop();
              setView('buku');
            }}
            className={`hover:text-slate-950 dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer ${
              view === 'buku' ? 'text-blue-700 dark:text-blue-400 underline underline-offset-4' : ''
            }`}
          >
            Buku Saku
          </button>
          <button
            type="button"
            onClick={() => {
              sound.click();
              setDark((d) => !d);
            }}
            className="hover:text-slate-950 dark:hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            {dark ? 'Mode Terang' : 'Mode Gelap'}
          </button>
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.click();
              setTeacherOpen(true);
            }}
            className="px-3 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Mode Guru
          </button>
        </div>
      </header>

      {/* Classroom Audio, Voice, Music & Status Strip */}
      <div className="bg-white/80 dark:bg-slate-900/75 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{KOTA_LABEL}</span>
          <span aria-hidden="true">·</span>
          <span>Bukan tes ujian · Belajar bersama di kelas</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num font-bold text-amber-700 dark:text-amber-400">
            Bintang Bersama: ★ {bintangBersama}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num">Stiker: {stickers.length}/25</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleVoice}
            className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs md:text-sm border cursor-pointer ${
              voiceOn
                ? 'bg-emerald-50 border-emerald-400 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-200'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {voiceOn ? 'Suara Baca: Aktif' : 'Suara Baca: Mati'}
          </button>
          <button
            type="button"
            onClick={toggleMusic}
            className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs md:text-sm border cursor-pointer ${
              musicOn && !muted
                ? 'bg-sky-50 border-sky-400 text-sky-950 dark:bg-sky-950/60 dark:text-sky-200'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            {musicOn ? 'Backsound: Aktif' : 'Backsound: Mati'}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs md:text-sm border cursor-pointer ${
              muted
                ? 'bg-amber-100 border-amber-400 text-amber-950 dark:bg-amber-950/60 dark:text-amber-200'
                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100'
            }`}
          >
            {muted ? 'Bisukan: Ya (M)' : 'Suara Efek (M)'}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="min-h-[44px] px-3.5 rounded-xl font-bold text-xs md:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 cursor-pointer"
          >
            Layar Penuh (F)
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full pb-14 sm:pb-16">
        {view === 'buku' && <BukuSaku onBack={() => setView('map')} />}

        {view === 'map' && (
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
            {/* Hero Banner with Logo & Soft-Selling Tim Guru SMP Kemala Bhayangkari 7 Porong */}
            <div className="rounded-2xl bg-white/88 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-5 flex-1">
                <img
                  src="/assets/aistudio/657031cc5d8eb_b91b42be.png"
                  alt="Logo Yayasan Kemala Bhayangkari"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 md:w-24 md:h-24 object-contain shrink-0 rounded-2xl bg-white p-1.5 border border-slate-200 shadow-xs"
                />
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                    Tim Guru SMP Kemala Bhayangkari 7 Porong · {KOTA_LABEL} · Kelas 6 SD
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Jelajahi 25 Panggung Matematika Bersama Mimo
                  </h1>
                  <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                    {SOFT_SELL_COPY}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => openQuestion(1)}
                  className="min-h-[56px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                >
                  Mulai dari Soal 1 →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.unlock();
                    sound.pop();
                    if (!muted) {
                      sound.setMusicEnabled(true);
                      setMusicOn(true);
                      sound.startMusic();
                    }
                    voice.speak(SOFT_SELL_VOICE_OVER, true);
                  }}
                  className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap"
                >
                  Putar Suara Pembuka & Musik
                </button>
              </div>
            </div>

            {/* Topic Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5 p-1 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl">
                {(['Semua', 'Bilangan', 'Geometri', 'Pengukuran', 'Data'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      sound.click();
                      setTopicFilter(t);
                    }}
                    className={`min-h-[44px] px-4 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                      topicFilter === t
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                25 dari 25 soal memiliki panggung interaktif + Contoh Guru
              </div>
            </div>

            {/* 25 Questions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuestions.map((q) => {
                const hasSticker = stickers.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => openQuestion(q.id)}
                    className="text-left rounded-2xl border bg-white/88 dark:bg-slate-900/90 backdrop-blur-xs border-slate-200 dark:border-slate-800 hover:border-blue-500 p-4 transition-transform active:scale-[0.99] cursor-pointer flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>
                          Soal {q.id} · {q.elemen} · {q.bentuk === 'PGK_KATEGORI' ? 'Benar/Salah' : q.bentuk}
                        </span>
                        {hasSticker && (
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">★ Selesai</span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {q.widget.namaPanggung}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {q.teksSoal}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">{q.lokasiKota}</span>
                      <span className="text-blue-700 dark:text-blue-400 font-bold">
                        Peraga & Mainkan →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'question' && (
          <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col gap-4">
            {/* Workspace Top Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.click();
                    voice.stop();
                    setView('map');
                  }}
                  className="min-h-[48px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ← Kembali ke Peta Soal
                </button>
                <div className="text-sm text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Soal {activeQuestion.id}: {activeQuestion.widget.namaPanggung}
                  </span>
                  <span className="mx-2" aria-hidden="true">·</span>
                  <span>{activeQuestion.elemen}</span>
                </div>
              </div>

              {/* Classroom Interaction Modes */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-white/85 dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-xl">
                {(
                  [
                    { id: 'maju-satu', label: 'Maju Satu' },
                    { id: 'berdua', label: 'Berdua' },
                    { id: 'tim', label: 'Mode Tim' },
                    { id: 'guru', label: 'Panggung Guru' }
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      sound.click();
                      setModeKelas(m.id);
                    }}
                    className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                      modeKelas === m.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-PHASE CLASSROOM FLOW BAR: 1. Peragaan Guru (Angka Cantik) -> 2. Giliran Siswa ke Depan (Individu / Kelompok) */}
            <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-blue-200 dark:border-blue-800 p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchFaseKelas('contoh-guru')}
                  className={`min-h-[56px] px-4 rounded-xl font-bold text-sm border-2 cursor-pointer transition-all ${
                    isContoh
                      ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  1. Peragaan Guru (Soal Contoh · Angka Cantik)
                </button>
                <button
                  type="button"
                  onClick={() => switchFaseKelas('giliran-siswa')}
                  className={`min-h-[56px] px-4 rounded-xl font-bold text-sm border-2 cursor-pointer transition-all ${
                    !isContoh
                      ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  2. Giliran Siswa ke Depan (Soal Latihan)
                </button>
              </div>

              {/* Individu / Kelompok Picker for Student Turn */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      sound.click();
                      setFormatSiswa('individu');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      formatSiswa === 'individu'
                        ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Individu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.click();
                      setFormatSiswa('kelompok');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      formatSiswa === 'kelompok'
                        ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Kelompok
                  </button>
                </div>

                <button
                  type="button"
                  onClick={acakSiswaKeDepan}
                  className="min-h-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  {formatSiswa === 'individu'
                    ? `Giliran: Absen No. ${absenMaju} (Acak 1–${TOTAL_ABSEN_KELAS})`
                    : `Giliran: Kelompok ${kelompokMaju} (Ganti)`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.unlock();
                    voice.speak(currentTeksSoal, true);
                  }}
                  className="min-h-[48px] px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
                >
                  Bacakan Soal (Voice)
                </button>
              </div>
            </div>

            {modeKelas === 'tim' && (
              <div className="rounded-xl bg-blue-50/95 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 px-4 py-2.5 flex items-center justify-between text-sm">
                <div className="font-bold text-blue-950 dark:text-blue-100">
                  Giliran Saat Ini: Tim {timGiliran} (Tanpa skor, kumpulkan Bintang Bersama!)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.pop();
                    setTimGiliran((t) => (t === 'A' ? 'B' : 'A'));
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 text-xs font-bold cursor-pointer"
                >
                  Ganti Giliran Tim
                </button>
              </div>
            )}

            {/* 5-Stage Stepper Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STAGE_NAMES.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => goStage(idx)}
                  className={`min-h-[46px] sm:min-h-[52px] rounded-xl font-bold text-xs md:text-sm px-2.5 border transition-colors cursor-pointer touch-manipulation ${
                    idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                  } ${
                    stage === idx
                      ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                      : idx < stage
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white/92 dark:bg-slate-900/92 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mascot Mimo Speech */}
            <MimoMascot
              mood={mimoMood}
              pesan={mimoText || activeQuestion.ceritaMimo}
              onEasterEgg={() => awardSticker(activeQuestion.id)}
            />

            {/* Dominant Interactive Stage (active across Stage 1..4) */}
            {stage >= 1 && renderWidget(activeQuestion)}

            {/* Stage 1 (Cerita) Start CTA */}
            {stage === 0 && (
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-8 text-center flex flex-col items-center gap-4">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isContoh ? 'PERAGAAN GURU · ANGKA CANTIK' : `${KOTA_LABEL} · GILIRAN SISWA`} · {activeQuestion.modelResmi}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white max-w-xl">
                  {activeQuestion.widget.namaPanggung}
                </h2>
                <p className="text-lg text-slate-700 dark:text-slate-200 max-w-2xl">
                  {currentTeksSoal}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => goStage(1)}
                    className="min-h-[64px] px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg cursor-pointer active:scale-95 transition-transform"
                  >
                    Mulai Mainkan & Peragakan →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.unlock();
                      voice.speak(currentTeksSoal, true);
                    }}
                    className="min-h-[64px] px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold text-base cursor-pointer"
                  >
                    Bacakan Soal
                  </button>
                </div>
              </div>
            )}

            {/* Stage 3 (Temukan) Prompt */}
            {stage === 2 && (
              <div className="rounded-2xl bg-amber-50/95 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300">Pertanyaan Pemantik Diskusi</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {activeQuestion.pertanyaanTemukan}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goStage(3)}
                  className="min-h-[64px] px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm cursor-pointer"
                >
                  Lihat Langkah Pengerjaan →
                </button>
              </div>
            )}

            {/* Stage 4 (Susun Langkah Sendiri dengan Balok Jawaban & Pengecoh) */}
            {stage === 3 && (
              <StepBlockChallenge
                questionId={activeQuestion.id}
                isContoh={isContoh}
                langkahAktif={langkahAktif}
                onLangkahChange={setLangkahAktif}
                onMimoReact={handleMimoReact}
                onProceedToAnswer={() => goStage(4)}
              />
            )}

            {/* Stage 5 (Coba Jawab) */}
            {stage === 4 && (
              <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                    {isContoh
                      ? 'SOAL CONTOH GURU (ANGKA CANTIK)'
                      : `SOAL LATIHAN ${activeQuestion.id} · ${formatSiswa === 'individu' ? `ABSEN NO. ${absenMaju}` : `KELOMPOK ${kelompokMaju}`}`}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlock();
                        voice.speak(currentTeksSoal, true);
                      }}
                      className="min-h-[44px] px-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 font-bold text-xs cursor-pointer"
                    >
                      Bacakan Soal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.pop();
                        setHintLevel((h) => (h < 3 ? h + 1 : 0));
                      }}
                      className="min-h-[44px] px-4 rounded-xl bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 font-bold text-xs cursor-pointer"
                    >
                      {hintLevel === 0
                        ? 'Minta Petunjuk (Level 1)'
                        : hintLevel < 3
                          ? `Tambah Petunjuk (Level ${hintLevel + 1})`
                          : 'Sembunyikan Petunjuk'}
                    </button>
                  </div>
                </div>

                <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {currentTeksSoal}
                </p>

                {hintLevel > 0 && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 space-y-1.5">
                    {activeQuestion.petunjukBertingkat.slice(0, hintLevel).map((h, i) => (
                      <div key={i} className="text-sm text-amber-950 dark:text-amber-200">
                        <strong>Petunjuk {i + 1}:</strong> {h}
                      </div>
                    ))}
                  </div>
                )}

                {activeQuestion.bentuk === 'PG' && currentOpsi && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentOpsi.map((opt) => {
                      const selected = pgChoice === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            sound.click();
                            setPgChoice(opt.id);
                            setFeedback(null);
                          }}
                          className={`min-h-[64px] rounded-xl border-2 px-4 py-3 text-left font-semibold text-base flex items-center gap-3 cursor-pointer transition-all ${
                            selected
                              ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-blue-400'
                          }`}
                        >
                          <span className="w-9 h-9 rounded-lg bg-white/20 border border-current flex items-center justify-center font-bold shrink-0">
                            {opt.id}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeQuestion.bentuk === 'PGK' && currentOpsi && (
                  <div className="space-y-3">
                    {currentOpsi.map((opt) => {
                      const checked = pgkChoices.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            sound.click();
                            setFeedback(null);
                            setPgkChoices((prev) =>
                              prev.includes(opt.id) ? prev.filter((x) => x !== opt.id) : [...prev, opt.id]
                            );
                          }}
                          className={`w-full min-h-[64px] rounded-xl border-2 px-4 py-3 text-left font-semibold text-base flex items-center gap-3 cursor-pointer transition-all ${
                            checked
                              ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:border-blue-400'
                          }`}
                        >
                          <span className="w-8 h-8 rounded-lg border-2 border-current flex items-center justify-center font-bold shrink-0">
                            {checked ? '✓' : opt.id}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeQuestion.bentuk === 'PGK_KATEGORI' && currentPernyataan && (
                  <div className="space-y-3">
                    {currentPernyataan.map((stmt) => {
                      const val = catChoices[stmt.id];
                      return (
                        <div
                          key={stmt.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            <span className="font-bold mr-2">{stmt.id}.</span>
                            {stmt.teks}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                sound.click();
                                setFeedback(null);
                                setCatChoices((prev) => ({ ...prev, [stmt.id]: true }));
                              }}
                              className={`min-h-[56px] min-w-[100px] px-4 rounded-xl border-2 font-bold text-sm cursor-pointer ${
                                val === true
                                  ? 'bg-emerald-600 border-emerald-700 text-white'
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              Benar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                sound.click();
                                setFeedback(null);
                                setCatChoices((prev) => ({ ...prev, [stmt.id]: false }));
                              }}
                              className={`min-h-[56px] min-w-[100px] px-4 rounded-xl border-2 font-bold text-sm cursor-pointer ${
                                val === false
                                  ? 'bg-amber-600 border-amber-700 text-white'
                                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              Salah
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={checkAnswer}
                    className="min-h-[64px] px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg cursor-pointer active:scale-95 transition-transform"
                  >
                    Periksa Jawaban
                  </button>

                  {isContoh && (
                    <button
                      type="button"
                      onClick={() => switchFaseKelas('giliran-siswa')}
                      className="min-h-[64px] px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base cursor-pointer"
                    >
                      Lanjut ke Giliran Siswa (Soal Asli) →
                    </button>
                  )}
                </div>

                {feedback && (
                  <div
                    className={`rounded-2xl border p-4 text-base font-semibold ${
                      feedback.tipe === 'ok'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-950 dark:text-emerald-100 animate-celebrate-pop'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-100'
                    }`}
                  >
                    {feedback.tipe === 'ok' ? '✓ ' : 'Mari periksa lagi: '}
                    {feedback.teks}
                    {celebrating && !isContoh && (
                      <div className="mt-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        Stiker didapat: {activeQuestion.stikerNama}!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Stage Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={stage === 0}
                onClick={() => goStage(stage - 1)}
                className="min-h-[56px] px-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 disabled:opacity-40 font-bold text-sm cursor-pointer"
              >
                ← Mundur
              </button>
              <div className="flex gap-2">
                {stage < 4 ? (
                  <button
                    type="button"
                    onClick={() => goStage(stage + 1)}
                    className="min-h-[56px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Lanjut →
                  </button>
                ) : (
                  activeId < 25 && (
                    <button
                      type="button"
                      onClick={() => openQuestion(activeId + 1)}
                      className="min-h-[56px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
                    >
                      Soal Berikutnya (Soal {activeId + 1}) →
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {teacherOpen && (
        <TeacherPanel
          question={view === 'question' ? activeQuestion : undefined}
          frozen={frozen}
          onToggleFreeze={() => setFrozen((f) => !f)}
          onClose={() => setTeacherOpen(false)}
        />
      )}

      {!ready && (
        <div className="fixed inset-0 z-50 bg-slate-950/48 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-blue-200 dark:border-blue-800 p-6 sm:p-7 md:p-9 text-center flex flex-col items-center gap-4 sm:gap-5 shadow-2xl animate-celebrate-pop">
            <img
              src="/assets/aistudio/657031cc5d8eb_b91b42be.png"
              alt="Logo Yayasan Kemala Bhayangkari"
              referrerPolicy="no-referrer"
              className="w-24 h-24 object-contain rounded-2xl bg-white p-2 border border-slate-200 shadow-sm"
            />
            <div className="space-y-2">
              <div className="text-xs font-bold text-blue-700 dark:text-blue-400">
                Persembahan Tim Guru SMP Kemala Bhayangkari 7 Porong
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                Apakah sudah siap?
              </h1>
            </div>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 leading-relaxed">
              “{SOFT_SELL_COPY}”
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-1">
              <button
                type="button"
                onClick={() => handleReadyStart(true)}
                className="min-h-[64px] px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-lg cursor-pointer active:scale-95 transition-transform shadow-md"
              >
                Sudah! Mulai & Putar Suara Pembuka
              </button>
              <button
                type="button"
                onClick={() => handleReadyStart(false)}
                className="min-h-[64px] px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer"
              >
                Masuk Tanpa Musik
              </button>
            </div>
          </div>
        </div>
      )}

      {frozen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="max-w-lg space-y-4">
            <h2 className="text-3xl font-extrabold">Layar Dibekukan oleh Guru</h2>
            <p className="text-lg text-slate-200">
              Ayo menghadap ke depan kelas dan berdiskusi bersama kelompokmu dulu!
            </p>
            <button
              type="button"
              onClick={() => {
                sound.click();
                setFrozen(false);
              }}
              className="min-h-[64px] px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-lg cursor-pointer mt-4"
            >
              Lanjutkan Layar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
