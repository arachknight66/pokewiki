/**
 * Saved Team Viewer
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTeam, usePokemon, useAuth } from '@/hooks';
import PokeballLoader from '@/components/ui/PokeballLoader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TypeBadgeGroup } from '@/components/ui/TypeBadge';
import Image from 'next/image';

const PokemonSlot = ({ id }: { id: number }) => {
  const { data, isLoading } = usePokemon(id);
  const pokemon = data?.pokemon;

  if (isLoading) {
    return (
      <Card className="flex flex-col items-center justify-center p-6 h-full animate-pulse bg-gray-50/50">
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-4" />
        <div className="h-4 w-16 bg-gray-200 rounded" />
      </Card>
    );
  }

  if (!pokemon) return null;

  return (
    <Card className="flex flex-col items-center p-6 h-full border-2 border-transparent hover:border-blue-500/30 transition-all hover:-translate-y-1">
      <div className="relative w-32 h-32 mb-4 drop-shadow-xl group-hover:scale-110 transition-transform">
        <Image 
          src={pokemon.sprites?.front2d || '/image.png'} 
          alt={pokemon.name} 
          fill 
          sizes="(max-width: 128px) 100vw, 128px"
          className="object-contain filter custom-drop-shadow" 
          unoptimized
        />
      </div>
      <h3 className="text-lg font-black font-display capitalize mb-2">{pokemon.name}</h3>
      <TypeBadgeGroup types={[pokemon.type1, pokemon.type2]} />
      
      <div className="w-full grid grid-cols-2 gap-2 mt-4 text-xs font-mono font-bold text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
        <div className="flex justify-between uppercase"><span>HP</span> <span>{pokemon.stats.hp}</span></div>
        <div className="flex justify-between uppercase"><span>ATK</span> <span>{pokemon.stats.attack}</span></div>
        <div className="flex justify-between uppercase"><span>DEF</span> <span>{pokemon.stats.defense}</span></div>
        <div className="flex justify-between uppercase"><span>SPD</span> <span>{pokemon.stats.spe}</span></div>
      </div>
    </Card>
  );
};

export default function TeamViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: team, isLoading, error } = useTeam(id as string);
  const { user } = useAuth();

  if (isLoading) return <PokeballLoader message="Loading team schema..." />;
  if (error || !team) return (
    <div className="text-center py-20 space-y-4">
      <h1 className="text-3xl font-black">Team not found</h1>
      <p className="text-gray-500">The team may be private or no longer exist.</p>
      <Button onClick={() => router.back()}>Go Back</Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 stagger-children">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center font-black transition-colors"
        >
          ←
        </button>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black font-display capitalize">
                {team.name}
             </h1>
             {team.isPublic ? (
               <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded bg-green-100 text-green-700">Public</span>
             ) : (
               <span className="px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded bg-gray-100 text-gray-500">Private</span>
             )}
          </div>
          <p className="text-gray-500 mt-1 max-w-2xl">{team.description || "No description provided."}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Format</span>
          <span className="text-xl font-bold">{team.format}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Rating</span>
          <span className="text-xl font-bold text-green-600 dark:text-green-400">{team.ratingScore || "N/A"}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Created At</span>
          <span className="text-sm font-bold">{new Date(team.createdAt).toLocaleDateString()}</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Views</span>
          <span className="text-xl font-bold">{team.views || 0}</span>
        </Card>
      </div>

      <div className="pt-4">
        <h2 className="text-2xl font-black font-display mb-6 flex items-center gap-2">
           <span className="text-blue-500">⬣</span> Roster
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.pokemonIds.map((id: number, idx: number) => (
             <PokemonSlot key={`${id}-${idx}`} id={id} />
          ))}
        </div>
      </div>
    </div>
  );
}
