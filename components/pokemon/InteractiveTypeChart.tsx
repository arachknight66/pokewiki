'use client';

import React, { useState } from 'react';
import { PokemonType } from '@/lib/types';
import { TYPE_MATCHUPS, TYPE_COLORS, getTypeTextColor } from '@/lib/type-system';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { usePrefersReducedMotion } from '@/hooks';

const ALL_TYPES = Object.keys(TYPE_MATCHUPS) as PokemonType[];

function getEffectiveness(attacker: PokemonType, defender: PokemonType): number {
  const chartDefender = TYPE_MATCHUPS[defender];
  if (chartDefender.immune?.includes(attacker)) return 0;
  if (chartDefender.resistance?.includes(attacker)) return 0.5;
  if (chartDefender.weak?.includes(attacker)) return 2;
  return 1;
}

export default function InteractiveTypeChart() {
  const prefersReducedMotion = usePrefersReducedMotion();

  // Hover and Pin states
  const [hovered, setHovered] = useState<{ type: PokemonType; direction: 'attacking' | 'defending' } | null>(null);
  const [pinned, setPinned] = useState<{ type: PokemonType; direction: 'attacking' | 'defending' } | null>(null);

  const active = hovered || pinned;

  const handleHeaderClick = (type: PokemonType, direction: 'attacking' | 'defending') => {
    if (pinned?.type === type && pinned.direction === direction) {
      setPinned(null);
    } else {
      setPinned({ type, direction });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: PokemonType, direction: 'attacking' | 'defending') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleHeaderClick(type, direction);
    }
  };

  const getMultiplierStyle = (multiplier: number, isHighlighted: boolean) => {
    if (multiplier === 2) {
      return {
        bg: isHighlighted ? 'bg-emerald-500/40 text-emerald-950 dark:text-emerald-300' : 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-400',
        label: '2x',
      };
    }
    if (multiplier === 0.5) {
      return {
        bg: isHighlighted ? 'bg-rose-500/40 text-rose-950 dark:text-rose-300' : 'bg-rose-500/20 text-rose-900 dark:text-rose-400',
        label: '½x',
      };
    }
    if (multiplier === 0) {
      return {
        bg: isHighlighted ? 'bg-zinc-800 text-zinc-400 dark:bg-zinc-950 border border-dashed border-zinc-700' : 'bg-zinc-700/50 text-zinc-500 dark:bg-zinc-900/50',
        label: '0x',
        crosshatch: true,
      };
    }
    return {
      bg: isHighlighted ? 'bg-white/10 dark:bg-white/5 text-slate-500' : 'bg-transparent text-slate-400/50 dark:text-slate-600/50',
      label: '1x',
    };
  };

  // Derive Type Info details dynamically for the panel
  const getActiveTypeDetails = () => {
    if (!active) return null;
    const type = active.type;

    // Offensive Details
    const strongAgainst = TYPE_MATCHUPS[type].effective;
    const weakAgainst = ALL_TYPES.filter(def => TYPE_MATCHUPS[def].resistance?.includes(type));
    const immuneAgainst = ALL_TYPES.filter(def => TYPE_MATCHUPS[def].immune?.includes(type));

    // Defensive Details
    const weakTo = TYPE_MATCHUPS[type].weak;
    const resists = TYPE_MATCHUPS[type].resistance;
    const immuneTo = TYPE_MATCHUPS[type].immune;

    return {
      type,
      color: TYPE_COLORS[type],
      textColor: getTypeTextColor(type),
      offensive: {
        strong: strongAgainst,
        weak: weakAgainst,
        immune: immuneAgainst,
      },
      defensive: {
        weak: weakTo,
        resists: resists,
        immune: immuneTo,
      },
    };
  };

  const details = getActiveTypeDetails();

  return (
    <div className="grid xl:grid-cols-4 gap-8">
      {/* Animation CSS inject */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cell-pulse {
          0% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.08); filter: brightness(1.3); }
          100% { transform: scale(1.05); filter: brightness(1.15); }
        }
        .cell-highlight-animate {
          animation: cell-pulse 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          z-index: 10;
        }
        .cell-highlight-static {
          transform: scale(1.02);
          filter: brightness(1.15);
          z-index: 5;
        }
        .crosshatch-pattern {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0, 0, 0, 0.1) 4px, rgba(0, 0, 0, 0.1) 8px);
        }
        .dark .crosshatch-pattern {
          background-image: repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255, 255, 255, 0.05) 4px, rgba(255, 255, 255, 0.05) 8px);
        }
      ` }} />

      {/* Grid Container */}
      <div className="xl:col-span-3 space-y-4">
        {/* Help tooltip instructions */}
        <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] text-xs font-semibold flex items-center gap-2">
          <span>💡</span>
          <p style={{ color: 'var(--text-secondary)' }}>
            Hover or click type headers to highlight matchups. Rows represent <span className="font-extrabold text-[var(--pokedex-red)]">Attacking Types</span>, columns represent <span className="font-extrabold text-[var(--accent-secondary)]">Defending Types</span>.
          </p>
        </div>

        {/* Scrollable grid wrapper */}
        <div className="overflow-x-auto rounded-2xl border-4 border-[var(--text-primary)] shadow-[8px_8px_0px_var(--text-primary)] bg-[var(--bg-card)] max-w-full">
          <div className="min-w-[840px] p-6">
            <table className="w-full border-collapse select-none table-fixed">
              {/* Header Row (Defending types) */}
              <thead>
                <tr>
                  <th className="w-[100px] h-[48px] text-left align-middle text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)] leading-tight p-1">
                    <div className="flex flex-col justify-between h-full">
                      <span className="text-right text-[var(--accent-secondary)]">Defend ➔</span>
                      <span className="text-left text-[var(--pokedex-red)]">Attack ↴</span>
                    </div>
                  </th>
                  {ALL_TYPES.map((type) => {
                    const isPinned = pinned?.type === type && pinned.direction === 'defending';
                    const isHovered = hovered?.type === type && hovered.direction === 'defending';
                    const isActiveHeader = isPinned || isHovered;

                    return (
                      <th
                        key={type}
                        className={`text-center align-middle font-display uppercase tracking-widest text-[9px] p-0.5 transition-all cursor-pointer`}
                        onClick={() => handleHeaderClick(type, 'defending')}
                        onMouseEnter={() => setHovered({ type, direction: 'defending' })}
                        onMouseLeave={() => setHovered(null)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Show matches for defending ${type}. ${isPinned ? 'Pinned' : 'Not pinned'}`}
                        aria-pressed={isPinned}
                        onKeyDown={(e) => handleKeyDown(e, type, 'defending')}
                      >
                        <div
                           className={`py-2 rounded-lg font-black transition-all flex flex-col items-center justify-center`}
                           style={{
                             backgroundColor: isActiveHeader ? TYPE_COLORS[type] : 'var(--bg-secondary)',
                             color: isActiveHeader ? getTypeTextColor(type) : 'var(--text-secondary)',
                             border: `2px solid ${isActiveHeader ? 'var(--text-primary)' : 'transparent'}`,
                           }}
                        >
                          {type.substring(0, 3)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Rows */}
              <tbody>
                {ALL_TYPES.map((attackType) => {
                  const isRowPinned = pinned?.type === attackType && pinned.direction === 'attacking';
                  const isRowHovered = hovered?.type === attackType && hovered.direction === 'attacking';
                  const isRowActive = isRowPinned || isRowHovered;

                  return (
                    <tr key={attackType}>
                      {/* Row Header */}
                      <td
                        className="h-[36px] align-middle font-display uppercase tracking-widest text-[9px] p-0.5 cursor-pointer"
                        onClick={() => handleHeaderClick(attackType, 'attacking')}
                        onMouseEnter={() => setHovered({ type: attackType, direction: 'attacking' })}
                        onMouseLeave={() => setHovered(null)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Show matches for attacking ${attackType}. ${isRowPinned ? 'Pinned' : 'Not pinned'}`}
                        aria-pressed={isRowPinned}
                        onKeyDown={(e) => handleKeyDown(e, attackType, 'attacking')}
                      >
                        <div
                           className="py-1.5 px-2 rounded-lg font-black transition-all text-center leading-none"
                           style={{
                             backgroundColor: isRowActive ? TYPE_COLORS[attackType] : 'var(--bg-secondary)',
                             color: isRowActive ? getTypeTextColor(attackType) : 'var(--text-secondary)',
                             border: `2px solid ${isRowActive ? 'var(--text-primary)' : 'transparent'}`,
                           }}
                        >
                          {attackType}
                        </div>
                      </td>

                      {/* Cells */}
                      {ALL_TYPES.map((defendType) => {
                        const multiplier = getEffectiveness(attackType, defendType);

                        // Matchup highlight checks
                        const colPinned = pinned?.type === defendType && pinned.direction === 'defending';
                        const colHovered = hovered?.type === defendType && hovered.direction === 'defending';
                        const isColActive = colPinned || colHovered;

                        const isCellHighlighted = isRowActive || isColActive;
                        const cellStyle = getMultiplierStyle(multiplier, isCellHighlighted);

                        // Anim class condition
                        let animClass = '';
                        if (isCellHighlighted) {
                          animClass = prefersReducedMotion ? 'cell-highlight-static' : 'cell-highlight-animate';
                        }

                        return (
                          <td
                            key={defendType}
                            className="p-0.5 align-middle text-center h-[36px]"
                            title={`${attackType} attacking ${defendType}: ${multiplier}x`}
                          >
                            <div
                              className={`
                                h-full w-full rounded-lg font-extrabold text-[10px]
                                flex items-center justify-center transition-all duration-200
                                ${cellStyle.bg} ${animClass} ${cellStyle.crosshatch ? 'crosshatch-pattern' : ''}
                              `}
                            >
                              {multiplier !== 1 && cellStyle.label}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating details / Sticky sidebar Panel */}
      <div className="xl:col-span-1">
        {details ? (
          <div
            className="sticky top-24 p-6 rounded-2xl border-4 border-[var(--text-primary)] shadow-[6px_6px_0px_var(--text-primary)] transition-all duration-300"
            style={{
              backgroundColor: 'var(--bg-card)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[var(--border-color-bold)] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black capitalize">{details.type}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white bg-[var(--text-muted)]">
                  {active === pinned ? 'Pinned 📌' : 'Preview'}
                </span>
              </div>
              <button
                onClick={() => { setPinned(null); setHovered(null); }}
                className="text-xs font-bold text-red-500 hover:underline"
              >
                Clear
              </button>
            </div>

            {/* Main Panel Content */}
            <div className="space-y-6">
              {/* Type Badge preview */}
              <div className="flex justify-center py-2">
                <TypeBadge type={details.type} size="lg" />
              </div>

              {/* Offensive Profile */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--pokedex-red)] border-l-4 border-[var(--pokedex-red)] pl-2">
                  Offensive Matchups (Deals)
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wide text-emerald-600 block mb-1">
                      Super Effective (2x)
                    </span>
                    {details.offensive.strong.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {details.offensive.strong.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--text-muted)] italic">None</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wide text-rose-500 block mb-1">
                      Not Very Effective (0.5x)
                    </span>
                    {details.offensive.weak.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {details.offensive.weak.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--text-muted)] italic">None</span>
                    )}
                  </div>

                  {details.offensive.immune.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wide text-zinc-500 block mb-1">
                        No Effect (0x)
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {details.offensive.immune.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Defensive Profile */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--accent-secondary)] border-l-4 border-[var(--accent-secondary)] pl-2">
                  Defensive Profile (Takes)
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wide text-rose-500 block mb-1">
                      Weak to (2x)
                    </span>
                    {details.defensive.weak.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {details.defensive.weak.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--text-muted)] italic">None</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wide text-emerald-600 block mb-1">
                      Resists (0.5x)
                    </span>
                    {details.defensive.resists.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {details.defensive.resists.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[var(--text-muted)] italic">None</span>
                    )}
                  </div>

                  {details.defensive.immune.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wide text-zinc-500 block mb-1">
                        Immune to (0x)
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {details.defensive.immune.map(t => <TypeBadge key={t} type={t} size="sm" />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="sticky top-24 p-8 rounded-2xl border-4 border-dashed border-[var(--border-color-bold)] bg-[var(--bg-card)] text-center">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--border-color-bold)] flex items-center justify-center mx-auto mb-4 text-xl opacity-30">
              ℹ️
            </div>
            <h3 className="font-bold text-sm mb-1">No Type Selected</h3>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Hover over a type header or click on it to lock the panel and view strengths, weaknesses, and defensive stats.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
