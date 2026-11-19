import React from 'react';
import { CITY_BUILDINGS } from '../../data/buildings';
import { BuildingId, OnlinePlayer } from '../../types/game';
import { Compass } from 'lucide-react';

interface MinimapRadarProps {
  playerPos: { x: number; z: number; rotY: number };
  onlinePlayers: OnlinePlayer[];
  completedQuestions: number[];
  activeBuildingId: BuildingId | null;
  onTeleportBuilding: (id: BuildingId) => void;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({
  playerPos,
  onlinePlayers,
  completedQuestions,
  activeBuildingId,
  onTeleportBuilding
}) => {
  // Map world coordinates x in [-50, 50], z in [-66, 50] into percentage [6..94]
  const toPercentX = (wx: number) => Math.max(8, Math.min(92, ((wx + 50) / 100) * 100));
  const toPercentY = (wz: number) => Math.max(8, Math.min(92, ((wz + 66) / 116) * 100));

  const px = toPercentX(playerPos.x);
  const py = toPercentY(playerPos.z);
  const deg = ((-playerPos.rotY * 180) / Math.PI) % 360;

  return (
    <div className="w-36 sm:w-44 rounded-2xl bg-slate-900/92 border-2 border-slate-700 shadow-xl p-2 text-white select-none">
      <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 px-1 pb-1">
        <span className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-amber-400" />
          <span>PETA KOTA</span>
        </span>
        <span className="text-emerald-400 font-mono-num">
          {activeBuildingId ? 'DI GEDUNG' : `${Math.round(playerPos.x)},${Math.round(playerPos.z)}`}
        </span>
      </div>

      {/* Radar Surface */}
      <div className="relative w-full h-28 sm:h-32 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
        {/* Main Avenue Roads */}
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-3 bg-slate-700/80"
          aria-hidden="true"
        />
        <div
          className="absolute left-0 right-0 top-[56%] h-2.5 bg-slate-700/80"
          aria-hidden="true"
        />

        {/* Clickable Building Beacons */}
        {CITY_BUILDINGS.map((b) => {
          const bx = toPercentX(b.x);
          const by = toPercentY(b.z);
          const done =
            !b.isVersus &&
            b.questionIds.length > 0 &&
            b.questionIds.every((qid) => completedQuestions.includes(qid));

          return (
            <button
              key={b.id}
              type="button"
              title={`Teleport ke ${b.title}`}
              onClick={() => onTeleportBuilding(b.id)}
              style={{
                left: `${bx}%`,
                top: `${by}%`,
                backgroundColor: b.color
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-md border text-[8px] font-black text-white flex items-center justify-center cursor-pointer hover:scale-125 transition-transform shadow-sm ${
                done ? 'border-emerald-300 ring-2 ring-emerald-400/70' : 'border-white/80'
              }`}
            >
              {b.isVersus ? 'VS' : b.id === 'bilangan' ? '1' : b.id === 'geometri' ? '2' : b.id === 'pengukuran' ? '3' : b.id === 'data' ? '4' : '5'}
            </button>
          );
        })}

        {/* Remote Online Players (Green Dots) */}
        {onlinePlayers.map((op) => (
          <div
            key={op.id}
            title={`${op.name} (${op.className})`}
            style={{
              left: `${toPercentX(op.x)}%`,
              top: `${toPercentY(op.z)}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-950 pointer-events-none"
          />
        ))}

        {/* Local Player Arrow */}
        <div
          style={{
            left: `${px}%`,
            top: `${py}%`,
            transform: `translate(-50%, -50%) rotate(${deg}deg)`
          }}
          className="absolute w-3.5 h-3.5 pointer-events-none"
        >
          <svg viewBox="0 0 20 20" className="w-full h-full drop-shadow">
            <polygon points="10,1 18,18 10,14 2,18" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      <div className="text-[9px] text-slate-400 text-center pt-1">
        Klik kotak angka/VS untuk teleport cepat
      </div>
    </div>
  );
};
