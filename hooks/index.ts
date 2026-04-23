/**
 * Custom React Hooks
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { User, Pokemon, Team, ForumThread, Tournament } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setUser(response.data.data);
          setError(null);
        }
      } catch (err) {
        // Token invalid or expired — clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        setUser(userData);
        return response.data.data;
      }
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout').catch(() => {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post('/api/auth/refresh', {
        refreshToken,
      });

      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return true;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
    return false;
  }, []);

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
      const response = await axios.post(`/api/teams`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
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
