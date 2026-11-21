import React from 'react';

interface PebbleVisualProps {
  count: number;
  hasBigQuan?: boolean;
  isQuan?: boolean;
  playerOwner?: 1 | 2 | null;
  isActiveHover?: boolean;
}

export const PebbleVisual: React.FC<PebbleVisualProps> = ({
  count,
  hasBigQuan = false,
  isQuan = false,
  playerOwner
}) => {
  // Deterministic positions based on count
  const renderPebbles = () => {
    // Show up to 16 pebble elements visually to avoid clutter, with total count number displayed clearly
    const maxVisual = Math.min(count, 14);
    const pebbles = [];

    // Pre-calculated organic offsets
    const offsets = [
      { x: 0, y: 0 },
      { x: -10, y: -8 },
      { x: 10, y: 8 },
      { x: -8, y: 10 },
      { x: 9, y: -9 },
      { x: 0, y: -12 },
      { x: -12, y: 0 },
      { x: 12, y: -2 },
      { x: -4, y: -14 },
      { x: 5, y: 14 },
      { x: -14, y: -6 },
      { x: 13, y: 7 },
      { x: -7, y: -10 },
      { x: 8, y: 2 },
    ];

    for (let i = 0; i < maxVisual; i++) {
      const pos = offsets[i % offsets.length];
      const size = 11 + (i % 3) * 2;
      const hue = playerOwner === 1 ? 'from-emerald-400 to-teal-700' :
                  playerOwner === 2 ? 'from-amber-400 to-amber-700' :
                  'from-slate-300 to-slate-600';

      pebbles.push(
        <div
          key={i}
          className={`absolute rounded-full shadow-md bg-gradient-to-br ${hue} border border-white/20 transition-all duration-300`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
          }}
        />
      );
    }

    return pebbles;
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none">
      {/* Quan Stone (Big gemstone) */}
      {hasBigQuan && (
        <div className="relative z-10 flex items-center justify-center animate-pebble-pulse">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-900 border-2 border-amber-200/80 shadow-[0_0_24px_rgba(245,158,11,0.5)] rotate-45 flex items-center justify-center">
            <span className="-rotate-45 font-display font-black text-obsidian-950 text-sm md:text-base tracking-wider">
              QUAN
            </span>
          </div>
        </div>
      )}

      {/* Small pebbles cluster */}
      <div className={`relative flex items-center justify-center ${hasBigQuan ? 'mt-4 scale-75' : 'scale-90'}`}>
        {renderPebbles()}
      </div>

      {/* Numerical Badge */}
      <div className={`absolute ${isQuan ? 'bottom-2' : 'bottom-1.5'} z-20 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold border backdrop-blur-md shadow-sm ${
        count === 0 && !hasBigQuan
          ? 'bg-slate-900/60 text-slate-500 border-slate-800'
          : playerOwner === 1
          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
          : playerOwner === 2
          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
          : 'bg-obsidian-800/80 text-slate-200 border-slate-600/40'
      }`}>
        {hasBigQuan ? `${count} (+10)` : count}
      </div>
    </div>
  );
};
