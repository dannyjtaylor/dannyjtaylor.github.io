import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Cookie Clicker — Full implementation inspired by Orteil's game
   ═══════════════════════════════════════════════════════════════════ */

// ─── Inline SVG Icon Component ───
function CookieIcon({ name, size = 18 }: { name: string; size?: number }) {
  const s = size;
  const icons: Record<string, JSX.Element> = {
    // Building icons
    cursor: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M7 2l10 12h-5l3 8-3 1-3-8-4 3z" fill="#e0c080" stroke="#7a5a2a" strokeWidth="1"/>
      </svg>
    ),
    grandma: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="10" r="7" fill="#f0d0a0" stroke="#8a6a3a" strokeWidth="1"/>
        <circle cx="9.5" cy="9" r="1.2" fill="#4a3a2a"/>
        <circle cx="14.5" cy="9" r="1.2" fill="#4a3a2a"/>
        <path d="M9 13q3 2 6 0" stroke="#8a5a3a" strokeWidth="1" fill="none"/>
        <path d="M5 6q2-4 7-4t7 4" stroke="#c0c0c0" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <circle cx="9.5" cy="9" r="2.5" fill="none" stroke="#8ab" strokeWidth="0.7"/>
        <circle cx="14.5" cy="9" r="2.5" fill="none" stroke="#8ab" strokeWidth="0.7"/>
      </svg>
    ),
    farm: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 20h16" stroke="#8a6a3a" strokeWidth="2"/>
        <path d="M8 20V8l-3 4" stroke="#6a8a3a" strokeWidth="1.5"/>
        <path d="M8 8l3 4" stroke="#6a8a3a" strokeWidth="1.5"/>
        <path d="M8 10l-2 2M8 10l2 2" stroke="#8aaa4a" strokeWidth="1"/>
        <path d="M16 20V8l-3 4" stroke="#6a8a3a" strokeWidth="1.5"/>
        <path d="M16 8l3 4" stroke="#6a8a3a" strokeWidth="1.5"/>
        <path d="M16 10l-2 2M16 10l2 2" stroke="#8aaa4a" strokeWidth="1"/>
      </svg>
    ),
    mine: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M14 4l6 6-2 2-6-6z" fill="#888" stroke="#555" strokeWidth="1"/>
        <path d="M4 20l10-10" stroke="#8a6a3a" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    factory: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="10" width="20" height="12" fill="#888" stroke="#555" strokeWidth="1"/>
        <rect x="4" y="4" width="4" height="8" fill="#999" stroke="#555" strokeWidth="1"/>
        <rect x="10" y="6" width="4" height="6" fill="#999" stroke="#555" strokeWidth="1"/>
        <rect x="5" y="14" width="3" height="3" fill="#ffa" stroke="#555" strokeWidth="0.5"/>
        <rect x="11" y="14" width="3" height="3" fill="#ffa" stroke="#555" strokeWidth="0.5"/>
        <rect x="16" y="14" width="3" height="3" fill="#ffa" stroke="#555" strokeWidth="0.5"/>
        <path d="M6 4v-2M12 6v-2" stroke="#777" strokeWidth="1.5"/>
      </svg>
    ),
    bank: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l10 6H2z" fill="#c8a860" stroke="#8a6a3a" strokeWidth="1"/>
        <rect x="2" y="8" width="20" height="2" fill="#dab870"/>
        <rect x="4" y="10" width="2" height="8" fill="#c8a860"/>
        <rect x="9" y="10" width="2" height="8" fill="#c8a860"/>
        <rect x="13" y="10" width="2" height="8" fill="#c8a860"/>
        <rect x="18" y="10" width="2" height="8" fill="#c8a860"/>
        <rect x="2" y="18" width="20" height="3" fill="#dab870" stroke="#8a6a3a" strokeWidth="0.5"/>
      </svg>
    ),
    temple: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l9 7H3z" fill="#d4a848" stroke="#8a6a2a" strokeWidth="1"/>
        <rect x="3" y="9" width="18" height="2" fill="#e0b858"/>
        <rect x="5" y="11" width="2" height="7" fill="#d4a848"/>
        <rect x="11" y="11" width="2" height="7" fill="#d4a848"/>
        <rect x="17" y="11" width="2" height="7" fill="#d4a848"/>
        <rect x="3" y="18" width="18" height="3" fill="#e0b858"/>
        <circle cx="12" cy="5.5" r="1.5" fill="#fff8" stroke="#8a6a2a" strokeWidth="0.5"/>
      </svg>
    ),
    wizard: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 1l4 12H8z" fill="#6a5acd" stroke="#4a3a8d" strokeWidth="1"/>
        <circle cx="12" cy="7" r="1.5" fill="#ffd700"/>
        <rect x="7" y="13" width="10" height="2" fill="#6a5acd" rx="1"/>
        <circle cx="12" cy="19" r="4" fill="#f0d0a0" stroke="#8a6a3a" strokeWidth="0.7"/>
        <circle cx="10.5" cy="18.5" r="0.8" fill="#4a3a2a"/>
        <circle cx="13.5" cy="18.5" r="0.8" fill="#4a3a2a"/>
      </svg>
    ),
    shipment: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3 8h-6z" fill="#c0c0c0" stroke="#888" strokeWidth="1"/>
        <rect x="10" y="10" width="4" height="10" fill="#c0c0c0" stroke="#888" strokeWidth="1"/>
        <path d="M8 20l-4 2M16 20l4 2" stroke="#f80" strokeWidth="2"/>
        <path d="M10 20l-3 2M14 20l3 2" stroke="#fa0" strokeWidth="1.5"/>
      </svg>
    ),
    alchemy: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M9 3h6v6l4 10H5l4-10z" fill="#a0d8a0" stroke="#5a8a5a" strokeWidth="1"/>
        <rect x="9" y="2" width="6" height="2" fill="#888" stroke="#555" strokeWidth="0.5"/>
        <circle cx="10" cy="15" r="1" fill="#60a060"/>
        <circle cx="14" cy="16" r="1.5" fill="#50b050"/>
        <circle cx="12" cy="13" r="0.8" fill="#70c070"/>
      </svg>
    ),
    portal: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#a060d0" strokeWidth="2"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="#c080f0" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#d0a0ff" stroke="#a060d0" strokeWidth="1"/>
        <path d="M12 3c3 3 3 6 0 9s-3 6 0 9" fill="none" stroke="#c080f0" strokeWidth="0.8"/>
      </svg>
    ),
    timemachine: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M9 2h6l-1 8h-4z" fill="#d4a848" stroke="#8a6a2a" strokeWidth="1"/>
        <path d="M9 22h6l-1-8h-4z" fill="#d4a848" stroke="#8a6a2a" strokeWidth="1"/>
        <circle cx="12" cy="12" r="3" fill="#f0e0a0" stroke="#8a6a2a" strokeWidth="1"/>
        <circle cx="12" cy="12" r="1" fill="#d4a848"/>
      </svg>
    ),
    antimatter: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="#60a0e0" stroke="#4080c0" strokeWidth="1"/>
        <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="#60a0e0" strokeWidth="1" transform="rotate(0 12 12)"/>
        <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="#60a0e0" strokeWidth="1" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="9" ry="4" fill="none" stroke="#60a0e0" strokeWidth="1" transform="rotate(120 12 12)"/>
      </svg>
    ),
    prism: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" fill="url(#prismGrad)" stroke="#a080d0" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" fill="#e0d0ff" opacity="0.5"/>
        <circle cx="10" cy="10" r="2" fill="#fff" opacity="0.3"/>
        <defs><radialGradient id="prismGrad"><stop offset="0%" stopColor="#e0c0ff"/><stop offset="100%" stopColor="#8060b0"/></radialGradient></defs>
      </svg>
    ),
    chancemaker: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#c8a860" stroke="#8a6a3a" strokeWidth="1"/>
        <rect x="6" y="7" width="4" height="6" rx="1" fill="#f0e0a0" stroke="#8a6a3a" strokeWidth="0.5"/>
        <rect x="12" y="7" width="4" height="6" rx="1" fill="#f0e0a0" stroke="#8a6a3a" strokeWidth="0.5"/>
        <text x="7" y="12" fontSize="5" fill="#8a6a3a" fontWeight="bold">7</text>
        <text x="13" y="12" fontSize="5" fill="#8a6a3a" fontWeight="bold">7</text>
        <rect x="8" y="16" width="8" height="2" rx="1" fill="#d4a848"/>
      </svg>
    ),
    fractal: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 4l2 4-2 4-2-4z" fill="#80c0a0" stroke="#408060" strokeWidth="0.7"/>
        <path d="M6 12l4 2-4 2-2-2z" fill="#80c0a0" stroke="#408060" strokeWidth="0.7"/>
        <path d="M18 12l-4 2 4 2 2-2z" fill="#80c0a0" stroke="#408060" strokeWidth="0.7"/>
        <path d="M12 16l2 4-2 2-2-2z" fill="#80c0a0" stroke="#408060" strokeWidth="0.7"/>
        <circle cx="12" cy="12" r="2" fill="#60a080" stroke="#408060" strokeWidth="0.7"/>
      </svg>
    ),
    // Common icons
    cookie: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#c89632" stroke="#7a5a2a" strokeWidth="1"/>
        <circle cx="8" cy="9" r="1.5" fill="#5a3a1a"/>
        <circle cx="14" cy="8" r="1.2" fill="#5a3a1a"/>
        <circle cx="10" cy="14" r="1.3" fill="#5a3a1a"/>
        <circle cx="16" cy="13" r="1.1" fill="#5a3a1a"/>
        <circle cx="12" cy="17" r="1" fill="#5a3a1a"/>
      </svg>
    ),
    timer: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="13" r="9" fill="none" stroke="#c0a060" strokeWidth="1.5"/>
        <path d="M12 7v6l4 3" stroke="#c0a060" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="10" y="2" width="4" height="2" rx="1" fill="#c0a060"/>
      </svg>
    ),
    star: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" fill="#ffd700" stroke="#c8a000" strokeWidth="0.7"/>
      </svg>
    ),
    uparrow: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 8h-4v10h-6V11H5z" fill="#60c060" stroke="#408040" strokeWidth="1"/>
      </svg>
    ),
    runner: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="14" cy="4" r="2.5" fill="#e0c080" stroke="#8a6a3a" strokeWidth="0.7"/>
        <path d="M10 9l4-1 3 4-2 1-2-2-2 5 4 3v3h-2v-2l-4-3v-2l-3 5H4l4-7z" fill="#e0c080" stroke="#8a6a3a" strokeWidth="0.7"/>
      </svg>
    ),
    nosign: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#e04040" strokeWidth="2"/>
        <path d="M6 6l12 12" stroke="#e04040" strokeWidth="2"/>
      </svg>
    ),
    building: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="18" fill="#888" stroke="#555" strokeWidth="1"/>
        <rect x="6" y="6" width="3" height="3" fill="#ffa" stroke="#555" strokeWidth="0.3"/>
        <rect x="11" y="6" width="3" height="3" fill="#ffa" stroke="#555" strokeWidth="0.3"/>
        <rect x="6" y="11" width="3" height="3" fill="#ffa" stroke="#555" strokeWidth="0.3"/>
        <rect x="11" y="11" width="3" height="3" fill="#ffa" stroke="#555" strokeWidth="0.3"/>
        <rect x="9" y="17" width="4" height="5" fill="#654" stroke="#555" strokeWidth="0.3"/>
      </svg>
    ),
    fire: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2c0 4-6 8-4 14 1 3 3 5 4 5s3-2 4-5c2-6-4-10-4-14z" fill="#f80" stroke="#c60" strokeWidth="0.7"/>
        <path d="M12 10c0 2-3 4-2 7 0.5 1.5 1.5 2.5 2 2.5s1.5-1 2-2.5c1-3-2-5-2-7z" fill="#fd0"/>
      </svg>
    ),
    snowflake: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke="#8cf" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" fill="#8cf"/>
      </svg>
    ),
    lightning: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M13 2l-5 10h5l-3 10 9-12h-6z" fill="#ffd700" stroke="#c8a000" strokeWidth="0.7"/>
      </svg>
    ),
    question: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#444" stroke="#666" strokeWidth="1"/>
        <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#999" fontWeight="bold">?</text>
      </svg>
    ),
    // Upgrade-specific icons
    finger: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2v10M10 12h4v6a2 2 0 01-4 0z" fill="#e0c080" stroke="#8a6a3a" strokeWidth="1"/>
      </svg>
    ),
    lotion: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="8" y="8" width="8" height="12" rx="2" fill="#e0e0f0" stroke="#8888aa" strokeWidth="1"/>
        <rect x="10" y="4" width="4" height="5" rx="1" fill="#ccc" stroke="#888" strokeWidth="0.5"/>
        <path d="M11 6h2v2h-2z" fill="#aaa"/>
      </svg>
    ),
    hands: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 12l4-6v12z" fill="#e0c080" stroke="#8a6a3a" strokeWidth="0.7"/>
        <path d="M20 12l-4-6v12z" fill="#e0c080" stroke="#8a6a3a" strokeWidth="0.7"/>
      </svg>
    ),
    hand: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M8 20v-8l-2-3v-4h2v4l2 2v-8h2v7l2-1V3h2v8l2-1V5h2v7l-2 4v4z" fill="#e0c080" stroke="#8a6a3a" strokeWidth="0.7"/>
      </svg>
    ),
    palm: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 20v-6l-2-4v-4h2v4l3 3V4h2v8l2-1V3h2v9l2-2V5h2v8l-3 5v2z" fill="#e0c080" stroke="#8a6a3a" strokeWidth="0.7"/>
      </svg>
    ),
    wave: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M5 14q3-6 7-6t7 6" stroke="#e0c080" strokeWidth="2" fill="none"/>
        <path d="M5 18q3-6 7-6t7 6" stroke="#e0c080" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    pointright: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 10h12l-4-4h4l6 6-6 6h-4l4-4H4z" fill="#e0c080" stroke="#8a6a3a" strokeWidth="0.7"/>
      </svg>
    ),
    email: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="1" fill="#ddd" stroke="#888" strokeWidth="1"/>
        <path d="M3 5l9 7 9-7" stroke="#888" strokeWidth="1"/>
      </svg>
    ),
    rock: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 18l2-6 4-4 5-1 5 3 1 5-3 4-6 1z" fill="#999" stroke="#666" strokeWidth="1"/>
      </svg>
    ),
    tooth: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M8 4c-2 0-4 3-4 7 0 3 2 8 4 10 1-3 2-5 4-5s3 2 4 5c2-2 4-7 4-10 0-4-2-7-4-7-1 0-2 1-4 1S10 4 8 4z" fill="#f8f8f0" stroke="#ccc" strokeWidth="1"/>
      </svg>
    ),
    juice: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="7" y="6" width="10" height="14" rx="1" fill="#f0e0a0" stroke="#8a6a3a" strokeWidth="1"/>
        <rect x="9" y="3" width="2" height="4" rx="0.5" fill="#8a6a3a"/>
        <circle cx="12" cy="13" r="3" fill="#a060a0" opacity="0.5"/>
      </svg>
    ),
    glasses: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="7" cy="12" r="4" fill="none" stroke="#555" strokeWidth="1.5"/>
        <circle cx="17" cy="12" r="4" fill="none" stroke="#555" strokeWidth="1.5"/>
        <path d="M11 12h2M3 12H2M22 12h-1" stroke="#555" strokeWidth="1.5"/>
      </svg>
    ),
    clock: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#c0a060" strokeWidth="1.5"/>
        <path d="M12 6v6l3 3" stroke="#c0a060" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    axe: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 20l10-10" stroke="#8a6a3a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 4l6 6-3 1-4-4z" fill="#aaa" stroke="#666" strokeWidth="0.7"/>
      </svg>
    ),
    poop: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M8 20c-2 0-3-2-3-3s1-2 2-2c-1-1-1-2 0-3s2-1 3-1c0-2 1-4 2-5s2-1 2 0c0-2 1-3 2-2s1 2 0 3c2 0 3 1 3 2s-1 2-1 3c1 0 2 1 2 2s-1 3-3 3z" fill="#8a6a3a" stroke="#5a3a1a" strokeWidth="0.7"/>
      </svg>
    ),
    tree: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="10" y="16" width="4" height="6" fill="#8a6a3a"/>
        <path d="M12 2l8 14H4z" fill="#4a8a3a" stroke="#2a5a1a" strokeWidth="0.7"/>
      </svg>
    ),
    dna: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M8 2c0 5 8 5 8 10s-8 5-8 10" stroke="#60a0e0" strokeWidth="1.5" fill="none"/>
        <path d="M16 2c0 5-8 5-8 10s8 5 8 10" stroke="#e06060" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    teddy: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="7" cy="6" r="3" fill="#c0906a" stroke="#8a6a3a" strokeWidth="0.7"/>
        <circle cx="17" cy="6" r="3" fill="#c0906a" stroke="#8a6a3a" strokeWidth="0.7"/>
        <circle cx="12" cy="13" r="7" fill="#c0906a" stroke="#8a6a3a" strokeWidth="0.7"/>
        <circle cx="10" cy="11" r="1" fill="#4a3a2a"/>
        <circle cx="14" cy="11" r="1" fill="#4a3a2a"/>
        <ellipse cx="12" cy="14" rx="2" ry="1.5" fill="#a07050"/>
      </svg>
    ),
    gas: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 16q2-8 6-8t4 4 2-4" stroke="#aaa" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M8 18q1-4 4-4t3 3" stroke="#ccc" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    bolt: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="#888" stroke="#555" strokeWidth="1"/>
        <circle cx="12" cy="12" r="2" fill="#aaa"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#888" strokeWidth="1.5"/>
      </svg>
    ),
    gear: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="5" fill="none" stroke="#888" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="#888"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 5l2 2" stroke="#888" strokeWidth="1.5"/>
      </svg>
    ),
    wrench: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M14 4a5 5 0 01-1 8l-7 7a2 2 0 01-3-3l7-7a5 5 0 018-1l-3 3 1 2 2 1 3-3a5 5 0 01-7-1z" fill="#888" stroke="#555" strokeWidth="0.7"/>
      </svg>
    ),
    bomb: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="14" r="8" fill="#333" stroke="#222" strokeWidth="1"/>
        <path d="M14 6l2-4" stroke="#888" strokeWidth="1.5"/>
        <circle cx="16" cy="2" r="2" fill="#f80"/>
        <circle cx="9" cy="11" r="2" fill="#555" opacity="0.5"/>
      </svg>
    ),
    chain: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <ellipse cx="9" cy="9" rx="4" ry="6" fill="none" stroke="#888" strokeWidth="2" transform="rotate(-45 9 9)"/>
        <ellipse cx="15" cy="15" rx="4" ry="6" fill="none" stroke="#888" strokeWidth="2" transform="rotate(-45 15 15)"/>
      </svg>
    ),
    baby: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="10" r="6" fill="#f0d0a0" stroke="#c0a080" strokeWidth="0.7"/>
        <circle cx="10" cy="9" r="1" fill="#4a3a2a"/>
        <circle cx="14" cy="9" r="1" fill="#4a3a2a"/>
        <path d="M10 12q2 2 4 0" stroke="#c0a080" strokeWidth="0.7" fill="none"/>
        <path d="M8 16c-1 2-1 4 0 5h8c1-1 1-3 0-5" fill="#88c0f0" stroke="#6090c0" strokeWidth="0.7"/>
      </svg>
    ),
    construction: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 20l8-16 8 16z" fill="none" stroke="#e0a020" strokeWidth="2"/>
        <rect x="4" y="18" width="16" height="3" fill="#888" stroke="#555" strokeWidth="0.5"/>
        <rect x="10" y="10" width="4" height="10" fill="#888" stroke="#555" strokeWidth="0.5"/>
      </svg>
    ),
    radioactive: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#ff0" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#ff0" opacity="0.5"/>
        <path d="M12 3v6M7 18l3-5M17 18l-3-5" stroke="#ff0" strokeWidth="2"/>
      </svg>
    ),
    robot: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="6" y="8" width="12" height="10" rx="1" fill="#aaa" stroke="#666" strokeWidth="1"/>
        <rect x="8" y="10" width="3" height="2" rx="0.5" fill="#66f"/>
        <rect x="13" y="10" width="3" height="2" rx="0.5" fill="#66f"/>
        <path d="M10 15h4" stroke="#666" strokeWidth="1"/>
        <path d="M12 4v4" stroke="#888" strokeWidth="1"/>
        <circle cx="12" cy="3" r="1.5" fill="#f00"/>
        <rect x="4" y="12" width="2" height="4" rx="0.5" fill="#aaa"/>
        <rect x="18" y="12" width="2" height="4" rx="0.5" fill="#aaa"/>
      </svg>
    ),
    chart: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="14" width="3" height="6" fill="#6090c0"/>
        <rect x="9" y="10" width="3" height="10" fill="#60c090"/>
        <rect x="14" y="6" width="3" height="14" fill="#c09060"/>
        <rect x="19" y="2" width="3" height="18" fill="#c06060"/>
        <path d="M3 20h19" stroke="#888" strokeWidth="1"/>
      </svg>
    ),
    creditcard: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="2" fill="#4060c0" stroke="#2040a0" strokeWidth="1"/>
        <rect x="2" y="9" width="20" height="3" fill="#2040a0"/>
        <rect x="4" y="15" width="8" height="2" rx="0.5" fill="#6080d0"/>
      </svg>
    ),
    lock: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="11" width="14" height="10" rx="1" fill="#c0a060" stroke="#8a6a2a" strokeWidth="1"/>
        <path d="M8 11V7a4 4 0 018 0v4" fill="none" stroke="#8a6a2a" strokeWidth="1.5"/>
        <circle cx="12" cy="16" r="1.5" fill="#5a3a1a"/>
      </svg>
    ),
    coin: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#ffd700" stroke="#c8a000" strokeWidth="1"/>
        <circle cx="12" cy="12" r="6" fill="none" stroke="#c8a000" strokeWidth="0.7"/>
        <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#8a6a00" fontWeight="bold">$</text>
      </svg>
    ),
    moai: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M8 22v-6l-1-8 2-5h6l2 5-1 8v6z" fill="#999" stroke="#666" strokeWidth="1"/>
        <rect x="9" y="8" width="2" height="2" fill="#555"/>
        <rect x="13" y="8" width="2" height="2" fill="#555"/>
        <path d="M10 13h4v2h-4z" fill="#777"/>
      </svg>
    ),
    scroll: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M6 3c-1 0-2 1-2 2v14c0 1 1 2 2 2h10l4-4V5c0-1-1-2-2-2z" fill="#f0e0c0" stroke="#8a6a3a" strokeWidth="1"/>
        <path d="M16 17v4l4-4z" fill="#d0c0a0" stroke="#8a6a3a" strokeWidth="0.5"/>
        <path d="M8 8h8M8 11h6M8 14h7" stroke="#8a6a3a" strokeWidth="0.7"/>
      </svg>
    ),
    cross: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M10 2h4v7h7v4h-7v9h-4v-9H3v-4h7z" fill="#c0a060" stroke="#8a6a2a" strokeWidth="0.7"/>
      </svg>
    ),
    tophat: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="18" rx="9" ry="3" fill="#333" stroke="#222" strokeWidth="1"/>
        <rect x="7" y="5" width="10" height="13" rx="1" fill="#333" stroke="#222" strokeWidth="1"/>
        <rect x="7" y="5" width="10" height="3" fill="#444"/>
      </svg>
    ),
    wand: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 20L18 6" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 4l4 4" stroke="#ffd700" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="19" cy="5" r="1" fill="#ffd700"/>
        <path d="M15 3l1-2M21 7l2 1M20 3l1-1" stroke="#ffd700" strokeWidth="0.7"/>
      </svg>
    ),
    eye: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="#e0c080" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#60a0e0" stroke="#4080c0" strokeWidth="0.7"/>
        <circle cx="12" cy="12" r="1.2" fill="#333"/>
      </svg>
    ),
    galaxy: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#112" stroke="#448" strokeWidth="0.5"/>
        <ellipse cx="12" cy="12" rx="8" ry="3" fill="none" stroke="#88f" strokeWidth="0.7" transform="rotate(-30 12 12)"/>
        <ellipse cx="12" cy="12" rx="6" ry="2" fill="none" stroke="#aaf" strokeWidth="0.5" transform="rotate(20 12 12)"/>
        <circle cx="12" cy="12" r="1.5" fill="#fff"/>
        <circle cx="8" cy="9" r="0.5" fill="#fff"/>
        <circle cx="16" cy="14" r="0.5" fill="#fff"/>
        <circle cx="15" cy="8" r="0.3" fill="#fff"/>
      </svg>
    ),
    hole: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#111"/>
        <circle cx="12" cy="12" r="6" fill="#000" stroke="#444" strokeWidth="0.5"/>
        <ellipse cx="12" cy="12" rx="9" ry="3" fill="none" stroke="#666" strokeWidth="1"/>
      </svg>
    ),
    plane: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M2 14l9-2 1-9 2 9 9 2-9 2-1 9-2-9z" fill="#c0c0c0" stroke="#888" strokeWidth="0.7"/>
      </svg>
    ),
    testtube: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M9 3h6v2h-1v10l3 5a1 1 0 01-1 1H8a1 1 0 01-1-1l3-5V5H9z" fill="#d0f0d0" stroke="#5a8a5a" strokeWidth="1"/>
        <path d="M10 14h4l2 4H8z" fill="#80c080" opacity="0.5"/>
      </svg>
    ),
    droplet: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3c-4 6-7 10-7 14a7 7 0 0014 0c0-4-3-8-7-14z" fill="#80c0e0" stroke="#5090b0" strokeWidth="1"/>
        <ellipse cx="10" cy="15" rx="2" ry="3" fill="#a0d8f0" opacity="0.5"/>
      </svg>
    ),
    chocolate: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#5a3a1a" stroke="#3a2010" strokeWidth="1"/>
        <path d="M4 10h16M4 16h16M10 4v16M16 4v16" stroke="#4a2a10" strokeWidth="0.7"/>
      </svg>
    ),
    clipboard: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="3" width="14" height="18" rx="1" fill="#f0e8d8" stroke="#8a6a3a" strokeWidth="1"/>
        <rect x="8" y="1" width="8" height="4" rx="1" fill="#ccc" stroke="#888" strokeWidth="0.5"/>
        <path d="M8 9h8M8 12h6M8 15h7" stroke="#8a6a3a" strokeWidth="0.7"/>
      </svg>
    ),
    dizzy: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="#f0d0a0" stroke="#c0a080" strokeWidth="1"/>
        <path d="M7 9l4 2-4 2M13 9l4 2-4 2" stroke="#8a6a3a" strokeWidth="1"/>
        <path d="M9 17q3 2 6 0" stroke="#8a6a3a" strokeWidth="1" fill="none"/>
      </svg>
    ),
    fluxcap: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M13 2l-5 10h5l-3 10 9-12h-6z" fill="#ffd700" stroke="#c8a000" strokeWidth="0.7"/>
      </svg>
    ),
    shuffle: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 8h4l4 4-4 4H3" stroke="#888" strokeWidth="1.5" fill="none"/>
        <path d="M21 8h-4l-4 4 4 4h4" stroke="#888" strokeWidth="1.5" fill="none"/>
        <path d="M7 8l10 8M17 8L7 16" stroke="#60a0e0" strokeWidth="1"/>
      </svg>
    ),
    bubbles: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="14" r="4" fill="none" stroke="#88c0e0" strokeWidth="1"/>
        <circle cx="16" cy="10" r="3" fill="none" stroke="#88c0e0" strokeWidth="1"/>
        <circle cx="12" cy="18" r="2" fill="none" stroke="#88c0e0" strokeWidth="1"/>
        <circle cx="14" cy="5" r="1.5" fill="none" stroke="#88c0e0" strokeWidth="0.7"/>
      </svg>
    ),
    gem: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 3l7 7-7 11-7-11z" fill="#60a0e0" stroke="#4080c0" strokeWidth="1"/>
        <path d="M5 10h14l-7 11z" fill="#80c0f0" opacity="0.3"/>
        <path d="M5 10l7-7 7 7" fill="#a0d8ff" opacity="0.2"/>
      </svg>
    ),
    mouse: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="6" y="3" width="12" height="18" rx="6" fill="#ddd" stroke="#888" strokeWidth="1"/>
        <path d="M12 3v8" stroke="#888" strokeWidth="1"/>
        <circle cx="12" cy="8" r="2" fill="#bbb" stroke="#888" strokeWidth="0.5"/>
      </svg>
    ),
    cat: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4 6l3 4h10l3-4v14a2 2 0 01-2 2H6a2 2 0 01-2-2z" fill="#f0c080" stroke="#c09050" strokeWidth="1"/>
        <circle cx="9" cy="12" r="1.5" fill="#4a3a2a"/>
        <circle cx="15" cy="12" r="1.5" fill="#4a3a2a"/>
        <path d="M11 14l1 1 1-1" stroke="#c09050" strokeWidth="0.7"/>
        <path d="M8 16q4 2 8 0" stroke="#c09050" strokeWidth="0.5" fill="none"/>
      </svg>
    ),
  };

  const icon = icons[name];
  if (!icon) return <span style={{ fontSize: s }}>{'?'}</span>;
  return icon;
}

