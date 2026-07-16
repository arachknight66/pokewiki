'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Pokemon, PokemonType } from '@/lib/types';
import { checkTypeSynergy, TYPE_MATCHUPS, TYPE_COLORS } from '@/lib/type-system';
import { usePrefersReducedMotion } from '@/hooks';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';

interface GraphNode {
  id: string;
  name: string;
  sprite: string;
  type1: PokemonType;
  type2?: PokemonType;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  isSynergistic: boolean;
  score: number;
  description: string;
}

interface SynergyGraphProps {
  pokemonList: Pokemon[];
}

function getEffectiveness(attacker: PokemonType, defender: PokemonType): number {
  const chartDefender = TYPE_MATCHUPS[defender];
  if (chartDefender.immune?.includes(attacker)) return 0;
  if (chartDefender.resistance?.includes(attacker)) return 0.5;
  if (chartDefender.weak?.includes(attacker)) return 2;
  return 1;
}

function getPokemonWeaknesses(pokemon: Pokemon): PokemonType[] {
  const types = [pokemon.type1, pokemon.type2].filter(Boolean) as PokemonType[];
  const weaknesses: PokemonType[] = [];
  const ALL_TYPES = Object.keys(TYPE_MATCHUPS) as PokemonType[];

  for (const attackingType of ALL_TYPES) {
    let multiplier = 1;
    for (const t of types) {
      multiplier *= getEffectiveness(attackingType, t);
    }
    if (multiplier > 1) {
      weaknesses.push(attackingType);
    }
  }
  return weaknesses;
}

