/**
 * Team Builder Page - Main feature
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

export default function TeamBuilderPage() {
  const { user } = useAuth();
  const { data: pokemonListData, isLoading: pokemonLoading } = usePokemonList();
  const createTeamMutation = useCreateTeam();

  const [selectedPokemon, setSelectedPokemon] = useState<number[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamFormat, setTeamFormat] = useState('OU');
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingResult, setRatingResult] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Filter Pokémon based on search
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Team Builder</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Build your competitive team with real-time analysis
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Info */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Team Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Stall Core, Balance Team"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  value={teamFormat}
                  onChange={(e) => setTeamFormat(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
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
          </Card>

          {/* Selected Pokémon */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Team Composition ({selectedPokemon.length}/6)
            </h2>
            {selectedPokemonDetails.length > 0 ? (
              <div className="space-y-3">
                {selectedPokemonDetails.map((poke, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold capitalize">{poke.name}</p>
                      <TypeBadgeGroup types={[poke.type1, poke.type2]} size="sm" />
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemovePokemon(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Add Pokémon to get started</p>
            )}
          </Card>

          {/* Pokémon Search */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Add Pokémon</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Pokémon by name..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800"
              />
              {pokemonLoading ? (
                <p>Loading Pokémon...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {filteredPokemon.slice(0, 30).map((poke: Pokemon) => (
                    <button
                      key={poke.id}
                      onClick={() => handleAddPokemon(poke.id)}
                      disabled={selectedPokemon.length >= 6 || selectedPokemon.includes(poke.id)}
                      className="p-2 text-center rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm capitalize font-medium"
                    >
                      {poke.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {selectedPokemon.length > 0 && (
            <Button
              onClick={handleSaveTeam}
              isLoading={isSubmitting}
              className="w-full py-3 text-lg"
            >
              Save Team
            </Button>
          )}
        </div>

        {/* Rating Panel */}
        <div>
          {ratingResult ? (
            <Card className="sticky top-8">
              <h2 className="text-2xl font-bold mb-6">
                Rating: <span className="text-primary-600">{ratingResult.finalScore}</span>/100
              </h2>

              <div className="space-y-4">
                {/* Subscores */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type Coverage</span>
                      <span className="font-medium">{ratingResult.typeCoverageScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Role Balance</span>
                      <span className="font-medium">{ratingResult.roleBalanceScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Synergy</span>
                      <span className="font-medium">{ratingResult.synergyScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meta Relevance</span>
                      <span className="font-medium">{ratingResult.metaRelevanceScore}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Weakness Penalty</span>
                      <span className="font-medium">{ratingResult.weaknessPenalty}</span>
                    </div>
                  </div>
                </div>

                {/* Roles */}
                {ratingResult.roles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm">Team Roles</h3>
                    <div className="flex flex-wrap gap-1">
                      {ratingResult.roles.map((role: string) => (
                        <span key={role} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-xs capitalize font-medium">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {ratingResult.weaknesses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm text-red-600">Weaknesses</h3>
                    <TypeBadgeGroup types={ratingResult.weaknesses} size="sm" />
                  </div>
                )}

                {/* Warnings */}
                {ratingResult.warnings.length > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2 text-sm text-yellow-800 dark:text-yellow-300">Warnings</h3>
                    <ul className="text-xs text-yellow-700 dark:text-yellow-200 space-y-1">
                      {ratingResult.warnings.map((warn: any, i: number) => (
                        <li key={i}>• {warn.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="sticky top-8">
              <p className="text-center text-gray-500">Add Pokémon to see rating</p>
            </Card>
          )}
        </div>
      </div>

      {/* View saved teams */}
      {user && (
        <div className="text-center mt-8">
          <Link href="/teams" className="text-primary-600 hover:text-primary-700 font-medium">
            View your saved teams →
          </Link>
        </div>
      )}
    </div>
  );
}