// ─── Building Definitions ───
interface BuildingDef {
  id: string;
  name: string;
  baseCost: number;
  baseCps: number;
  description: string;
  icon: string;
}

const BUILDINGS: BuildingDef[] = [
  { id: 'cursor',     name: 'Cursor',              baseCost: 15,           baseCps: 0.1,    description: 'Autoclicks once every 10 seconds.',                       icon: 'cursor' },
  { id: 'grandma',    name: 'Grandma',             baseCost: 100,          baseCps: 1,      description: 'A nice grandma to bake more cookies.',                    icon: 'grandma' },
  { id: 'farm',       name: 'Farm',                baseCost: 1100,         baseCps: 8,      description: 'Grows cookie plants from cookie seeds.',                  icon: 'farm' },
  { id: 'mine',       name: 'Mine',                baseCost: 12000,        baseCps: 47,     description: 'Mines out cookie dough and chocolate chips.',              icon: 'mine' },
  { id: 'factory',    name: 'Factory',             baseCost: 130000,       baseCps: 260,    description: 'Produces large quantities of cookies.',                   icon: 'factory' },
  { id: 'bank',       name: 'Bank',                baseCost: 1400000,      baseCps: 1400,   description: 'Generates cookies from interest.',                        icon: 'bank' },
  { id: 'temple',     name: 'Temple',              baseCost: 20000000,     baseCps: 7800,   description: 'Full of ancient cookie recipes.',                         icon: 'temple' },
  { id: 'wizard',     name: 'Wizard Tower',        baseCost: 330000000,    baseCps: 44000,  description: 'Summons cookies with magic spells.',                      icon: 'wizard' },
  { id: 'shipment',   name: 'Shipment',            baseCost: 5100000000,   baseCps: 260000, description: 'Brings in fresh cookies from the cookie planet.',         icon: 'shipment' },
  { id: 'alchemy',    name: 'Alchemy Lab',         baseCost: 75000000000,  baseCps: 1600000,description: 'Turns gold into cookies!',                               icon: 'alchemy' },
  { id: 'portal',     name: 'Portal',              baseCost: 1000000000000,baseCps: 10000000,description:'Opens a door to the Cookieverse.',                       icon: 'portal' },
  { id: 'timemachine',name: 'Time Machine',        baseCost: 14000000000000,baseCps:65000000,description:'Brings cookies from the past before they were eaten.',    icon: 'timemachine' },
  { id: 'antimatter', name: 'Antimatter Condenser',baseCost: 170000000000000,baseCps:430000000,description:'Condenses the antimatter in the universe into cookies.',icon: 'antimatter' },
  { id: 'prism',      name: 'Prism',               baseCost: 2100000000000000,baseCps:2900000000,description:'Converts light into cookies.',                       icon: 'prism' },
  { id: 'chancemaker',name: 'Chancemaker',         baseCost: 26000000000000000,baseCps:21000000000,description:'Generates cookies out of thin air through sheer luck.',icon: 'chancemaker' },
  { id: 'fractal',    name: 'Fractal Engine',      baseCost: 310000000000000000,baseCps:150000000000,description:'Turns cookies into even more cookies.',          icon: 'fractal' },
];

