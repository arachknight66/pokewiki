/**
 * Custom React Hooks
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { User, Pokemon, Team, ForumThread, Tournament } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import { signIn, signOut, useSession } from 'next-auth/react';
import { 
  getEvolutionChain, 
  getPokemonLocationEncounters, 
  getMoveDetail, 
  getAbilityDetail, 
  getPokemonThatLearnMove, 
  getPokemonByAbility, 
  getItemDetail, 
  getItemList, 
  getPokemonEvolvingWithItem 
} from '@/lib/api/pokeApi';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export function useAuth() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const isLoading = status === 'loading';

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid email or password');
        throw new Error('Invalid credentials');
      }
      return true;
    } catch (err: any) {
      setError('Login failed. Check your credentials.');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    // NextAuth handles token refresh automatically through the session provider if configured
    return true;
  }, []);

  const user = session?.user ? {
    id: (session.user as any).id,
    email: session.user.email,
    username: session.user.name || 'Trainer',
    // Add stub properties that might be expected by the UI for now
    preferences: { theme: 'light', notifications: true },
    avatarUrl: (session.user as any).image || null,
    createdAt: new Date().toISOString(),
  } : null;

  return { user, isLoading, error, login, logout, refreshAccessToken };
}


// ============================================================================
// POKÉMON HOOKS
// ============================================================================

export function usePokemon(id: number) {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: async () => {
      const response = await axios.get(`/api/pokemon/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function usePokemonList({
  page = 1,
  pageSize = 20,
  search = '',
  type1 = '',
  generation = 0,
  sortBy = 'id',
} = {}) {
  return useQuery({
    queryKey: ['pokemon-list', { page, pageSize, search, type1, generation, sortBy }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(search && { search }),
        ...(type1 && { type1 }),
        ...(generation && { generation: generation.toString() }),
        sortBy,
      });

      const response = await axios.get(`/api/pokemon?${params}`);
      return response.data;
    },
  });
}

// ============================================================================
// TEAM HOOKS
// ============================================================================

export function useTeams({
  page = 1,
  pageSize = 20,
  sortBy = 'created',
  sortOrder = 'desc',
} = {}) {
  return useQuery({
    queryKey: ['teams', { page, pageSize, sortBy, sortOrder }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy,
        sortOrder,
      });

      const response = await axios.get(`/api/teams?${params}`);
      return response.data;
    },
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      const response = await axios.get(`/api/teams/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTeam() {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`/api/teams`, data);
      return response.data.data;
    },
  });
}

// ============================================================================
// FORUM HOOKS
// ============================================================================

export function useForumThreads({
  page = 1,
  pageSize = 20,
  category = '',
} = {}) {
  return useQuery({
    queryKey: ['forum-threads', { page, pageSize, category }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...(category && { category }),
      });

      const response = await axios.get(`/api/forum/threads?${params}`);
      return response.data;
    },
  });
}

export function useForumThread(id: string) {
  return useQuery({
    queryKey: ['forum-thread', id],
    queryFn: async () => {
      const response = await axios.get(`/api/forum/threads/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
}

// ============================================================================
// LOCAL STORAGE HOOKS
// ============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('LocalStorage read error:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('LocalStorage write error:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// AUDIO & PHASE 2 HOOKS
// ============================================================================

let globalAudio: HTMLAudioElement | null = null;
let globalSetPlayingId: ((id: number | null) => void) | null = null;

export function useAudioPlayer() {
  const [playingId, setPlayingId] = useState<number | null>(null);

  useEffect(() => {
    globalSetPlayingId = setPlayingId;
    return () => {
      if (globalSetPlayingId === setPlayingId) {
        globalSetPlayingId = null;
      }
    };
  }, []);

  const playCry = (id: number, url: string) => {
    try {
      if (globalAudio) {
        globalAudio.pause();
        globalAudio = null;
      }
      
      if (playingId === id) {
        if (globalSetPlayingId) globalSetPlayingId(null);
        return;
      }

      const audio = new Audio(url);
      globalAudio = audio;
      if (globalSetPlayingId) globalSetPlayingId(id);

      audio.play().catch((err) => {
        console.warn('Audio play failed:', err);
        if (globalSetPlayingId) globalSetPlayingId(null);
      });

      audio.onended = () => {
        if (globalAudio === audio) {
          globalAudio = null;
          if (globalSetPlayingId) globalSetPlayingId(null);
        }
      };

      audio.onerror = () => {
        if (globalAudio === audio) {
          globalAudio = null;
          if (globalSetPlayingId) globalSetPlayingId(null);
        }
      };
    } catch (e) {
      console.warn('Cry player setup error:', e);
      if (globalSetPlayingId) globalSetPlayingId(null);
    }
  };

  return { playingId, playCry };
}

export function useEvolutionChain(url: string) {
  return useQuery({
    queryKey: ['evolution-chain', url],
    queryFn: () => getEvolutionChain(url),
    enabled: !!url,
  });
}

export function usePokemonLocationEncounters(id: number) {
  return useQuery({
    queryKey: ['pokemon-encounters', id],
    queryFn: () => getPokemonLocationEncounters(id),
    enabled: !!id,
  });
}

export function useMoveDetail(name: string) {
  return useQuery({
    queryKey: ['move-detail', name],
    queryFn: () => getMoveDetail(name),
    enabled: !!name,
  });
}

export function useAbilityDetail(nameOrId: string | number) {
  return useQuery({
    queryKey: ['ability-detail', nameOrId],
    queryFn: () => getAbilityDetail(nameOrId),
    enabled: !!nameOrId,
  });
}

export function usePokemonThatLearnMove(moveName: string) {
  return useQuery({
    queryKey: ['pokemon-by-move', moveName],
    queryFn: () => getPokemonThatLearnMove(moveName),
    enabled: !!moveName,
  });
}

export function usePokemonByAbility(abilityName: string) {
  return useQuery({
    queryKey: ['pokemon-by-ability', abilityName],
    queryFn: () => getPokemonByAbility(abilityName),
    enabled: !!abilityName,
  });
}

export function useItemDetail(nameOrId: string | number) {
  return useQuery({
    queryKey: ['item-detail', nameOrId],
    queryFn: () => getItemDetail(nameOrId),
    enabled: !!nameOrId,
  });
}

export function useItemList({ page = 1, pageSize = 20 } = {}) {
  return useQuery({
    queryKey: ['item-list', { page, pageSize }],
    queryFn: () => getItemList(pageSize, (page - 1) * pageSize),
  });
}

export function usePokemonEvolvingWithItem(itemName: string) {
  return useQuery({
    queryKey: ['pokemon-evolving-with-item', itemName],
    queryFn: () => getPokemonEvolvingWithItem(itemName),
    enabled: !!itemName,
  });
}

