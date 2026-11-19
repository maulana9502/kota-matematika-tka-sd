import React from 'react';
import { OnlinePlayer } from '../../types/game';
import { sound } from '../../utils/sound';
import { Users, MapPin, Swords, X } from 'lucide-react';

interface OnlinePlayersModalProps {
  players: OnlinePlayer[];
  myPos: { x: number; z: number };
  onVisitPlayer: (player: OnlinePlayer) => void;
  onChallengePlayer: (player: OnlinePlayer) => void;
  onClose: () => void;
}

export const OnlinePlayersModal: React.FC<OnlinePlayersModalProps> = ({
  players,
  myPos,
  onVisitPlayer,
  onChallengePlayer,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[85dvh] overflow-y-auto rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-black text-slate-900">
                Teman Online di Kota ({players.length})
              </h2>
              <p className="text-xs text-slate-500">
                Kunjungi temanmu langsung di kota 3D atau tantang Duel Versus 1v1!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {players.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center space-y-2">
            <div className="text-base font-bold text-slate-800">Belum ada pemain lain yang sedang berjalan di kota</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Buka tab/perangkat lain dengan aplikasi ini untuk langsung melihat temanmu berjalan bersama secara real-time, atau masuk ke Gedung Versus 1v1 untuk melawan Bot Pintar!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {players.map((p) => {
              const distMeters = Math.round(Math.hypot(p.x - myPos.x, p.z - myPos.z));
              return (
                <div
                  key={p.id}
                  className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border border-black/15 flex items-center justify-center text-white font-black text-sm shadow-xs"
                      style={{ backgroundColor: p.shirtColor || '#2563EB' }}
                    >
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {p.name} <span className="text-xs font-semibold text-blue-700">· Lv.{p.level || 1}</span>
                      </div>
                      <div className="text-xs text-slate-600">
                        Kelas {p.className} · {p.school}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Jarak: {distMeters} m · {p.insideBuildingId ? `Di dalam Gedung ${p.insideBuildingId}` : 'Di Jalanan Kota'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.pop();
                        onVisitPlayer(p);
                      }}
                      className="min-h-[40px] px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Kunjungi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.pop();
                        onChallengePlayer(p);
                      }}
                      className="min-h-[40px] px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Swords className="w-3.5 h-3.5" />
                      <span>Tantang Duel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
