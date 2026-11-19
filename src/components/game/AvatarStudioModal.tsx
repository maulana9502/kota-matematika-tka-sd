import React, { useState } from 'react';
import {
  AvatarAppearance,
  COMPANION_OPTIONS,
  HatStyle,
  PANTS_COLOR_OPTIONS,
  SHIRT_COLOR_OPTIONS
} from '../../types/game';
import { sound } from '../../utils/sound';
import { X, Check, Sparkles } from 'lucide-react';

interface AvatarStudioModalProps {
  current: AvatarAppearance;
  onSave: (next: AvatarAppearance) => void;
  onClose: () => void;
}

const HAIR_OPTIONS = [
  { label: 'Hitam Pekat', hex: '#1E1B18' },
  { label: 'Cokelat Tua', hex: '#5C3A21' },
  { label: 'Pirang Emas', hex: '#CA8A04' },
  { label: 'Merah Marun', hex: '#7F1D1D' }
];

const HAT_OPTIONS: { id: HatStyle; label: string; desc: string }[] = [
  { id: 'default', label: 'Tanpa Topi', desc: 'Tampil santai dengan gaya rambut rapi' },
  { id: 'topi-sekolah', label: 'Topi Sekolah', desc: 'Topi biru kebanggaan pelajar kota' },
  { id: 'topi-juara', label: 'Mahkota Emas', desc: 'Simbol penjelajah matematika sejati' },
  { id: 'bando-pintar', label: 'Bando Antena', desc: 'Antena pemancar ide kreatif 3D' }
];

export const AvatarStudioModal: React.FC<AvatarStudioModalProps> = ({
  current,
  onSave,
  onClose
}) => {
  const [draft, setDraft] = useState<AvatarAppearance>({ ...current });

  const applyUpdate = (patch: Partial<AvatarAppearance>) => {
    sound.click();
    const next = { ...draft, ...patch };
    setDraft(next);
    onSave(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-black text-slate-900">Studio Avatar & Pendamping 3D</h2>
              <p className="text-xs text-slate-500">Perubahan langsung terlihat pada karakter 3D kamu di kota!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
            aria-label="Tutup Studio Avatar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shirt & Pants Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="text-sm font-bold text-slate-800 mb-2">Warna Baju</div>
            <div className="grid grid-cols-4 gap-2">
              {SHIRT_COLOR_OPTIONS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => applyUpdate({ shirtColor: c.hex })}
                  className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                    draft.shirtColor === c.hex ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg mx-auto border border-black/15" style={{ backgroundColor: c.hex }} />
                  <div className="text-[10px] font-bold text-slate-700 mt-1 truncate">{c.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-bold text-slate-800 mb-2">Warna Celana</div>
              <div className="grid grid-cols-2 gap-2">
                {PANTS_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => applyUpdate({ pantsColor: c.hex })}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${
                      draft.pantsColor === c.hex ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md border border-black/15 shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs font-bold text-slate-800">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-800 mb-2">Warna Rambut</div>
              <div className="grid grid-cols-2 gap-2">
                {HAIR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => applyUpdate({ hairColor: c.hex })}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${
                      draft.hairColor === c.hex ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md border border-black/15 shrink-0" style={{ backgroundColor: c.hex }} />
                    <span className="text-xs font-bold text-slate-800">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hat Style */}
        <div>
          <div className="text-sm font-bold text-slate-800 mb-2">Aksesori Kepala 3D</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {HAT_OPTIONS.map((hat) => (
              <button
                key={hat.id}
                type="button"
                onClick={() => applyUpdate({ hatStyle: hat.id })}
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  draft.hatStyle === hat.id
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="text-xs font-extrabold">{hat.label}</div>
                <div className={`text-[10px] mt-1 ${draft.hatStyle === hat.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  {hat.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Floating Companions */}
        <div>
          <div className="text-sm font-bold text-slate-800 mb-2">Pilih Karakter Pendamping 3D (Melayang di Bahu)</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {COMPANION_OPTIONS.map((comp) => (
              <button
                key={comp.id}
                type="button"
                onClick={() => applyUpdate({ companion: comp.id })}
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  draft.companion === comp.id
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-4 h-4 rounded-full border border-black/15" style={{ backgroundColor: comp.warnaUtama }} />
                  {draft.companion === comp.id && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <div className="text-xs font-extrabold text-slate-900 mt-1.5">{comp.nama}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{comp.julukan}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              sound.pop();
              onClose();
            }}
            className="min-h-[46px] px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer"
          >
            Selesai & Kembali ke Kota
          </button>
        </div>
      </div>
    </div>
  );
};
