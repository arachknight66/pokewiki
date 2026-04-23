import axios from 'axios';

const pokeApiClient = axios.create({
  baseURL: 'https://pokeapi.co/api/v2/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default pokeApiClient;
