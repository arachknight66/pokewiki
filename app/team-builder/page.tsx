/**
 * Team Builder Page — Pokémon Anime-inspired
 */

'use client';

import { useState, useEffect } from 'react';
import { usePokemonList, useCreateTeam, useAuth } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import { Pokemon, Team } from '@/lib/types';
import { rateTeam } from '@/lib/rating-engine';
import Link from 'next/link';
import Image from 'next/image';

const TYPE_COLORS: Record<string, string> = {
  normal:   '#A8A878', fire:     '#F08030', water:    '#6890F0',
  grass:    '#78C850', electric: '#F8D030', ice:      '#98D8D8',
  fighting: '#C03028', poison:   '#A040A0', ground:   '#E0C068',
  flying:   '#A890F0', psychic:  '#F85888', bug:      '#A8B820',
  rock:     '#B8A038', ghost:    '#705898', dragon:   '#7038F8',
  dark:     '#705848', steel:    '#B8B8D0', fairy:    '#EE99AC',
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export default function TeamBuilderPage() {
  const { user } = useAuth();
  const createTeamMutation = useCreateTeam();

  const [selectedPokemon, setSelectedPokemon] = useState<number[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamFormat, setTeamFormat] = useState('OU');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingResult, setRatingResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: pokemonListData, isLoading: pokemonLoading } = usePokemonList({
    pageSize: 1100,
  });

  // Get selected Pokémon details
  const selectedPokemonDetails = selectedPokemon.map(id =>
    pokemonListData?.data?.find((p: Pokemon) => p.id === id)
  ).filter(Boolean) as Pokemon[];

  // Calculate team rating when Pokémon are selected
  useEffect(() => {
    if (selectedPokemonDetails.length > 0) {
      const mockMoves = selectedPokemonDetails.flatMap(p => [
        { type: p.type1, name: 'Move1', category: 'physical' as const, pp: 20, priority: 0 },
        p.type2 ? { type: p.type2, name: 'Move2', category: 'special' as const, pp: 15, priority: 0 } : null,
      ]).filter(Boolean);

      const rating = rateTeam({
        team: { id: '', userId: '', pokemonIds: selectedPokemon } as Team,
        pokemon: selectedPokemonDetails,
        moves: mockMoves as any,
      });

      setRatingResult(rating);
    }
  }, [selectedPokemonDetails, selectedPokemon]);

  // Filter Pokémon based on search term (client-side since we have the full list)
  const filteredPokemon = pokemonListData?.data?.filter((p: Pokemon) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddPokemon = (pokemonId: number) => {
    if (selectedPokemon.length < 6 && !selectedPokemon.includes(pokemonId)) {
      setSelectedPokemon([...selectedPokemon, pokemonId]);
    }
  };

  const handleRemovePokemon = (index: number) => {
    setSelectedPokemon(selectedPokemon.filter((_, i) => i !== index));
  };

  const handleSaveTeam = async () => {
    if (!user) {
      alert('Please log in to save teams');
      return;
    }
    if (!teamName.trim()) {
      alert('Please enter a team name');
      return;
    }
    if (selectedPokemon.length === 0) {
      alert('Please add at least one Pokémon');
      return;
    }

    setIsSubmitting(true);
    try {
      await createTeamMutation.mutateAsync({
        name: teamName,
        description: `Team with ${selectedPokemon.length} Pokémon - Rating: ${ratingResult?.finalScore || 0}`,
        format: teamFormat,
        pokemonIds: selectedPokemon,
      });
      alert('Team saved successfully!');
      setTeamName('');
      setSelectedPokemon([]);
      setRatingResult(null);
    } catch (error) {
      alert('Failed to save team');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Score color based on rating
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="space-y-8 stagger-children">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl lg:text-5xl font-black font-display">
          <span className="anime-heading">Team Builder</span>
        </h1>
        <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
          Assemble your championship-winning party
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Info — Pokédex panel style */}
          <div className="pokedex-panel p-6 space-y-4">
            <h2 className="text-xl font-black font-display flex items-center gap-2">
               <span style={{ color: 'var(--pokedex-red)' }}>⬣</span> Team Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Kanto Champions"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-[0.15em] mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Battle Format
                </label>
                <select
                  value={teamFormat}
                  onChange={(e) => setTeamFormat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                >
                  <option value="OU">OU (Overused)</option>
                  <option value="UU">UU (UnderUsed)</option>
                  <option value="RU">RU (RarelyUsed)</option>
                  <option value="Doubles">Doubles</option>
                  <option value="LC">Little Cup</option>
                  <option value="VGC">VGC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Selected Pokémon — Team Party view */}
          <Card className="energy-burst">
            <h2 className="text-xl font-black font-display mb-5 flex items-center gap-2">
              <span style={{ color: 'var(--accent-secondary)' }}>⬣</span> Your Party
              <span className="ml-auto text-xs font-extrabold px-2 py-1 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '2px solid var(--border-color)' }}>
                {selectedPokemon.length} / 6
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
              {Array.from({ length: 6 }).map((_, index) => {
                const poke = selectedPokemonDetails[index];
                const bgColor = poke ? TYPE_COLORS[poke.type1] || '#A8A878' : undefined;
                const rgb = bgColor ? hexToRgb(bgColor) : undefined;

                return (
                  <div
                    key={index}
                    className="relative rounded-xl p-4 text-center transition-all duration-300 min-h-[130px] flex flex-col items-center justify-center speed-lines"
                    style={{
                      background: poke ? `rgba(${rgb}, 0.08)` : 'var(--bg-secondary)',
                      border: `2px solid ${poke ? `rgba(${rgb}, 0.3)` : 'var(--border-color)'}`,
                      boxShadow: poke ? `0 4px 15px rgba(${rgb}, 0.15)` : 'none',
                    }}
                  >
                    {poke ? (
                      <>
                        <div className="relative group">
                          <div className="absolute inset-0 m-auto w-12 h-12 rounded-full blur-xl opacity-20" style={{ background: bgColor }} />
                          {poke.sprites?.officialArtwork && (
                            <Image
                              src={poke.sprites.officialArtwork}
                              alt={poke.name}
                              width={64}
                              height={64}
                              className="relative z-10 drop-shadow-md object-contain mb-2 transition-transform group-hover:scale-110"
                              unoptimized
                            />
                          )}
                        </div>
                        <p className="font-extrabold capitalize text-xs font-display mb-1.5">{poke.name}</p>
                        <TypeBadgeGroup types={[poke.type1, poke.type2]} size="sm" />
                        <button
                          onClick={() => handleRemovePokemon(index)}
                          className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all hover:scale-110 shadow-lg"
                          style={{
                            background: 'var(--pokedex-red)',
                            color: 'white',
                            border: '2px solid var(--pokedex-red-dark)',
                          }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="text-center opacity-60">
                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-xl" style={{ border: '2px dashed var(--border-color-bold)' }}>
                          +
                        </div>
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-muted">Slot {index + 1}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pokémon Search — Add to team */}
          <Card>
            <h2 className="text-xl font-black font-display mb-4 flex items-center gap-2">
              <span style={{ color: 'var(--accent-gold)' }}>⬣</span> Recruit Pokémon
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search species name..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm pl-11"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40">🔍</span>
              </div>
              
              {pokemonLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-3 rounded-full spinner" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--pokedex-red)' }} />
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
                  {filteredPokemon.map((poke: Pokemon) => {
                    const isSelected = selectedPokemon.includes(poke.id);
                    const isFull = selectedPokemon.length >= 6;
                    const bgColor = TYPE_COLORS[poke.type1] || '#A8A878';
                    const rgb = hexToRgb(bgColor);

                    return (
                      <button
                        key={poke.id}
                        onClick={() => handleAddPokemon(poke.id)}
                        disabled={isFull || isSelected}
                        className="p-2.5 text-left rounded-xl transition-all duration-200 text-sm capitalize font-extrabold disabled:opacity-40 disabled:cursor-not-allowed group border-2"
                        style={{
                          background: isSelected ? `rgba(${rgb}, 0.12)` : 'var(--bg-secondary)',
                          borderColor: isSelected ? bgColor : 'var(--border-color)',
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 flex-shrink-0 bg-white/10 rounded-lg p-1">
                            {poke.sprites?.officialArtwork && (
                              <Image
                                src={poke.sprites.officialArtwork}
                                alt={poke.name}
                                width={32}
                                height={32}
                                className="object-contain w-full h-full group-hover:scale-110 transition-transform"
                                unoptimized
                              />
                            )}
                          </div>
                          <span className="truncate">{poke.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {selectedPokemon.length > 0 && (
            <Button
              onClick={handleSaveTeam}
              isLoading={isSubmitting}
              className="w-full py-4 text-xl shadow-xl"
              size="lg"
            >
              🚀 Finalize Your Team
            </Button>
          )}
        </div>

        {/* Rating Panel — Battle Analysis */}
        <div className="space-y-6">
          {ratingResult ? (
            <Card className="sticky top-20 border-t-4" style={{ borderTopColor: getScoreColor(ratingResult.finalScore) }}>
              <h2 className="text-xl font-black font-display mb-6 text-center">
                 Battle Analysis
              </h2>

              {/* Score ring */}
              <div className="text-center mb-8 relative">
                {/* SVG for animated ring */}
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                   <svg className="w-full h-full transform -rotate-90">
                     <circle
                       cx="64" cy="64" r="58"
                       fill="none" stroke="var(--bg-secondary)" strokeWidth="8"
                     />
                     <circle
                       cx="64" cy="64" r="58"
                       fill="none" stroke={getScoreColor(ratingResult.finalScore)}
                       strokeWidth="8" strokeDasharray={364.4}
                       strokeDashoffset={364.4 * (1 - ratingResult.finalScore / 100)}
                       strokeLinecap="round"
                       className="transition-all duration-1000 ease-out"
                     />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black font-display" style={{ color: getScoreColor(ratingResult.finalScore) }}>
                        {ratingResult.finalScore}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Rating</span>
                   </div>
                </div>
                
                {/* Score badge */}
                <div className="mt-4 inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white" 
                  style={{ background: getScoreColor(ratingResult.finalScore), boxShadow: `0 4px 10px ${getScoreColor(ratingResult.finalScore)}44` }}>
                  {ratingResult.finalScore >= 80 ? 'Elite Tier' : ratingResult.finalScore >= 60 ? 'Master' : 'Challenger'}
                </div>
              </div>

              <div className="space-y-6">
                {/* Breakdown — Anime Battle Stats */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                    Stat Breakdown
                  </h3>
                  {[
                    { label: 'Type Coverage', value: ratingResult.typeCoverageScore },
                    { label: 'Role Balance', value: ratingResult.roleBalanceScore },
                    { label: 'Team Synergy', value: ratingResult.synergyScore },
                    { label: 'Meta Power', value: ratingResult.metaRelevanceScore },
                  ].map(item => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="stat-bar-track">
                         <div className="stat-bar-fill" style={{ width: `${item.value}%`, background: getScoreColor(item.value) }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Roles */}
                {ratingResult.roles.length > 0 && (
                  <div>
                    <h3 className="font-extrabold text-[10px] uppercase tracking-[0.2em] mb-2.5" style={{ color: 'var(--text-muted)' }}>
                      Party Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ratingResult.roles.map((role: string) => (
                        <span
                          key={role}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-black capitalize border-2"
                          style={{
                            background: 'var(--bg-secondary)',
                            color: 'var(--accent-secondary)',
                            borderColor: 'var(--accent-secondary)',
                          }}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {ratingResult.weaknesses.length > 0 && (
                  <div>
                    <h3 className="font-extrabold text-[10px] uppercase tracking-[0.2em] mb-2.5 text-red-500">
                      Team Weaknesses
                    </h3>
                    <TypeBadgeGroup types={ratingResult.weaknesses} size="sm" />
                  </div>
                )}

                {/* Findings — Anime Warning box */}
                {ratingResult.warnings.length > 0 && (
                  <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: '#F59E0B', background: 'rgba(245, 158, 11, 0.04)' }}>
                    <h3 className="font-black text-xs uppercase tracking-widest mb-2" style={{ color: '#D97706' }}>
                      ⚡ Battle Insights
                    </h3>
                    <ul className="text-xs space-y-2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {ratingResult.warnings.map((warn: any, i: number) => (
                        <li key={i} className="flex gap-2">
                           <span className="shrink-0">•</span>
                           <span>{warn.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="sticky top-20 text-center py-16 opacity-80">
              <div className="w-20 h-20 rounded-full border-4 border-dashed mx-auto mb-6 flex items-center justify-center text-3xl font-black opacity-20"
                style={{ borderColor: 'var(--border-color-bold)' }}>
                ?
              </div>
              <p className="font-black font-display text-xl mb-2">Analysis Pending</p>
              <p className="text-xs font-bold leading-relaxed px-6" style={{ color: 'var(--text-muted)' }}>
                Recruit Pokémon to your party to see battle metrics and synergy ratings
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Footer link */}
      {user && (
        <div className="text-center pt-8">
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 font-black text-sm transition-all hover:translate-x-1"
            style={{ color: 'var(--accent-secondary)' }}
          >
            Manage Your Saved Teams <span className="text-xl">➔</span>
          </Link>
        </div>
      )}
    </div>
  );
}
