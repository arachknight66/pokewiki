import {
  Generation,
  NamedAPIResourceList,
  PokemonDetail,
  PokemonSpecies,
  EvolutionChainResponse
} from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2/';

async function fetchPokeApi<T>(endpoint: string): Promise<T> {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${BASE_URL}${endpoint.replace(/^\//, '')}`;
  
  const res = await fetch(url, {
    next: { revalidate: 86400 } // 24 hours caching
  });
  
  if (!res.ok) {
    throw new Error(`PokeAPI error: ${res.statusText}`);
  }
  return res.json();
}

async function fetchGraphQL<T>(query: string, variables?: any): Promise<T> {
  const res = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 86400 } // 24 hours caching
  });

  if (!res.ok) {
    throw new Error(`GraphQL error: ${res.statusText}`);
  }
  return res.json();
}

export const getGenerations = async (): Promise<Generation[]> => {
  const list = await fetchPokeApi<NamedAPIResourceList>('generation?limit=9');
  const promises = list.results.map((gen) => 
    fetchPokeApi<Generation>(gen.url)
  );
  return Promise.all(promises);
};

export const getPokemonList = async (limit: number = 151, offset: number = 0): Promise<NamedAPIResourceList> => {
  return fetchPokeApi<NamedAPIResourceList>(`pokemon?limit=${limit}&offset=${offset}`);
};

export const getPokemonDetail = async (idOrName: string | number): Promise<PokemonDetail> => {
  return fetchPokeApi<PokemonDetail>(`pokemon/${idOrName}`);
};

export const getPokemonSpecies = async (idOrName: string | number): Promise<PokemonSpecies> => {
  return fetchPokeApi<PokemonSpecies>(`pokemon-species/${idOrName}`);
};

export const getEvolutionChain = async (url: string): Promise<EvolutionChainResponse> => {
  return fetchPokeApi<EvolutionChainResponse>(url);
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
  const data = await fetchPokeApi<any>(`ability/${nameOrId}`);
  
  const effectEntry = data.effect_entries?.find((e: any) => e.language.name === 'en');
  const effect = effectEntry ? effectEntry.effect : '';
  const shortEffect = effectEntry ? effectEntry.short_effect : '';
  
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
  return fetchPokeApi<any[]>(`pokemon/${id}/encounters`);
};

export const getMoveDetail = async (name: string): Promise<any> => {
  const cleanName = name.toLowerCase().replace(' ', '-');
  return fetchPokeApi<any>(`move/${cleanName}`);
};

export const getItemDetail = async (idOrName: string | number): Promise<any> => {
  const nameOrId = typeof idOrName === 'string' ? idOrName.toLowerCase().replace(' ', '-') : idOrName;
  return fetchPokeApi<any>(`item/${nameOrId}`);
};

export const getItemList = async (limit: number = 20, offset: number = 0): Promise<any> => {
  return fetchPokeApi<any>(`item?limit=${limit}&offset=${offset}`);
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
  const response = await fetchGraphQL<any>(query, {
    moveName: moveName.toLowerCase().replace(' ', '-')
  });
  
  const raw = response.data?.pokemon_v2_pokemonmove || [];
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
  const response = await fetchGraphQL<any>(query, {
    abilityName: abilityName.toLowerCase().replace(' ', '-')
  });
  
  const raw = response.data?.pokemon_v2_ability[0]?.pokemon_v2_pokemonabilities || [];
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
  const response = await fetchGraphQL<any>(query, {
    itemName: itemName.toLowerCase().replace(' ', '-')
  });
  
  const raw = response.data?.pokemon_v2_pokemonevolution || [];
  const seen = new Set();
  const list: any[] = [];
  raw.forEach((r: any) => {
    const p = r.pokemon_v2_pokemonspecy;
    if (p && !seen.has(p.id)) {
      seen.add(p.id);
      list.push({
        id: p.id,
        name: p.name.replace('-', ' ')
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

  const response = await fetchGraphQL<any>(query);
  const rawData = response.data?.pokemon_v2_pokemon || [];
  
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
      generation_id: p.pokemon_v2_pokemonspecy?.generation_id || 1,
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

  const response = await fetchGraphQL<any>(query, { pokeId: id });
  const rawMoves = response.data?.pokemon_v2_pokemon[0]?.pokemon_v2_pokemonmoves || [];
  
  const levelUpMap = new Map<string, PokemonMoveData>();
  const machineMap = new Map<string, PokemonMoveData>();

  rawMoves.forEach((m: any) => {
    const method = m.pokemon_v2_movelearnmethod?.name || 'unknown';
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
