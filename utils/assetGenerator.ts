'use client';

import { BASE64_SPRITES } from './base64Assets';

const FILE_BASED_SPRITES = [
  'wm',
  'inner_guard',
  'officer',
  'Grand_master',
  'Grand_Steward',
  'square',
  'level',
  'Plumb_rule',
  'Corn',
  'G'
] as const;
const FILE_KEY_MAP: Record<string, string> = {
  worshipful_master: 'wm',
  wm: 'wm',
  junior_warden: 'officer',
  senior_warden: 'officer',
  senior_deacon: 'officer',
  officer: 'officer',
  grand_master: 'Grand_master',
  grand_steward: 'Grand_Steward',
  square: 'square',
  level: 'level',
  plumb: 'Plumb_rule',
  corn: 'Corn',
  letter_g: 'G'
};
const PROCEDURAL_KEY_MAP: Record<string, string> = {
  wm: 'worshipful_master',
  officer: 'junior_warden'
};

export const generateSpriteUrl = (key: string): string => {
  const fileKey = FILE_KEY_MAP[key] ?? key;
  if (FILE_BASED_SPRITES.includes(fileKey as typeof FILE_BASED_SPRITES[number])) {
    return `/sprites/${fileKey}.png`;
  }

  const resolvedKey = PROCEDURAL_KEY_MAP[key] ?? key;

  // 1. Check if a static Base64 string exists (Priority)
  if (BASE64_SPRITES[resolvedKey] && BASE64_SPRITES[resolvedKey].length > 0) {
      return BASE64_SPRITES[resolvedKey];
  }

  // 2. Fallback: Procedural Canvas Generation
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');

  const isPillar = resolvedKey.startsWith('pillar');
  const isNPC = ['worshipful_master', 'senior_warden', 'junior_warden', 'inner_guard', 'senior_deacon'].includes(resolvedKey);

  // 32x32 for icons, 40x160 for pillars, 32x48 for NPCs (to match 45px Player)
  canvas.width = isPillar ? 40 : 32;
  canvas.height = isPillar ? 160 : (isNPC ? 48 : 32);

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Ensure crisp pixel art edges
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Drawing Helpers
  const fillRect = (x: number, y: number, w: number, h: number, c: string) => {
      ctx.fillStyle = c;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  };

  // Colors based on provided images
  const C_TURQUOISE = '#2dd4bf'; // Cambridge Blue / Teal
  const C_TURQUOISE_DARK = '#0f766e'; // Texture for rosettes
  const C_SILVER = '#cbd5e1'; // Metal/Chains
  const C_SUIT = '#0f172a'; // Dark Navy/Black
  const C_FLESH = '#fca5a5';
  const C_WHITE = '#f8fafc';
  const C_GOLD = '#d4af37';
  const C_GOLD_BRIGHT = '#ffd700';
  const C_WOOD = '#78350f';
  const C_WOOD_LIGHT = '#92400e';

  switch(resolvedKey) {
    // === FELLOW CRAFT WORKING TOOLS ===

    case 'square': // The Square - FC Working Tool
        ctx.translate(cx, cy);
        ctx.strokeStyle = C_GOLD;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // L-shaped square (carpenter's square)
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(-10, 10);
        ctx.lineTo(10, 10);
        ctx.stroke();

        // Right angle marker
        ctx.strokeStyle = C_GOLD_BRIGHT;
        ctx.lineWidth = 1;
        ctx.strokeRect(-7, 7, 4, 4);

        // Add some depth/highlights
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(-8, 8);
        ctx.stroke();
        break;

    case 'level': // The Level - FC Working Tool
        ctx.translate(cx, cy);

        // A-frame structure
        ctx.strokeStyle = C_WOOD;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -12); // Top point
        ctx.lineTo(-12, 10); // Left leg
        ctx.moveTo(0, -12);
        ctx.lineTo(12, 10); // Right leg
        ctx.stroke();

        // Crossbar
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-8, 2);
        ctx.lineTo(8, 2);
        ctx.stroke();

        // Plumb line from top
        ctx.strokeStyle = C_GOLD;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, 6);
        ctx.stroke();

        // Plumb bob
        ctx.fillStyle = C_GOLD_BRIGHT;
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(-2, 10);
        ctx.lineTo(0, 12);
        ctx.lineTo(2, 10);
        ctx.closePath();
        ctx.fill();
        break;

    case 'plumb': // The Plumb Rule - FC Working Tool
        ctx.translate(cx, cy);

        // Vertical rule/board
        ctx.fillStyle = C_WOOD;
        ctx.fillRect(-3, -14, 6, 22);

        // Wood grain highlights
        ctx.fillStyle = C_WOOD_LIGHT;
        ctx.fillRect(-1, -14, 2, 22);

        // Top mount
        ctx.fillStyle = C_SILVER;
        ctx.fillRect(-4, -14, 8, 3);

        // Plumb line
        ctx.strokeStyle = C_GOLD;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.lineTo(0, 8);
        ctx.stroke();

        // Plumb bob (weighted point)
        ctx.fillStyle = C_GOLD_BRIGHT;
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(-3, 12);
        ctx.lineTo(0, 14);
        ctx.lineTo(3, 12);
        ctx.closePath();
        ctx.fill();

        // Bob highlight
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        break;

    case 'corn': // Ear of Corn (Shibboleth) - FC Symbol
        ctx.translate(cx, cy);

        // Stem
        ctx.strokeStyle = '#65a30d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(0, 4);
        ctx.stroke();

        // Corn cob body (golden)
        ctx.fillStyle = C_GOLD;
        ctx.beginPath();
        ctx.ellipse(0, -4, 5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corn kernels pattern
        ctx.fillStyle = C_GOLD_BRIGHT;
        for (let row = -10; row <= 2; row += 4) {
          for (let col = -3; col <= 3; col += 3) {
            ctx.beginPath();
            ctx.ellipse(col, row - 4, 1.5, 2, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Husk/leaves (green)
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.moveTo(-3, 4);
        ctx.quadraticCurveTo(-8, 0, -6, -8);
        ctx.quadraticCurveTo(-4, -4, -3, 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(3, 4);
        ctx.quadraticCurveTo(8, 0, 6, -8);
        ctx.quadraticCurveTo(4, -4, 3, 2);
        ctx.fill();

        // Silk at top
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-1, -13);
        ctx.lineTo(-3, -16);
        ctx.moveTo(0, -14);
        ctx.lineTo(0, -17);
        ctx.moveTo(1, -13);
        ctx.lineTo(3, -16);
        ctx.stroke();
        break;

    case 'letter_g': // The Letter G - FC Symbol
        // Radiant background glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.5)');
        gradient.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);

        // Outer ring
        ctx.strokeStyle = C_GOLD;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 12, 0, Math.PI * 2);
        ctx.stroke();

        // The letter G
        ctx.font = 'bold 18px serif';
        ctx.fillStyle = C_GOLD_BRIGHT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('G', cx, cy + 1);

        // Radiating lines (glory)
        ctx.strokeStyle = C_GOLD;
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * 13, cy + Math.sin(angle) * 13);
          ctx.lineTo(cx + Math.cos(angle) * 15, cy + Math.sin(angle) * 15);
          ctx.stroke();
        }
        break;

    // === ORIGINAL EA TOOLS (kept for compatibility) ===

    case 'gauge':
        ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4);
        fillRect(-14, -4, 28, 8, '#fbbf24');
        fillRect(-14, -4, 28, 2, '#fcd34d');
        fillRect(-14, 2, 28, 2, '#d97706');
        ctx.fillStyle = '#78350f';
        for(let i=-12; i<=12; i+=4) ctx.fillRect(i, -4, 1, 4);
        break;

    case 'gavel':
        ctx.translate(cx, cy); ctx.rotate(-Math.PI / 4);
        fillRect(-2, 0, 4, 14, '#78350f');
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.moveTo(-4, -12); ctx.lineTo(-10, -10); ctx.lineTo(-10, -2); ctx.lineTo(-4, 0);
        ctx.lineTo(4, 0); ctx.lineTo(10, -2); ctx.lineTo(10, -10); ctx.lineTo(4, -12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#b45309'; ctx.fillRect(-8, -9, 16, 2);
        break;

    case 'chisel':
        ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
        fillRect(-2, -10, 4, 10, '#78350f');
        fillRect(-2, 0, 4, 12, '#94a3b8');
        ctx.beginPath(); ctx.moveTo(-2, 12); ctx.lineTo(2, 12); ctx.lineTo(0, 15);
        ctx.fillStyle = '#cbd5e1'; ctx.fill();
        break;

    case 'rough_ashlar':
        fillRect(4, 8, 24, 20, '#475569');
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.moveTo(4, 8); ctx.lineTo(10, 12); ctx.lineTo(4, 16); ctx.fill();
        ctx.beginPath(); ctx.moveTo(28, 28); ctx.lineTo(22, 24); ctx.lineTo(28, 20); ctx.fill();
        fillRect(6, 8, 18, 2, '#64748b');
        break;

    case 'perfect_ashlar':
        fillRect(6, 8, 20, 20, '#cbd5e1');
        ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1;
        ctx.strokeRect(6.5, 8.5, 19, 19);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(14, 4, 4, 4);
        ctx.beginPath(); ctx.arc(16, 4, 3, Math.PI, 0); ctx.stroke();
        break;

    case 'ladder':
        fillRect(8, 2, 3, 28, '#854d0e');
        fillRect(21, 2, 3, 28, '#854d0e');
        ctx.fillStyle = '#ca8a04';
        for(let y=6; y<28; y+=6) fillRect(8, y, 16, 2, '#ca8a04');
        break;

    case 'apron': // Item Icon: EA Apron (White Lambskin)
        ctx.translate(cx, cy);
        // Strings
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(16, -8); ctx.stroke();

        // Body (White)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-11, -8, 22, 18);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; // Subtle grey outline
        ctx.strokeRect(-11, -8, 22, 18);

        // Flap (Down)
        ctx.beginPath(); ctx.moveTo(-11, -8); ctx.lineTo(11, -8); ctx.lineTo(0, 3); ctx.closePath();
        ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
        break;

    case 'worshipful_master':
        // 32x48 Canvas
        // Head (Center 16, y=6)
        ctx.fillStyle = C_FLESH; ctx.beginPath(); ctx.arc(16, 6, 6, 0, Math.PI*2); ctx.fill();
        // Hair (Grey/White sides, balding)
        ctx.fillStyle = '#e2e8f0'; ctx.fillRect(10, 4, 3, 6); ctx.fillRect(19, 4, 3, 6);

        // Suit Body (Torso: 12 to 34)
        ctx.fillStyle = C_SUIT; ctx.fillRect(8, 12, 16, 22);

        // Legs (34 to 46)
        ctx.fillRect(9, 34, 6, 12); ctx.fillRect(17, 34, 6, 12);

        // Shoes
        ctx.fillStyle = '#000000'; ctx.fillRect(8, 46, 7, 2); ctx.fillRect(17, 46, 7, 2);

        // Arms
        ctx.fillStyle = C_SUIT; ctx.fillRect(5, 13, 3, 16); ctx.fillRect(24, 13, 3, 16);
        // Hands
        ctx.fillStyle = C_FLESH; ctx.fillRect(5, 29, 3, 3); ctx.fillRect(24, 29, 3, 3);

        // Collar (Turquoise)
        ctx.strokeStyle = C_TURQUOISE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(11, 14); ctx.lineTo(16, 24); ctx.lineTo(21, 14); ctx.stroke();

        // Jewel (Square - Silver)
        ctx.strokeStyle = C_SILVER; ctx.lineWidth = 1.5;
        ctx.strokeRect(13, 24, 6, 6);

        // --- INSTALLED MASTER APRON ---
        // Body
        ctx.fillStyle = C_WHITE; ctx.fillRect(9, 22, 14, 11);
        // Border
        ctx.strokeStyle = C_TURQUOISE; ctx.lineWidth = 2; ctx.strokeRect(9, 22, 14, 11);

        // Silver Chains (Tassels) hanging from "buttons"
        ctx.fillStyle = C_SILVER;
        // Left Chain
        ctx.fillRect(10, 24, 2, 5);
        // Right Chain
        ctx.fillRect(20, 24, 2, 5);

        // Inverted Taus (Silver) - 3 of them (Left, Right, Center/Flap implied)
        ctx.fillStyle = C_SILVER;
        // Left Bottom Tau (Upside down T)
        ctx.fillRect(10, 30, 3, 1); ctx.fillRect(11, 29, 1, 2);
        // Right Bottom Tau
        ctx.fillRect(19, 30, 3, 1); ctx.fillRect(20, 29, 1, 2);
        // Center/Top Tau (Small)
        ctx.fillRect(14.5, 24, 3, 1); ctx.fillRect(15.5, 23, 1, 2);
        break;

    case 'junior_warden':
    case 'inner_guard':
    case 'senior_warden':
    case 'senior_deacon':
        const role = resolvedKey;

        // Head
        ctx.fillStyle = C_FLESH; ctx.beginPath(); ctx.arc(16, 6, 6, 0, Math.PI*2); ctx.fill();

        // Hair
        if (role === 'senior_warden') {
            ctx.fillStyle = '#94a3b8'; // Grey
            ctx.beginPath(); ctx.arc(16, 5, 6, Math.PI, 0); ctx.fill();
        } else {
            ctx.fillStyle = '#78350f'; // Brown
            ctx.beginPath(); ctx.arc(16, 5, 6, Math.PI, 0); ctx.fill();
        }

        // Suit Body
        ctx.fillStyle = C_SUIT; ctx.fillRect(8, 12, 16, 22);
        // Legs
        ctx.fillRect(9, 34, 6, 12); ctx.fillRect(17, 34, 6, 12);
        // Shoes
        ctx.fillStyle = '#000000'; ctx.fillRect(8, 46, 7, 2); ctx.fillRect(17, 46, 7, 2);
        // Arms
        ctx.fillStyle = C_SUIT; ctx.fillRect(5, 13, 3, 16); ctx.fillRect(24, 13, 3, 16);
        // Hands
        ctx.fillStyle = C_FLESH; ctx.fillRect(5, 29, 3, 3); ctx.fillRect(24, 29, 3, 3);

        // Collar (Turquoise)
        ctx.strokeStyle = C_TURQUOISE; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(11, 14); ctx.lineTo(16, 24); ctx.lineTo(21, 14); ctx.stroke();

        // Jewel (Silver)
        ctx.strokeStyle = C_SILVER; ctx.lineWidth = 1.5;
        if (role === 'inner_guard') {
            // Crossed Swords
            ctx.beginPath(); ctx.moveTo(14, 24); ctx.lineTo(18, 29); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(18, 24); ctx.lineTo(14, 29); ctx.stroke();
        } else if (role === 'junior_warden') {
            // Plumb Rule
            ctx.beginPath(); ctx.moveTo(16, 24); ctx.lineTo(16, 30); ctx.stroke();
            // Bob
            ctx.beginPath(); ctx.arc(16, 31, 1, 0, Math.PI*2); ctx.stroke();
        } else if (role === 'senior_warden') {
            // Level
            ctx.beginPath(); ctx.moveTo(13, 28); ctx.lineTo(19, 28); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(16, 28); ctx.lineTo(16, 25); ctx.stroke();
        } else if (role === 'senior_deacon') {
            // Square and Compasses (simplified)
            ctx.beginPath(); ctx.moveTo(14, 26); ctx.lineTo(16, 30); ctx.lineTo(18, 26); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(14, 28); ctx.lineTo(18, 28); ctx.stroke();
        }

        // --- MASTER MASON APRON ---
        // Body
        ctx.fillStyle = C_WHITE; ctx.fillRect(9, 22, 14, 11);
        // Border
        ctx.strokeStyle = C_TURQUOISE; ctx.lineWidth = 2; ctx.strokeRect(9, 22, 14, 11);

        // Silver Chains (Tassels)
        ctx.fillStyle = C_SILVER;
        ctx.fillRect(10, 24, 2, 5); // Left
        ctx.fillRect(20, 24, 2, 5); // Right

        // Rosettes (Turquoise Circles with texture)
        ctx.fillStyle = C_TURQUOISE;
        // Bottom Left
        ctx.beginPath(); ctx.arc(11, 30, 2, 0, Math.PI*2); ctx.fill();
        // Bottom Right
        ctx.beginPath(); ctx.arc(21, 30, 2, 0, Math.PI*2); ctx.fill();
        // Inner texture for rosette
        ctx.fillStyle = C_TURQUOISE_DARK;
        ctx.fillRect(10.5, 29.5, 1, 1); ctx.fillRect(20.5, 29.5, 1, 1);
        break;

    case 'tassel':
        ctx.translate(cx, cy);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(0, 0); ctx.stroke();
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, 2, 3, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(-2, 10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(0, 11); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(2, 10); ctx.stroke();
        break;

    case 'square_compass':
        ctx.translate(cx, cy);
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-8, 9); ctx.lineTo(0, -9); ctx.lineTo(8, 9); ctx.stroke();
        ctx.strokeStyle = C_SILVER;
        ctx.beginPath(); ctx.moveTo(-10, -3); ctx.lineTo(0, 6); ctx.lineTo(10, -3); ctx.stroke();
        break;

    case 'pillar_ionic':
        fillRect(4, 140, 32, 20, C_SILVER);
        const gI = ctx.createLinearGradient(6,0,34,0);
        gI.addColorStop(0, '#94a3b8'); gI.addColorStop(0.5, '#f1f5f9'); gI.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gI; ctx.fillRect(6, 25, 28, 115);
        fillRect(2, 10, 36, 15, C_SILVER);
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(10, 18, 5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(30, 18, 5, 0, Math.PI*2); ctx.fill();
        break;

    case 'pillar_doric':
        fillRect(4, 140, 32, 20, C_SILVER);
        const gD = ctx.createLinearGradient(6,0,34,0);
        gD.addColorStop(0, '#94a3b8'); gD.addColorStop(0.5, '#f1f5f9'); gD.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gD; ctx.fillRect(6, 20, 28, 120);
        fillRect(2, 10, 36, 10, C_SILVER);
        fillRect(4, 20, 32, 5, '#94a3b8');
        break;

    case 'pillar_corinthian':
        fillRect(4, 140, 32, 20, C_SILVER);
        const gC = ctx.createLinearGradient(6,0,34,0);
        gC.addColorStop(0, '#94a3b8'); gC.addColorStop(0.5, '#f1f5f9'); gC.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gC; ctx.fillRect(6, 35, 28, 105);
        fillRect(4, 5, 32, 30, C_SILVER);
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.moveTo(4, 35); ctx.lineTo(4, 15); ctx.lineTo(10, 25); ctx.fill();
        ctx.beginPath(); ctx.moveTo(36, 35); ctx.lineTo(36, 15); ctx.lineTo(30, 25); ctx.fill();
        ctx.beginPath(); ctx.moveTo(18, 35); ctx.lineTo(20, 15); ctx.lineTo(22, 35); ctx.fill();
        break;

    // === FIVE ORDERS OF ARCHITECTURE (for FC) ===

    case 'pillar_tuscan':
        fillRect(4, 140, 32, 20, C_SILVER);
        const gT = ctx.createLinearGradient(8,0,32,0);
        gT.addColorStop(0, '#94a3b8'); gT.addColorStop(0.5, '#e2e8f0'); gT.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gT; ctx.fillRect(8, 15, 24, 125);
        fillRect(4, 10, 32, 8, C_SILVER);
        break;

    case 'pillar_composite':
        fillRect(4, 140, 32, 20, C_SILVER);
        const gCo = ctx.createLinearGradient(6,0,34,0);
        gCo.addColorStop(0, '#94a3b8'); gCo.addColorStop(0.5, '#f1f5f9'); gCo.addColorStop(1, '#94a3b8');
        ctx.fillStyle = gCo; ctx.fillRect(6, 35, 28, 105);
        fillRect(2, 5, 36, 30, C_SILVER);
        // Volutes (from Ionic)
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.arc(10, 18, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(30, 18, 4, 0, Math.PI*2); ctx.fill();
        // Leaves (from Corinthian)
        ctx.beginPath(); ctx.moveTo(16, 35); ctx.lineTo(20, 10); ctx.lineTo(24, 35); ctx.fill();
        break;

    default:
        fillRect(0,0,32,32,'#ef4444');
  }

  return canvas.toDataURL();
};
