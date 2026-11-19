import React, { useRef, useState } from 'react';
import { Zap } from 'lucide-react';

interface TouchJoystickProps {
  onVectorChange: (x: number, y: number) => void;
  sprint: boolean;
  onToggleSprint: () => void;
}

export const TouchJoystick: React.FC<TouchJoystickProps> = ({
  onVectorChange,
  sprint,
  onToggleSprint
}) => {
  const baseRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const [knob, setKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const maxRadius = 42;

  const updateFromClient = (clientX: number, clientY: number) => {
    const el = baseRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }
    setKnob({ x: dx, y: dy });
    onVectorChange(dx / maxRadius, dy / maxRadius);
  };

  const resetStick = () => {
    pointerIdRef.current = null;
    setKnob({ x: 0, y: 0 });
    onVectorChange(0, 0);
  };

  return (
    <div className="flex items-end gap-3 select-none">
      {/* Analog Joystick Base (solid/semi-opaque, NO backdrop-blur) */}
      <div
        ref={baseRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (pointerIdRef.current !== null) return;
          pointerIdRef.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClient(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          e.stopPropagation();
          updateFromClient(e.clientX, e.clientY);
        }}
        onPointerUp={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          e.stopPropagation();
          resetStick();
        }}
        onPointerCancel={(e) => {
          if (pointerIdRef.current !== e.pointerId) return;
          resetStick();
        }}
        className="relative w-28 h-28 rounded-full bg-slate-900/88 border-2 border-white/30 shadow-xl touch-none flex items-center justify-center cursor-grab active:cursor-grabbing"
        aria-label="Joystick Gerak Avatar"
      >
        <div className="w-16 h-16 rounded-full border border-white/15 pointer-events-none" />
        <div
          style={{
            transform: `translate3d(${knob.x}px, ${knob.y}px, 0)`
          }}
          className="absolute w-11 h-11 rounded-full bg-amber-400 border-2 border-white shadow-lg pointer-events-none"
        />
      </div>

      {/* Sprint Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleSprint();
        }}
        className={`min-h-[48px] px-3.5 rounded-2xl border-2 font-extrabold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors ${
          sprint
            ? 'bg-amber-400 border-white text-slate-950'
            : 'bg-slate-900/90 border-white/25 text-white'
        }`}
      >
        <Zap className="w-4 h-4" />
        <span>{sprint ? 'Lari ON' : 'Lari'}</span>
      </button>
    </div>
  );
};
