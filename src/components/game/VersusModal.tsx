import React, { useEffect, useState } from 'react';
import { VERSUS_QUESTIONS } from '../../data/versusQuestions';
import { OnlinePlayer, PlayerIdentity, VersusQuestion } from '../../types/game';
import { sound, voice } from '../../utils/sound';
import { Swords, Bot, Trophy, X, Clock } from 'lucide-react';

export interface ActiveDuelState {
  mode: 'pvp' | 'bot';
  roomId?: string;
  questionIndices: number[];
  opponentName: string;
  opponentClass: string;
  opponentScore: number;
  opponentProgress: number;
  opponentFinished: boolean;
  winnerId?: string;
}

interface VersusModalProps {
  identity: PlayerIdentity;
  onlinePlayers: OnlinePlayer[];
  activeDuel: ActiveDuelState | null;
  onStartBotDuel: () => void;
  onChallengeOnline: (player: OnlinePlayer) => void;
  onSubmitPvpAnswer: (roomId: string, round: number, points: number) => void;
  onDuelVictory: (won: boolean, score: number) => void;
  onClose: () => void;
}

export const VersusModal: React.FC<VersusModalProps> = ({
  identity,
  onlinePlayers,
  activeDuel,
  onStartBotDuel,
  onChallengeOnline,
  onSubmitPvpAnswer,
  onDuelVictory,
  onClose
}) => {
  const [round, setRound] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [botProgress, setBotProgress] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(() => Date.now());
  const [roundFeedback, setRoundFeedback] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  // Reset local round tracking whenever a fresh duel begins
  useEffect(() => {
    if (activeDuel) {
      setRound(0);
      setMyScore(0);
      setBotScore(0);
      setBotProgress(0);
      setSelectedIdx(null);
      setRoundFeedback(null);
      setFinished(false);
      setRoundStartTime(Date.now());
    }
  }, [activeDuel?.roomId, activeDuel?.mode]);

  // Bot simulation pacing
  useEffect(() => {
    if (!activeDuel || activeDuel.mode !== 'bot' || finished) return;
    const timer = window.setInterval(() => {
      setBotProgress((bp) => {
        if (bp >= 5) return 5;
        const botCorrect = Math.random() < 0.72;
        if (botCorrect) {
          setBotScore((bs) => bs + 120 + Math.floor(Math.random() * 40));
        }
        return bp + 1;
      });
    }, 5200);
    return () => window.clearInterval(timer);
  }, [activeDuel, finished]);

  const currentQuestion: VersusQuestion | null =
    activeDuel && activeDuel.questionIndices[round] !== undefined
      ? VERSUS_QUESTIONS[activeDuel.questionIndices[round] % VERSUS_QUESTIONS.length]
      : null;

  const handleChooseOption = (idx: number) => {
    if (!activeDuel || !currentQuestion || selectedIdx !== null) return;
    sound.unlock();
    setSelectedIdx(idx);

    const elapsedSec = (Date.now() - roundStartTime) / 1000;
    const speedBonus = Math.max(10, Math.round(50 - elapsedSec * 2));
    const isCorrect = idx === currentQuestion.kunciIndex;
    const earned = isCorrect ? 100 + speedBonus : 0;

    if (isCorrect) {
      sound.clap();
      setRoundFeedback(`Benar! (+${earned} poin) · ${currentQuestion.pembahasan}`);
    } else {
      sound.softWrong();
      setRoundFeedback(
        `Kurang tepat! Jawaban benar: ${currentQuestion.opsi[currentQuestion.kunciIndex]}. ${currentQuestion.pembahasan}`
      );
    }

    const nextScore = myScore + earned;
    setMyScore(nextScore);

    if (activeDuel.mode === 'pvp' && activeDuel.roomId) {
      onSubmitPvpAnswer(activeDuel.roomId, round, earned);
    }

    window.setTimeout(() => {
      if (round + 1 >= activeDuel.questionIndices.length) {
        setFinished(true);
        const oppScore = activeDuel.mode === 'bot' ? botScore : activeDuel.opponentScore;
        onDuelVictory(nextScore >= oppScore, nextScore);
      } else {
        setRound((r) => r + 1);
        setSelectedIdx(null);
        setRoundFeedback(null);
        setRoundStartTime(Date.now());
      }
    }, 1800);
  };

  const oppScoreDisplay = activeDuel?.mode === 'bot' ? botScore : activeDuel?.opponentScore || 0;
  const oppProgressDisplay = activeDuel?.mode === 'bot' ? botProgress : activeDuel?.opponentProgress || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl max-h-[92dvh] overflow-y-auto rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-700 to-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6" />
            <div>
              <h2 className="font-display text-xl font-black">Arena Duel Versus 1v1</h2>
              <p className="text-xs text-rose-100">Bank 125 Soal Cerita & Penalaran Cepat Matematika SD</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              voice.stop();
              onClose();
            }}
            className="p-2 rounded-xl bg-black/20 hover:bg-black/30 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Lobby Mode Picker */}
          {!activeDuel && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                    <Bot className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-base">Lawan Bot Pintar Kota (Solo Instan)</div>
                    <p className="text-xs text-slate-700 mt-0.5">
                      5 soal acak dari bank 125 soal dengan bonus kecepatan menjawab!
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sound.pop();
                    onStartBotDuel();
                  }}
                  className="min-h-[48px] px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer shrink-0"
                >
                  Mulai Duel vs Bot →
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="text-sm font-black text-slate-800">
                  Tantang Teman Online 1v1 Real-Time ({onlinePlayers.length} Pemain Tersedia)
                </div>
                {onlinePlayers.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
                    Belum ada pemain lain yang online saat ini. Gunakan mode Duel vs Bot di atas atau ajak temanmu login di perangkat lain!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {onlinePlayers.map((op) => (
                      <div
                        key={op.id}
                        className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-sm text-slate-900">{op.name}</div>
                          <div className="text-xs text-slate-500">Kelas {op.className} · {op.school}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            sound.pop();
                            onChallengeOnline(op);
                          }}
                          className="min-h-[38px] px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                        >
                          Tantang 1v1
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Duel Arena */}
          {activeDuel && (
            <div className="space-y-5">
              {/* Scoreboard */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-blue-50 border-2 border-blue-400 p-3.5">
                  <div className="text-xs font-bold text-blue-700">{identity.name} (Kamu)</div>
                  <div className="text-2xl font-black font-mono-num text-blue-950">{myScore}</div>
                  <div className="text-[11px] font-semibold text-blue-700">
                    Progres: {finished ? 5 : round}/5 Soal
                  </div>
                </div>
                <div className="rounded-2xl bg-rose-50 border-2 border-rose-400 p-3.5 text-right">
                  <div className="text-xs font-bold text-rose-700">
                    {activeDuel.opponentName} ({activeDuel.opponentClass})
                  </div>
                  <div className="text-2xl font-black font-mono-num text-rose-950">{oppScoreDisplay}</div>
                  <div className="text-[11px] font-semibold text-rose-700">
                    Progres: {oppProgressDisplay}/5 Soal
                  </div>
                </div>
              </div>

              {!finished && currentQuestion && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>
                      Ronde {round + 1} dari 5 · Topik: {currentQuestion.topic}
                    </span>
                    <span className="flex items-center gap-1 text-amber-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Jawab Cepat = Bonus Poin!</span>
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.teks}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQuestion.opsi.map((opText, idx) => {
                      const picked = selectedIdx === idx;
                      const isRight = idx === currentQuestion.kunciIndex;
                      let cls = 'bg-white border-slate-200 text-slate-900 hover:border-blue-500';
                      if (selectedIdx !== null) {
                        if (isRight) cls = 'bg-emerald-600 border-emerald-700 text-white';
                        else if (picked) cls = 'bg-rose-600 border-rose-700 text-white';
                      }
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={selectedIdx !== null}
                          onClick={() => handleChooseOption(idx)}
                          className={`min-h-[54px] px-4 py-3 rounded-xl border-2 text-left font-bold text-sm cursor-pointer transition-colors ${cls}`}
                        >
                          <span className="mr-2 opacity-75">{['A', 'B', 'C', 'D'][idx]}.</span>
                          <span>{opText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {roundFeedback && (
                    <div className="rounded-xl bg-white border border-slate-300 p-3 text-xs sm:text-sm font-bold text-slate-800">
                      {roundFeedback}
                    </div>
                  )}
                </div>
              )}

              {finished && (
                <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-emerald-50 border-2 border-amber-400 p-6 text-center space-y-3">
                  <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
                  <h3 className="font-display text-2xl font-black text-slate-900">
                    {myScore > oppScoreDisplay
                      ? 'SELAMAT! KAMU MENANG DUEL 1v1!'
                      : myScore === oppScoreDisplay
                        ? 'HASIL SERI YANG HEBAT!'
                        : 'DUEL SELESAI! TERUS BERLATIH!'}
                  </h3>
                  <p className="text-sm text-slate-700 font-semibold">
                    Skor Akhir: Kamu <strong className="font-mono-num">{myScore}</strong> vs{' '}
                    {activeDuel.opponentName} <strong className="font-mono-num">{oppScoreDisplay}</strong>
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.pop();
                        onStartBotDuel();
                      }}
                      className="min-h-[46px] px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm cursor-pointer"
                    >
                      Main Duel Lagi
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.click();
                        onClose();
                      }}
                      className="min-h-[46px] px-5 rounded-xl bg-slate-900 text-white font-bold text-sm cursor-pointer"
                    >
                      Kembali ke Kota 3D
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