export default function SynergyGraph({ pokemonList }: SynergyGraphProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeLink, setActiveLink] = useState<GraphLink | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const width = 300;
  const height = 260;
  const centerX = width / 2;
  const centerY = height / 2;

  // Initialize and run the D3 simulation
  useEffect(() => {
    if (pokemonList.length < 2) {
      setNodes([]);
      setLinks([]);
      return;
    }

    // Create copy to prevent mutating props directly
    const initialNodes: GraphNode[] = pokemonList.map((p, idx) => {
      const angle = (idx / pokemonList.length) * 2 * Math.PI - Math.PI / 2;
      const radius = 65;
      return {
        id: p.id.toString(),
        name: p.name,
        sprite: p.sprites?.officialArtwork || '',
        type1: p.type1,
        type2: p.type2,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    // Create links between all pairs
    const initialLinks: GraphLink[] = [];
    for (let i = 0; i < pokemonList.length - 1; i++) {
      for (let j = i + 1; j < pokemonList.length; j++) {
        const p1 = pokemonList[i];
        const p2 = pokemonList[j];

        const synergy = checkTypeSynergy(p1.type1, p2.type1);
        const w1 = getPokemonWeaknesses(p1);
        const w2 = getPokemonWeaknesses(p2);
        const overlaps = w1.filter(w => w2.includes(w));

        const details: string[] = [];

        // Resistances / Immunities covering weaknesses
        const chart1 = TYPE_MATCHUPS[p1.type1];
        const chart2 = TYPE_MATCHUPS[p2.type1];

        w2.forEach(w => {
          if (chart1.resistance?.includes(w) || chart1.immune?.includes(w)) {
            details.push(`${p1.name} resists ${w} (p2 weakness)`);
          }
        });
        w1.forEach(w => {
          if (chart2.resistance?.includes(w) || chart2.immune?.includes(w)) {
            details.push(`${p2.name} resists ${w} (p1 weakness)`);
          }
        });

        // Cover weakness
        w2.forEach(w => {
          if (chart1.effective?.includes(w)) {
            details.push(`${p1.name} covers weakness to ${w}`);
          }
        });
        w1.forEach(w => {
          if (chart2.effective?.includes(w)) {
            details.push(`${p2.name} covers weakness to ${w}`);
          }
        });

        // Shared weakness warning
        if (overlaps.length > 0) {
          details.push(`Shared weakness: ${overlaps.join(', ')}`);
        }

        const relationText = details.length > 0 
          ? details.join(', ') 
          : `Neutral matchups between ${p1.name} and ${p2.name}`;

        initialLinks.push({
          source: p1.id.toString(),
          target: p2.id.toString(),
          isSynergistic: synergy.isSynergistic,
          score: synergy.score,
          description: relationText,
        });
      }
    }

    if (prefersReducedMotion) {
      setNodes(initialNodes);
      setLinks(initialLinks);
      return;
    }

    // Configure simulation
    const simulation = forceSimulation<GraphNode>(initialNodes)
      .force('link', forceLink<GraphNode, any>(initialLinks).id(d => d.id).distance(100))
      .force('charge', forceManyBody().strength(-140))
      .force('center', forceCenter(centerX, centerY))
      .alphaDecay(0.06);

    let animFrameId: number;
    const updateState = () => {
      setNodes([...initialNodes]);
      setLinks([...initialLinks]);
    };

    simulation.on('tick', () => {
      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(updateState);
    });

    return () => {
      simulation.stop();
      cancelAnimationFrame(animFrameId);
    };
  }, [pokemonList, prefersReducedMotion, centerX, centerY]);

  if (pokemonList.length < 2) {
    return null;
  }

  // Helper to find node coordinate resolved during D3 ticking
  const getNodeCoords = (id: string | GraphNode): { x: number; y: number } => {
    if (typeof id === 'object') {
      return { x: id.x ?? 0, y: id.y ?? 0 };
    }
    const node = nodes.find(n => n.id === id);
    return { x: node?.x ?? 0, y: node?.y ?? 0 };
  };

  const handleLinkHover = (link: GraphLink, event: React.MouseEvent) => {
    setActiveLink(link);
    const coords1 = getNodeCoords(link.source);
    const coords2 = getNodeCoords(link.target);
    // Position tooltip at the center point of the edge
    setTooltipPos({
      x: (coords1.x + coords2.x) / 2,
      y: (coords1.y + coords2.y) / 2,
    });
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden flex flex-col items-center select-none mb-6">
      
      {/* Screen Reader visually hidden text representation */}
      <span className="sr-only">
        <h4>Team Defensive Synergy Graph</h4>
        <p>Selected team members are interconnected with lines highlighting their synergies and weakness overlaps:</p>
        <ul>
          {links.map((link, idx) => (
            <li key={idx}>{link.description}</li>
          ))}
        </ul>
      </span>

      {/* SVG Canvas layer for edges */}
      <svg className="w-full" height={height} viewBox={`0 0 ${width} ${height}`}>
        {links.map((link, idx) => {
          const s = getNodeCoords(link.source);
          const t = getNodeCoords(link.target);
          
          const sId = typeof link.source === 'object' ? link.source.id : link.source;
          const tId = typeof link.target === 'object' ? link.target.id : link.target;

          // Weakness overlap is flagged if descriptions contain "Shared weakness"
          const hasOverlap = link.description.includes('Shared weakness');
          const isSynergistic = link.isSynergistic;

          // Define color/style
          let strokeColor = 'rgba(150, 150, 150, 0.2)'; // neutral default
          let isDashed = false;
          let strokeWidth = 1.5;

          if (hasOverlap) {
            strokeColor = '#ef4444'; // Red for shared weakness overlap
            isDashed = true;
            strokeWidth = 3;
          } else if (isSynergistic) {
            strokeColor = '#10b981'; // Green for resistance coverage
            strokeWidth = 3;
          }

          // Dim edge if another node is hovered and this edge is not connected to it
          const isDimmed = hoveredNodeId && sId !== hoveredNodeId && tId !== hoveredNodeId;

          return (
            <g key={idx}>
              {/* Visible rendered line */}
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isDashed ? '6,4' : 'none'}
                className="transition-all duration-300"
                style={{ opacity: isDimmed ? 0.08 : 0.85 }}
              />
              {/* Large invisible interactive line to make hovering easy */}
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="transparent"
                strokeWidth={14}
                className="cursor-pointer"
                onMouseEnter={(e) => handleLinkHover(link, e)}
                onMouseLeave={() => { setActiveLink(null); setTooltipPos(null); }}
                onClick={(e) => handleLinkHover(link, e)}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes layer (Circular sprites absolute positioned relative to center) */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map((node) => {
          const x = node.x ?? 0;
          const y = node.y ?? 0;
          const isHovered = hoveredNodeId === node.id;
          const typeColor = TYPE_COLORS[node.type1] || '#ccc';

          return (
            <div
              key={node.id}
              className="absolute pointer-events-auto transition-transform duration-300"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.18 : 1})`,
                zIndex: isHovered ? 20 : 10,
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Thumbnail Container */}
              <div
                className="w-12 h-12 rounded-full border-4 flex items-center justify-center bg-white dark:bg-[var(--bg-secondary)] shadow-md transition-all relative overflow-hidden"
                style={{
                  borderColor: isHovered ? 'var(--text-primary)' : typeColor,
                  boxShadow: `0 4px 10px ${typeColor}44`,
                }}
              >
                {node.sprite ? (
                  <Image
                    src={node.sprite}
                    alt={node.name}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full select-none"
                    unoptimized
                  />
                ) : (
                  <span className="text-[10px] font-black">{node.name.substring(0, 3)}</span>
                )}
              </div>
              
              {/* Mini Label badge */}
              <div 
                className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border shadow-sm select-none"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: typeColor,
                  color: 'var(--text-primary)',
                }}
              >
                {node.name.length > 7 ? `${node.name.substring(0, 6)}.` : node.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Midpoint floating edge Relationship Tooltip */}
      {activeLink && tooltipPos && (
        <div
          className="absolute z-30 p-3 rounded-xl border-4 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] text-[10px] font-bold max-w-[200px] pointer-events-none transition-all duration-200"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%) translateY(-12px)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="text-[9px] uppercase font-black tracking-wider text-[var(--accent-secondary)] mb-1">
            {activeLink.isSynergistic ? '🔋 Type Synergy' : activeLink.description.includes('Shared weakness') ? '⚠️ Shared Weakness' : '⚔️ Pair Matchup'}
          </div>
          <p className="leading-tight capitalize text-[10px]">{activeLink.description}</p>
        </div>
      )}
    </div>
  );
}
