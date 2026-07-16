import axios from 'axios';
import pokeApiClient from './axios';
import {
  Generation,
  NamedAPIResourceList,
  PokemonDetail,
  PokemonSpecies,
  EvolutionChainResponse
} from '../types/pokemon';

export const getGenerations = async (): Promise<Generation[]> => {
  const response = await pokeApiClient.get<NamedAPIResourceList>('generation?limit=9');
  const promises = response.data.results.map((gen) => 
    pokeApiClient.get<Generation>(gen.url).then(res => res.data)
  );
  return Promise.all(promises);
};

export const getPokemonList = async (limit: number = 151, offset: number = 0): Promise<NamedAPIResourceList> => {
  const response = await pokeApiClient.get<NamedAPIResourceList>(`pokemon?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const getPokemonDetail = async (idOrName: string | number): Promise<PokemonDetail> => {
  const response = await pokeApiClient.get<PokemonDetail>(`pokemon/${idOrName}`);
  return response.data;
};

export const getPokemonSpecies = async (idOrName: string | number): Promise<PokemonSpecies> => {
  const response = await pokeApiClient.get<PokemonSpecies>(`pokemon-species/${idOrName}`);
  return response.data;
};

export const getEvolutionChain = async (url: string): Promise<EvolutionChainResponse> => {
  const cleanUrl = url.replace('https://pokeapi.co/api/v2/', '');
  const response = await pokeApiClient.get<EvolutionChainResponse>(cleanUrl);
  return response.data;
};

export interface AbilityDetail {
  id: number;
  name: string;
  effect: string;
  shortEffect: string;
  flavorText: string;
}

export const getAbilityDetail = async (idOrName: string | number): Promise<AbilityDetail> => {
  const nameOrId = typeof idOrName === 'string' ? idOrName.toLowerCase().replace(' ', '-') : idOrName;
  const response = await pokeApiClient.get(`ability/${nameOrId}`);
  const data = response.data;
  
  // Find English effect
  const effectEntry = data.effect_entries?.find((e: any) => e.language.name === 'en');
  const effect = effectEntry ? effectEntry.effect : '';
  const shortEffect = effectEntry ? effectEntry.short_effect : '';
  
  // Find English flavor text
  const flavorEntry = data.flavor_text_entries?.find((e: any) => e.language.name === 'en');
  const flavorText = flavorEntry ? flavorEntry.flavor_text : 'No description available.';
  
  return {
    id: data.id,
    name: data.name,
    effect: effect || flavorText,
    shortEffect: shortEffect || flavorText,
    flavorText,
  };
};

export const getPokemonLocationEncounters = async (id: number): Promise<any[]> => {
  const response = await pokeApiClient.get(`pokemon/${id}/encounters`);
  return response.data;
};

export const getMoveDetail = async (name: string): Promise<any> => {
  const cleanName = name.toLowerCase().replace(' ', '-');
  const response = await pokeApiClient.get(`move/${cleanName}`);
  return response.data;
};

export const getItemDetail = async (idOrName: string | number): Promise<any> => {
  const nameOrId = typeof idOrName === 'string' ? idOrName.toLowerCase().replace(' ', '-') : idOrName;
  const response = await pokeApiClient.get(`item/${nameOrId}`);
  return response.data;
};

export const getItemList = async (limit: number = 20, offset: number = 0): Promise<any> => {
  const response = await pokeApiClient.get(`item?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const getPokemonThatLearnMove = async (moveName: string): Promise<any[]> => {
  const query = `
    query getPokemonByMove($moveName: String!) {
      pokemon_v2_pokemonmove(where: {pokemon_v2_move: {name: {_eq: $moveName}}}) {
        pokemon_v2_pokemon {
          id
          name
          pokemon_v2_pokemontypes {
            pokemon_v2_type {
              name
            }
          }
        }
      }
    }
  `;
  const response = await axios.post('https://beta.pokeapi.co/graphql/v1beta', { 
    query,
    variables: { moveName: moveName.toLowerCase().replace(' ', '-') }
  });
  
  const raw = response.data.data.pokemon_v2_pokemonmove || [];
  const seen = new Set();
  const list: any[] = [];
  raw.forEach((r: any) => {
    const p = r.pokemon_v2_pokemon;
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      list.push({
        id: p.id,
        name: p.name.replace('-', ' '),
        types: p.pokemon_v2_pokemontypes.map((t: any) => t.pokemon_v2_type.name)
      });
    }
  });
  return list;
};

export const getPokemonByAbility = async (abilityName: string): Promise<any[]> => {
  const query = `
    query getPokemonByAbility($abilityName: String!) {
      pokemon_v2_ability(where: {name: {_eq: $abilityName}}) {
        pokemon_v2_pokemonabilities {
          pokemon_v2_pokemon {
            id
            name
            pokemon_v2_pokemontypes {
              pokemon_v2_type {
                name
              }
            }
          }
        }
      }
    }
  `;
  const response = await axios.post('https://beta.pokeapi.co/graphql/v1beta', { 
    query,
    variables: { abilityName: abilityName.toLowerCase().replace(' ', '-') }
  });
  
  const raw = response.data.data.pokemon_v2_ability[0]?.pokemon_v2_pokemonabilities || [];
  const seen = new Set();
  const list: any[] = [];
  raw.forEach((r: any) => {
    const p = r.pokemon_v2_pokemon;
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      list.push({
        id: p.id,
        name: p.name.replace('-', ' '),
        types: p.pokemon_v2_pokemontypes.map((t: any) => t.pokemon_v2_type.name)
      });
    }
  });
  return list;
};