// ─── Upgrade Definitions ───
interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  buildingId?: string; // which building this doubles
  type: 'building' | 'click' | 'global';
  multiplier: number;
  requirement?: { building: string; count: number } | { totalCookies: number } | { clicks: number };
  icon: string;
  tier: number;
}

function buildingUpgrade(buildingId: string, name: string, tier: number, cost: number, count: number, icon: string): UpgradeDef {
  return {
    id: `${buildingId}-tier${tier}`,
    name,
    description: `${BUILDINGS.find(b => b.id === buildingId)?.name ?? buildingId}s are twice as efficient.`,
    cost,
    buildingId,
    type: 'building',
    multiplier: 2,
    requirement: { building: buildingId, count },
    icon,
    tier,
  };
}

const UPGRADES: UpgradeDef[] = [
  // Cursor upgrades
  buildingUpgrade('cursor', 'Reinforced Index Finger', 1, 100, 1, 'finger'),
  buildingUpgrade('cursor', 'Carpal Tunnel Prevention Cream', 2, 500, 1, 'lotion'),
  buildingUpgrade('cursor', 'Ambidextrous', 3, 10000, 10, 'hands'),
  buildingUpgrade('cursor', 'Thousand Fingers', 4, 100000, 25, 'hand'),
  buildingUpgrade('cursor', 'Million Fingers', 5, 10000000, 50, 'palm'),
  buildingUpgrade('cursor', 'Billion Fingers', 6, 100000000, 100, 'wave'),
  buildingUpgrade('cursor', 'Trillion Fingers', 7, 1000000000, 150, 'pointright'),

  // Grandma upgrades
  buildingUpgrade('grandma', 'Forwards from Grandma', 1, 1000, 1, 'email'),
  buildingUpgrade('grandma', 'Steel-plated Rolling Pins', 2, 5000, 5, 'rock'),
  buildingUpgrade('grandma', 'Lubricated Dentures', 3, 50000, 25, 'tooth'),
  buildingUpgrade('grandma', 'Prune Juice', 4, 5000000, 50, 'juice'),
  buildingUpgrade('grandma', 'Double-thick Glasses', 5, 500000000, 100, 'glasses'),
  buildingUpgrade('grandma', 'Aging Agents', 6, 50000000000, 150, 'clock'),

  // Farm upgrades
  buildingUpgrade('farm', 'Cheap Hoes', 1, 11000, 1, 'axe'),
  buildingUpgrade('farm', 'Fertilizer', 2, 55000, 5, 'poop'),
  buildingUpgrade('farm', 'Cookie Trees', 3, 550000, 25, 'tree'),
  buildingUpgrade('farm', 'Genetically-modified Cookies', 4, 55000000, 50, 'dna'),
  buildingUpgrade('farm', 'Gingerbread Scarecrows', 5, 5500000000, 100, 'teddy'),

  // Mine upgrades
  buildingUpgrade('mine', 'Sugar Gas', 1, 120000, 1, 'gas'),
  buildingUpgrade('mine', 'Megadrill', 2, 600000, 5, 'bolt'),
  buildingUpgrade('mine', 'Ultradrill', 3, 6000000, 25, 'gear'),
  buildingUpgrade('mine', 'Ultimadrill', 4, 600000000, 50, 'wrench'),
  buildingUpgrade('mine', 'H-bomb Mining', 5, 60000000000, 100, 'bomb'),

  // Factory upgrades
  buildingUpgrade('factory', 'Sturdier Conveyor Belts', 1, 1300000, 1, 'chain'),
  buildingUpgrade('factory', 'Child Labor', 2, 6500000, 5, 'baby'),
  buildingUpgrade('factory', 'Sweatshop', 3, 65000000, 25, 'construction'),
  buildingUpgrade('factory', 'Radium Reactors', 4, 6500000000, 50, 'radioactive'),
  buildingUpgrade('factory', 'Recombobulators', 5, 650000000000, 100, 'robot'),

  // Bank upgrades
  buildingUpgrade('bank', 'Taller Tellers', 1, 14000000, 1, 'chart'),
  buildingUpgrade('bank', 'Scissor-resistant Credit Cards', 2, 70000000, 5, 'creditcard'),
  buildingUpgrade('bank', 'Acid-proof Vaults', 3, 700000000, 25, 'lock'),
  buildingUpgrade('bank', 'Chocolate Coins', 4, 70000000000, 50, 'coin'),

  // Temple upgrades
  buildingUpgrade('temple', 'Golden Idols', 1, 200000000, 1, 'moai'),
  buildingUpgrade('temple', 'Sacrificial Rolling Pins', 2, 1000000000, 5, 'scroll'),
  buildingUpgrade('temple', 'Blessed Cookie Cutters', 3, 10000000000, 25, 'cross'),

  // Wizard Tower upgrades
  buildingUpgrade('wizard', 'Pointier Hats', 1, 3300000000, 1, 'tophat'),
  buildingUpgrade('wizard', 'Focus Wands', 2, 16500000000, 5, 'wand'),
  buildingUpgrade('wizard', 'Laser Eyes', 3, 165000000000, 25, 'eye'),

  // Shipment upgrades
  buildingUpgrade('shipment', 'Vanilla Nebulae', 1, 51000000000, 1, 'galaxy'),
  buildingUpgrade('shipment', 'Wormholes', 2, 255000000000, 5, 'hole'),
  buildingUpgrade('shipment', 'Frequent Flyer', 3, 2550000000000, 25, 'plane'),

  // Alchemy Lab upgrades
  buildingUpgrade('alchemy', 'Antimony', 1, 750000000000, 1, 'testtube'),
  buildingUpgrade('alchemy', 'Essence of Dough', 2, 3750000000000, 5, 'droplet'),
  buildingUpgrade('alchemy', 'True Chocolate', 3, 37500000000000, 25, 'chocolate'),

  // Portal upgrades
  buildingUpgrade('portal', 'Ancient Tablet', 1, 10000000000000, 1, 'clipboard'),
  buildingUpgrade('portal', 'Insane Oatling Workers', 2, 50000000000000, 5, 'dizzy'),

  // Time Machine upgrades
  buildingUpgrade('timemachine', 'Flux Capacitors', 1, 140000000000000, 1, 'fluxcap'),
  buildingUpgrade('timemachine', 'Time Paradox Resolver', 2, 700000000000000, 5, 'shuffle'),

  // Antimatter Condenser upgrades
  buildingUpgrade('antimatter', 'Sugar Bosons', 1, 1700000000000000, 1, 'bubbles'),

  // Prism upgrades
  buildingUpgrade('prism', 'Gem Polish', 1, 21000000000000000, 1, 'gem'),

  // Click upgrades
  {
    id: 'click-1',
    name: 'Plastic Mouse',
    description: 'Clicking gains +1% of your CpS.',
    cost: 50000,
    type: 'click',
    multiplier: 2,
    requirement: { clicks: 1000 },
    icon: 'mouse',
    tier: 1,
  },
  {
    id: 'click-2',
    name: 'Iron Mouse',
    description: 'Clicking gains +1% of your CpS.',
    cost: 5000000,
    type: 'click',
    multiplier: 2,
    requirement: { clicks: 100000 },
    icon: 'mouse',
    tier: 2,
  },
  {
    id: 'click-3',
    name: 'Titanium Mouse',
    description: 'Clicking gains +1% of your CpS.',
    cost: 500000000,
    type: 'click',
    multiplier: 2,
    requirement: { clicks: 10000000 },
    icon: 'mouse',
    tier: 3,
  },

  // Global multiplier upgrades
  {
    id: 'global-1',
    name: 'Kitten Helpers',
    description: 'You gain more CpS the more milk you have. (Milk is earned from achievements.)',
    cost: 9000000,
    type: 'global',
    multiplier: 1.1,
    requirement: { totalCookies: 100000 },
    icon: 'cat',
    tier: 1,
  },
  {
    id: 'global-2',
    name: 'Kitten Workers',
    description: 'You gain even more CpS the more milk you have.',
    cost: 9000000000,
    type: 'global',
    multiplier: 1.15,
    requirement: { totalCookies: 10000000 },
    icon: 'cat',
    tier: 2,
  },
  {
    id: 'global-3',
    name: 'Kitten Engineers',
    description: 'You gain even more CpS the more milk you have.',
    cost: 9000000000000,
    type: 'global',
    multiplier: 1.2,
    requirement: { totalCookies: 10000000000 },
    icon: 'cat',
    tier: 3,
  },
  {
    id: 'global-4',
    name: 'Kitten Overseers',
    description: 'You gain even more CpS the more milk you have.',
    cost: 9000000000000000,
    type: 'global',
    multiplier: 1.25,
    requirement: { totalCookies: 10000000000000 },
    icon: 'cat',
    tier: 4,
  },
];

