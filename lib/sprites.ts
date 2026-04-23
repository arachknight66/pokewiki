/**
 * Pokémon Sprite URL helpers
 * Uses PokeAPI's GitHub-hosted sprites
 */

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export function getPokemonSprites(id: number) {
  return {
    // 2D sprites
    front2d: `${SPRITE_BASE}/${id}.png`,
    frontShiny2d: `${SPRITE_BASE}/shiny/${id}.png`,
    // Official Artwork (high-res 2D)
    officialArtwork: `${SPRITE_BASE}/other/official-artwork/${id}.png`,
    officialArtworkShiny: `${SPRITE_BASE}/other/official-artwork/shiny/${id}.png`,
    // 3D Home renders
    home3d: `${SPRITE_BASE}/other/home/${id}.png`,
    home3dShiny: `${SPRITE_BASE}/other/home/shiny/${id}.png`,
    // Animated showdown sprites
    showdownAnimated: `${SPRITE_BASE}/other/showdown/${id}.gif`,
    showdownAnimatedShiny: `${SPRITE_BASE}/other/showdown/shiny/${id}.gif`,
  };
}