export const getPokemonEvolvingWithItem = async (itemName: string): Promise<any[]> => {
  const query = `
    query getEvolutions($itemName: String!) {
      pokemon_v2_pokemonevolution(where: {pokemon_v2_item: {name: {_eq: $itemName}}}) {
        pokemon_v2_pokemonspecy {
          id
          name
        }
      }
    }
  `;
  const response = await axios.post('https://beta.pokeapi.co/graphql/v1beta', {
    query,
    variables: { itemName: itemName.toLowerCase().replace(' ', '-') }
  });
  const raw = response.data.data.pokemon_v2_pokemonevolution || [];
  const seen = new Set();
  const list: any[] = [];
  raw.forEach((r: any) => {
    const s = r.pokemon_v2_pokemonspecy;
    if (s && !seen.has(s.id)) {
      seen.add(s.id);
      list.push({ 
        id: s.id, 
        name: s.name.replace('-', ' ')
      });
    }
  });
  return list;
};


export interface GqlPokemonSearchData {
  id: number;
  name: string;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spa: number;
    spd: number;
    spe: number;
  };
  generation_id: number;
  height: number;
  weight: number;
  base_exp: number;
  abilities: string[];
}

export const getAllPokemonSearchData = async (): Promise<GqlPokemonSearchData[]> => {
  const query = `
    query {
      pokemon_v2_pokemon(limit: 1025) {
        id
        name
        height
        weight
        base_experience
        pokemon_v2_pokemontypes {
          pokemon_v2_type {
            name
          }
        }
        pokemon_v2_pokemonstats {
          base_stat
          pokemon_v2_stat {
             name
          }
        }
        pokemon_v2_pokemonabilities {
          pokemon_v2_ability {
            name
          }
        }
        pokemon_v2_pokemonspecy {
          generation_id
        }
      }
    }
  `;

  // We use standard axios directly to beta graphql
  const response = await axios.post('https://beta.pokeapi.co/graphql/v1beta', { query });
  
  const rawData = response.data.data.pokemon_v2_pokemon;
  
  return rawData.map((p: any) => {
    const types = p.pokemon_v2_pokemontypes.map((pt: any) => pt.pokemon_v2_type.name);
    
    let stats: any = {};
    p.pokemon_v2_pokemonstats.forEach((s: any) => {
      if (s.pokemon_v2_stat.name === 'hp') stats.hp = s.base_stat;
      if (s.pokemon_v2_stat.name === 'attack') stats.attack = s.base_stat;
      if (s.pokemon_v2_stat.name === 'defense') stats.defense = s.base_stat;
      if (s.pokemon_v2_stat.name === 'special-attack') stats.spa = s.base_stat;
      if (s.pokemon_v2_stat.name === 'special-defense') stats.spd = s.base_stat;
      if (s.pokemon_v2_stat.name === 'speed') stats.spe = s.base_stat;
    });

    const abilities = p.pokemon_v2_pokemonabilities.map((a: any) => a.pokemon_v2_ability.name);

    return {
      id: p.id,
      name: p.name,
      types: types,
      stats: stats,
      generation_id: p.pokemon_v2_pokemonspecy?.generation_id || 1, // fallback to Gen 1 if missing
      height: p.height / 10,
      weight: p.weight / 10,
      base_exp: p.base_experience || 0,
      abilities: abilities
    };
  });
};

export interface PokemonMoveData {
  name: string;
  level: number;
  method: string;
  accuracy: number | null;
  power: number | null;
  type: string;
  damage_class: string;
}

export const getPokemonMovesData = async (id: number): Promise<{ levelUp: PokemonMoveData[], machine: PokemonMoveData[] }> => {
  const query = `
    query getMoves($pokeId: Int!) {
      pokemon_v2_pokemon(where: {id: {_eq: $pokeId}}) {
        pokemon_v2_pokemonmoves {
          level
          pokemon_v2_movelearnmethod {
            name
          }
          pokemon_v2_move {
            name
            accuracy
            power
            pokemon_v2_type {
              name
            }
            pokemon_v2_movedamageclass {
              name
            }
          }
        }
      }
    }
  `;

  const response = await axios.post('https://beta.pokeapi.co/graphql/v1beta', { 
    query, 
    variables: { pokeId: id } 
  });
  
  const rawMoves = response.data.data.pokemon_v2_pokemon[0]?.pokemon_v2_pokemonmoves || [];
  
  // We use a Map to keep only one unique instance of each move per learn method (ignoring version duplicates)
  const levelUpMap = new Map<string, PokemonMoveData>();
  const machineMap = new Map<string, PokemonMoveData>();

  rawMoves.forEach((m: any) => {
    const method = m.pokemon_v2_movelearnmethod?.name || 'unknown';
    // We only care about level-up, machine, egg, tutor. 
    // Usually 'level-up' vs the rest.
    const moveData: PokemonMoveData = {
      name: m.pokemon_v2_move?.name || 'unknown',
      level: m.level || 0,
      method: method,
      accuracy: m.pokemon_v2_move?.accuracy,
      power: m.pokemon_v2_move?.power,
      type: m.pokemon_v2_move?.pokemon_v2_type?.name || 'unknown',
      damage_class: m.pokemon_v2_move?.pokemon_v2_movedamageclass?.name || 'status',
    };

    if (method === 'level-up') {
      // Keep earliest level learned
      if (!levelUpMap.has(moveData.name) || levelUpMap.get(moveData.name)!.level > moveData.level) {
        levelUpMap.set(moveData.name, moveData);
      }
    } else if (method === 'machine' || method === 'egg' || method === 'tutor') {
      if (!machineMap.has(moveData.name)) {
        machineMap.set(moveData.name, moveData);
      }
    }
  });

  return {
    levelUp: Array.from(levelUpMap.values()),
    machine: Array.from(machineMap.values())
  };
};
