/**
 * Items Listing Page
 */
'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getItemList } from '@/lib/api/pokeApi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PokeballLoader from '@/components/ui/PokeballLoader';
import Link from 'next/link';
import Image from 'next/image';

const ITEMS_PER_PAGE = 24;

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Fetch the full list of items for client-side search (highly performant alternative)
  const { data, isLoading, error } = useQuery({
    queryKey: ['all-items-catalog'],
    queryFn: () => getItemList(2100, 0),
    staleTime: 1000 * 60 * 10 // Cache for 10 minutes
  });

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((item: any) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase().trim().replace(/ /g, '-'))
    );
  }, [data, searchTerm]);

  // Paginated chunk
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, page]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on search
  };

  if (isLoading) {
    return <PokeballLoader message="Cataloging item inventory..." />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 stagger-children">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-black font-display flex items-center gap-2">
          <span style={{ color: 'var(--accent-gold)' }}>⬣</span> Items Database
        </h1>
        <p className="text-xs font-extrabold uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
          Explore evolution stones, held items, battle items, and gear
        </p>
      </div>

      {/* Search Input bar */}
      <div className="auth-input-wrapper relative w-full max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search items... (e.g. fire stone, poke ball)"
          className="auth-input shadow-inner !pl-10 text-sm"
        />
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
        <div className="auth-input-glow" />
      </div>

      {error ? (
        <Card className="text-center py-10">
          <p className="text-lg font-bold">Failed to load item inventory.</p>
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="text-center py-16">
          <p className="text-lg font-extrabold" style={{ color: 'var(--text-secondary)' }}>No items found matching &quot;{searchTerm}&quot;</p>
        </Card>
      ) : (
        <>
          {/* Grid of Item cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {paginatedItems.map((item: any) => {
              const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`;
              
              return (
                <Link key={item.name} href={`/items/${item.name}`}>
                  <div
                    className="group flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 cursor-pointer select-none text-center h-full justify-between"
                    style={{
                      background: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      boxShadow: '4px 4px 0px var(--text-primary)'
                    }}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-white/5 dark:bg-black/20 rounded-full border border-[var(--border-color)] group-hover:scale-110 transition-transform">
                      <Image
                        src={spriteUrl}
                        alt={item.name}
                        width={30}
                        height={30}
                        className="object-contain"
                        onError={(e) => {
                          // Fallback to backpack emoji if sprite 404s
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            const emoji = document.createElement('span');
                            emoji.textContent = '🎒';
                            emoji.style.fontSize = '20px';
                            parent.appendChild(emoji);
                          }
                        }}
                        unoptimized
                      />
                    </div>
                    
                    <div className="mt-3">
                      <p className="font-extrabold capitalize text-xs line-clamp-2 leading-tight">
                        {item.name.replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
              >
                ◀ Prev
              </Button>
              <span className="text-xs font-black">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
              >
                Next ▶
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
