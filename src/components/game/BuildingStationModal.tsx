import React, { useState, useCallback } from 'react';
import {
  BUKU_SAKU_MATERI,
  KOTA_LABEL,
  TKA_QUESTIONS,
  TkaQuestion,
  QuestionTopic
} from '../../data/tkaData';
import {
  BuildingDef,
  ChapterId,
  INTERIOR_TROPHY_MILESTONES,
  PlayerIdentity,
  PlayerProgress,
  StationId
} from '../../types/game';
import { formatAngkaID, sound, voice } from '../../utils/sound';
import { syncEntryToGoogleSheets, DEFAULT_TEACHER_EMAIL } from '../../utils/googleSheets';
import { MimoMascot, MimoMood } from '../MimoMascot';
import { StepBlockChallenge } from '../StepBlockChallenge';
import { BukuSaku } from '../BukuSaku';
import { TeacherPanel } from '../TeacherPanel';
import { Widget8Timbangan } from '../widgets/Widget8Timbangan';
import { Widget20Tanah } from '../widgets/Widget20Tanah';
import { Widget25Sudut } from '../widgets/Widget25Sudut';
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
} from '../widgets/WidgetsSetA';
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
} from '../widgets/WidgetsSetB';
import {
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  Volume2,
  X,
  Trophy,
  ExternalLink,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';

interface BuildingStationModalProps {
  building: BuildingDef;
  initialStation: StationId;
  identity: PlayerIdentity;
  progress: PlayerProgress;
  teacherEmail: string;
  onCompleteQuestion: (qid: number, chapterId: ChapterId, isContoh: boolean) => void;
  onSubmitArchive: (payload: {
    chapterId: ChapterId;
    chapterTitle: string;
    questionLabel: string;
    pgScore: number;
    reflectionText: string;
    syncedToSheet: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

type ClassroomMode = 'maju-satu' | 'berdua' | 'tim' | 'guru';
type FaseKelas = 'contoh-guru' | 'giliran-siswa';
type FormatSiswa = 'individu' | 'kelompok';

const STAGE_NAMES = ['1. Cerita', '2. Mainkan', '3. Temukan', '4. Susun Langkah', '5. Coba Jawab'];
const TOTAL_ABSEN_KELAS = 36;

export const BuildingStationModal: React.FC<BuildingStationModalProps> = ({
  building,
  initialStation,
  identity,
  progress,
  teacherEmail,
  onCompleteQuestion,
  onSubmitArchive,
  onClose
}) => {
  const [station, setStation] = useState<StationId>(
    initialStation === 'keluar' ? 'soal' : initialStation
  );

  // Material interactive state
  const [fracMult, setFracMult] = useState(2);
  const [beratKg, setBeratKg] = useState(2.5);
  const [angleA, setAngleA] = useState(50);
  const [showFullBukuSaku, setShowFullBukuSaku] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [frozen, setFrozen] = useState(false);

  // Soal station state (preserving 100% of original App.tsx flow)
  const chapterQuestions = TKA_QUESTIONS.filter((q) => building.questionIds.includes(q.id));
  const [topicFilter, setTopicFilter] = useState<'Semua' | QuestionTopic>('Semua');
  const [activeId, setActiveId] = useState<number>(chapterQuestions[0]?.id || 1);
  const [stage, setStage] = useState<number>(0);
  const [langkahAktif, setLangkahAktif] = useState<number>(0);
  const [faseKelas, setFaseKelas] = useState<FaseKelas>('contoh-guru');
  const [formatSiswa, setFormatSiswa] = useState<FormatSiswa>('individu');
  const [absenMaju, setAbsenMaju] = useState<number>(() => Math.floor(Math.random() * TOTAL_ABSEN_KELAS) + 1);
  const [kelompokMaju, setKelompokMaju] = useState<number>(1);
  const [modeKelas, setModeKelas] = useState<ClassroomMode>('maju-satu');
  const [timGiliran, setTimGiliran] = useState<'A' | 'B'>('A');
  const [mimoMood, setMimoMood] = useState<MimoMood>('senang');
  const [mimoText, setMimoText] = useState<string>('');
  const [pgChoice, setPgChoice] = useState<string | null>(null);
  const [pgkChoices, setPgkChoices] = useState<string[]>([]);
  const [catChoices, setCatChoices] = useState<Record<string, boolean>>({});
  const [hintLevel, setHintLevel] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ tipe: 'ok' | 'coba'; teks: string } | null>(null);
  const [celebrating, setCelebrating] = useState<boolean>(false);

  // Written Reflection & Google Sheet Sync (NO Photo Upload!)
  const [reflectionText, setReflectionText] = useState<string>('');
  const [pgScoreInput, setPgScoreInput] = useState<number>(100);
  const [syncingSheet, setSyncingSheet] = useState<boolean>(false);
  const [sheetResult, setSheetResult] = useState<{
    ok: boolean;
    message: string;
    url?: string;
  } | null>(null);

  const chapterId = (building.isVersus ? 'strategi' : building.id) as ChapterId;
  const materiSection = BUKU_SAKU_MATERI.find((m) => m.id === chapterId) || BUKU_SAKU_MATERI[0];
  const masteryCount = progress.chapterMastery[chapterId] || 0;

  const visibleQuestions =
    topicFilter === 'Semua'
      ? chapterQuestions
      : chapterQuestions.filter((q) => q.elemen === topicFilter);

  const activeQuestion: TkaQuestion =
    TKA_QUESTIONS.find((q) => q.id === activeId) || chapterQuestions[0] || TKA_QUESTIONS[0];

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

  const angleB = Math.min(120, Math.max(20, angleA * 2 > 160 ? 60 : angleA));
  const angleC = 180 - angleA - angleB;

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

  const selectQuestion = (qid: number) => {
    sound.unlock();
    sound.click();
    const q = TKA_QUESTIONS.find((item) => item.id === qid);
    if (!q) return;
    setActiveId(qid);
    setFaseKelas('contoh-guru');
    setStage(0);
    resetAnswerBox();
    setMimoMood('senang');
    setMimoText(`Guru peragakan dulu dengan angka cantik! ${q.ceritaMimo}`);
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
      voice.speak(`${siapa} ${activeQuestion.teksSoal}`);
    }
  };

  const acakSiswaKeDepan = () => {
    sound.unlock();
    sound.pop();
    if (formatSiswa === 'individu') {
      let picked = Math.floor(Math.random() * TOTAL_ABSEN_KELAS) + 1;
      if (picked === absenMaju) picked = (picked % TOTAL_ABSEN_KELAS) + 1;
      setAbsenMaju(picked);
      setMimoMood('bersorak');
      setMimoText(`Ayo nomor absen ${picked}, silakan maju ke depan dan susun langkahnya dari nol!`);
      voice.speak(`Ayo nomor absen ${picked}, silakan maju ke depan kelas.`);
    } else {
      const nextKel = (kelompokMaju % 4) + 1;
      setKelompokMaju(nextKel);
      setMimoMood('bersorak');
      setMimoText(`Giliran Kelompok ${nextKel} maju bersama ke depan kelas!`);
      voice.speak(`Giliran Kelompok ${nextKel} maju bersama ke depan.`);
    }
  };

  const goStage = (nextStage: number) => {
    sound.unlock();
    sound.click();
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
      voice.speak(activeQuestion.pertanyaanTemukan);
    } else if (clamped === 3) {
      setLangkahAktif(0);
      setMimoMood('senang');
      setMimoText('Ikuti petunjuk pemandu lalu geser balok jawaban yang tepat ke setiap langkah — hati-hati ada balok pengecoh!');
    } else if (clamped === 4) {
      setMimoMood('berpikir');
      setMimoText('Sekarang giliran mencoba soalnya! Baca pelan-pelan ya.');
      voice.speak(currentTeksSoal);
    }
  };

  const checkAnswer = () => {
    sound.unlock();
    const q = activeQuestion;

    if (q.bentuk === 'PG' && currentOpsi) {
      if (!pgChoice) return;
      if (pgChoice === currentKunci) {
        sound.clap();
        setCelebrating(true);
        onCompleteQuestion(q.id, chapterId, isContoh);
        const msg = `Hebat! Pilihan ${pgChoice} tepat sekali! ${currentPembahasan}`;
        setMimoMood('bersorak');
        setMimoText(msg);
        setFeedback({ tipe: 'ok', teks: `Benar! ${currentPembahasan}` });
        voice.speak(msg);
        if (modeKelas === 'tim') setTimGiliran((t) => (t === 'A' ? 'B' : 'A'));
      } else {
        sound.softWrong();
        const opt = currentOpsi.find((o) => o.id === pgChoice);
        const msg = opt?.feedbackSalah || 'Belum tepat, yuk periksa lagi langkahnya di panggung!';
        setMimoMood('bingung');
        setMimoText(msg);
        setFeedback({ tipe: 'coba', teks: msg });
        voice.speak(msg);
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
        onCompleteQuestion(q.id, chapterId, isContoh);
        const msg = `Tepat sekali! Semua pernyataan yang benar berhasil dipilih! ${currentPembahasan}`;
        setMimoMood('bersorak');
        setMimoText(msg);
        setFeedback({ tipe: 'ok', teks: `Benar! ${currentPembahasan}` });
        voice.speak(msg);
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
        voice.speak(msg);
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
        onCompleteQuestion(q.id, chapterId, isContoh);
        const msg = `Luar biasa! Ketiga pernyataan Benar atau Salah dijawab dengan tepat!`;
        setMimoMood('bersorak');
        setMimoText(msg);
        setFeedback({ tipe: 'ok', teks: `Benar semua! ${currentPembahasan}` });
        voice.speak(msg);
        if (modeKelas === 'tim') setTimGiliran((t) => (t === 'A' ? 'B' : 'A'));
      } else {
        sound.softWrong();
        const msg = `Pernyataan ${wrongStmt.id}: ${wrongStmt.feedbackSalah}`;
        setMimoMood('bingung');
        setMimoText(msg);
        setFeedback({ tipe: 'coba', teks: msg });
        voice.speak(msg);
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
      onWowTriggered: () => onCompleteQuestion(q.id, chapterId, isContoh)
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

  const handleSaveReflectionOnly = async () => {
    if (!reflectionText.trim()) {
      setSheetResult({ ok: false, message: 'Tuliskan dulu kesimpulan atau uraian belajarmu ya.' });
      return;
    }
    sound.ding();
    setSyncingSheet(true);
    await onSubmitArchive({
      chapterId,
      chapterTitle: building.title,
      questionLabel: `Soal ${activeQuestion.id}: ${activeQuestion.widget.namaPanggung}`,
      pgScore: pgScoreInput,
      reflectionText: reflectionText.trim(),
      syncedToSheet: false
    });
    setSyncingSheet(false);
    setSheetResult({
      ok: true,
      message: 'Refleksi tertulis tersimpan ke Arsip Guru & menambah progres piala 3D gedung!'
    });
  };

  const handleSendToGoogleSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.unlock();
    sound.click();
    setSyncingSheet(true);
    setSheetResult(null);

    const effectiveTeacher = teacherEmail || DEFAULT_TEACHER_EMAIL;
    const label = `Soal ${activeQuestion.id} (${activeQuestion.widget.namaPanggung})`;

    const gs = await syncEntryToGoogleSheets({
      studentName: identity.name,
      school: identity.school,
      className: identity.className,
      chapterTitle: building.title,
      questionLabel: label,
      pgScore: pgScoreInput,
      reflectionText: reflectionText.trim() || `Menyelesaikan latihan di ${building.title}`,
      teacherEmail: effectiveTeacher
    });

    await onSubmitArchive({
      chapterId,
      chapterTitle: building.title,
      questionLabel: label,
      pgScore: pgScoreInput,
      reflectionText: reflectionText.trim() || `Menyelesaikan latihan di ${building.title}`,
      syncedToSheet: gs.ok
    });

    setSyncingSheet(false);
    setSheetResult({
      ok: true,
      message: gs.ok
        ? gs.message
        : `Tersimpan di Arsip Kota & Cloud. (${gs.message})`,
      url: gs.spreadsheetUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl h-[94dvh] rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div
          style={{ borderBottomColor: building.accentColor }}
          className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white border-b-4 flex flex-wrap items-center justify-between gap-3 shrink-0"
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              {building.shortTitle} · {KOTA_LABEL}
            </div>
            <h2 className="font-display text-lg sm:text-xl font-black text-white">
              {building.title}
            </h2>
          </div>

          {/* Station Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                sound.click();
                setStation('materi');
              }}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                station === 'materi' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Layar Materi</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                setStation('soal');
              }}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                station === 'soal' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>2. Meja Soal & Refleksi ({chapterQuestions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                setStation('sheet');
              }}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                station === 'sheet' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>3. Kirim Google Sheet</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                setTeacherOpen(true);
              }}
              className="min-h-[40px] px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Mode Guru</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.click();
                voice.stop();
                onClose();
              }}
              className="min-h-[40px] px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Scrollable Station Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50">
          {/* STATION 1: LAYAR VIDEO & MATERI + TROPHY MILESTONES */}
          {station === 'materi' && (
            <div className="space-y-5">
              {/* Progress & 5 Interior 3D Trophy Tracker */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      Progres Dekorasi Piala 3D Gedung ({masteryCount}/10 Aktivitas)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.unlock();
                      voice.speak(
                        `${materiSection.judul}. ${materiSection.subjudul}. ${materiSection.poin
                          .map((p) => `${p.judul}: ${p.isi}`)
                          .join('. ')}`,
                        true
                      );
                    }}
                    className="min-h-[40px] px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Bacakan Materi (Voice)</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {INTERIOR_TROPHY_MILESTONES.map((m) => {
                    const unlocked = masteryCount >= m.threshold;
                    return (
                      <div
                        key={m.threshold}
                        className={`rounded-xl p-2.5 border text-center ${
                          unlocked
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="text-xs font-black font-mono-num">
                          {unlocked ? '✓ TERBUKA' : `Target ${m.threshold}`}
                        </div>
                        <div className="text-[11px] font-bold mt-0.5">{m.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Mini-Tools matching Chapter */}
              {chapterId === 'bilangan' && (
                <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-blue-900">
                      Coba Interaktif: Pecahan Senilai dari 1/2
                    </div>
                    <p className="text-sm text-blue-800 mt-1">
                      Geser pengali untuk melihat pembilang dan penyebut dikali bilangan yang sama:
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <label htmlFor="st-frac-mult" className="text-sm font-semibold font-mono-num">
                        Pengali: ×{fracMult}
                      </label>
                      <input
                        id="st-frac-mult"
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
                  <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-xl border border-blue-200 font-mono-num text-2xl font-bold">
                    <span>1/2</span>
                    <span className="text-slate-400">=</span>
                    <span className="text-blue-600">{fracMult}/{fracMult * 2}</span>
                    <span className="text-slate-400">=</span>
                    <span className="text-emerald-600">50%</span>
                  </div>
                </div>
              )}

              {chapterId === 'pengukuran' && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm font-bold text-amber-950">
                      Coba Interaktif: Konverter Tangga Berat (kg → g)
                    </div>
                    <div className="flex items-center gap-3">
                      <label htmlFor="st-berat-kg" className="font-mono-num text-sm font-bold">
                        Berat: {formatAngkaID(beratKg, 1)} kg
                      </label>
                      <input
                        id="st-berat-kg"
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
                    <div className="rounded-xl bg-white p-3 border border-amber-200">
                      <div className="text-xs text-slate-500">kg</div>
                      <div className="text-lg font-bold">{formatAngkaID(beratKg, 1)}</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-amber-200">
                      <div className="text-xs text-slate-500">hg (ons)</div>
                      <div className="text-lg font-bold">{formatAngkaID(beratKg * 10, 1)}</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-amber-200">
                      <div className="text-xs text-slate-500">dag</div>
                      <div className="text-lg font-bold">{formatAngkaID(beratKg * 100, 1)}</div>
                    </div>
                    <div className="rounded-xl bg-white p-3 border border-amber-200">
                      <div className="text-xs text-slate-500">g</div>
                      <div className="text-lg font-bold text-emerald-700">{formatAngkaID(beratKg * 1000, 0)}</div>
                    </div>
                  </div>
                </div>
              )}

              {chapterId === 'geometri' && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-emerald-950">
                      Coba Interaktif: Jumlah Tiga Sudut Segitiga Selalu 180°
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <label htmlFor="st-sudut-a" className="text-sm font-mono-num font-semibold">
                        Ubah Sudut A: {angleA}°
                      </label>
                      <input
                        id="st-sudut-a"
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
                  <div className="font-mono-num text-lg font-bold bg-white px-5 py-3 rounded-xl border border-emerald-200">
                    {angleA}° + {angleB}° + {angleC}° = <span className="text-emerald-700">180°</span>
                  </div>
                </div>
              )}

              {/* Preserved BUKU_SAKU_MATERI Section */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{materiSection.judul}</h3>
                    <p className="text-sm text-slate-600">{materiSection.subjudul}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.click();
                      setShowFullBukuSaku((v) => !v);
                    }}
                    className="min-h-[42px] px-4 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                  >
                    {showFullBukuSaku ? 'Tutup Buku Saku Lengkap' : 'Buka Buku Saku Lengkap (Semua 5 Bab)'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materiSection.poin.map((p) => (
                    <div key={p.judul} className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                      <div className="font-bold text-slate-900 text-base">{p.judul}</div>
                      <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{p.isi}</p>
                    </div>
                  ))}
                </div>

                {materiSection.tabelRumus && (
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-700">
                          <th className="py-3 px-4 font-bold">Bangun datar</th>
                          <th className="py-3 px-4 font-bold">Keliling</th>
                          <th className="py-3 px-4 font-bold">Luas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materiSection.tabelRumus.map((r) => (
                          <tr key={r.bangun}>
                            <td className="py-3 px-4 font-semibold text-slate-900">{r.bangun}</td>
                            <td className="py-3 px-4 font-mono-num text-slate-700">{r.keliling}</td>
                            <td className="py-3 px-4 font-mono-num text-slate-700">{r.luas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {showFullBukuSaku && (
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <BukuSaku onBack={() => setShowFullBukuSaku(false)} />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    sound.pop();
                    setStation('soal');
                  }}
                  className="min-h-[52px] px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md"
                >
                  Lanjut ke Meja Soal & Refleksi →
                </button>
              </div>
            </div>
          )}

          {/* STATION 2: MEJA SOAL & REFLEKSI (100% PRESERVED 25 INTERACTIVE STAGES + WRITTEN REFLECTION) */}
          {station === 'soal' && (
            <div className="space-y-4">
              {/* Chapter Question Selector Pills */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                    Pilih Panggung Soal ({visibleQuestions.length} Soal di {building.shortTitle})
                  </div>
                  {building.id === 'strategi' && (
                    <div className="flex flex-wrap gap-1">
                      {(['Semua', 'Bilangan', 'Geometri', 'Pengukuran', 'Data'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            sound.click();
                            setTopicFilter(t);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                            topicFilter === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {visibleQuestions.map((q) => {
                    const done = progress.completedQuestions.includes(q.id);
                    const isActive = q.id === activeQuestion.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => selectQuestion(q.id)}
                        className={`min-h-[42px] px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                            : done
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-blue-400'
                        }`}
                      >
                        <span>Soal {q.id}</span>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Classroom Interaction Modes */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-bold text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200">
                  Soal {activeQuestion.id}: {activeQuestion.widget.namaPanggung} ·{' '}
                  <span className="text-blue-700">{activeQuestion.elemen}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl">
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
                      className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                        modeKelas === m.id ? 'bg-blue-600 text-white' : 'text-slate-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2-Phase Classroom Flow Bar */}
              <div className="rounded-2xl bg-white border-2 border-blue-200 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => switchFaseKelas('contoh-guru')}
                    className={`min-h-[48px] px-4 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer ${
                      isContoh
                        ? 'bg-amber-500 border-amber-600 text-slate-950'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    1. Peragaan Guru (Soal Contoh · Angka Cantik)
                  </button>
                  <button
                    type="button"
                    onClick={() => switchFaseKelas('giliran-siswa')}
                    className={`min-h-[48px] px-4 rounded-xl font-bold text-xs sm:text-sm border-2 cursor-pointer ${
                      !isContoh
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                  >
                    2. Giliran Siswa ke Depan (Soal Latihan)
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        sound.click();
                        setFormatSiswa('individu');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                        formatSiswa === 'individu' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
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
                        formatSiswa === 'kelompok' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      Kelompok
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={acakSiswaKeDepan}
                    className="min-h-[42px] px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                  >
                    {formatSiswa === 'individu'
                      ? `Absen No. ${absenMaju} (Acak 1–${TOTAL_ABSEN_KELAS})`
                      : `Kelompok ${kelompokMaju} (Ganti)`}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.unlock();
                      voice.speak(currentTeksSoal, true);
                    }}
                    className="min-h-[42px] px-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                  >
                    Bacakan Soal
                  </button>
                </div>
              </div>

              {modeKelas === 'tim' && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 flex items-center justify-between text-sm">
                  <div className="font-bold text-blue-950">
                    Giliran Saat Ini: Tim {timGiliran} (Tanpa skor ujian, kumpulkan Bintang Bersama!)
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.pop();
                      setTimGiliran((t) => (t === 'A' ? 'B' : 'A'));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-xs font-bold cursor-pointer"
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
                    className={`min-h-[46px] rounded-xl font-bold text-xs px-2.5 border cursor-pointer ${
                      idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      stage === idx
                        ? 'bg-blue-600 border-blue-700 text-white shadow-sm'
                        : idx < stage
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <MimoMascot
                mood={mimoMood}
                pesan={mimoText || activeQuestion.ceritaMimo}
                onEasterEgg={() => onCompleteQuestion(activeQuestion.id, chapterId, false)}
              />

              {/* Preserved Interactive Widget */}
              {stage >= 1 && renderWidget(activeQuestion)}

              {stage === 0 && (
                <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 text-center flex flex-col items-center gap-4">
                  <div className="text-xs font-semibold text-slate-500">
                    {isContoh ? 'PERAGAAN GURU · ANGKA CANTIK' : `${KOTA_LABEL} · GILIRAN SISWA`} · {activeQuestion.modelResmi}
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 max-w-xl">
                    {activeQuestion.widget.namaPanggung}
                  </h3>
                  <p className="text-base sm:text-lg text-slate-700 max-w-2xl">{currentTeksSoal}</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      type="button"
                      onClick={() => goStage(1)}
                      className="min-h-[56px] px-7 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base cursor-pointer"
                    >
                      Mulai Mainkan & Peragakan →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.unlock();
                        voice.speak(currentTeksSoal, true);
                      }}
                      className="min-h-[56px] px-6 rounded-2xl bg-slate-100 border border-slate-300 font-bold text-sm cursor-pointer"
                    >
                      Bacakan Soal
                    </button>
                  </div>
                </div>
              )}

              {stage === 2 && (
                <div className="rounded-2xl bg-amber-50 border border-amber-300 p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-amber-800">Pertanyaan Pemantik Diskusi</div>
                    <div className="text-lg font-bold text-slate-900 mt-1">{activeQuestion.pertanyaanTemukan}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => goStage(3)}
                    className="min-h-[56px] px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Susun Langkah Pengerjaan →
                  </button>
                </div>
              )}

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

              {stage === 4 && (
                <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-blue-700">
                      {isContoh
                        ? 'SOAL CONTOH GURU (ANGKA CANTIK)'
                        : `SOAL LATIHAN ${activeQuestion.id} · ${
                            formatSiswa === 'individu' ? `ABSEN NO. ${absenMaju}` : `KELOMPOK ${kelompokMaju}`
                          }`}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.unlock();
                          voice.speak(currentTeksSoal, true);
                        }}
                        className="min-h-[40px] px-3.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-800 font-bold text-xs cursor-pointer"
                      >
                        Bacakan Soal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.pop();
                          setHintLevel((h) => (h < 3 ? h + 1 : 0));
                        }}
                        className="min-h-[40px] px-3.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs cursor-pointer"
                      >
                        {hintLevel === 0
                          ? 'Petunjuk (Level 1)'
                          : hintLevel < 3
                            ? `Petunjuk (Level ${hintLevel + 1})`
                            : 'Sembunyikan Petunjuk'}
                      </button>
                    </div>
                  </div>

                  <p className="text-lg font-semibold text-slate-900 leading-relaxed">{currentTeksSoal}</p>

                  {hintLevel > 0 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-1.5">
                      {activeQuestion.petunjukBertingkat.slice(0, hintLevel).map((h, i) => (
                        <div key={i} className="text-sm text-amber-950">
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
                            className={`min-h-[58px] rounded-xl border-2 px-4 py-3 text-left font-semibold text-base flex items-center gap-3 cursor-pointer ${
                              selected
                                ? 'bg-blue-600 border-blue-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-blue-400'
                            }`}
                          >
                            <span className="w-8 h-8 rounded-lg bg-white/20 border border-current flex items-center justify-center font-bold shrink-0">
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
                            className={`w-full min-h-[58px] rounded-xl border-2 px-4 py-3 text-left font-semibold text-base flex items-center gap-3 cursor-pointer ${
                              checked
                                ? 'bg-blue-600 border-blue-700 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-blue-400'
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
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                          >
                            <div className="text-base font-semibold text-slate-900">
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
                                className={`min-h-[48px] min-w-[90px] px-4 rounded-xl border-2 font-bold text-sm cursor-pointer ${
                                  val === true ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-slate-300 text-slate-800'
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
                                className={`min-h-[48px] min-w-[90px] px-4 rounded-xl border-2 font-bold text-sm cursor-pointer ${
                                  val === false ? 'bg-amber-600 border-amber-700 text-white' : 'bg-white border-slate-300 text-slate-800'
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
                      className="min-h-[56px] px-7 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base cursor-pointer"
                    >
                      Periksa Jawaban
                    </button>

                    {isContoh && (
                      <button
                        type="button"
                        onClick={() => switchFaseKelas('giliran-siswa')}
                        className="min-h-[56px] px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
                      >
                        Lanjut ke Giliran Siswa (Soal Asli) →
                      </button>
                    )}
                  </div>

                  {feedback && (
                    <div
                      className={`rounded-2xl border p-4 text-base font-semibold ${
                        feedback.tipe === 'ok'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : 'bg-amber-50 border-amber-300 text-amber-950'
                      }`}
                    >
                      {feedback.tipe === 'ok' ? '✓ ' : 'Mari periksa lagi: '}
                      {feedback.teks}
                      {celebrating && !isContoh && (
                        <div className="mt-2 text-sm font-bold text-emerald-800">
                          Stiker didapat: {activeQuestion.stikerNama}!
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Stage Navigation */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={stage === 0}
                  onClick={() => goStage(stage - 1)}
                  className="min-h-[48px] px-5 rounded-xl bg-white border border-slate-300 disabled:opacity-40 font-bold text-sm cursor-pointer"
                >
                  ← Mundur Tahap
                </button>
                {stage < 4 && (
                  <button
                    type="button"
                    onClick={() => goStage(stage + 1)}
                    className="min-h-[48px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Lanjut Tahap →
                  </button>
                )}
              </div>

              {/* Written Refleksi / Uraian Box (STRICTLY NO Photo Upload) */}
              <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
                <div className="text-sm font-extrabold text-slate-900">
                  Refleksi & Uraian Pemahaman Siswa (Tertulis — Tanpa Unggah Foto)
                </div>
                <p className="text-xs text-slate-600">
                  Tuliskan kesimpulan konsep atau langkah penyelesaian yang kamu pahami dari Soal {activeQuestion.id}.
                </p>
                <textarea
                  rows={3}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Contoh: Untuk membandingkan harga atau mencari KPK, saya menyamakan satuannya dulu lalu..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={syncingSheet}
                    onClick={handleSaveReflectionOnly}
                    className="min-h-[44px] px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Simpan Refleksi ke Arsip & Naikkan Piala 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.click();
                      setStation('sheet');
                    }}
                    className="min-h-[44px] px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    Buka Terminal Kirim Google Sheet →
                  </button>
                </div>
                {sheetResult && station === 'soal' && (
                  <div className={`rounded-xl px-4 py-2.5 text-xs font-bold ${sheetResult.ok ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-amber-50 text-amber-900 border border-amber-300'}`}>
                    {sheetResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATION 3: TERMINAL KIRIM GOOGLE SHEET (STRICTLY NO Photo Upload) */}
          {station === 'sheet' && (
            <form
              onSubmit={handleSendToGoogleSheets}
              className="max-w-2xl mx-auto rounded-3xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-black text-slate-900">
                    Terminal Kirim Google Sheets & Arsip Guru
                  </h3>
                  <p className="text-xs text-slate-600">
                    Folder Drive otomatis: Kota Matematika TKA → {identity.school} → Kelas {identity.className} → {identity.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-[11px] font-bold text-slate-500">Nama Siswa</div>
                  <div className="font-bold text-slate-900">{identity.name}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-[11px] font-bold text-slate-500">Sekolah & Kelas</div>
                  <div className="font-bold text-slate-900">{identity.school} · Kelas {identity.className}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <div className="text-[11px] font-bold text-slate-500">Gedung / Bab</div>
                  <div className="font-bold text-slate-900">{building.title}</div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <label htmlFor="pg-score-sheet" className="block text-[11px] font-bold text-slate-500">
                    Nilai Latihan / Skor Pemahaman (0–100)
                  </label>
                  <input
                    id="pg-score-sheet"
                    type="number"
                    min={0}
                    max={100}
                    value={pgScoreInput}
                    onChange={(e) => setPgScoreInput(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    className="mt-1 w-24 rounded-lg border border-slate-300 px-2 py-1 font-mono-num font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sheet-reflection" className="block text-xs font-bold text-slate-700 mb-1">
                  Jawaban Uraian / Refleksi Tertulis (Tanpa Unggah Foto)
                </label>
                <textarea
                  id="sheet-reflection"
                  rows={4}
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Tuliskan inti konsep matematika yang sudah kamu kuasai di gedung ini..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={syncingSheet}
                className="w-full min-h-[52px] rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-base cursor-pointer shadow-md disabled:opacity-60"
              >
                {syncingSheet ? 'Mengirim ke Google Sheets & Arsip...' : 'Kirim ke Google Sheets & Arsip Guru'}
              </button>

              {sheetResult && (
                <div
                  className={`rounded-2xl p-4 border text-sm font-semibold space-y-2 ${
                    sheetResult.ok
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}
                >
                  <div>{sheetResult.message}</div>
                  {sheetResult.url && (
                    <a
                      href={sheetResult.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-700 underline font-bold"
                    >
                      <span>Buka File Google Spreadsheet</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {teacherOpen && (
        <TeacherPanel
          question={activeQuestion}
          frozen={frozen}
          onToggleFreeze={() => setFrozen((f) => !f)}
          onClose={() => setTeacherOpen(false)}
        />
      )}

      {frozen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/92 flex flex-col items-center justify-center p-6 text-center text-white">
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
              className="min-h-[56px] px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-base cursor-pointer"
            >
              Lanjutkan Layar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