// ─── Achievement Definitions ───
interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (state: GameState) => boolean;
}

const ACHIEVEMENTS: AchievementDef[] = [
  // Click achievements
  { id: 'click-1',   name: 'Clicktastic',         description: 'Make 1 cookie from clicking.',          icon: 'cursor', check: (s) => s.totalClicks >= 1 },
  { id: 'click-2',   name: 'Clickathlon',          description: 'Make 100 cookies from clicking.',       icon: 'cursor', check: (s) => s.totalClicks >= 100 },
  { id: 'click-3',   name: 'Clickolympics',        description: 'Make 10,000 cookies from clicking.',    icon: 'cursor', check: (s) => s.totalClicks >= 10000 },
  { id: 'click-4',   name: 'Clickorama',           description: 'Make 100,000 cookies from clicking.',   icon: 'cursor', check: (s) => s.totalClicks >= 100000 },
  { id: 'click-5',   name: 'Clickasmic',           description: 'Make 1,000,000 cookies from clicking.', icon: 'cursor', check: (s) => s.totalClicks >= 1000000 },
  { id: 'click-6',   name: 'Clickageddon',         description: 'Make 10,000,000 cookies from clicking.',icon: 'cursor', check: (s) => s.totalClicks >= 10000000 },
  { id: 'click-7',   name: 'Clicknarok',           description: 'Make 1 billion cookies from clicking.', icon: 'cursor', check: (s) => s.totalClicks >= 1000000000 },

  // Cookie baking achievements
  { id: 'bake-1',    name: 'Wake and Bake',        description: 'Bake 1 cookie in one ascension.',        icon: 'cookie', check: (s) => s.totalBaked >= 1 },
  { id: 'bake-2',    name: 'Making Some Dough',    description: 'Bake 1,000 cookies.',                    icon: 'cookie', check: (s) => s.totalBaked >= 1000 },
  { id: 'bake-3',    name: 'So Baked Right Now',    description: 'Bake 100,000 cookies.',                 icon: 'cookie', check: (s) => s.totalBaked >= 100000 },
  { id: 'bake-4',    name: 'Fledgling Bakery',      description: 'Bake 1 million cookies.',               icon: 'cookie', check: (s) => s.totalBaked >= 1000000 },
  { id: 'bake-5',    name: 'Affluent Bakery',       description: 'Bake 100 million cookies.',             icon: 'cookie', check: (s) => s.totalBaked >= 100000000 },
  { id: 'bake-6',    name: 'World-famous Bakery',   description: 'Bake 10 billion cookies.',              icon: 'cookie', check: (s) => s.totalBaked >= 10000000000 },
  { id: 'bake-7',    name: 'Cosmic Bakery',         description: 'Bake 1 trillion cookies.',              icon: 'cookie', check: (s) => s.totalBaked >= 1000000000000 },
  { id: 'bake-8',    name: 'Galactic Bakery',       description: 'Bake 100 trillion cookies.',            icon: 'cookie', check: (s) => s.totalBaked >= 100000000000000 },
  { id: 'bake-9',    name: 'Universal Bakery',      description: 'Bake 10 quadrillion cookies.',          icon: 'cookie', check: (s) => s.totalBaked >= 10000000000000000 },
  { id: 'bake-10',   name: 'Timeless Bakery',       description: 'Bake 1 quintillion cookies.',           icon: 'cookie', check: (s) => s.totalBaked >= 1000000000000000000 },

  // CpS achievements
  { id: 'cps-1',     name: 'Casual Baking',        description: 'Bake 1 cookie per second.',              icon: 'timer', check: (s) => s.cps >= 1 },
  { id: 'cps-2',     name: 'Hardcore Baking',       description: 'Bake 10 cookies per second.',           icon: 'timer', check: (s) => s.cps >= 10 },
  { id: 'cps-3',     name: 'Steady Supply',         description: 'Bake 100 cookies per second.',          icon: 'timer', check: (s) => s.cps >= 100 },
  { id: 'cps-4',     name: 'Cookie Monster',        description: 'Bake 10,000 cookies per second.',       icon: 'timer', check: (s) => s.cps >= 10000 },
  { id: 'cps-5',     name: 'Mass Production',       description: 'Bake 1 million cookies per second.',    icon: 'timer', check: (s) => s.cps >= 1000000 },
  { id: 'cps-6',     name: 'Cookie Singularity',    description: 'Bake 1 billion cookies per second.',    icon: 'timer', check: (s) => s.cps >= 1000000000 },

  // Building count achievements
  { id: 'cursor-1',  name: 'Click',                description: 'Have 1 cursor.',                          icon: 'cursor', check: (s) => (s.buildings.cursor ?? 0) >= 1 },
  { id: 'cursor-2',  name: 'Double-click',         description: 'Have 2 cursors.',                         icon: 'cursor', check: (s) => (s.buildings.cursor ?? 0) >= 2 },
  { id: 'cursor-25', name: 'Mouse Wheel',          description: 'Have 25 cursors.',                        icon: 'cursor', check: (s) => (s.buildings.cursor ?? 0) >= 25 },
  { id: 'cursor-50', name: 'Of Mice and Men',      description: 'Have 50 cursors.',                        icon: 'cursor', check: (s) => (s.buildings.cursor ?? 0) >= 50 },
  { id: 'cursor-100',name: 'The Digital',           description: 'Have 100 cursors.',                      icon: 'cursor', check: (s) => (s.buildings.cursor ?? 0) >= 100 },
  { id: 'cursor-200',name: 'Extreme Polydactyly',  description: 'Have 200 cursors.',                       icon: 'cursor', check: (s) => (s.buildings.cursor ?? 0) >= 200 },

  { id: 'grandma-1', name: 'Just Wrong',           description: 'Have 1 grandma.',                         icon: 'grandma', check: (s) => (s.buildings.grandma ?? 0) >= 1 },
  { id: 'grandma-25',name: 'Retirement Home',       description: 'Have 25 grandmas.',                      icon: 'grandma', check: (s) => (s.buildings.grandma ?? 0) >= 25 },
  { id: 'grandma-50',name: 'Half-century of Baking',description: 'Have 50 grandmas.',                      icon: 'grandma', check: (s) => (s.buildings.grandma ?? 0) >= 50 },
  { id: 'grandma-100',name: 'Centennial',           description: 'Have 100 grandmas.',                     icon: 'grandma', check: (s) => (s.buildings.grandma ?? 0) >= 100 },
  { id: 'grandma-200',name: 'Bicentennial',         description: 'Have 200 grandmas.',                     icon: 'grandma', check: (s) => (s.buildings.grandma ?? 0) >= 200 },

  { id: 'farm-1',    name: 'Bought the Farm',       description: 'Have 1 farm.',                           icon: 'farm', check: (s) => (s.buildings.farm ?? 0) >= 1 },
  { id: 'farm-25',   name: 'Reap What You Sow',     description: 'Have 25 farms.',                         icon: 'farm', check: (s) => (s.buildings.farm ?? 0) >= 25 },
  { id: 'farm-50',   name: 'Farm Fresh',             description: 'Have 50 farms.',                         icon: 'farm', check: (s) => (s.buildings.farm ?? 0) >= 50 },
  { id: 'farm-100',  name: 'Sustainable Agriculture',description: 'Have 100 farms.',                        icon: 'farm', check: (s) => (s.buildings.farm ?? 0) >= 100 },

  { id: 'mine-1',    name: 'You Dirty Miner',       description: 'Have 1 mine.',                           icon: 'mine', check: (s) => (s.buildings.mine ?? 0) >= 1 },
  { id: 'mine-25',   name: 'Quarry On',              description: 'Have 25 mines.',                         icon: 'mine', check: (s) => (s.buildings.mine ?? 0) >= 25 },
  { id: 'mine-50',   name: 'Ore-inspiring',          description: 'Have 50 mines.',                         icon: 'mine', check: (s) => (s.buildings.mine ?? 0) >= 50 },
  { id: 'mine-100',  name: 'Deep Digger',            description: 'Have 100 mines.',                        icon: 'mine', check: (s) => (s.buildings.mine ?? 0) >= 100 },

  { id: 'factory-1', name: 'Production Line',        description: 'Have 1 factory.',                        icon: 'factory', check: (s) => (s.buildings.factory ?? 0) >= 1 },
  { id: 'factory-25',name: 'Industrial Revolution',   description: 'Have 25 factories.',                    icon: 'factory', check: (s) => (s.buildings.factory ?? 0) >= 25 },
  { id: 'factory-50',name: 'Global Warming',          description: 'Have 50 factories.',                    icon: 'factory', check: (s) => (s.buildings.factory ?? 0) >= 50 },
  { id: 'factory-100',name: 'Ultimate Automation',    description: 'Have 100 factories.',                   icon: 'factory', check: (s) => (s.buildings.factory ?? 0) >= 100 },

  { id: 'bank-1',    name: 'Your Own Mint',          description: 'Have 1 bank.',                           icon: 'bank', check: (s) => (s.buildings.bank ?? 0) >= 1 },
  { id: 'bank-25',   name: 'Cookie Derivatives',     description: 'Have 25 banks.',                         icon: 'bank', check: (s) => (s.buildings.bank ?? 0) >= 25 },
  { id: 'bank-50',   name: 'Too Big to Fail',        description: 'Have 50 banks.',                         icon: 'bank', check: (s) => (s.buildings.bank ?? 0) >= 50 },

  { id: 'temple-1',  name: 'Cookie Temple',          description: 'Have 1 temple.',                         icon: 'temple', check: (s) => (s.buildings.temple ?? 0) >= 1 },
  { id: 'temple-25', name: 'Prayer Wheel',           description: 'Have 25 temples.',                       icon: 'temple', check: (s) => (s.buildings.temple ?? 0) >= 25 },

  { id: 'wizard-1',  name: 'Bewitched',              description: 'Have 1 wizard tower.',                   icon: 'wizard', check: (s) => (s.buildings.wizard ?? 0) >= 1 },
  { id: 'wizard-25', name: 'The Sorcerer\'s Apprentice',description: 'Have 25 wizard towers.',              icon: 'wizard', check: (s) => (s.buildings.wizard ?? 0) >= 25 },

  { id: 'shipment-1',name: 'Expedition',             description: 'Have 1 shipment.',                       icon: 'shipment', check: (s) => (s.buildings.shipment ?? 0) >= 1 },
  { id: 'alchemy-1', name: 'Transmutation',          description: 'Have 1 alchemy lab.',                    icon: 'alchemy', check: (s) => (s.buildings.alchemy ?? 0) >= 1 },
  { id: 'portal-1',  name: 'Portal Opened',          description: 'Have 1 portal.',                         icon: 'portal', check: (s) => (s.buildings.portal ?? 0) >= 1 },
  { id: 'time-1',    name: 'Time Warp',              description: 'Have 1 time machine.',                   icon: 'timemachine', check: (s) => (s.buildings.timemachine ?? 0) >= 1 },
  { id: 'anti-1',    name: 'Antibaker',              description: 'Have 1 antimatter condenser.',            icon: 'antimatter', check: (s) => (s.buildings.antimatter ?? 0) >= 1 },
  { id: 'prism-1',   name: 'Luminous',               description: 'Have 1 prism.',                           icon: 'prism', check: (s) => (s.buildings.prism ?? 0) >= 1 },
  { id: 'chance-1',  name: 'Lucky Break',            description: 'Have 1 chancemaker.',                     icon: 'chancemaker', check: (s) => (s.buildings.chancemaker ?? 0) >= 1 },
  { id: 'fractal-1', name: 'Self-similar',           description: 'Have 1 fractal engine.',                  icon: 'fractal', check: (s) => (s.buildings.fractal ?? 0) >= 1 },

  // Golden cookie achievements
  { id: 'gold-1',    name: 'Golden Cookie',          description: 'Click 1 golden cookie.',                  icon: 'star', check: (s) => s.goldenClicks >= 1 },
  { id: 'gold-7',    name: 'Lucky Cookie',           description: 'Click 7 golden cookies.',                 icon: 'star', check: (s) => s.goldenClicks >= 7 },
  { id: 'gold-27',   name: 'A Stroke of Luck',       description: 'Click 27 golden cookies.',                icon: 'star', check: (s) => s.goldenClicks >= 27 },
  { id: 'gold-77',   name: 'Fortune',                description: 'Click 77 golden cookies.',                icon: 'star', check: (s) => s.goldenClicks >= 77 },
  { id: 'gold-777',  name: 'Leprechaun',             description: 'Click 777 golden cookies.',               icon: 'star', check: (s) => s.goldenClicks >= 777 },

  // Upgrade count achievements
  { id: 'upg-1',     name: 'Enhancer',               description: 'Purchase 1 upgrade.',                     icon: 'uparrow', check: (s) => s.purchasedUpgrades.size >= 1 },
  { id: 'upg-5',     name: 'Augmenter',              description: 'Purchase 5 upgrades.',                    icon: 'uparrow', check: (s) => s.purchasedUpgrades.size >= 5 },
  { id: 'upg-10',    name: 'Cookie Boosted',         description: 'Purchase 10 upgrades.',                   icon: 'uparrow', check: (s) => s.purchasedUpgrades.size >= 10 },
  { id: 'upg-25',    name: 'Cookie Supercharged',    description: 'Purchase 25 upgrades.',                   icon: 'uparrow', check: (s) => s.purchasedUpgrades.size >= 25 },
  { id: 'upg-50',    name: 'Maxed Out',              description: 'Purchase 50 upgrades.',                   icon: 'uparrow', check: (s) => s.purchasedUpgrades.size >= 50 },

  // Special achievements
  { id: 'speed-1',   name: 'Speed Baking I',         description: 'Bake 1 million cookies in 35 minutes.',   icon: 'runner', check: (s) => s.totalBaked >= 1000000 && s.playTimeSeconds < 2100 },
  { id: 'speed-2',   name: 'Speed Baking II',        description: 'Bake 1 million cookies in 25 minutes.',   icon: 'runner', check: (s) => s.totalBaked >= 1000000 && s.playTimeSeconds < 1500 },
  { id: 'speed-3',   name: 'Speed Baking III',       description: 'Bake 1 million cookies in 15 minutes.',   icon: 'runner', check: (s) => s.totalBaked >= 1000000 && s.playTimeSeconds < 900 },
  { id: 'nclick-1',  name: 'Neverclick',             description: 'Bake 1 million cookies with no clicks.',   icon: 'nosign', check: (s) => s.totalBaked >= 1000000 && s.totalClicks === 0 },
  { id: 'true-nv',   name: 'True Neverclick',        description: 'Bake 1 million cookies with zero clicks.',icon: 'nosign', check: (s) => s.totalBaked >= 1000000 && s.handmadeClicks === 0 },
  { id: 'total-100', name: 'Centennial and a Half',  description: 'Have 150 buildings.',                     icon: 'building', check: (s) => Object.values(s.buildings).reduce((a,b)=>a+b, 0) >= 150 },
  { id: 'total-200', name: 'Bicentennial Plus',      description: 'Have 200 buildings.',                     icon: 'building', check: (s) => Object.values(s.buildings).reduce((a,b)=>a+b, 0) >= 200 },
  { id: 'total-300', name: 'Tricentennial',          description: 'Have 300 buildings.',                     icon: 'building', check: (s) => Object.values(s.buildings).reduce((a,b)=>a+b, 0) >= 300 },
  { id: 'total-400', name: 'Quadricentennial',       description: 'Have 400 buildings.',                     icon: 'building', check: (s) => Object.values(s.buildings).reduce((a,b)=>a+b, 0) >= 400 },
  { id: 'total-500', name: 'Quincentennial',         description: 'Have 500 buildings.',                     icon: 'building', check: (s) => Object.values(s.buildings).reduce((a,b)=>a+b, 0) >= 500 },

  // Frenzy achievements
  { id: 'frenzy-1',  name: 'Frenzy',                 description: 'Activate a Frenzy.',                       icon: 'fire', check: (s) => s.frenzyActivations >= 1 },
  { id: 'cfrenzy',   name: 'Click Frenzy',           description: 'Activate a Click Frenzy.',                 icon: 'lightning', check: (s) => s.clickFrenzyActivations >= 1 },
];

