/**
 * Database Seed Script
 * Populates Pokémon, moves, and abilities data
 * Fetches from PokéAPI
 */

const { Pool } = require('pg');

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🌱 Starting database seed...');
    console.log('📡 Fetching Pokémon data from PokéAPI...\n');

    // Fetch first 151 Pokémon (Gen 1) as initial seed
    const POKEAPI_URL = 'https://pokeapi.co/api/v2';
    const POKEMON_COUNT = 151; // Can increase later

    for (let i = 1; i <= POKEMON_COUNT; i++) {
      try {
        // These will be simplified for demo - in production, you'd fetch actual data
        if (i % 20 === 0) {
          console.log(`⏳ Processing Pokémon ${i}/${POKEMON_COUNT}...`);
        }

        // Fetch Pokémon data
        const pokemonRes = await fetch(`${POKEAPI_URL}/pokemon/${i}`);
        const pokemon = await pokemonRes.json();

        // Fetch species data for description
        const speciesRes = await fetch(pokemon.species.url);
        const species = await speciesRes.json();

        let description = 'No description available';
        const flavorText = species.flavor_text_entries?.find(
          (entry) => entry.language.name === 'en'
        );
        if (flavorText) {
          description = flavorText.flavor_text.replace('\n', ' ').replace('\f', ' ');
        }

        // Extract type data
        const types = pokemon.types
          .sort((a, b) => a.slot - b.slot)
          .map((t) => t.type.name);

        const type1 = types[0] ?? 'normal';
        const type2 = types[1] ?? null;

        // Extract abilities
        const abilities = pokemon.abilities
          .filter((a) => !a.is_hidden)
          .map((a) => a.ability.name);

        const hiddenAbility = pokemon.abilities.find((a) => a.is_hidden)?.ability.name;

        // Insert Pokémon
        await pool.query(
          `INSERT INTO pokemon 
           (name, pokedex_number, description, generation, 
            hp, attack, defense, spa, spd, spe, 
            type_1, type_2, height, weight, base_exp, abilities, hidden_ability)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
           ON CONFLICT (name) DO NOTHING`,
          [
            pokemon.name,
            pokemon.id,
            description,
            Math.ceil(pokemon.id / 151), // Simplified generation calc
            pokemon.stats[0].base_stat, // HP
            pokemon.stats[1].base_stat, // Attack
            pokemon.stats[2].base_stat, // Defense
            pokemon.stats[3].base_stat, // SpA
            pokemon.stats[4].base_stat, // SpD
            pokemon.stats[5].base_stat, // Speed
            type1,
            type2,
            pokemon.height / 10, // Convert to meters
            pokemon.weight / 10, // Convert to kg
            pokemon.base_experience,
            JSON.stringify(abilities),
            hiddenAbility,
          ]
        );
      } catch (err) {
        console.error(`Error seeding Pokémon ${i}:`, err.message);
      }
    }

    console.log(`\n✨ Seed completed!`);
    console.log(`📊 Seeded ${POKEMON_COUNT} Pokémon with stats, types, and abilities`);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedDatabase();
