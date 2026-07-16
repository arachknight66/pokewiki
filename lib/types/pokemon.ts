export interface PokemonType {
  slot: number;
  type: { name: string; url: string; };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string; };
}

export interface PokemonAbility {
  ability: { name: string; url: string; };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonSprites {
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny: string;
    };
    showdown: {
      front_default: string;
      front_shiny: string;
    };
    home: {
      front_default: string;
      front_shiny: string;
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  height: number;
  weight: number;
  base_experience: number;
}

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface NamedAPIResourceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedAPIResource[];
}

export interface Generation {
  id: number;
  name: string;
  main_region: NamedAPIResource;
  pokemon_species: NamedAPIResource[];
}

export interface EvolutionChainResponse {
  chain: EvolutionChain;
}

export interface EvolutionChain {
  species: NamedAPIResource;
  evolves_to: EvolutionChain[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain: { url: string; };
  flavor_text_entries: { flavor_text: string; language: NamedAPIResource; version: NamedAPIResource; }[];
  genera: { genus: string; language: NamedAPIResource; }[];
  color: NamedAPIResource;
  generation: NamedAPIResource;
  egg_groups: NamedAPIResource[];
  gender_rate: number;
  hatch_counter: number;
}

export interface EvolutionDetail {
  trigger: NamedAPIResource;
  item: NamedAPIResource | null;
  min_level: number | null;
  gender: number | null;
  held_item: NamedAPIResource | null;
  time_of_day: string;
  known_move: NamedAPIResource | null;
  known_move_type: NamedAPIResource | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  relative_physical_stats: number | null;
  location: NamedAPIResource | null;
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
}

export interface EvolutionNode {
  species: NamedAPIResource;
  evolution_details?: EvolutionDetail[];
  evolves_to: EvolutionNode[];
}

export interface LocationEncounter {
  location_area: NamedAPIResource;
  version_details: {
    max_chance: number;
    encounter_details: {
      min_level: number;
      max_level: number;
      chance: number;
      method: NamedAPIResource;
    }[];
    version: NamedAPIResource;
  }[];
}