// ─── Golden Cookie Effects ───
type GoldenEffect = 'frenzy' | 'clickFrenzy' | 'lucky' | 'ruin' | 'clot';

const GOLDEN_EFFECTS: { effect: GoldenEffect; weight: number }[] = [
  { effect: 'frenzy',      weight: 40 },
  { effect: 'clickFrenzy', weight: 15 },
  { effect: 'lucky',       weight: 30 },
  { effect: 'ruin',        weight: 10 },
  { effect: 'clot',        weight: 5 },
];

// ─── Game State ───
interface GameState {
  cookies: number;
  totalBaked: number;
  totalClicks: number;
  handmadeClicks: number;
  buildings: Record<string, number>;
  purchasedUpgrades: Set<string>;
  unlockedAchievements: Set<string>;
  cps: number;
  cookiesPerClick: number;
  goldenClicks: number;
  frenzyActivations: number;
  clickFrenzyActivations: number;
  playTimeSeconds: number;
  // Active effects
  frenzyMultiplier: number;
  frenzyTimer: number;
  clickFrenzyMultiplier: number;
  clickFrenzyTimer: number;
}

// ─── Formatting ───
function formatNumber(n: number): string {
  if (n < 1000) return Math.floor(n).toLocaleString();
  if (n < 1e6) return n.toFixed(1).replace(/\.0$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (n < 1e9) return (n / 1e6).toFixed(3) + ' million';
  if (n < 1e12) return (n / 1e9).toFixed(3) + ' billion';
  if (n < 1e15) return (n / 1e12).toFixed(3) + ' trillion';
  if (n < 1e18) return (n / 1e15).toFixed(3) + ' quadrillion';
  if (n < 1e21) return (n / 1e18).toFixed(3) + ' quintillion';
  if (n < 1e24) return (n / 1e21).toFixed(3) + ' sextillion';
  if (n < 1e27) return (n / 1e24).toFixed(3) + ' septillion';
  return n.toExponential(3);
}

function formatCps(n: number): string {
  if (n < 1000) return n.toFixed(1);
  return formatNumber(n);
}

/* ═══════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════ */
export function CookieClicker() {
  // ─── Core State ───
  const [cookies, setCookies] = useState(0);
  const [totalBaked, setTotalBaked] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [handmadeClicks, setHandmadeClicks] = useState(0);
  const [buildings, setBuildings] = useState<Record<string, number>>({});
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<Set<string>>(new Set());
  const [unlockedAchievements, setUnlockedAchievements] = useState<Set<string>>(new Set());
  const [goldenClicks, setGoldenClicks] = useState(0);
  const [frenzyActivations, setFrenzyActivations] = useState(0);
  const [clickFrenzyActivations, setClickFrenzyActivations] = useState(0);
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);

  // Active effects
  const [frenzyMultiplier, setFrenzyMultiplier] = useState(1);
  const [frenzyTimer, setFrenzyTimer] = useState(0);
  const [clickFrenzyMultiplier, setClickFrenzyMultiplier] = useState(1);
  const [clickFrenzyTimer, setClickFrenzyTimer] = useState(0);

  // UI state
  const [activeTab, setActiveTab] = useState<'store' | 'achievements'>('store');
  const [showUpgrades, setShowUpgrades] = useState(true);
  const [clickFloaters, setClickFloaters] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);
  const [goldenCookie, setGoldenCookie] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [achievementPopup, setAchievementPopup] = useState<string | null>(null);

  const floaterIdRef = useRef(0);
  const cookieRef = useRef<HTMLDivElement>(null);
  const goldenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Compute CpS ───
  const cps = useMemo(() => {
    let total = 0;
    for (const bDef of BUILDINGS) {
      const count = buildings[bDef.id] ?? 0;
      if (count === 0) continue;
      let bCps = bDef.baseCps;
      // Apply building-specific upgrade multipliers
      for (const upg of UPGRADES) {
        if (upg.type === 'building' && upg.buildingId === bDef.id && purchasedUpgrades.has(upg.id)) {
          bCps *= upg.multiplier;
        }
      }
      total += bCps * count;
    }
    // Apply global multipliers
    for (const upg of UPGRADES) {
      if (upg.type === 'global' && purchasedUpgrades.has(upg.id)) {
        total *= upg.multiplier;
      }
    }
    // Apply frenzy
    total *= frenzyMultiplier;
    return total;
  }, [buildings, purchasedUpgrades, frenzyMultiplier]);

  // ─── Compute Cookies Per Click ───
  const cookiesPerClick = useMemo(() => {
    let base = 1;
    // Click upgrades double clicking power
    for (const upg of UPGRADES) {
      if (upg.type === 'click' && purchasedUpgrades.has(upg.id)) {
        base *= upg.multiplier;
      }
    }
    // Add 1% of CpS per click (base mechanic)
    base += cps * 0.01;
    // Apply click frenzy
    base *= clickFrenzyMultiplier;
    return Math.max(1, base);
  }, [purchasedUpgrades, cps, clickFrenzyMultiplier]);

  // ─── Building Cost Calculator ───
  const getBuildingCost = useCallback((buildingId: string) => {
    const def = BUILDINGS.find(b => b.id === buildingId);
    if (!def) return Infinity;
    const owned = buildings[buildingId] ?? 0;
    return Math.ceil(def.baseCost * Math.pow(1.15, owned));
  }, [buildings]);

  // ─── Game State Object for Achievement Checks ───
  const gameState: GameState = useMemo(() => ({
    cookies,
    totalBaked,
    totalClicks,
    handmadeClicks,
    buildings,
    purchasedUpgrades,
    unlockedAchievements,
    cps,
    cookiesPerClick,
    goldenClicks,
    frenzyActivations,
    clickFrenzyActivations,
    playTimeSeconds,
    frenzyMultiplier,
    frenzyTimer,
    clickFrenzyMultiplier,
    clickFrenzyTimer,
  }), [cookies, totalBaked, totalClicks, handmadeClicks, buildings, purchasedUpgrades, unlockedAchievements, cps, cookiesPerClick, goldenClicks, frenzyActivations, clickFrenzyActivations, playTimeSeconds, frenzyMultiplier, frenzyTimer, clickFrenzyMultiplier, clickFrenzyTimer]);

  // ─── CpS Tick (10 FPS for smoother feel) ───
  useEffect(() => {
    const interval = setInterval(() => {
      const gain = cps / 10;
      if (gain > 0) {
        setCookies(c => c + gain);
        setTotalBaked(t => t + gain);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [cps]);

  // ─── Play Time Counter ───
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayTimeSeconds(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Frenzy Timers ───
  useEffect(() => {
    if (frenzyTimer <= 0) return;
    const interval = setInterval(() => {
      setFrenzyTimer(t => {
        if (t <= 1) {
          setFrenzyMultiplier(1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [frenzyTimer]);

  useEffect(() => {
    if (clickFrenzyTimer <= 0) return;
    const interval = setInterval(() => {
      setClickFrenzyTimer(t => {
        if (t <= 1) {
          setClickFrenzyMultiplier(1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [clickFrenzyTimer]);

  // ─── Achievement Checking ───
  useEffect(() => {
    for (const ach of ACHIEVEMENTS) {
      if (!unlockedAchievements.has(ach.id) && ach.check(gameState)) {
        setUnlockedAchievements(prev => {
          const next = new Set(prev);
          next.add(ach.id);
          return next;
        });
        setAchievementPopup(ach.name);
        setTimeout(() => setAchievementPopup(null), 3000);
      }
    }
  }, [gameState, unlockedAchievements]);

  // ─── Golden Cookie Spawner ───
  useEffect(() => {
    const scheduleGolden = () => {
      const delay = (120 + Math.random() * 240) * 1000; // 2-6 minutes
      goldenTimerRef.current = setTimeout(() => {
        setGoldenCookie({
          x: 20 + Math.random() * 60,
          y: 20 + Math.random() * 60,
          visible: true,
        });
        // Auto-hide after 13 seconds
        setTimeout(() => {
          setGoldenCookie(null);
        }, 13000);
        scheduleGolden();
      }, delay);
    };
    // First golden cookie comes sooner
    goldenTimerRef.current = setTimeout(() => {
      setGoldenCookie({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        visible: true,
      });
      setTimeout(() => setGoldenCookie(null), 13000);
      scheduleGolden();
    }, (30 + Math.random() * 60) * 1000);
    return () => { if (goldenTimerRef.current) clearTimeout(goldenTimerRef.current); };
  }, []);

  // ─── Click the Cookie ───
  const handleCookieClick = useCallback((e: React.MouseEvent) => {
    const gain = cookiesPerClick;
    setCookies(c => c + gain);
    setTotalBaked(t => t + gain);
    setTotalClicks(t => t + gain);
    setHandmadeClicks(t => t + 1);

    // Floater
    const rect = cookieRef.current?.getBoundingClientRect();
    if (rect) {
      const id = ++floaterIdRef.current;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setClickFloaters(f => [...f, { id, x, y, amount: gain }]);
      setTimeout(() => {
        setClickFloaters(f => f.filter(fl => fl.id !== id));
      }, 1000);
    }
  }, [cookiesPerClick]);

  // ─── Buy Building ───
  const buyBuilding = useCallback((buildingId: string) => {
    const cost = getBuildingCost(buildingId);
    if (cookies < cost) return;
    setCookies(c => c - cost);
    setBuildings(b => ({ ...b, [buildingId]: (b[buildingId] ?? 0) + 1 }));
  }, [cookies, getBuildingCost]);

  // ─── Buy Upgrade ───
  const buyUpgrade = useCallback((upgradeId: string) => {
    const upg = UPGRADES.find(u => u.id === upgradeId);
    if (!upg || purchasedUpgrades.has(upgradeId) || cookies < upg.cost) return;
    setCookies(c => c - upg.cost);
    setPurchasedUpgrades(prev => new Set([...prev, upgradeId]));
  }, [cookies, purchasedUpgrades]);

  // ─── Click Golden Cookie ───
  const handleGoldenClick = useCallback(() => {
    setGoldenCookie(null);
    setGoldenClicks(g => g + 1);

    // Pick weighted random effect
    const totalWeight = GOLDEN_EFFECTS.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let effect: GoldenEffect = 'lucky';
    for (const e of GOLDEN_EFFECTS) {
      roll -= e.weight;
      if (roll <= 0) { effect = e.effect; break; }
    }

    switch (effect) {
      case 'frenzy':
        setFrenzyMultiplier(7);
        setFrenzyTimer(77);
        setFrenzyActivations(f => f + 1);
        setNotification('Frenzy! Cookie production x7 for 77 seconds!');
        break;
      case 'clickFrenzy':
        setClickFrenzyMultiplier(777);
        setClickFrenzyTimer(13);
        setClickFrenzyActivations(f => f + 1);
        setNotification('Click Frenzy! Clicking power x777 for 13 seconds!');
        break;
      case 'lucky': {
        const reward = Math.min(cookies * 0.15 + 13, cps * 900);
        setCookies(c => c + Math.max(reward, 1));
        setTotalBaked(t => t + Math.max(reward, 1));
        setNotification(`Lucky! +${formatNumber(Math.max(reward, 1))} cookies!`);
        break;
      }
      case 'ruin': {
        const loss = Math.min(cookies * 0.05, cps * 60);
        setCookies(c => Math.max(0, c - loss));
        setNotification(`Ruin! Lost ${formatNumber(loss)} cookies...`);
        break;
      }
      case 'clot':
        setFrenzyMultiplier(0.5);
        setFrenzyTimer(66);
        setNotification('Clot! Cookie production halved for 66 seconds...');
        break;
    }
    setTimeout(() => setNotification(null), 4000);
  }, [cookies, cps]);

  // ─── Available Upgrades ───
  const availableUpgrades = useMemo(() => {
    return UPGRADES.filter(upg => {
      if (purchasedUpgrades.has(upg.id)) return false;
      if (!upg.requirement) return true;
      if ('building' in upg.requirement) {
        return (buildings[upg.requirement.building] ?? 0) >= upg.requirement.count;
      }
      if ('totalCookies' in upg.requirement) {
        return totalBaked >= upg.requirement.totalCookies;
      }
      if ('clicks' in upg.requirement) {
        return totalClicks >= upg.requirement.clicks;
      }
      return false;
    });
  }, [purchasedUpgrades, buildings, totalBaked, totalClicks]);

  // ─── Building CpS with upgrades ───
  const getBuildingCps = useCallback((buildingId: string) => {
    const def = BUILDINGS.find(b => b.id === buildingId);
    if (!def) return 0;
    let bCps = def.baseCps;
    for (const upg of UPGRADES) {
      if (upg.type === 'building' && upg.buildingId === buildingId && purchasedUpgrades.has(upg.id)) {
        bCps *= upg.multiplier;
      }
    }
    return bCps;
  }, [purchasedUpgrades]);

  // ─── Styles ───
  const bg = '#1e0f00';
  const panelBg = '#2a1a0a';
  const cookieGold = '#c89632';
  const cookieDark = '#7a5a2a';
  const textColor = '#fff8e7';
  const textDim = '#b09060';
  const borderColor = '#4a3520';

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      background: bg, color: textColor,
      fontFamily: 'var(--font-system)', fontSize: 11,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* ─── Left Panel: Cookie Section ─── */}
      <div style={{
        width: '40%', minWidth: 200, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(ellipse at center, #3a2010 0%, ${bg} 100%)`,
        position: 'relative', overflow: 'hidden',
        borderRight: `2px solid ${borderColor}`,
      }}>
        {/* Cookie Counter */}
        <div style={{ textAlign: 'center', marginBottom: 16, zIndex: 2 }}>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: textColor, textShadow: '0 0 10px rgba(200,150,50,0.5)' }}>
            {formatNumber(cookies)}
          </div>
          <div style={{ fontSize: 10, color: textDim }}>
            cookies
          </div>
          <div style={{ fontSize: 10, color: textDim, marginTop: 2 }}>
            per second: {formatCps(cps)}
          </div>
        </div>

        {/* The Big Cookie */}
        <div
          ref={cookieRef}
          onClick={handleCookieClick}
          style={{
            width: 180, height: 180, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, #e8c06a, ${cookieGold} 30%, ${cookieDark} 100%)`,
            boxShadow: `0 0 30px rgba(200, 150, 50, 0.4), inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 4px 8px rgba(255,220,100,0.2)`,
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.05s',
            userSelect: 'none',
            zIndex: 2,
          }}
          onMouseDown={(e) => { (e.target as HTMLElement).style.transform = 'scale(0.95)'; }}
          onMouseUp={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
        >
          {/* Chocolate chips on the cookie */}
          {[
            { x: 30, y: 40, s: 14 }, { x: 70, y: 30, s: 12 }, { x: 110, y: 55, s: 16 },
            { x: 50, y: 90, s: 13 }, { x: 95, y: 80, s: 11 }, { x: 130, y: 110, s: 14 },
            { x: 60, y: 130, s: 12 }, { x: 100, y: 140, s: 10 }, { x: 35, y: 65, s: 9 },
            { x: 120, y: 35, s: 11 }, { x: 75, y: 110, s: 13 }, { x: 145, y: 75, s: 10 },
          ].map((chip, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: chip.x, top: chip.y,
              width: chip.s, height: chip.s * 0.7,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, #5a3a1a, #3a2010)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }} />
          ))}
        </div>

        {/* Click Floaters */}
        {clickFloaters.map(f => (
          <div key={f.id} style={{
            position: 'absolute',
            left: f.x + (cookieRef.current?.offsetLeft ?? 0) - 20,
            top: f.y + (cookieRef.current?.offsetTop ?? 0),
            color: '#fff',
            fontWeight: 'bold',
            fontSize: 16,
            textShadow: '0 0 4px rgba(255,200,50,0.8)',
            pointerEvents: 'none',
            animation: 'cookieFloatUp 1s ease-out forwards',
            zIndex: 10,
          }}>
            +{formatNumber(f.amount)}
          </div>
        ))}

        {/* Golden Cookie */}
        {goldenCookie?.visible && (
          <div
            onClick={handleGoldenClick}
            style={{
              position: 'absolute',
              left: `${goldenCookie.x}%`, top: `${goldenCookie.y}%`,
              width: 40, height: 40, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ffd700, #daa520, #b8860b)',
              boxShadow: '0 0 20px #ffd700, 0 0 40px rgba(255,215,0,0.5)',
              cursor: 'pointer',
              animation: 'goldenPulse 1s ease-in-out infinite alternate',
              zIndex: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}
          >
            <CookieIcon name="cookie" size={20} />
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div style={{
            position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.85)', border: `1px solid ${cookieGold}`,
            padding: '6px 14px', borderRadius: 4, fontSize: 11, color: '#ffd700',
            zIndex: 30, whiteSpace: 'nowrap', textAlign: 'center',
            animation: 'fadeInOut 4s ease forwards',
          }}>
            {notification}
          </div>
        )}

        {/* Active Effects */}
        <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 2 }}>
          {frenzyTimer > 0 && (
            <div style={{ fontSize: 9, color: frenzyMultiplier >= 1 ? '#ffd700' : '#ff6666', marginBottom: 2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><CookieIcon name={frenzyMultiplier >= 1 ? 'fire' : 'snowflake'} size={10} /> {frenzyMultiplier >= 1 ? `Frenzy x${frenzyMultiplier}` : `Clot x${frenzyMultiplier}`} ({frenzyTimer}s)</span>
            </div>
          )}
          {clickFrenzyTimer > 0 && (
            <div style={{ fontSize: 9, color: '#ff66ff' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><CookieIcon name="lightning" size={10} /> Click Frenzy x{clickFrenzyMultiplier} ({clickFrenzyTimer}s)</span>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(0,0,0,0.6)', padding: '3px 8px',
          display: 'flex', justifyContent: 'space-between', fontSize: 9, color: textDim,
        }}>
          <span>Baked all time: {formatNumber(totalBaked)}</span>
          <span>Clicks: {handmadeClicks.toLocaleString()}</span>
        </div>
      </div>

      {/* ─── Right Panel: Store / Achievements ─── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: panelBg, overflow: 'hidden',
      }}>
        {/* Tab buttons */}
        <div style={{
          display: 'flex', borderBottom: `2px solid ${borderColor}`,
          background: '#1a0f05', flexShrink: 0,
        }}>
          <button onClick={() => setActiveTab('store')} style={{
            flex: 1, padding: '6px 0', border: 'none',
            background: activeTab === 'store' ? panelBg : 'transparent',
            color: activeTab === 'store' ? cookieGold : textDim,
            fontFamily: 'var(--font-system)', fontSize: 11, fontWeight: 'bold',
            borderBottom: activeTab === 'store' ? `2px solid ${cookieGold}` : '2px solid transparent',
          }}>
            Store
          </button>
          <button onClick={() => setActiveTab('achievements')} style={{
            flex: 1, padding: '6px 0', border: 'none',
            background: activeTab === 'achievements' ? panelBg : 'transparent',
            color: activeTab === 'achievements' ? cookieGold : textDim,
            fontFamily: 'var(--font-system)', fontSize: 11, fontWeight: 'bold',
            borderBottom: activeTab === 'achievements' ? `2px solid ${cookieGold}` : '2px solid transparent',
          }}>
            Achievements ({unlockedAchievements.size}/{ACHIEVEMENTS.length})
          </button>
        </div>

        {activeTab === 'store' && (
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Upgrades Section */}
            <div style={{
              padding: '6px 8px',
              borderBottom: `1px solid ${borderColor}`,
              background: '#251505',
            }}>
              <div
                onClick={() => setShowUpgrades(!showUpgrades)}
                style={{ cursor: 'pointer', fontWeight: 'bold', color: cookieGold, fontSize: 10, marginBottom: showUpgrades ? 4 : 0 }}
              >
                {showUpgrades ? '▼' : '▶'} Upgrades ({availableUpgrades.length} available)
              </div>
              {showUpgrades && availableUpgrades.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {availableUpgrades.slice(0, 20).map(upg => (
                    <div
                      key={upg.id}
                      onClick={() => buyUpgrade(upg.id)}
                      title={`${upg.name}\n${upg.description}\nCost: ${formatNumber(upg.cost)}`}
                      style={{
                        width: 36, height: 36, borderRadius: 4,
                        background: cookies >= upg.cost
                          ? 'linear-gradient(135deg, #4a3520, #5a4530)'
                          : 'linear-gradient(135deg, #2a1a0a, #3a2515)',
                        border: cookies >= upg.cost ? `2px solid ${cookieGold}` : `1px solid ${borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, cursor: cookies >= upg.cost ? 'pointer' : 'default',
                        opacity: cookies >= upg.cost ? 1 : 0.5,
                        transition: 'all 0.15s',
                      }}
                    >
                      <CookieIcon name={upg.icon} size={18} />
                    </div>
                  ))}
                </div>
              )}
              {showUpgrades && availableUpgrades.length === 0 && (
                <div style={{ fontSize: 9, color: textDim, padding: '2px 0' }}>
                  No upgrades available — keep building!
                </div>
              )}
            </div>

            {/* Buildings Section */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {BUILDINGS.map(bDef => {
                const cost = getBuildingCost(bDef.id);
                const owned = buildings[bDef.id] ?? 0;
                const canAfford = cookies >= cost;
                const bCps = getBuildingCps(bDef.id);

                return (
                  <div
                    key={bDef.id}
                    onClick={() => buyBuilding(bDef.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px',
                      borderBottom: `1px solid ${borderColor}`,
                      background: canAfford ? 'rgba(100,80,40,0.15)' : 'transparent',
                      cursor: canAfford ? 'pointer' : 'default',
                      opacity: canAfford ? 1 : 0.45,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (canAfford) (e.currentTarget.style.background = 'rgba(100,80,40,0.3)'); }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = canAfford ? 'rgba(100,80,40,0.15)' : 'transparent'; }}
                  >
                    <div style={{ fontSize: 24, width: 32, textAlign: 'center', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CookieIcon name={bDef.icon} size={24} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 11, color: canAfford ? textColor : textDim }}>
                        {bDef.name}
                      </div>
                      <div style={{ fontSize: 9, color: canAfford ? cookieGold : textDim }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><CookieIcon name="cookie" size={10} /> {formatNumber(cost)}</span>
                      </div>
                      <div style={{ fontSize: 8, color: textDim }}>
                        each produces {formatCps(bCps)} cookies/sec
                      </div>
                    </div>
                    <div style={{
                      fontSize: 20, fontWeight: 'bold',
                      color: owned > 0 ? cookieGold : '#555',
                      minWidth: 30, textAlign: 'right',
                    }}>
                      {owned}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            <div style={{ fontSize: 10, color: textDim, marginBottom: 8 }}>
              Achievements unlocked: {unlockedAchievements.size} / {ACHIEVEMENTS.length}
              &nbsp;&mdash;&nbsp;
              Milk: {((unlockedAchievements.size / ACHIEVEMENTS.length) * 100).toFixed(1)}%
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {ACHIEVEMENTS.map(ach => {
                const unlocked = unlockedAchievements.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    title={unlocked ? `${ach.name}\n${ach.description}` : '???'}
                    style={{
                      width: 40, height: 40, borderRadius: 4,
                      background: unlocked
                        ? 'linear-gradient(135deg, #4a3a20, #6a5030)'
                        : '#1a1008',
                      border: unlocked ? `2px solid ${cookieGold}` : `1px solid #333`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18,
                      opacity: unlocked ? 1 : 0.3,
                      transition: 'all 0.3s',
                    }}
                  >
                    {unlocked ? <CookieIcon name={ach.icon} size={18} /> : <CookieIcon name="question" size={18} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Achievement Popup */}
      {achievementPopup && (
        <div style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)', border: `2px solid ${cookieGold}`,
          padding: '8px 20px', borderRadius: 4, zIndex: 100,
          textAlign: 'center', animation: 'achievementSlide 3s ease forwards',
        }}>
          <div style={{ fontSize: 9, color: cookieGold, fontWeight: 'bold' }}>Achievement Unlocked!</div>
          <div style={{ fontSize: 12, color: textColor, marginTop: 2 }}>{achievementPopup}</div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes cookieFloatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-60px); }
        }
        @keyframes goldenPulse {
          0% { transform: scale(1); box-shadow: 0 0 20px #ffd700, 0 0 40px rgba(255,215,0,0.5); }
          100% { transform: scale(1.1); box-shadow: 0 0 30px #ffd700, 0 0 60px rgba(255,215,0,0.7); }
        }
        @keyframes achievementSlide {
          0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
