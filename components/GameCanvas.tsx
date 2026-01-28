import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Player, Orb, Platform, Question } from '../types';
import {
  GRAVITY, FRICTION, MOVE_SPEED, JUMP_FORCE,
  WORLD_WIDTH, WORLD_HEIGHT, PLATFORM_DATA, ORB_DATA, GOAL_X, GOAL_Y_OFFSET, QUESTIONS,
  DESIGN_HEIGHT, CHECKPOINTS, NPC_CONFIG, TASSELS, LIBERAL_ARTS_LABELS, STAIRCASE_MARKERS,
  TEMPLE_COLORS, ROOM_DEFINITIONS, LIGHT_SOURCES
} from '../constants';
import QuizModal from './QuizModal';
import LoreModal from './LoreModal';
import { generateSpriteUrl } from '../utils/assetGenerator';
import { submitScore as submitLeaderboardScore } from '../api/leaderboard';

// Import shared rendering library (Early 2000s Graphics Refresh)
import {
  setSmoothing,
  drawDropShadow,
  drawDynamicShadow,
  drawBloom,
  drawCollectibleGlow,
  drawVignette,
  createScreenShake,
  updateScreenShake,
  ParticleSystem,
  createLandingDust,
  createJumpDust,
  createCollectionBurst,
  createCheckpointEffect,
  applyEnhancedLighting,
  drawTorchSmoke,
  generateStarField,
  renderStarField,
  createSquashStretch,
  applyLandingSquash,
  applyJumpStretch,
  updateSquashStretch,
  getHoverOffset,
  drawSpriteGlow,
  drawGlintEffect,
  TransitionManager,
  ScorePopupManager,
  ENHANCED_COLORS,
  withAlpha,
  type ScreenShake,
  type StarField,
} from '@shared/rendering';

type GameCanvasProps = {
  userId?: string | null;
  userName?: string | null;
  rank?: string | null;
  initiationDate?: string | null;
  isGrandOfficer?: boolean | null;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ userId, userName, rank, initiationDate, isGrandOfficer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const userNameRef = useRef<string | null>(userName ?? null);
  const rankRef = useRef<string | null>(rank ?? null);
  const initiationDateRef = useRef<string | null>(initiationDate ?? null);
  const isGrandOfficerRef = useRef<boolean | null>(isGrandOfficer ?? null);
  const innerGuardGreetedRef = useRef(false);
  
  // Dimensions state - Initialize safely for SSR/Window to prevent 0x0
  const [dimensions, setDimensions] = useState({ 
    w: typeof window !== 'undefined' ? (window.innerWidth || 800) : 800, 
    h: typeof window !== 'undefined' ? (window.innerHeight || 600) : 600 
  });
  
  const [isPortrait, setIsPortrait] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false); // User override for preview/desktop
  
  // Game State
  const [gameState, setGameState] = useState<GameState>(GameState.START_MENU);
  const [score, setScore] = useState(0);
  const [activeOrb, setActiveOrb] = useState<Orb | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [checkpointPopup, setCheckpointPopup] = useState(false);
  
  // Player Identity
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false); // New modal trigger
  const [tempName, setTempName] = useState(''); // For input field

  // Level Completion Warnings
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);

  // Player Progression State
  const [hasApron, setHasApron] = useState(false);
  const [isRestored, setIsRestored] = useState(false); // Track if Master has restored comforts
  
  // New Tassel Collection State
  const [collectedTassels, setCollectedTassels] = useState<Set<number>>(new Set());
  const [hasSeenTasselIntro, setHasSeenTasselIntro] = useState(false);

  // JW Interaction State (0: Start, 1: Q801 done, 2: Q802 done, 3: Completed)
  const [jwProgress, setJwProgress] = useState(0);

  // Standalone Mode State
  const [isStandalone, setIsStandalone] = useState(false);

  // Sound Toggle State
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundEnabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Screen Shake State (for fall death effect)
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('tutorialSeen') !== 'true';
    }
    return true;
  });

  useEffect(() => {
    if (userName) {
      userNameRef.current = userName;
      setPlayerName(userName);
      setTempName(userName);
      setShowNameInput(false);
    }
    if (rank) {
      rankRef.current = rank;
    }
    if (initiationDate) {
      initiationDateRef.current = initiationDate;
    }
    if (typeof isGrandOfficer === 'boolean') {
      isGrandOfficerRef.current = isGrandOfficer;
    }
  }, [userId, userName, rank, initiationDate, isGrandOfficer]);

  // Mutable Game State
  const playerRef = useRef<Player>({
    x: 50, y: DESIGN_HEIGHT - 100, width: 30, height: 45,
    vx: 0, vy: 0,
    isGrounded: false,
    color: '#ffffff',
    facing: 1,
    jumpCount: 0,
    coyoteTimer: 0
  });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  const orbsStateRef = useRef<Set<number>>(new Set()); // IDs of inactive orbs
  
  // Lore State Logic: Track which lore types (sprite keys) have been seen in this run
  const seenLoreRef = useRef<Set<string>>(new Set());

  // Checkpoint State
  const lastCheckpointRef = useRef({ x: 50, y: DESIGN_HEIGHT - 100 });
  const checkpointTimeoutRef = useRef<number | null>(null);

  // Momentum preservation for orb collection
  const savedVelocityRef = useRef({ vx: 0, vy: 0 });

  // Jump buffer for better input feel
  const jumpBufferRef = useRef(0);

  // God mode state
  const godModeRef = useRef(false);

  // Camera now tracks X and Y
  const cameraRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Asset Loading
  const spritesRef = useRef<Record<string, HTMLImageElement>>({});

  // Fullscreen tracking
  const hasTriedFullscreenRef = useRef(false);

  // Performance: Cached platforms array
  const platformsRef = useRef<Platform[]>([]);

  // Performance: Cached star positions with enhanced properties
  const starsRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    phase: number;
    brightness: number;
    color: 'white' | 'blue' | 'gold';
  }>>([]);

  // Dust particles for visual polish (legacy - keeping for compatibility)
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
  }>>([]);

  // === SHARED RENDERING LIBRARY REFS (Early 2000s Graphics Refresh) ===
  const particleSystemRef = useRef<ParticleSystem>(new ParticleSystem(100));
  const screenShakeStateRef = useRef<ScreenShake>({
    intensity: 0,
    duration: 0,
    elapsed: 0,
    offsetX: 0,
    offsetY: 0
  });
  const transitionManagerRef = useRef<TransitionManager>(new TransitionManager());
  const scorePopupManagerRef = useRef<ScorePopupManager>(new ScorePopupManager());
  const squashStretchRef = useRef(createSquashStretch());
  const starFieldRef = useRef<StarField | null>(null);
  const wasGroundedRef = useRef(false);
  const prevVyRef = useRef(0);

  // Submit score to My Year in the Chair
  const saveScoreToLeaderboard = async (finalScore: number, completed: boolean) => {
    const name = playerName.trim() || 'Anonymous';
    await submitLeaderboardScore(name, finalScore, completed, userId);
  };

  // --- Initialization & Resize ---
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Safety check for 0 dimensions to prevent blank screen
      if (w > 0 && h > 0) {
        setDimensions({ w, h });
        // Only trigger portrait mode on narrow screens (phones)
        // This allows desktop windows to be narrow without blocking gameplay
        const isNarrow = w < 768; 
        setIsPortrait(isNarrow && h > w);
      }
    };
    
    // Initial call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- Standalone Mode Detection ---
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneQuery || isIOSStandalone);
    };
    checkStandalone();
  }, []);

  // Persist sound preference
  useEffect(() => {
    localStorage.setItem('soundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  // Cache platforms on mount
  useEffect(() => {
    const groundRefY = DESIGN_HEIGHT - 40;
    platformsRef.current = PLATFORM_DATA.map(p => ({
      x: p.x,
      y: groundRefY + p.yOffset,
      width: p.width,
      height: p.height,
      color: p.color,
      type: p.type
    }));
  }, []);

  // Cache star positions on mount with enhanced properties
  useEffect(() => {
    const stars: Array<{
      x: number;
      y: number;
      size: number;
      phase: number;
      brightness: number;
      color: 'white' | 'blue' | 'gold';
    }> = [];
    const STAR_CELL = 200;

    for (let x = 0; x < WORLD_WIDTH + STAR_CELL; x += STAR_CELL) {
      for (let y = -800; y < DESIGN_HEIGHT + 400; y += STAR_CELL) {
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const val = n - Math.floor(n);
        if (val > 0.7) {
          stars.push({
            x: x + (val * 100) % 150,
            y: y + ((val * 1000) % 150),
            size: val * 2 + 0.5, // Slightly larger range
            phase: val * 10,
            brightness: 0.3 + val * 0.7,
            color: val > 0.9 ? 'gold' : val > 0.85 ? 'blue' : 'white'
          });
        }
      }
    }
    starsRef.current = stars;
  }, []);

 
  // Preload Sprites
  useEffect(() => {
    const uniqueKeys = Array.from(new Set(ORB_DATA.map(o => o.spriteKey)));
    
    // We explicitly include NPC sprites and Tassels
    const assetsToLoad = [
        ...uniqueKeys,
        'square_compass',
        'wm',
        'inner_guard',
        'senior_warden',
        'junior_warden',
        'officer',
        'grand_master',
        'tassel',
        'pillar_ionic',
        'pillar_doric',
        'pillar_corinthian'
    ];

    assetsToLoad.forEach(key => {
        const img = new Image();
        img.src = generateSpriteUrl(key);
        spritesRef.current[key] = img;
    });
  }, []);

  // --- Sound ---
  const playSound = (type: 'jump' | 'collect' | 'error' | 'win' | 'lore') => {
    if (!soundEnabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (!ctx) return;
    
    // Resume if suspended (PC/Browser requirement)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'collect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'lore') {
      // Mystical chord
      const freqs = [330, 440, 554]; // A Major
      freqs.forEach(f => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.05, now);
          g.gain.linearRampToValueAtTime(0, now + 1.0);
          o.start(now);
          o.stop(now + 1.0);
      });
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 1.0);
      osc.start(now);
      osc.stop(now + 1.0);
    }
  };

  // Helper to trigger fullscreen with vendor prefixes
  const enterFullscreen = () => {
    if (hasTriedFullscreenRef.current) return;
    hasTriedFullscreenRef.current = true;

    try {
      const docEl = document.documentElement as any;
      const request = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (request) {
        request.call(docEl).catch(() => {});
      }
    } catch (e) { }
  };

  // Toggle Function with comprehensive prefix support
  const toggleFullscreen = () => {
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;
      
      const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
      
      if (!isFullscreen) {
        const request = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
        if (request) {
            request.call(docEl).catch((e: any) => console.log("Fullscreen request failed", e));
        }
      } else {
        const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
        if (exit) exit.call(doc).catch((e: any) => console.log("Fullscreen exit failed", e));
      }
    } catch (e) {
      console.log('Fullscreen API error', e);
    }
  };

  // Reusable Jump Logic
  const executeJump = () => {
    const p = playerRef.current;
    if (p.isGrounded || p.coyoteTimer > 0) {
      // Create jump dust particles at player's feet
      createJumpDust(
        particleSystemRef.current,
        p.x + p.width / 2,
        p.y + p.height
      );
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      p.jumpCount = 1;
      p.coyoteTimer = 0;
      jumpBufferRef.current = 0; // Clear buffer
      playSound('jump');
    } else if (p.jumpCount < 2) {
      p.vy = JUMP_FORCE;
      p.jumpCount++;
      jumpBufferRef.current = 0; // Clear buffer
      playSound('jump');
    } else {
      // Can't jump now, but buffer the input
      jumpBufferRef.current = 8; // 8 frames buffer
    }
  };

  // Input Listeners (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // God Mode toggle: Ctrl+Alt+G
      if (e.ctrlKey && e.altKey && e.code === 'KeyG') {
        godModeRef.current = !godModeRef.current;
        console.log('God Mode:', godModeRef.current ? 'ENABLED' : 'DISABLED');
        return;
      }

      // Escape toggles pause
      if (e.code === 'Escape') {
        if (gameState === GameState.PLAYING) {
          setGameState(GameState.PAUSED);
        } else if (gameState === GameState.PAUSED) {
          setGameState(GameState.PLAYING);
        }
        return;
      }

      if (gameState !== GameState.PLAYING) return;
      if (e.code === 'Space' && !e.repeat) executeJump();
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (e.code === 'Space' && playerRef.current.vy < 0 && !godModeRef.current) playerRef.current.vy *= 0.5;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Input Handler for both Touch and Mouse
  const handleInputStart = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    if (e.cancelable) e.preventDefault();
    enterFullscreen();
    if (key === 'Space') executeJump();
    keysRef.current[key] = true;
  };

  const handleInputEnd = (key: string) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    keysRef.current[key] = false;
    if (key === 'Space' && playerRef.current.vy < 0) playerRef.current.vy *= 0.5;
  };

  // --- DRAWING HELPERS ---
  const drawStoneBlock = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
    const isLargePlatform = h > 80;

    ctx.save();

    if (isLargePlatform) {
      // Large platforms get proper Masonic floor pattern
      // Draw the platform body first
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, w, h);

      // Draw mosaic pattern on top surface only (2 rows)
      const TILE_SIZE = 12;
      const rows = 2;

      for (let row = 0; row < rows; row++) {
        const cols = Math.ceil(w / TILE_SIZE);
        for (let col = 0; col < cols; col++) {
          const tx = x + col * TILE_SIZE;
          const ty = y + row * TILE_SIZE;
          const tw = Math.min(TILE_SIZE, x + w - tx);
          const th = TILE_SIZE;

          // Proper checkered with offset rows
          const isBlack = (col + row) % 2 === 0;
          ctx.fillStyle = isBlack ? '#1e293b' : '#e2e8f0';
          ctx.fillRect(tx, ty, tw, th);

          // Add subtle 3D effect to each tile
          ctx.strokeStyle = isBlack ? '#0f172a' : '#f8fafc';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(tx, ty + th);
          ctx.lineTo(tx, ty);
          ctx.lineTo(tx + tw, ty);
          ctx.stroke();
        }
      }

      // Stone texture below the floor
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x, y + rows * TILE_SIZE, w, h - rows * TILE_SIZE);

      // Add stone block lines
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      const blockHeight = 20;
      for (let by = y + rows * TILE_SIZE + blockHeight; by < y + h; by += blockHeight) {
        ctx.beginPath();
        ctx.moveTo(x, by);
        ctx.lineTo(x + w, by);
        ctx.stroke();
      }

      // Top edge highlight
      const topGrad = ctx.createLinearGradient(x, y, x, y + 4);
      topGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      topGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(x, y, w, 4);

    } else {
      // Smaller platforms - stone texture
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, y, w, h);

      // Stone veining
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      for(let i=0; i<w; i+=15) {
          ctx.beginPath();
          ctx.moveTo(x + i, y);
          ctx.lineTo(x + i - 20, y + h);
          ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Top checkered pattern (single row)
      const TILE_SIZE = 12;
      const cols = Math.ceil(w / TILE_SIZE);
      for(let c=0; c<cols; c++) {
          const tx = x + c * TILE_SIZE;
          const tw = Math.min(TILE_SIZE, x + w - tx);
          ctx.fillStyle = (c % 2 === 0) ? '#1e293b' : '#f8fafc';
          ctx.fillRect(tx, y, tw, TILE_SIZE);
      }

      // Top edge highlight
      const topGrad = ctx.createLinearGradient(x, y, x, y + 3);
      topGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      topGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(x, y, w, 3);
    }

    // Border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
  };

  // Draw stone wall pattern with block texture
  const drawStoneWall = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.save();

    // Base stone color
    ctx.fillStyle = TEMPLE_COLORS.STONE_MID;
    ctx.fillRect(x, y, w, h);

    // Stone block pattern
    const blockW = 40;
    const blockH = 20;
    ctx.strokeStyle = TEMPLE_COLORS.STONE_DARK;
    ctx.lineWidth = 1;

    let row = 0;
    for (let by = y; by < y + h; by += blockH) {
      const offset = (row % 2) * (blockW / 2);
      for (let bx = x - offset; bx < x + w + blockW; bx += blockW) {
        if (bx + blockW > x && bx < x + w) {
          const drawX = Math.max(x, bx);
          const drawW = Math.min(bx + blockW, x + w) - drawX;
          const drawH = Math.min(blockH, y + h - by);

          // Block highlight (top-left)
          ctx.fillStyle = TEMPLE_COLORS.STONE_LIGHT;
          ctx.fillRect(drawX, by, drawW, 2);
          ctx.fillRect(drawX, by, 2, drawH);

          // Block shadow (bottom-right)
          ctx.fillStyle = TEMPLE_COLORS.STONE_DARK;
          ctx.fillRect(drawX, by + drawH - 2, drawW, 2);
          ctx.fillRect(drawX + drawW - 2, by, 2, drawH);
        }
      }
      row++;
    }

    ctx.restore();
  };

  // Draw checkered mosaic pavement (Masonic floor)
  const drawMasonicFloor = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.save();

    const TILE_SIZE = 16;
    const rows = Math.ceil(h / TILE_SIZE);
    const cols = Math.ceil(w / TILE_SIZE);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tx = x + col * TILE_SIZE;
        const ty = y + row * TILE_SIZE;
        const tw = Math.min(TILE_SIZE, x + w - tx);
        const th = Math.min(TILE_SIZE, y + h - ty);

        // Checkered pattern with row offset for perspective
        const isBlack = (col + row) % 2 === 0;
        ctx.fillStyle = isBlack ? TEMPLE_COLORS.MOSAIC_BLACK : TEMPLE_COLORS.MOSAIC_WHITE;
        ctx.fillRect(tx, ty, tw, th);

        // Subtle 3D tile effect
        if (!isBlack) {
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(tx, ty, tw, 1);
          ctx.fillRect(tx, ty, 1, th);
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.3)';
          ctx.fillRect(tx + tw - 1, ty, 1, th);
          ctx.fillRect(tx, ty + th - 1, tw, 1);
        }
      }
    }

    // Border/grout line around the entire floor
    ctx.strokeStyle = TEMPLE_COLORS.STONE_DARK;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.restore();
  };

  // Draw a classical pillar (Ionic/Doric/Corinthian style)
  const drawPillar = (ctx: CanvasRenderingContext2D, x: number, y: number, height: number, style: 'ionic' | 'doric' | 'corinthian' = 'doric') => {
    ctx.save();

    const pillarW = 30;
    const baseH = 15;
    const capitalH = style === 'corinthian' ? 25 : 15;
    const shaftH = height - baseH - capitalH;

    // Base
    ctx.fillStyle = TEMPLE_COLORS.STONE_LIGHT;
    ctx.fillRect(x - pillarW/2 - 5, y - baseH, pillarW + 10, baseH);
    ctx.fillStyle = TEMPLE_COLORS.STONE_ACCENT;
    ctx.fillRect(x - pillarW/2 - 3, y - baseH, pillarW + 6, 3);

    // Shaft with fluting effect
    const shaftGrad = ctx.createLinearGradient(x - pillarW/2, 0, x + pillarW/2, 0);
    shaftGrad.addColorStop(0, TEMPLE_COLORS.STONE_MID);
    shaftGrad.addColorStop(0.3, TEMPLE_COLORS.STONE_LIGHT);
    shaftGrad.addColorStop(0.7, TEMPLE_COLORS.STONE_LIGHT);
    shaftGrad.addColorStop(1, TEMPLE_COLORS.STONE_MID);
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(x - pillarW/2, y - baseH - shaftH, pillarW, shaftH);

    // Fluting lines
    ctx.strokeStyle = TEMPLE_COLORS.STONE_DARK;
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 5; i++) {
      const fx = x - pillarW/2 + (pillarW * i / 5);
      ctx.beginPath();
      ctx.moveTo(fx, y - baseH);
      ctx.lineTo(fx, y - baseH - shaftH);
      ctx.stroke();
    }

    // Capital
    const capY = y - baseH - shaftH - capitalH;
    ctx.fillStyle = TEMPLE_COLORS.STONE_LIGHT;

    if (style === 'ionic') {
      // Ionic volutes (scrolls)
      ctx.fillRect(x - pillarW/2 - 8, capY + capitalH - 8, pillarW + 16, 8);
      ctx.beginPath();
      ctx.arc(x - pillarW/2 - 5, capY + capitalH - 4, 6, 0, Math.PI * 2);
      ctx.arc(x + pillarW/2 + 5, capY + capitalH - 4, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'corinthian') {
      // Corinthian acanthus leaves (simplified)
      ctx.fillRect(x - pillarW/2 - 5, capY + 10, pillarW + 10, capitalH - 10);
      ctx.fillStyle = TEMPLE_COLORS.GOLD;
      for (let i = 0; i < 5; i++) {
        const leafX = x - pillarW/2 + (i * pillarW / 4);
        ctx.beginPath();
        ctx.moveTo(leafX, capY + capitalH);
        ctx.quadraticCurveTo(leafX + 3, capY + 5, leafX + 6, capY);
        ctx.quadraticCurveTo(leafX + 9, capY + 5, leafX + 12, capY + capitalH);
        ctx.fill();
      }
    } else {
      // Doric - simple circular capital
      ctx.fillRect(x - pillarW/2 - 3, capY + capitalH - 6, pillarW + 6, 6);
      ctx.fillRect(x - pillarW/2, capY, pillarW, capitalH - 6);
    }

    ctx.restore();
  };

  // Draw a flickering candle with glow
  const drawCandle = (ctx: CanvasRenderingContext2D, x: number, y: number, frameTime: number) => {
    ctx.save();

    // Flicker effect
    const flicker = Math.sin(frameTime / 100) * 0.15 + Math.sin(frameTime / 67) * 0.1;
    const flameSway = Math.sin(frameTime / 150) * 2;

    // Candle holder
    ctx.fillStyle = TEMPLE_COLORS.GOLD;
    ctx.beginPath();
    ctx.moveTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.lineTo(x + 5, y - 5);
    ctx.lineTo(x - 5, y - 5);
    ctx.closePath();
    ctx.fill();

    // Candle body
    ctx.fillStyle = '#f5f5dc'; // Cream/wax color
    ctx.fillRect(x - 4, y - 25, 8, 20);

    // Wick
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - 25);
    ctx.lineTo(x, y - 30);
    ctx.stroke();

    // Flame glow
    const glowRadius = 25 + flicker * 10;
    const glowGrad = ctx.createRadialGradient(x + flameSway, y - 35, 0, x, y - 30, glowRadius);
    glowGrad.addColorStop(0, `rgba(255, 200, 100, ${0.6 + flicker})`);
    glowGrad.addColorStop(0.5, `rgba(255, 150, 50, ${0.3 + flicker * 0.5})`);
    glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x + flameSway/2, y - 32, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Flame
    ctx.fillStyle = TEMPLE_COLORS.CANDLE_GLOW;
    ctx.beginPath();
    ctx.moveTo(x - 3 + flameSway, y - 30);
    ctx.quadraticCurveTo(x + flameSway, y - 45 - flicker * 5, x + 3 + flameSway, y - 30);
    ctx.fill();

    // Inner flame (white hot)
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    ctx.moveTo(x - 1 + flameSway, y - 30);
    ctx.quadraticCurveTo(x + flameSway, y - 38 - flicker * 3, x + 1 + flameSway, y - 30);
    ctx.fill();

    ctx.restore();
  };

  // Draw an archway with pillars
  const drawArchway = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.save();

    const pillarW = 25;
    const archThickness = 20;

    // Left pillar
    drawPillar(ctx, x - width/2 + pillarW/2, y, height - archThickness, 'ionic');

    // Right pillar
    drawPillar(ctx, x + width/2 - pillarW/2, y, height - archThickness, 'ionic');

    // Arch
    const archY = y - height + archThickness;
    ctx.fillStyle = TEMPLE_COLORS.STONE_LIGHT;
    ctx.beginPath();
    ctx.moveTo(x - width/2, archY + archThickness);
    ctx.lineTo(x - width/2, archY);
    ctx.quadraticCurveTo(x, archY - 30, x + width/2, archY);
    ctx.lineTo(x + width/2, archY + archThickness);
    ctx.quadraticCurveTo(x, archY - 10, x - width/2, archY + archThickness);
    ctx.fill();

    // Keystone
    ctx.fillStyle = TEMPLE_COLORS.GOLD;
    ctx.beginPath();
    ctx.moveTo(x - 10, archY - 20);
    ctx.lineTo(x + 10, archY - 20);
    ctx.lineTo(x + 8, archY);
    ctx.lineTo(x - 8, archY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Draw the All-Seeing Eye with animation
  const drawAllSeeingEye = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frameTime: number) => {
    ctx.save();

    const pulse = Math.sin(frameTime / 500) * 0.1 + 1;
    const rayRotation = frameTime / 2000;

    // Radiant rays
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rayRotation);
    ctx.strokeStyle = TEMPLE_COLORS.GOLD_BRIGHT;
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * size * 0.8, Math.sin(angle) * size * 0.6);
      ctx.lineTo(Math.cos(angle) * size * 1.5 * pulse, Math.sin(angle) * size * pulse);
      ctx.stroke();
    }
    ctx.restore();

    // Triangle
    ctx.fillStyle = TEMPLE_COLORS.GOLD;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size * 0.8, y + size * 0.6);
    ctx.lineTo(x + size * 0.8, y + size * 0.6);
    ctx.closePath();
    ctx.fill();

    // Triangle border
    ctx.strokeStyle = TEMPLE_COLORS.GOLD_BRIGHT;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eye white
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.4, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Iris
    ctx.fillStyle = TEMPLE_COLORS.ROYAL_BLUE;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x - size * 0.05, y - size * 0.05, size * 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Draw vaulted ceiling with painted stars
  const drawVaultedCeiling = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, frameTime: number) => {
    ctx.save();

    // Ceiling gradient (darker at edges)
    const ceilingGrad = ctx.createLinearGradient(x, y, x, y + height);
    ceilingGrad.addColorStop(0, TEMPLE_COLORS.CEILING_DARK);
    ceilingGrad.addColorStop(0.5, TEMPLE_COLORS.ROYAL_BLUE);
    ceilingGrad.addColorStop(1, TEMPLE_COLORS.CEILING_DARK);
    ctx.fillStyle = ceilingGrad;
    ctx.fillRect(x, y, width, height);

    // Painted stars on ceiling
    const starCount = Math.floor(width / 50);
    for (let i = 0; i < starCount; i++) {
      const starX = x + (i + 0.5) * (width / starCount) + Math.sin(i * 3) * 15;
      const starY = y + height * 0.3 + Math.cos(i * 2) * (height * 0.2);
      const twinkle = Math.sin(frameTime / 800 + i) * 0.3 + 0.7;

      // Star glow
      ctx.fillStyle = `rgba(255, 223, 186, ${twinkle * 0.3})`;
      ctx.beginPath();
      ctx.arc(starX, starY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Star point
      ctx.fillStyle = `rgba(255, 248, 220, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(starX, starY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Architectural ribs
    ctx.strokeStyle = TEMPLE_COLORS.STONE_DARK;
    ctx.lineWidth = 3;
    const ribCount = Math.floor(width / 150);
    for (let i = 0; i <= ribCount; i++) {
      const ribX = x + (i * width / ribCount);
      ctx.beginPath();
      ctx.moveTo(ribX, y + height);
      ctx.quadraticCurveTo(ribX, y + height * 0.3, x + width/2, y);
      ctx.stroke();
    }

    ctx.restore();
  };

  // Draw blazing sun symbol
  const drawSunSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frameTime: number) => {
    ctx.save();

    const pulse = Math.sin(frameTime / 300) * 0.1 + 1;
    const rotation = frameTime / 5000;

    // Outer glow
    const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0.4)');
    glowGrad.addColorStop(0.5, 'rgba(255, 165, 0, 0.2)');
    glowGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Rays
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.fillStyle = TEMPLE_COLORS.GOLD_BRIGHT;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const rayLength = (i % 2 === 0) ? size * 1.5 * pulse : size * 1.2 * pulse;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.1) * size * 0.7, Math.sin(angle - 0.1) * size * 0.7);
      ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
      ctx.lineTo(Math.cos(angle + 0.1) * size * 0.7, Math.sin(angle + 0.1) * size * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Sun disk
    const diskGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.7);
    diskGrad.addColorStop(0, '#fff8dc');
    diskGrad.addColorStop(0.7, TEMPLE_COLORS.GOLD_BRIGHT);
    diskGrad.addColorStop(1, TEMPLE_COLORS.GOLD);
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Face features (simplified)
    ctx.fillStyle = TEMPLE_COLORS.GOLD;
    // Eyes
    ctx.beginPath();
    ctx.arc(x - size * 0.2, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.2, y - size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.beginPath();
    ctx.arc(x, y + size * 0.15, size * 0.2, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.restore();
  };

  // Draw crescent moon symbol
  const drawMoonSymbol = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frameTime: number) => {
    ctx.save();

    const glow = Math.sin(frameTime / 600) * 0.1 + 0.9;

    // Moon glow
    const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 1.5);
    glowGrad.addColorStop(0, `rgba(200, 210, 255, ${glow * 0.3})`);
    glowGrad.addColorStop(1, 'rgba(150, 170, 220, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Crescent shape
    ctx.fillStyle = '#e8e4df';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Cut out to make crescent
    ctx.fillStyle = TEMPLE_COLORS.NIGHT_SKY;
    ctx.beginPath();
    ctx.arc(x + size * 0.4, y, size * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Face features
    ctx.fillStyle = '#bbb8b0';
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y - size * 0.15, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - size * 0.35, y + size * 0.2, size * 0.08, 0, Math.PI, true);
    ctx.stroke();

    ctx.restore();
  };

  // Draw tool on pedestal (replacing floating orb look)
  const drawToolOnPedestal = (ctx: CanvasRenderingContext2D, x: number, y: number, spriteKey: string, frameTime: number) => {
    ctx.save();

    const pedestalH = 25;
    const pedestalW = 35;

    // Pedestal base
    ctx.fillStyle = TEMPLE_COLORS.STONE_LIGHT;
    ctx.fillRect(x - pedestalW/2 - 5, y - 5, pedestalW + 10, 8);

    // Pedestal shaft
    const shaftGrad = ctx.createLinearGradient(x - pedestalW/2, 0, x + pedestalW/2, 0);
    shaftGrad.addColorStop(0, TEMPLE_COLORS.STONE_MID);
    shaftGrad.addColorStop(0.5, TEMPLE_COLORS.STONE_LIGHT);
    shaftGrad.addColorStop(1, TEMPLE_COLORS.STONE_MID);
    ctx.fillStyle = shaftGrad;
    ctx.fillRect(x - pedestalW/2, y - pedestalH, pedestalW, pedestalH - 5);

    // Pedestal top
    ctx.fillStyle = TEMPLE_COLORS.STONE_ACCENT;
    ctx.fillRect(x - pedestalW/2 - 3, y - pedestalH - 3, pedestalW + 6, 5);

    // Subtle golden glow around tool
    const pulse = Math.sin(frameTime / 400) * 0.2 + 0.8;
    const glowGrad = ctx.createRadialGradient(x, y - pedestalH - 20, 0, x, y - pedestalH - 20, 30);
    glowGrad.addColorStop(0, `rgba(212, 175, 55, ${pulse * 0.4})`);
    glowGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y - pedestalH - 20, 30, 0, Math.PI * 2);
    ctx.fill();

    // Draw the tool sprite on top of pedestal
    const img = spritesRef.current[spriteKey];
    const toolSize = 36;
    if (img && img.complete && img.naturalHeight !== 0) {
      ctx.drawImage(img, x - toolSize/2, y - pedestalH - toolSize - 3, toolSize, toolSize);
    } else {
      // Fallback circle
      ctx.fillStyle = TEMPLE_COLORS.GOLD;
      ctx.beginPath();
      ctx.arc(x, y - pedestalH - 20, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Apply lighting overlay for candlelit atmosphere (subtle warm glow, not darkening)
  const applyLighting = (
    ctx: CanvasRenderingContext2D,
    lights: typeof LIGHT_SOURCES,
    cameraX: number,
    cameraY: number,
    viewW: number,
    viewH: number
  ) => {
    ctx.save();

    // Only add warm colored light glows - no darkness overlay
    // This creates pools of warm light without darkening the scene
    ctx.globalCompositeOperation = 'screen';

    for (const light of lights) {
      // Only process lights that might be visible
      if (light.x < cameraX - light.radius || light.x > cameraX + viewW + light.radius) continue;
      if (light.y < cameraY - light.radius || light.y > cameraY + viewH + light.radius) continue;

      const colorGrad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius * 0.8);
      // Subtle warm glow - intensity controls brightness
      const alpha = Math.floor(light.intensity * 40); // 0-40 hex (0-25% opacity)
      const alphaHex = alpha.toString(16).padStart(2, '0');
      colorGrad.addColorStop(0, light.color + alphaHex);
      colorGrad.addColorStop(0.6, light.color + Math.floor(alpha * 0.4).toString(16).padStart(2, '0'));
      colorGrad.addColorStop(1, light.color + '00');

      ctx.fillStyle = colorGrad;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
  };

  const drawPlayerSprite = (ctx: CanvasRenderingContext2D, p: Player, showApron: boolean, isRestored: boolean) => {
    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    ctx.scale(p.facing, 1); 

    // ANIMATION LOGIC
    // Calculate leg swing based on velocity (faster movement = faster animation)
    const baseWalkSpeed = 120; // base ms per cycle
    const velocityFactor = Math.min(Math.abs(p.vx) / 5.5, 1.5); // Normalize to max speed
    const walkSpeed = baseWalkSpeed / Math.max(velocityFactor, 0.5); // Faster movement = faster cycle
    const isMoving = Math.abs(p.vx) > 0.1;
    const walkCycle = Date.now() / walkSpeed;

    // Leg Offsets (in pixels) - amplitude increases with speed
    const legAmplitude = 4 + velocityFactor * 2; // 4-7 pixels based on speed
    let leftLegOffset = 0;
    let rightLegOffset = 0;
    let bodyBob = 0;

    if (!p.isGrounded) {
        // Jump Pose: Splay legs slightly
        leftLegOffset = -4; // Back leg kick
        rightLegOffset = 5;  // Front leg reach
    } else if (isMoving) {
        // Walk Cycle: Oscillate legs alternately
        leftLegOffset = Math.sin(walkCycle) * legAmplitude;
        rightLegOffset = Math.sin(walkCycle + Math.PI) * legAmplitude;
        // Subtle body bob when running
        bodyBob = Math.abs(Math.sin(walkCycle * 2)) * 1.5;
    }

    // Apply body bob for running animation
    ctx.translate(0, -bodyBob);

    // Head (Flesh tone)
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath(); ctx.arc(0, -16, 7, 0, Math.PI * 2); ctx.fill();

    // Hair (Dark Suit Color) - Fuller, completely covering top
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(7, -20); 
    ctx.bezierCurveTo(4, -27, -9, -27, -10, -20);
    ctx.lineTo(-10, -9); 
    ctx.lineTo(-3, -9);
    ctx.lineTo(-3, -14);
    ctx.lineTo(7, -20);
    ctx.fill();

    // --- FELLOW CRAFT - Always visible (no blindfold in 2nd Degree) ---
    // Eye
    ctx.fillStyle = '#000000';
    ctx.fillRect(4, -17, 2, 2);

    // Suit Body
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-7, -10, 14, 20);

    // White Shirt
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4, -10); ctx.lineTo(4, -10); ctx.lineTo(0, 0);
    ctx.fill();

    // Black Tie
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-1, -10); ctx.lineTo(1, -10); ctx.lineTo(0.5, -2); ctx.lineTo(-0.5, -2);
    ctx.fill();

    // Legs - Animated
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6 + leftLegOffset, 10, 5, 12); // Left Leg
    ctx.fillRect(1 + rightLegOffset, 10, 5, 12); // Right Leg

    // Shoes
    ctx.fillStyle = '#000000';
    ctx.fillRect(-6 + leftLegOffset, 22, 7, 3);
    ctx.fillRect(1 + rightLegOffset, 22, 7, 3);

    // Arms - Animated opposite to legs (natural walking motion)
    ctx.fillStyle = '#0f172a';
    const armAmplitude = 3 + velocityFactor * 1.5;
    const leftArmSwing = isMoving ? Math.sin(walkCycle + Math.PI) * armAmplitude : 0;
    const rightArmSwing = isMoving ? Math.sin(walkCycle) * armAmplitude : 0;

    ctx.fillRect(-9 + leftArmSwing, -8, 3, 14);
    ctx.fillRect(6 + rightArmSwing, -8, 3, 14);

    // Hands
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(-9 + leftArmSwing, 6, 3, 3);
    ctx.fillRect(6 + rightArmSwing, 6, 3, 3);

    // --- APRON ---
    // Always show apron - EA apron initially, FC apron after being passed
    ctx.fillStyle = '#f8fafc'; // White Leather
    ctx.strokeStyle = '#cbd5e1'; // Subtle border
    ctx.lineWidth = 1;

    // Main Square (Skirt)
    ctx.fillRect(-7, 0, 14, 10);
    ctx.strokeRect(-7, 0, 14, 10);

    if (!isRestored) {
        // EA APRON - Plain white with flap DOWN
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.lineTo(0, 5); // Points DOWN
        ctx.closePath();
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.stroke();
    } else {
        // FC APRON - Flap DOWN with TWO green/blue rosettes at bottom corners
        ctx.beginPath();
        ctx.moveTo(-7, 0);
        ctx.lineTo(7, 0);
        ctx.lineTo(0, 5); // Points DOWN for FC
        ctx.closePath();
        ctx.fillStyle = '#f8fafc';
        ctx.fill();
        ctx.stroke();

        // Two green/blue rosettes at bottom corners of apron
        ctx.fillStyle = '#0f766e'; // Teal rosettes
        ctx.beginPath();
        ctx.arc(-4, 8, 2, 0, Math.PI * 2); // Left rosette
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 8, 2, 0, Math.PI * 2); // Right rosette
        ctx.fill();

        // Rosette centers (lighter teal)
        ctx.fillStyle = '#5eead4';
        ctx.beginPath();
        ctx.arc(-4, 8, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, 8, 0.8, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  };

  const drawNPC = (ctx: CanvasRenderingContext2D, spriteKey: string, x: number, y: number, frameTime?: number) => {
      const img = spritesRef.current[spriteKey];
      if (img && img.complete && img.naturalHeight !== 0) {
          const targetHeight = playerRef.current.height || 45;
          const w = img.naturalWidth || 32;
          const h = img.naturalHeight || 32;
          const scale = targetHeight / h;
          const scaledW = w * scale;
          const scaledH = h * scale;

          ctx.save();

          // Draw shadow beneath NPC
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(x, y, scaledW / 2 - 3, 4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Draw NPC (standing still)
          ctx.drawImage(img, x - scaledW / 2, y - scaledH, scaledW, scaledH);

          ctx.restore();
      } else {
          // Fallback box
          ctx.fillStyle = 'purple';
          ctx.fillRect(x - 10, y - 30, 20, 30);
      }
  };

  // Draw decorative goal area arch
  const drawGoalArea = (ctx: CanvasRenderingContext2D, x: number, y: number, frameTime: number, isUnlocked: boolean) => {
    ctx.save();

    const archWidth = 120;
    const archHeight = 150;
    const columnWidth = 18;
    const doorWidth = archWidth - columnWidth * 2 - 8;
    const doorHeight = archHeight - 20;

    // Animated light rays emanating from center (only when unlocked)
    if (isUnlocked) {
      const rayCount = 8;
      ctx.save();
      ctx.translate(x, y - archHeight / 2);
      ctx.rotate(frameTime / 3000);

      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * 200, Math.sin(angle) * 200);
        rayGrad.addColorStop(0, 'rgba(251, 191, 36, 0.3)');
        rayGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');

        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle - 0.1) * 180, Math.sin(angle - 0.1) * 180);
        ctx.lineTo(Math.cos(angle + 0.1) * 180, Math.sin(angle + 0.1) * 180);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Left column
    const leftColX = x - archWidth / 2;
    const colGradL = ctx.createLinearGradient(leftColX, y, leftColX + columnWidth, y);
    colGradL.addColorStop(0, '#92400e');
    colGradL.addColorStop(0.3, '#d97706');
    colGradL.addColorStop(0.7, '#fbbf24');
    colGradL.addColorStop(1, '#d97706');
    ctx.fillStyle = colGradL;
    ctx.fillRect(leftColX, y - archHeight, columnWidth, archHeight);

    // Left column base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(leftColX - 4, y - 10, columnWidth + 8, 10);

    // Left column capital
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(leftColX - 4, y - archHeight - 10, columnWidth + 8, 10);

    // Right column
    const rightColX = x + archWidth / 2 - columnWidth;
    const colGradR = ctx.createLinearGradient(rightColX, y, rightColX + columnWidth, y);
    colGradR.addColorStop(0, '#d97706');
    colGradR.addColorStop(0.3, '#fbbf24');
    colGradR.addColorStop(0.7, '#d97706');
    colGradR.addColorStop(1, '#92400e');
    ctx.fillStyle = colGradR;
    ctx.fillRect(rightColX, y - archHeight, columnWidth, archHeight);

    // Right column base
    ctx.fillStyle = '#78350f';
    ctx.fillRect(rightColX - 4, y - 10, columnWidth + 8, 10);

    // Right column capital
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(rightColX - 4, y - archHeight - 10, columnWidth + 8, 10);

    // Arch top (lintel)
    const lintelGrad = ctx.createLinearGradient(x - archWidth / 2, y - archHeight - 10, x - archWidth / 2, y - archHeight - 30);
    lintelGrad.addColorStop(0, '#d97706');
    lintelGrad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = lintelGrad;
    ctx.fillRect(leftColX - 4, y - archHeight - 30, archWidth + 8, 20);

    // Triangular pediment
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.moveTo(leftColX - 10, y - archHeight - 30);
    ctx.lineTo(x, y - archHeight - 70);
    ctx.lineTo(rightColX + columnWidth + 10, y - archHeight - 30);
    ctx.closePath();
    ctx.fill();

    // Pediment border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.stroke();

    // === TEMPLE DOOR ===
    const doorX = x - doorWidth / 2;
    const doorY = y - doorHeight;

    if (isUnlocked) {
      // OPEN DOOR - Show golden light beyond
      const lightGrad = ctx.createRadialGradient(x, y - doorHeight / 2, 0, x, y - doorHeight / 2, doorWidth);
      lightGrad.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
      lightGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.6)');
      lightGrad.addColorStop(1, 'rgba(217, 119, 6, 0.3)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

      // Door frame edge (open door leaf visible on side)
      ctx.fillStyle = '#5c4033';
      ctx.fillRect(doorX - 8, doorY, 10, doorHeight);

      // "FELLOW CRAFT" text above doorway
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px serif';
      ctx.textAlign = 'center';
      ctx.fillText('FELLOW CRAFT', x, doorY - 5);
    } else {
      // CLOSED DOOR - Wooden temple door with lock
      const woodGrad = ctx.createLinearGradient(doorX, doorY, doorX + doorWidth, doorY);
      woodGrad.addColorStop(0, '#5c4033');
      woodGrad.addColorStop(0.2, '#8b6914');
      woodGrad.addColorStop(0.5, '#654321');
      woodGrad.addColorStop(0.8, '#8b6914');
      woodGrad.addColorStop(1, '#5c4033');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

      // Door panels
      ctx.strokeStyle = '#3d2817';
      ctx.lineWidth = 2;
      const panelPadding = 6;
      const panelWidth = (doorWidth - panelPadding * 3) / 2;
      const panelHeight = (doorHeight - panelPadding * 4) / 3;

      // Draw 6 panels (2 columns x 3 rows)
      for (let col = 0; col < 2; col++) {
        for (let row = 0; row < 3; row++) {
          const px = doorX + panelPadding + col * (panelWidth + panelPadding);
          const py = doorY + panelPadding + row * (panelHeight + panelPadding);
          ctx.strokeRect(px, py, panelWidth, panelHeight);
        }
      }

      // Center line between doors
      ctx.beginPath();
      ctx.moveTo(x, doorY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Lock symbol in center
      const lockY = y - doorHeight / 2;
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x - 8, lockY - 5, 16, 12);
      ctx.beginPath();
      ctx.arc(x, lockY - 8, 6, Math.PI, 0, false);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Keyhole
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(x, lockY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 1, lockY, 2, 4);

      // "SEALED" text (pulsing)
      const sealPulse = Math.sin(frameTime / 500) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(220, 38, 38, ${sealPulse})`;
      ctx.font = 'bold 12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('SEALED', x, doorY - 5);
    }

    // Square and Compass symbol in center of arch (no G - NZ style)
    const pulse = Math.sin(frameTime / 400) * 0.2 + 0.8;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15 * pulse;

    // Draw simplified Square and Compass
    const scX = x;
    const scY = y - archHeight / 2 - 20;
    const scSize = 18;

    ctx.strokeStyle = `rgba(251, 191, 36, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Compass (V shape pointing down)
    ctx.beginPath();
    ctx.moveTo(scX - scSize * 0.6, scY - scSize * 0.5);
    ctx.lineTo(scX, scY + scSize * 0.5);
    ctx.lineTo(scX + scSize * 0.6, scY - scSize * 0.5);
    ctx.stroke();

    // Square (L shape)
    ctx.beginPath();
    ctx.moveTo(scX - scSize * 0.5, scY + scSize * 0.3);
    ctx.lineTo(scX - scSize * 0.5, scY - scSize * 0.3);
    ctx.lineTo(scX + scSize * 0.5, scY - scSize * 0.3);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    ctx.restore();
  };

  // Get current room based on world X position
  const getCurrentRoom = (worldX: number) => {
    for (const room of ROOM_DEFINITIONS) {
      if (worldX >= room.xStart && worldX < room.xEnd) {
        return room;
      }
    }
    return ROOM_DEFINITIONS[ROOM_DEFINITIONS.length - 1];
  };

  // Section-based visual theming (enhanced for temple atmosphere)
  const getSectionTheme = (worldX: number): {
    tint: string;
    fogColor: string;
    starBrightness: number;
    showStars: boolean;
    ceilingStyle: 'stone' | 'vaulted' | 'celestial' | 'open';
  } => {
    const room = getCurrentRoom(worldX);

    switch (room.id) {
      case 1: // Preparation Room
        return {
          tint: 'rgba(45, 42, 38, 0.15)',
          fogColor: 'rgba(100, 80, 60, 0.08)',
          starBrightness: 0,
          showStars: false,
          ceilingStyle: 'stone'
        };
      case 2: // Entrance Porch
        return {
          tint: 'rgba(74, 69, 64, 0.12)',
          fogColor: 'rgba(120, 100, 80, 0.06)',
          starBrightness: 0.3,
          showStars: false,
          ceilingStyle: 'stone'
        };
      case 3: // Lodge Room West
        return {
          tint: 'rgba(30, 58, 95, 0.08)',
          fogColor: 'rgba(100, 116, 139, 0.05)',
          starBrightness: 0.6,
          showStars: true,
          ceilingStyle: 'vaulted'
        };
      case 4: // Lodge Center
        return {
          tint: 'rgba(30, 58, 95, 0.06)',
          fogColor: 'rgba(100, 116, 139, 0.04)',
          starBrightness: 0.8,
          showStars: true,
          ceilingStyle: 'vaulted'
        };
      case 5: // North Passage
        return {
          tint: 'rgba(30, 41, 59, 0.2)',
          fogColor: 'rgba(50, 70, 90, 0.15)',
          starBrightness: 0.2,
          showStars: false,
          ceilingStyle: 'stone'
        };
      case 6: // Winding Stairs
        return {
          tint: 'rgba(74, 69, 64, 0.1)',
          fogColor: 'rgba(150, 150, 180, 0.06)',
          starBrightness: 0.5,
          showStars: false,
          ceilingStyle: 'stone'
        };
      case 7: // Middle Chamber
        return {
          tint: 'rgba(212, 175, 55, 0.08)',
          fogColor: 'rgba(251, 191, 36, 0.05)',
          starBrightness: 1.0,
          showStars: true,
          ceilingStyle: 'vaulted'
        };
      case 8: // Celestial Canopy
        return {
          tint: 'rgba(139, 92, 246, 0.06)',
          fogColor: 'rgba(200, 180, 255, 0.04)',
          starBrightness: 1.5,
          showStars: true,
          ceilingStyle: 'celestial'
        };
      case 9: // The East
        return {
          tint: 'rgba(255, 215, 0, 0.1)',
          fogColor: 'rgba(251, 191, 36, 0.08)',
          starBrightness: 0.8,
          showStars: true,
          ceilingStyle: 'open'
        };
      default:
        return {
          tint: 'rgba(74, 69, 64, 0.1)',
          fogColor: 'rgba(100, 80, 60, 0.06)',
          starBrightness: 0.5,
          showStars: true,
          ceilingStyle: 'stone'
        };
    }
  };

  const drawTempleBackground = (ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, width: number, height: number, frameTime: number) => {
    ctx.save();

    // Get section theme based on camera center
    const centerX = cameraX + width / 2;
    const theme = getSectionTheme(centerX);
    const currentRoom = getCurrentRoom(centerX);

    // Base background - dark temple interior
    const skyGrad = ctx.createLinearGradient(0, cameraY, 0, cameraY + height);
    skyGrad.addColorStop(0, TEMPLE_COLORS.CEILING_DARK);
    skyGrad.addColorStop(0.3, TEMPLE_COLORS.NIGHT_SKY);
    skyGrad.addColorStop(1, TEMPLE_COLORS.STONE_DARK);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(cameraX, cameraY, width, height);

    // Draw stone walls in background (parallax - slow movement)
    const parallaxX = cameraX * 0.2;
    const wallSegmentW = 300;
    const wallStart = Math.floor((cameraX - 100) / wallSegmentW);
    const wallEnd = Math.ceil((cameraX + width + 100) / wallSegmentW);

    ctx.globalAlpha = 0.3;
    for (let i = wallStart; i <= wallEnd; i++) {
      const wallX = i * wallSegmentW - parallaxX % wallSegmentW;
      drawStoneWall(ctx, wallX, cameraY, wallSegmentW, height);
    }
    ctx.globalAlpha = 1.0;

    // Vaulted ceiling rendering for appropriate rooms
    if (theme.ceilingStyle === 'vaulted' && cameraY < 150) {
      drawVaultedCeiling(ctx, cameraX, cameraY, width, 120, frameTime);
    }

    // Draw painted stars on ceiling (only in rooms with starry ceilings)
    if (theme.showStars) {
      const stars = starsRef.current;
      const starColors = {
        white: [255, 255, 255],
        blue: [200, 220, 255],
        gold: [255, 215, 150]
      };

      for (const star of stars) {
        if (star.x >= cameraX - 50 && star.x <= cameraX + width + 50 &&
            star.y >= cameraY - 50 && star.y <= cameraY + height + 50) {
          const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frameTime / 1500 + star.phase));
          const alpha = twinkle * star.brightness * theme.starBrightness;
          const [r, g, b] = starColors[star.color];
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha)})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Room-specific decorations
    // Entrance Porch - Great pillars (Jachin & Boaz positions)
    if (centerX >= 800 && centerX < 1200) {
      if (850 > cameraX && 850 < cameraX + width) {
        drawPillar(ctx, 850, DESIGN_HEIGHT - 40, 200, 'ionic');
      }
      if (1150 > cameraX && 1150 < cameraX + width) {
        drawPillar(ctx, 1150, DESIGN_HEIGHT - 40, 200, 'ionic');
      }
    }

    // Lodge rooms - decorative archways
    if (currentRoom.id >= 3 && currentRoom.id <= 4) {
      const archX = currentRoom.xStart + (currentRoom.xEnd - currentRoom.xStart) / 2;
      if (archX > cameraX - 100 && archX < cameraX + width + 100) {
        ctx.globalAlpha = 0.5;
        drawArchway(ctx, archX, DESIGN_HEIGHT - 40, 150, 180);
        ctx.globalAlpha = 1.0;
      }
    }

    // Middle Chamber - All-Seeing Eye at the top of Jacob's Ladder
    if (currentRoom.id === 7 && cameraY < -500) {
      drawAllSeeingEye(ctx, 5250, -650, 40, frameTime);
    }

    // Celestial Canopy - Moon and ethereal atmosphere
    if (currentRoom.id === 8) {
      // Draw moon in the West
      if (5700 > cameraX && 5700 < cameraX + width) {
        drawMoonSymbol(ctx, 5700, cameraY + 80, 30, frameTime);
      }
    }

    // The East - Blazing Sun
    if (currentRoom.id === 9) {
      const sunX = 7600;
      const sunY = cameraY + 100;
      if (sunX > cameraX - 100 && sunX < cameraX + width + 100) {
        drawSunSymbol(ctx, sunX, sunY, 50, frameTime);
      }
      // All-Seeing Eye above the sun
      if (sunX > cameraX - 50 && sunX < cameraX + width + 50) {
        drawAllSeeingEye(ctx, sunX, sunY - 120, 35, frameTime);
      }
    }

    // Decorative pillars in background (room-aware styling)
    const PILLAR_GAP = 350;
    const pStart = Math.floor(cameraX / PILLAR_GAP);
    const pEnd = Math.floor((cameraX + width) / PILLAR_GAP) + 1;

    for (let i = pStart; i <= pEnd; i++) {
      const px = i * PILLAR_GAP;
      const pillarRoom = getCurrentRoom(px);

      // Skip pillars in certain rooms
      if (pillarRoom.id === 5) continue; // North Passage - no pillars

      let pillarStyle: 'ionic' | 'doric' | 'corinthian' = 'doric';
      if (pillarRoom.id <= 2) pillarStyle = 'ionic';
      else if (pillarRoom.id >= 7) pillarStyle = 'corinthian';

      ctx.globalAlpha = 0.4;
      drawPillar(ctx, px, DESIGN_HEIGHT + 200, 300, pillarStyle);
      ctx.globalAlpha = 1.0;
    }

    // Draw Liberal Arts & Sciences Labels with enhanced glow (Seven Steps)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 24px serif';
    ctx.shadowColor = TEMPLE_COLORS.GOLD_BRIGHT;
    ctx.shadowBlur = 15;
    ctx.fillStyle = TEMPLE_COLORS.GOLD_BRIGHT;
    // Draw Liberal Arts & Sciences labels on the Seven Steps
    LIBERAL_ARTS_LABELS.forEach(label => {
      if (label.x > cameraX - 100 && label.x < cameraX + width + 100) {
        ctx.fillText(label.text, label.x, DESIGN_HEIGHT - 40 + label.yOffset - 30);
      }
    });
    ctx.restore();

    // Warm atmospheric fog (candlelit ambiance)
    const fogBands = [
      { y: 200, alpha: 0.03, speed: 0.015 },
      { y: 280, alpha: 0.05, speed: 0.01 },
    ];

    fogBands.forEach(band => {
      const offset = (frameTime * band.speed) % (width * 2);
      ctx.save();
      ctx.globalAlpha = band.alpha;
      const gradient = ctx.createLinearGradient(cameraX, 0, cameraX + width, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.3, theme.fogColor);
      gradient.addColorStop(0.7, theme.fogColor);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(cameraX - offset, band.y + cameraY, width * 3, 60);
      ctx.restore();
    });

    // Ceiling cornice (architectural detail)
    if (cameraY < 80 && theme.ceilingStyle !== 'celestial' && theme.ceilingStyle !== 'open') {
      const cY = cameraY;
      const cH = 50;

      ctx.fillStyle = TEMPLE_COLORS.STONE_DARK;
      ctx.fillRect(cameraX, cY, width, cH);

      // Decorative molding
      ctx.strokeStyle = TEMPLE_COLORS.STONE_MID;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cameraX, cY + 15);
      ctx.lineTo(cameraX + width, cY + 15);
      ctx.moveTo(cameraX, cY + 40);
      ctx.lineTo(cameraX + width, cY + 40);
      ctx.stroke();

      // Dentil pattern
      ctx.fillStyle = TEMPLE_COLORS.STONE_LIGHT;
      const dentilSize = 18;
      const dStart = Math.floor(cameraX / dentilSize);
      const dEnd = Math.floor((cameraX + width) / dentilSize) + 1;
      for (let i = dStart; i <= dEnd; i++) {
        if (i % 2 === 0) {
          ctx.fillRect(i * dentilSize, cY + 22, dentilSize - 2, 12);
        }
      }
    }

    // Apply section theme tint overlay
    ctx.fillStyle = theme.tint;
    ctx.fillRect(cameraX, cameraY, width, height);

    ctx.restore();
  };

  // --- Main Loop ---
  const gameLoop = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    // Safety Try-Catch for Render Loop
    try {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.imageSmoothingEnabled = false;

        const { w, h } = dimensions;
        // Safety for zero dimensions
        if (w === 0 || h === 0) return;

        const scaleRatio = h / DESIGN_HEIGHT;
        const viewW = w / scaleRatio;
        const viewH = DESIGN_HEIGHT;

        const player = playerRef.current;
        const keys = keysRef.current;
        
        const groundRefY = DESIGN_HEIGHT - 40;

        // Use cached platforms for performance
        const platforms = platformsRef.current;

        const orbs: Orb[] = ORB_DATA.map(o => ({
        ...o,
        x: o.x,
        y: groundRefY + o.yOffset,
        active: !orbsStateRef.current.has(o.id)
        }));
        const collectedOrbs = orbsStateRef.current.size;
        const allOrbsCollected = collectedOrbs >= ORB_DATA.length;

        // --- PHYSICS ---
        if (keys['ArrowLeft']) { player.vx -= 1; player.facing = -1; }
        if (keys['ArrowRight']) { player.vx += 1; player.facing = 1; }

        // MOVEMENT LIMIT FOR BLINDFOLDED CANDIDATE
        const currentSpeedLimit = isRestored ? MOVE_SPEED : 2.5; // Slow crawl if not restored (increased from 1.5)

        if (player.vx > currentSpeedLimit) player.vx = currentSpeedLimit;
        if (player.vx < -currentSpeedLimit) player.vx = -currentSpeedLimit;

        player.vx *= FRICTION;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
        player.x += player.vx;

        // God mode flying: holding space makes player fly up
        if (godModeRef.current && keys['Space']) {
          player.vy = -8; // Fly upward
        } else {
          player.vy += GRAVITY;
        }
        player.y += player.vy;

        // --- NPC INTERACTIONS ---

        // 0. INNER GUARD (Name Entry Challenge for FC)
        // He stands at the start. If name is not entered, he blocks path.
        const igX = NPC_CONFIG.INNER_GUARD.x;
        const resolvedName = userNameRef.current || playerName;
        const resolvedRank = rankRef.current;
        const resolvedInitiationDate = initiationDateRef.current;
        const resolvedIsGrandOfficer = isGrandOfficerRef.current;
        const hasIdentityDetails = Boolean(resolvedName && resolvedRank && resolvedInitiationDate);

        if (hasIdentityDetails) {
            // Player has all details - IG greets them
            if (!innerGuardGreetedRef.current && player.x > igX - 50) {
                innerGuardGreetedRef.current = true;
                player.vx = 0;
                keysRef.current = {}; // Stop inputs

                let response = `Whom have you there? Brother ${resolvedRank} ${resolvedName}, who was initiated on ${resolvedInitiationDate}. The Senior Warden awaits to invest you with the badge of a Fellow Craft.`;
                if (resolvedIsGrandOfficer === true) {
                    response = `Whom have you there? A Grand Lodge Officer! I am honoured to admit you, ${resolvedName}. The Senior Warden awaits to invest you.`;
                } else if (resolvedIsGrandOfficer === false) {
                    response = 'Whom have you there? You seek advancement in Freemasonry. The Senior Warden awaits to invest you with the badge of a Fellow Craft.';
                }

                const innerGuardOrbMock: Orb = {
                    id: 997,
                    x: 0, y: 0, radius: 0, active: true,
                    name: 'Inner Guard',
                    spriteKey: 'inner_guard',
                    blurb: response
                };

                setActiveOrb(innerGuardOrbMock);
                setGameState(GameState.LORE);
                playSound('lore');
            }
        } else {
            // Player is missing identity details - block and show name input
            if (player.x > igX - 50) {
                player.x = igX - 50;
                player.vx = 0;
                keysRef.current = {}; // Stop inputs
                setShowNameInput(true); // Trigger Modal
            }
        }

        // 1. SENIOR WARDEN INTERACTION (Near Start - Presents FC Apron)
        const swFirstX = NPC_CONFIG.SENIOR_WARDEN.x;
        const swFirstY = groundRefY + NPC_CONFIG.SENIOR_WARDEN.yOffset;
        if (!isRestored && innerGuardGreetedRef.current) {
            // Block player at SW until they receive the apron
            if (player.x > swFirstX - 30) {
                player.x = swFirstX - 30;
                player.vx = 0;
                keysRef.current = {}; // Stop movement

                const swOrbMock: Orb = {
                    id: 999,
                    x: 0, y: 0, radius: 0, active: true,
                    name: "Senior Warden",
                    spriteKey: "senior_warden",
                    blurb: "Brother, I invest you with the distinguishing badge of a Fellow Craft Freemason. It points out that as a Craftsman you are expected to make the liberal arts and sciences your future study. Now ascend the Winding Staircase to the Middle Chamber."
                };
                setActiveOrb(swOrbMock);
                setGameState(GameState.LORE);
                playSound('lore');
            }
        }

        // 2. JUNIOR WARDEN INTERACTION
        const jwX = NPC_CONFIG.JUNIOR_WARDEN.x;
        const jwY = groundRefY + NPC_CONFIG.JUNIOR_WARDEN.yOffset; 
        
        if (jwProgress < 3) {
            const distToJW = Math.abs((player.x + player.width/2) - jwX);
            const heightDiff = Math.abs((player.y + player.height) - jwY); // Check feet relative to platform

            if (distToJW < 40 && heightDiff < 50) {
                 player.vx = 0;
                 keysRef.current = {};

                 const jwOrbMock: Orb = {
                    id: 998,
                    x: 0, y: 0, radius: 0, active: true,
                    name: "Junior Warden",
                    spriteKey: "junior_warden",
                    blurb: "Brother, before you proceed further, I must ask you a few questions regarding your entrance into the Lodge."
                 };
                 setActiveOrb(jwOrbMock);
                 setGameState(GameState.LORE);
                 playSound('lore');
            }
        }

        // 3. TASSELS COLLECTION (NOW TRIGGERS POPUP)
        for (const tassel of TASSELS) {
             if (!collectedTassels.has(tassel.id)) {
                 const tX = tassel.x;
                 const tY = groundRefY + tassel.yOffset;
                 const dx = (player.x + player.width/2) - tX;
                 const dy = (player.y + player.height/2) - tY;
                 if (Math.sqrt(dx*dx + dy*dy) < 40) {
                     // Check if this is the first tassel (show introduction)
                     const isFirstTassel = collectedTassels.size === 0 && !hasSeenTasselIntro;

                     // Build the blurb with optional introduction
                     let blurbText = (tassel as any).blurb || "One of the four cardinal virtues.";
                     if (isFirstTassel) {
                         blurbText = `You have discovered the first of FOUR TASSELS, representing the Four Cardinal Virtues of Freemasonry. This tassel represents ${tassel.name}. ${blurbText} Collect all four for a Perfect Ashlar Bonus!`;
                         setHasSeenTasselIntro(true);
                     }

                     // Create a temporary Orb object for the Tassel to use the Lore Modal
                     const tasselOrbMock: Orb = {
                        id: tassel.id,
                        x: 0, y: 0, radius: 0, active: true,
                        name: isFirstTassel ? `Cardinal Virtue: ${tassel.name}` : tassel.name,
                        spriteKey: 'tassel',
                        blurb: blurbText
                     };

                     player.vx = 0;
                     keysRef.current = {};
                     setActiveOrb(tasselOrbMock);
                     setGameState(GameState.LORE);
                     playSound('lore');
                 }
             }
        }

        // 4. WORSHIPFUL MASTER (GOAL) INTERACTION - Middle Chamber
        const wmX = NPC_CONFIG.WORSHIPFUL_MASTER.x;
        const wmY = groundRefY + NPC_CONFIG.WORSHIPFUL_MASTER.yOffset;
        const distToWM = Math.abs((player.x + player.width/2) - wmX);
        // Trigger win if close to WM in Middle Chamber
        if (distToWM < 50 && Math.abs((player.y + player.height) - wmY) < 60) {
            if (allOrbsCollected) {
                // Middle Chamber Bonus (all stairs completed)?
                let bonus = 0;
                if (collectedTassels.size >= 3) {
                    bonus = 1000; // Middle Chamber Bonus for completing all 15 steps
                }
                
                setScore(s => s + bonus); // Add bonus visually before saving
                saveScoreToLeaderboard(score + 500 + bonus, true);
                setGameState(GameState.VICTORY);
                playSound('win');
                return;
            } else {
                 player.x = wmX - 60;
                 player.vx = 0;
                 if (!warningMessage) {
                    const toolsCollected = collectedOrbs;
                    const totalTools = ORB_DATA.length;
                    setWarningMessage(`Grand Master: "The door to the Fellow Craft degree remains sealed. You have collected ${toolsCollected} of ${totalTools} Working Tools. Return when you have proven your proficiency."`);
                    playSound('error');
                    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
                    warningTimeoutRef.current = window.setTimeout(() => setWarningMessage(null), 4000);
                 }
            }
        }


        for (const cp of CHECKPOINTS) {
            if (player.x > cp.x && cp.x > lastCheckpointRef.current.x) {
                lastCheckpointRef.current = { x: cp.x, y: groundRefY + cp.yOffset - 100 };
                setCheckpointPopup(true);
                playSound('lore');
                // Add checkpoint celebration particles and flash
                createCheckpointEffect(
                  particleSystemRef.current,
                  player.x + player.width / 2,
                  player.y + player.height / 2
                );
                transitionManagerRef.current.flash(200, '#fbbf24', 0.2);

                if (checkpointTimeoutRef.current) window.clearTimeout(checkpointTimeoutRef.current);
                checkpointTimeoutRef.current = window.setTimeout(() => {
                    setCheckpointPopup(false);
                }, 3000);
            }
        }

        if (player.x < 0) { player.x = 0; player.vx = 0; }
        if (player.x > WORLD_WIDTH - player.width) { player.x = WORLD_WIDTH - player.width; player.vx = 0; }
        
        if (player.y > groundRefY + 600) {
        // Trigger screen shake effect
        setScreenShake({ x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 });
        setTimeout(() => setScreenShake({ x: 0, y: 0 }), 100);
        // Add death flash effect
        transitionManagerRef.current.flash(150, '#ff0000', 0.3);

        player.x = lastCheckpointRef.current.x;
        player.y = lastCheckpointRef.current.y;
        player.vx = 0; player.vy = 0; player.jumpCount = 0; player.coyoteTimer = 0;
        playSound('error');
        }

        player.isGrounded = false;
        for (const plat of platforms) {
        if (
            player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y < plat.y + plat.height &&
            player.y + player.height > plat.y
        ) {
            // Calculate overlap amounts
            const playerCenterX = player.x + player.width / 2;
            const playerCenterY = player.y + player.height / 2;
            const platCenterX = plat.x + plat.width / 2;
            const platCenterY = plat.y + plat.height / 2;

            const overlapX = (player.width + plat.width) / 2 - Math.abs(playerCenterX - platCenterX);
            const overlapY = (player.height + plat.height) / 2 - Math.abs(playerCenterY - platCenterY);

            if (overlapX < overlapY) {
            // Horizontal collision - use relative position, not velocity
            if (playerCenterX < platCenterX) {
                player.x = plat.x - player.width; // Push left
            } else {
                player.x = plat.x + plat.width; // Push right
            }
            player.vx = 0;
            } else {
            // Vertical collision - use relative position for direction
            if (playerCenterY < platCenterY) {
                // Player is above platform
                player.y = plat.y - player.height;
                player.isGrounded = true;
                player.vy = 0;
                player.jumpCount = 0;
            } else {
                // Player is below platform (hit head)
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
            }
        }
        }

        if (player.isGrounded) player.coyoteTimer = 6;
        else if (player.coyoteTimer > 0) player.coyoteTimer--;

        // === LANDING DETECTION FOR PARTICLES AND SQUASH/STRETCH ===
        const justLanded = player.isGrounded && !wasGroundedRef.current && prevVyRef.current > 2;
        if (justLanded) {
          const landingImpact = Math.min(prevVyRef.current / 15, 1);
          // Create landing dust particles
          createLandingDust(
            particleSystemRef.current,
            player.x + player.width / 2,
            player.y + player.height,
            landingImpact
          );
          // Apply squash effect based on landing impact
          applyLandingSquash(squashStretchRef.current, landingImpact);
        }
        wasGroundedRef.current = player.isGrounded;
        prevVyRef.current = player.vy;

        // Update squash/stretch animation
        updateSquashStretch(squashStretchRef.current);

        // Update particle system
        particleSystemRef.current.update(16.67);

        // Update transition manager
        transitionManagerRef.current.update();

        // Update score popups
        scorePopupManagerRef.current.update();

        // Jump buffer: execute buffered jump if player just landed
        if (player.isGrounded && jumpBufferRef.current > 0) {
          executeJump();
        }
        if (jumpBufferRef.current > 0) jumpBufferRef.current--;

        for (const orb of orbs) {
        if (!orb.active) continue;
        const dx = (player.x + player.width / 2) - orb.x;
        const dy = (player.y + player.height / 2) - orb.y;
        if (Math.sqrt(dx * dx + dy * dy) < orb.radius + player.width / 2 + 10) {
            // Save velocity before stopping for momentum preservation
            savedVelocityRef.current = { vx: player.vx, vy: player.vy };
            setActiveOrb(orb);
            playerRef.current.vx = 0;
            playerRef.current.vy = 0;
            keysRef.current = {};
            if (seenLoreRef.current.has(orb.spriteKey)) {
                if (orb.questionId !== undefined) {
                    const question = QUESTIONS.find(q => q.id === orb.questionId);
                    if (question) {
                        setActiveQuestion(question);
                        setGameState(GameState.QUIZ);
                        playSound('lore'); 
                    } else handleCorrectAnswer(); 
                } else handleCorrectAnswer();
            } else {
                seenLoreRef.current.add(orb.spriteKey);
                setGameState(GameState.LORE); 
                playSound('lore');
            }
            return;
        }
        }

        // Camera system optimized for vertical gameplay (Winding Staircase)
        let targetCamX = player.x - viewW / 2 + player.width / 2;
        const lookAheadY = player.vy * 8;
        // Keep player in upper portion of screen for vertical ascent view (player looks up)
        let targetCamY = (player.y - viewH * 0.4) + lookAheadY;
        if (targetCamX < 0) targetCamX = 0;
        const maxScrollX = WORLD_WIDTH - viewW;
        if (targetCamX > maxScrollX) targetCamX = maxScrollX;
        // Clamp Y to world bounds - allow showing ground floor (positive Y up to groundRefY)
        const maxCamY = groundRefY - viewH + 60; // Show ground floor with some padding
        if (targetCamY > maxCamY) targetCamY = maxCamY;
        const minCamY = -WORLD_HEIGHT + viewH;
        if (targetCamY < minCamY) targetCamY = minCamY;
        cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.1;
        cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.15; // Faster Y follow for vertical gameplay 

        ctx.resetTransform();
        ctx.clearRect(0,0,w,h);
        ctx.save();
        ctx.scale(scaleRatio, scaleRatio);
        ctx.translate(
          -Math.floor(cameraRef.current.x) + screenShake.x,
          -Math.floor(cameraRef.current.y) + screenShake.y
        );

        // Cache frame time for all animations (performance optimization)
        const frameTime = Date.now();

        drawTempleBackground(ctx, cameraRef.current.x, cameraRef.current.y, viewW, viewH, frameTime);

        // Check if door is unlocked (all orbs collected)
        const isDoorUnlocked = allOrbsCollected;

        // Draw Goal Area arch with temple door (behind the Worshipful Master in Middle Chamber)
        drawGoalArea(ctx, wmX, wmY, frameTime, isDoorUnlocked);

        // Draw Officers (NPCs) with breathing animation
        drawNPC(ctx, 'inner_guard', NPC_CONFIG.INNER_GUARD.x, groundRefY + NPC_CONFIG.INNER_GUARD.yOffset, frameTime);
        drawNPC(ctx, 'senior_warden', swFirstX, swFirstY, frameTime);
        drawNPC(ctx, 'junior_warden', jwX, jwY, frameTime);
        // Worshipful Master awaits in the Middle Chamber
        drawNPC(ctx, 'wm', wmX, wmY, frameTime);

        CHECKPOINTS.forEach(cp => {
            const cpImg = spritesRef.current['square_compass'];
            const isPassed = lastCheckpointRef.current.x >= cp.x;
            const cpX = cp.x;
            const cpY = groundRefY + cp.yOffset - 50;

            ctx.save();

            // Draw decorative pillar base
            ctx.fillStyle = isPassed ? '#92400e' : '#374151';
            ctx.fillRect(cpX - 12, cpY + 35, 24, 8);

            // Draw column
            const colGrad = ctx.createLinearGradient(cpX - 8, cpY, cpX + 8, cpY);
            colGrad.addColorStop(0, isPassed ? '#d97706' : '#4b5563');
            colGrad.addColorStop(0.5, isPassed ? '#fbbf24' : '#6b7280');
            colGrad.addColorStop(1, isPassed ? '#d97706' : '#4b5563');
            ctx.fillStyle = colGrad;
            ctx.fillRect(cpX - 6, cpY + 10, 12, 25);

            // Draw capital (top decoration)
            ctx.fillStyle = isPassed ? '#fbbf24' : '#6b7280';
            ctx.fillRect(cpX - 10, cpY + 5, 20, 5);

            // Animated glow if passed
            if (isPassed) {
                const glowIntensity = 10 + Math.sin(frameTime / 300) * 5;
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = glowIntensity;
            }

            // Draw Square & Compass icon
            if (cpImg && cpImg.complete && cpImg.naturalWidth > 0) {
                if (isPassed) {
                    // Subtle wobble animation when passed
                    ctx.translate(cpX, cpY - 10);
                    const wobble = Math.sin(frameTime / 500) * 0.05;
                    ctx.rotate(wobble);
                    ctx.drawImage(cpImg, -20, -20, 40, 40);
                } else {
                    ctx.globalAlpha = 0.4;
                    ctx.drawImage(cpImg, cpX - 20, cpY - 30, 40, 40);
                }
            } else {
                ctx.fillStyle = isPassed ? '#fbbf24' : '#475569';
                ctx.beginPath();
                ctx.arc(cpX, cpY - 10, 12, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        // Platform rendering with type-specific styles
        platforms.forEach(plat => {
          switch (plat.type) {
            case 'floor':
              // Large floor platforms - mosaic pavement on top, stone wall below
              drawMasonicFloor(ctx, plat.x, plat.y, plat.width, 24);
              drawStoneWall(ctx, plat.x, plat.y + 24, plat.width, plat.height - 24);
              break;

            case 'step':
              // Stone stepping platforms
              ctx.save();
              ctx.fillStyle = plat.color;
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

              // Top surface highlight
              ctx.fillStyle = TEMPLE_COLORS.STONE_ACCENT;
              ctx.fillRect(plat.x, plat.y, plat.width, 3);

              // Shadow on bottom
              ctx.fillStyle = TEMPLE_COLORS.STONE_DARK;
              ctx.fillRect(plat.x, plat.y + plat.height - 2, plat.width, 2);

              // Simple stone texture lines
              ctx.strokeStyle = TEMPLE_COLORS.STONE_DARK;
              ctx.lineWidth = 0.5;
              ctx.globalAlpha = 0.4;
              for (let i = 8; i < plat.width; i += 15) {
                ctx.beginPath();
                ctx.moveTo(plat.x + i, plat.y);
                ctx.lineTo(plat.x + i - 5, plat.y + plat.height);
                ctx.stroke();
              }
              ctx.globalAlpha = 1.0;
              ctx.restore();
              break;

            case 'pillar_base':
              // Pillar platform bases
              ctx.save();
              // Base stone
              ctx.fillStyle = plat.color;
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

              // Decorative molding
              ctx.fillStyle = TEMPLE_COLORS.STONE_ACCENT;
              ctx.fillRect(plat.x - 3, plat.y, plat.width + 6, 5);
              ctx.fillRect(plat.x - 2, plat.y + plat.height - 5, plat.width + 4, 5);

              // Vertical fluting suggestion
              ctx.strokeStyle = TEMPLE_COLORS.STONE_DARK;
              ctx.lineWidth = 1;
              for (let i = 5; i < plat.width; i += 10) {
                ctx.beginPath();
                ctx.moveTo(plat.x + i, plat.y + 5);
                ctx.lineTo(plat.x + i, plat.y + plat.height - 5);
                ctx.stroke();
              }
              ctx.restore();
              break;

            case 'altar':
              // Special altar rendering with golden trim
              ctx.save();
              // Main body
              ctx.fillStyle = plat.color;
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

              // Golden top trim
              ctx.fillStyle = TEMPLE_COLORS.GOLD;
              ctx.fillRect(plat.x, plat.y, plat.width, 4);

              // Glow effect
              ctx.shadowColor = TEMPLE_COLORS.GOLD_BRIGHT;
              ctx.shadowBlur = 15;
              ctx.fillStyle = TEMPLE_COLORS.GOLD_BRIGHT;
              ctx.fillRect(plat.x + 2, plat.y + 1, plat.width - 4, 2);
              ctx.shadowBlur = 0;
              ctx.restore();
              break;

            case 'ladder_rung':
              // Jacob's Ladder rungs with golden glow
              ctx.save();
              // Golden rung
              const rungGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
              rungGrad.addColorStop(0, TEMPLE_COLORS.GOLD_BRIGHT);
              rungGrad.addColorStop(0.5, TEMPLE_COLORS.GOLD);
              rungGrad.addColorStop(1, TEMPLE_COLORS.STONE_MID);
              ctx.fillStyle = rungGrad;
              ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

              // Glow
              ctx.shadowColor = TEMPLE_COLORS.GOLD_BRIGHT;
              ctx.shadowBlur = 10;
              ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
              ctx.fillRect(plat.x - 5, plat.y - 5, plat.width + 10, plat.height + 10);
              ctx.shadowBlur = 0;
              ctx.restore();
              break;

            case 'landing':
              // Landing platforms between staircase sections
              ctx.save();
              // Main landing surface
              drawMasonicFloor(ctx, plat.x, plat.y, plat.width, 24);
              // Stone support below
              ctx.fillStyle = plat.color;
              ctx.fillRect(plat.x, plat.y + 24, plat.width, plat.height - 24);
              // Decorative border
              ctx.strokeStyle = TEMPLE_COLORS.GOLD;
              ctx.lineWidth = 2;
              ctx.strokeRect(plat.x, plat.y, plat.width, 24);
              ctx.restore();
              break;

            case 'celestial':
              // Floating ethereal platforms (cloud-like)
              ctx.save();
              // Cloud gradient
              const cloudGrad = ctx.createRadialGradient(
                plat.x + plat.width / 2, plat.y + plat.height / 2, 0,
                plat.x + plat.width / 2, plat.y + plat.height / 2, plat.width / 2
              );
              cloudGrad.addColorStop(0, 'rgba(200, 210, 255, 0.9)');
              cloudGrad.addColorStop(0.6, 'rgba(150, 170, 220, 0.7)');
              cloudGrad.addColorStop(1, 'rgba(100, 120, 180, 0.4)');

              ctx.fillStyle = cloudGrad;
              ctx.beginPath();
              ctx.ellipse(
                plat.x + plat.width / 2,
                plat.y + plat.height / 2,
                plat.width / 2,
                plat.height / 2 + 5,
                0, 0, Math.PI * 2
              );
              ctx.fill();

              // Starry sparkles
              ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
              for (let i = 0; i < 3; i++) {
                const sparkleX = plat.x + 20 + i * (plat.width - 40) / 2;
                const sparkleY = plat.y + 5 + Math.sin(Date.now() / 300 + i) * 3;
                ctx.beginPath();
                ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
              break;

            case 'platform':
            default:
              // Default stone block rendering
              drawStoneBlock(ctx, plat.x, plat.y, plat.width, plat.height, plat.color);
              break;
          }
        });

        // Senior Warden Platform (Goal Area)
        // No longer a red box, rely on the NPC drawing above

        // Orbs rendered as floating tools with glow
        orbs.forEach(orb => {
          if (!orb.active) return;
          const img = spritesRef.current[orb.spriteKey];
          const toolSize = 40;

          // Calculate distance to player for interaction glow
          const distToPlayer = Math.sqrt(
            Math.pow((player.x + player.width/2) - orb.x, 2) +
            Math.pow((player.y + player.height/2) - orb.y, 2)
          );
          const isNearby = distToPlayer < 80;

          // Floating animation
          const floatOffset = Math.sin(frameTime / 400 + orb.id) * 4;
          const orbY = orb.y + floatOffset;

          ctx.save();

          // Golden glow around tool (enhanced when nearby)
          const basePulse = Math.sin(frameTime / 300 + orb.id) * 0.15 + 0.85;
          const glowIntensity = isNearby ? basePulse * 0.5 : basePulse * 0.25;
          const glowRadius = isNearby ? 35 : 28;

          const toolGlow = ctx.createRadialGradient(orb.x, orbY, 0, orb.x, orbY, glowRadius);
          toolGlow.addColorStop(0, `rgba(251, 191, 36, ${glowIntensity})`);
          toolGlow.addColorStop(0.5, `rgba(255, 215, 0, ${glowIntensity * 0.4})`);
          toolGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
          ctx.fillStyle = toolGlow;
          ctx.beginPath();
          ctx.arc(orb.x, orbY, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Draw tool sprite
          if (img && img.complete && img.naturalHeight !== 0) {
            ctx.drawImage(img, orb.x - toolSize/2, orbY - toolSize/2, toolSize, toolSize);
          } else {
            // Fallback golden circle
            ctx.fillStyle = TEMPLE_COLORS.GOLD;
            ctx.beginPath();
            ctx.arc(orb.x, orbY, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 14px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(orb.name[0], orb.x, orbY);
          }

          // Sparkles when player is nearby
          if (isNearby) {
            const sparkleAngle = frameTime / 300;
            ctx.fillStyle = 'rgba(255, 248, 220, 0.9)';
            for (let i = 0; i < 4; i++) {
              const angle = sparkleAngle + (i * Math.PI / 2);
              const sparkleX = orb.x + Math.cos(angle) * (toolSize / 2 + 8);
              const sparkleY = orbY + Math.sin(angle) * (toolSize / 2 + 8);
              ctx.beginPath();
              ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          ctx.restore();
        });

        // Draw Tassels AFTER platforms and orbs so they appear in front
        const virtueColors: Record<string, { primary: string; glow: string }> = {
          'Temperance': { primary: '#3b82f6', glow: '#60a5fa' },  // Blue
          'Fortitude': { primary: '#ef4444', glow: '#f87171' },   // Red
          'Prudence': { primary: '#22c55e', glow: '#4ade80' },    // Green
          'Justice': { primary: '#a855f7', glow: '#c084fc' }      // Purple
        };

        TASSELS.forEach(t => {
            if (!collectedTassels.has(t.id)) {
                const tx = t.x;
                const ty = groundRefY + t.yOffset;
                const colors = virtueColors[t.name] || { primary: '#fbbf24', glow: '#fcd34d' };

                // Floating animation
                const bob = Math.sin(frameTime / 300 + t.id) * 5;
                const sway = Math.sin(frameTime / 500 + t.id * 2) * 3;

                ctx.save();
                ctx.translate(tx + sway, ty + bob);

                // Glow effect
                ctx.shadowColor = colors.glow;
                ctx.shadowBlur = 15 + Math.sin(frameTime / 200) * 5;

                // Rope/cord at top
                ctx.strokeStyle = '#92400e';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.quadraticCurveTo(sway * 0.5, -10, 0, 0);
                ctx.stroke();

                // Tassel head (top knot)
                ctx.fillStyle = colors.primary;
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, Math.PI * 2);
                ctx.fill();

                // Tassel fringe body
                ctx.fillStyle = colors.primary;
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.lineTo(8, 0);
                ctx.lineTo(6, 25);
                ctx.lineTo(-6, 25);
                ctx.closePath();
                ctx.fill();

                // Fringe detail lines
                ctx.strokeStyle = colors.glow;
                ctx.lineWidth = 1;
                for (let i = -5; i <= 5; i += 2) {
                    ctx.beginPath();
                    ctx.moveTo(i, 5);
                    ctx.lineTo(i * 0.8, 23);
                    ctx.stroke();
                }

                ctx.restore();
            }
        });

        // Draw player - use Grand Master sprite when God Mode is active
        if (godModeRef.current) {
          const gmImg = spritesRef.current['grand_master'];
          if (gmImg && gmImg.complete && gmImg.naturalWidth > 0) {
            const targetHeight = player.height * 1.2;
            const scale = targetHeight / gmImg.naturalHeight;
            const scaledW = gmImg.naturalWidth * scale;

            // Calculate walk animation (same logic as player)
            const isMoving = Math.abs(player.vx) > 0.1;
            const velocityFactor = Math.min(Math.abs(player.vx) / 5.5, 1.5);
            const walkSpeed = 120 / Math.max(velocityFactor, 0.5);
            const walkCycle = frameTime / walkSpeed;
            const legAmplitude = 4 + velocityFactor * 2;

            let leftLegOffset = 0;
            let rightLegOffset = 0;
            let bodyBob = 0;

            if (!player.isGrounded) {
              leftLegOffset = -4;
              rightLegOffset = 5;
            } else if (isMoving) {
              leftLegOffset = Math.sin(walkCycle) * legAmplitude;
              rightLegOffset = Math.sin(walkCycle + Math.PI) * legAmplitude;
              bodyBob = Math.abs(Math.sin(walkCycle * 2)) * 1.5;
            }

            ctx.save();
            ctx.translate(player.x + player.width / 2, player.y + player.height - bodyBob);
            if (player.facing === -1) ctx.scale(-1, 1);

            // Golden aura for Grand Master
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15 + Math.sin(frameTime / 300) * 5;

            // Draw upper body (clip to show only top 70% of sprite)
            const upperBodyHeight = targetHeight * 0.7;
            const legStartY = -targetHeight + upperBodyHeight;

            ctx.save();
            ctx.beginPath();
            ctx.rect(-scaledW / 2, -targetHeight, scaledW, upperBodyHeight);
            ctx.clip();
            ctx.drawImage(gmImg, -scaledW / 2, -targetHeight, scaledW, targetHeight);
            ctx.restore();

            // Draw animated legs (dark suit color)
            ctx.shadowBlur = 0;
            const legWidth = scaledW * 0.18;
            const legHeight = targetHeight * 0.3;
            const legSpacing = scaledW * 0.12;

            // Left leg
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-legSpacing - legWidth / 2 + leftLegOffset, legStartY, legWidth, legHeight);

            // Right leg
            ctx.fillRect(legSpacing - legWidth / 2 + rightLegOffset, legStartY, legWidth, legHeight);

            // Shoes
            ctx.fillStyle = '#000000';
            const shoeHeight = legHeight * 0.15;
            ctx.fillRect(-legSpacing - legWidth / 2 + leftLegOffset - 1, legStartY + legHeight - shoeHeight, legWidth + 2, shoeHeight);
            ctx.fillRect(legSpacing - legWidth / 2 + rightLegOffset - 1, legStartY + legHeight - shoeHeight, legWidth + 2, shoeHeight);

            ctx.restore();
          } else {
            drawPlayerSprite(ctx, player, hasApron, isRestored);
          }
        } else {
          drawPlayerSprite(ctx, player, hasApron, isRestored);
        }

        // Render particles (dust, sparkles, etc.)
        particleSystemRef.current.render(ctx, cameraRef.current.x, cameraRef.current.y, viewW, viewH);

        // Apply candlelit atmosphere lighting overlay (only when restored/not blindfolded)
        if (isRestored) {
          applyLighting(ctx, LIGHT_SOURCES, cameraRef.current.x, cameraRef.current.y, viewW, viewH);
          // Add torch smoke effects near light sources
          for (const light of LIGHT_SOURCES) {
            if (light.x > cameraRef.current.x - 50 && light.x < cameraRef.current.x + viewW + 50) {
              drawTorchSmoke(ctx, light.x, light.y - 20, frameTime);
            }
          }
        }

        // Render score popups
        scorePopupManagerRef.current.render(ctx, cameraRef.current.x, cameraRef.current.y);

        ctx.restore();

        ctx.resetTransform();

        // --- VISUAL EFFECTS (Enhanced with shared rendering library) ---
        // Fellow Craft - no blindfold, full vision with temple atmosphere

        // Enhanced vignette from shared library
        drawVignette(ctx, w, h, 0.45);

        // Subtle golden glow at edges (temple atmosphere)
        const radius = Math.max(w, h) * 0.8;
        const atmosphericGlow = ctx.createRadialGradient(w/2, h/2, radius * 0.6, w/2, h/2, radius);
        atmosphericGlow.addColorStop(0, 'rgba(251, 191, 36, 0)');
        atmosphericGlow.addColorStop(1, 'rgba(251, 191, 36, 0.06)');
        ctx.fillStyle = atmosphericGlow;
        ctx.fillRect(0, 0, w, h);

        // Render screen transitions (fade, flash effects)
        transitionManagerRef.current.render(ctx, w, h);

        // Grand Master Mode indicator when God Mode is active
        if (godModeRef.current) {
          ctx.save();
          ctx.font = 'bold 16px serif';
          ctx.textAlign = 'center';

          // Golden glowing text
          const gmPulse = Math.sin(frameTime / 400) * 0.3 + 0.7;
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 10 * gmPulse;
          ctx.fillStyle = `rgba(255, 215, 0, ${gmPulse})`;
          ctx.fillText('GRAND MASTER MODE', w / 2, 30);

          // Subtitle
          ctx.font = '10px serif';
          ctx.shadowBlur = 5;
          ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
          ctx.fillText('Infinite Flight Enabled', w / 2, 45);

          ctx.restore();
        }

    } catch (e) {
        console.error("Game Loop Error:", e);
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, dimensions, hasApron, warningMessage, score, playerName, isRestored, jwProgress, collectedTassels, hasSeenTasselIntro, screenShake, soundEnabled]); 

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, gameLoop]);

  const handleLoreContinue = () => {
      // Special check for Senior Warden NPC (Fake Orb ID 999)
      if (activeOrb && activeOrb.id === 999) {
          setIsRestored(true);
          setHasApron(true);
          setActiveOrb(null);
          setGameState(GameState.PLAYING);
          return;
      }

      // Special check for Junior Warden NPC (Fake Orb ID 998)
      if (activeOrb && activeOrb.id === 998) {
          // Check progress to determine which question to ask next
          let nextQId = 801;
          if (jwProgress === 1) nextQId = 802;
          if (jwProgress === 2) nextQId = 8; // Original Rite of Destitution Question

          const question = QUESTIONS.find(q => q.id === nextQId);
          if (question) {
              setActiveQuestion(question);
              setGameState(GameState.QUIZ);
          } else {
              setGameState(GameState.PLAYING); // Fallback
          }
          return;
      }

      // Special check for Tassels (IDs 101-104)
      if (activeOrb && activeOrb.id >= 101 && activeOrb.id <= 104) {
          setCollectedTassels(prev => new Set(prev).add(activeOrb!.id));
          setActiveOrb(null);
          // Restore partial momentum
          playerRef.current.vx = savedVelocityRef.current.vx * 0.5;
          playerRef.current.vy = Math.min(savedVelocityRef.current.vy * 0.3, 0);
          setGameState(GameState.PLAYING);
          return;
      }

      if (activeOrb) {
        if (activeOrb.questionId === undefined) {
             handleCorrectAnswer();
             return;
        }
        const question = QUESTIONS.find(q => q.id === activeOrb.questionId);
        if (question) {
            setActiveQuestion(question);
            setGameState(GameState.QUIZ);
        } else handleCorrectAnswer();
      }
  };

  const handleCorrectAnswer = () => {
    playSound('collect');
    setScore(s => s + 100);

    // Add collection burst particles and score popup
    if (activeOrb && activeOrb.x && activeOrb.y) {
      const groundRefY = DESIGN_HEIGHT - 40;
      const orbY = groundRefY + (activeOrb as any).yOffset || activeOrb.y;
      createCollectionBurst(particleSystemRef.current, activeOrb.x, orbY);
      scorePopupManagerRef.current.addScore(activeOrb.x, orbY - 30, 100);
    }

    // Check if this was the JW Interaction
    if (activeQuestion && (activeQuestion.id === 801 || activeQuestion.id === 802 || activeQuestion.id === 8)) {
        // Advance JW Progress
        const nextProgress = jwProgress + 1;
        setJwProgress(nextProgress);

        setActiveOrb(null);
        setActiveQuestion(null);
        keysRef.current = {};

        // Restore partial momentum for soft landing
        playerRef.current.vx = savedVelocityRef.current.vx * 0.5;
        playerRef.current.vy = Math.min(savedVelocityRef.current.vy * 0.3, 0);

        setGameState(GameState.PLAYING);
        return;
    }

    if (activeOrb) {
        orbsStateRef.current.add(activeOrb.id);
        if (activeOrb.spriteKey === 'apron') setHasApron(true);
    }
    setActiveOrb(null);
    setActiveQuestion(null);
    keysRef.current = {};

    // Restore partial momentum for soft landing
    playerRef.current.vx = savedVelocityRef.current.vx * 0.5;
    playerRef.current.vy = Math.min(savedVelocityRef.current.vy * 0.3, 0);

    setGameState(GameState.PLAYING);
  };

  const handleIncorrectAnswer = () => {
    playSound('error');
    saveScoreToLeaderboard(score, false);
    setGameState(GameState.GAME_OVER);
  };

  const startGame = () => {
      // Reset player to starting position (on ground floor)
      const groundRefY = DESIGN_HEIGHT - 40;
      const startY = groundRefY - 60; // Start above ground so player lands
      playerRef.current = { x: 50, y: startY, width: 30, height: 45, vx: 0, vy: 0, isGrounded: false, color: '#ffffff', facing: 1, jumpCount: 0, coyoteTimer: 0 };
      lastCheckpointRef.current = { x: 50, y: startY };
      // Initialize camera to show ground floor area
      cameraRef.current = { x: 0, y: groundRefY - DESIGN_HEIGHT + 60 };
      setGameState(GameState.PLAYING);
  };
  
  const handleNameSubmit = () => {
      if (tempName.trim()) {
          setPlayerName(tempName.trim());
          setShowNameInput(false);
          // Don't need to do anything else, the loop will unblock the player
      }
  };

  const resetGame = (goToMenu: boolean = false) => {
    const groundRefY = DESIGN_HEIGHT - 40;
    const startY = groundRefY - 60;
    playerRef.current = { x: 50, y: startY, width: 30, height: 45, vx: 0, vy: 0, isGrounded: false, color: '#ffffff', facing: 1, jumpCount: 0, coyoteTimer: 0 };
    keysRef.current = {};
    orbsStateRef.current.clear();
    setScore(0);
    lastCheckpointRef.current = { x: 50, y: startY };
    setCheckpointPopup(false);
    setWarningMessage(null);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    setActiveQuestion(null);
    cameraRef.current = { x: 0, y: groundRefY - DESIGN_HEIGHT + 60 };
    setHasApron(false);
    setIsRestored(false); // Reset to candidate state
    setJwProgress(0); // Reset JW flow
    setCollectedTassels(new Set()); // Reset Tassels
    setHasSeenTasselIntro(false); // Reset first-tassel intro flag
    seenLoreRef.current.clear();
    if (userNameRef.current) {
      setPlayerName(userNameRef.current);
      setTempName(userNameRef.current);
      setShowNameInput(false);
    } else {
      setPlayerName(''); // Reset name so they have to meet IG again
      setTempName('');
    }
    setGameState(goToMenu ? GameState.START_MENU : GameState.PLAYING);
  };

  if (gameState === GameState.START_MENU) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] p-2 md:p-4 overflow-y-auto">
        {/* Force Landscape Warning for Preview/Desktop */}
        {isPortrait && !forceLandscape && (
          <div className="absolute inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm">
             <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
             <h2 className="text-2xl font-bold text-amber-400 mb-2">Best Experience in Landscape</h2>
             <p className="text-slate-400 mb-6">If you are on a phone, please rotate it.<br/>If you are on PC, you can continue.</p>
             <button onClick={() => setForceLandscape(true)} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white font-bold transition-colors">Play Anyway</button>
          </div>
        )}

        <div className="w-full max-w-md max-h-full md:max-h-[90vh] flex flex-col bg-slate-900/90 backdrop-blur-md p-6 rounded-xl border-2 border-amber-600 shadow-2xl overflow-y-auto">
          <div className="flex flex-col items-center text-center justify-center">
             <div className="mb-4">
                {/* Logo: Square and Compass (Procedural) */}
                <img
                    src={generateSpriteUrl('square_compass')}
                    className="w-20 h-20 md:w-28 md:h-28 mx-auto mb-4 object-contain"
                    style={{imageRendering:'pixelated'}}
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = document.getElementById('logo-fallback');
                        if (fallback) fallback.style.display = 'block';
                    }}
                />
                <div id="logo-fallback" className="hidden text-4xl mb-2">🏛️</div>
                <h1 className="text-2xl md:text-4xl font-bold text-amber-500 font-serif tracking-widest uppercase leading-tight">The Fellow Craft<br/>Challenge</h1>
                <p className="text-slate-400 mt-2 italic text-sm md:text-base">Ascend the Winding Staircase</p>
             </div>

             <div className="w-full max-w-xs space-y-4 mt-4">
                <p className="text-slate-300 text-sm">Prepare to prove your proficiency.</p>
                <button onClick={startGame} className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded transition-colors uppercase tracking-widest shadow-lg text-sm md:text-base">Begin Journey</button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden no-select">
      {isPortrait && !forceLandscape && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center text-center p-8">
            <div className="text-6xl mb-4 animate-bounce">📱🔄</div>
            <h2 className="text-2xl font-bold text-amber-400 mb-2">Please Rotate Device</h2>
            <p className="text-slate-400 mb-6">This game is designed for landscape mode.</p>
            {/* Added for Preview/Desktop users */}
            <button onClick={() => setForceLandscape(true)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 text-sm">Play Anyway (Desktop/Preview)</button>
        </div>
      )}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          {/* Pause Button */}
          {gameState === GameState.PLAYING && (
            <button
              onClick={() => setGameState(GameState.PAUSED)}
              className="bg-slate-800/50 p-2 rounded-lg border border-slate-600/50 transition active:scale-95 text-slate-400 hover:text-white hover:bg-slate-800/80"
              title="Pause (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          {!isStandalone && (
            <button onClick={toggleFullscreen} className="bg-slate-800/50 p-2 rounded-lg border border-slate-600/50 transition active:scale-95 text-slate-400 hover:text-white hover:bg-slate-800/80" title="Toggle Fullscreen">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            </button>
          )}
        </div>
        <div className="bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-600 backdrop-blur-sm flex items-center gap-3">
          {/* Staircase Progress Tracker */}
          <div className="flex gap-2 items-center mr-2 border-r border-slate-600 pr-3">
               <div className={`px-2 py-0.5 rounded text-xs font-bold ${collectedTassels.has(101) ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`} title="3 Steps - Principal Officers">3</div>
               <div className={`px-2 py-0.5 rounded text-xs font-bold ${collectedTassels.has(102) ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`} title="5 Steps - Orders of Architecture">5</div>
               <div className={`px-2 py-0.5 rounded text-xs font-bold ${collectedTassels.has(103) ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`} title="7 Steps - Liberal Arts & Sciences">7</div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <div className="w-24 h-2.5 bg-slate-700/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 ease-out"
                style={{ width: `${(score / (ORB_DATA.length * 100)) * 100}%` }}
              />
            </div>
            <span className="text-amber-400 font-mono text-sm min-w-[4rem] text-right">
              {score}/{ORB_DATA.length * 100}
            </span>
          </div>

          {hasApron && <img src={generateSpriteUrl('apron')} className="w-5 h-5 object-contain" style={{imageRendering:'pixelated'}} title="Apron Equipped"/>}
        </div>
      </div>
      <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-500 ${checkpointPopup ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-slate-900/90 border-2 border-amber-500 px-6 py-3 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(245,158,11,0.3)] backdrop-blur-md">
           <img
             src={generateSpriteUrl('square_compass')}
             className="w-8 h-8 md:w-12 md:h-12"
             style={{ imageRendering: 'pixelated', animation: 'spin 3s linear infinite' }}
           />
           <div><h3 className="text-amber-400 font-bold text-lg md:text-xl uppercase tracking-widest">Checkpoint</h3><p className="text-slate-400 text-xs md:text-sm">Progress Saved</p></div>
        </div>
      </div>
      <div className={`absolute top-32 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 ${warningMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="bg-red-900/90 border-2 border-red-500 px-6 py-3 rounded-xl flex items-center gap-4 shadow-[0_0_20px_rgba(220,38,38,0.3)] backdrop-blur-md">
           <div className="text-2xl">⚠️</div>
           <div><h3 className="text-red-400 font-bold text-lg uppercase tracking-widest">Access Denied</h3><p className="text-slate-300 text-sm">{warningMessage}</p></div>
        </div>
      </div>
      
      {/* Name Entry Modal (Inner Guard) */}
      {showNameInput && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <div className="bg-slate-900 border-2 border-amber-600 rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-slate-800 rounded-full border-2 border-slate-600 mb-4 flex items-center justify-center">
                          <img src={generateSpriteUrl('inner_guard')} className="w-10 h-10 object-contain" />
                      </div>
                      <h3 className="text-amber-500 font-bold text-xl uppercase mb-1">The Inner Guard Challenges You</h3>
                      <p className="text-slate-300 italic mb-6">"Whom have you there?"</p>
                      
                      <input 
                        type="text" 
                        placeholder="Enter your name" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-4 py-2 text-white mb-4 focus:border-amber-500 focus:outline-none"
                      />
                      <button 
                        onClick={handleNameSubmit}
                        disabled={!tempName.trim()}
                        className="w-full bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2 rounded uppercase tracking-wider transition-colors"
                      >
                        Proceed
                      </button>
                  </div>
              </div>
          </div>
      )}

      <canvas ref={canvasRef} width={dimensions.w} height={dimensions.h} className="block bg-slate-900" />

      {/* Tutorial Overlay */}
      {gameState === GameState.PLAYING && showTutorial && (
        <div
          className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-pointer"
          onClick={() => {
            setShowTutorial(false);
            localStorage.setItem('tutorialSeen', 'true');
          }}
        >
          <div className="text-center p-6 max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mb-6 uppercase tracking-wider">How to Play</h2>

            {/* Desktop Controls */}
            <div className="hidden md:block mb-6">
              <div className="flex justify-center gap-8 mb-4">
                <div className="text-center">
                  <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 mb-2 font-mono text-white">← →</div>
                  <p className="text-slate-400 text-sm">Move</p>
                </div>
                <div className="text-center">
                  <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 mb-2 font-mono text-white">Space</div>
                  <p className="text-slate-400 text-sm">Jump</p>
                </div>
                <div className="text-center">
                  <div className="bg-slate-800 border border-slate-600 rounded px-4 py-2 mb-2 font-mono text-white">Esc</div>
                  <p className="text-slate-400 text-sm">Pause</p>
                </div>
              </div>
            </div>

            {/* Mobile Controls Hint */}
            <div className="md:hidden mb-6">
              <p className="text-slate-300 mb-4">Use the on-screen buttons to move and jump</p>
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  <p className="text-slate-400 text-sm">Move</p>
                </div>
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <p className="text-slate-400 text-sm">Jump</p>
                </div>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Collect orbs, answer questions, and prove your proficiency.
            </p>

            <p className="text-amber-400 animate-pulse">Tap anywhere to start</p>
          </div>
        </div>
      )}

      {gameState === GameState.PLAYING && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-end pb-4 px-4">
            <div className="flex justify-between items-end w-full select-none mb-2">
                <div className="flex gap-3 pointer-events-auto">
                    <button
                        className="w-16 h-16 bg-white/5 rounded-full backdrop-blur-md border-2 border-white/10 active:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                        onMouseDown={handleInputStart('ArrowLeft')} onMouseUp={handleInputEnd('ArrowLeft')} onMouseLeave={handleInputEnd('ArrowLeft')}
                        onTouchStart={handleInputStart('ArrowLeft')} onTouchEnd={handleInputEnd('ArrowLeft')}
                    >
                        <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                        className="w-16 h-16 bg-white/5 rounded-full backdrop-blur-md border-2 border-white/10 active:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                        onMouseDown={handleInputStart('ArrowRight')} onMouseUp={handleInputEnd('ArrowRight')} onMouseLeave={handleInputEnd('ArrowRight')}
                        onTouchStart={handleInputStart('ArrowRight')} onTouchEnd={handleInputEnd('ArrowRight')}
                    >
                        <svg className="w-8 h-8 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
                <div className="pointer-events-auto pl-6">
                    <button
                        className="w-20 h-20 bg-blue-500/10 rounded-full backdrop-blur-md border-2 border-blue-400/20 active:bg-blue-500/30 flex items-center justify-center transition-all active:scale-95"
                        onMouseDown={handleInputStart('Space')} onMouseUp={handleInputEnd('Space')} onMouseLeave={handleInputEnd('Space')}
                        onTouchStart={handleInputStart('Space')} onTouchEnd={handleInputEnd('Space')}
                    >
                        <span className="font-bold text-white/70 tracking-wider text-sm">JUMP</span>
                    </button>
                </div>
            </div>
        </div>
      )}
      {gameState === GameState.LORE && activeOrb && <LoreModal orb={activeOrb} onNext={handleLoreContinue} />}
      {gameState === GameState.QUIZ && activeQuestion && (
        <QuizModal
          question={activeQuestion}
          onCorrect={handleCorrectAnswer}
          onIncorrect={handleIncorrectAnswer}
        />
      )}

      {/* Victory Screen */}
      {gameState === GameState.VICTORY && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="relative w-full max-w-xl max-h-[95vh] flex flex-col items-center bg-slate-900 border-2 md:border-4 border-amber-500 rounded-xl p-4 md:p-8 shadow-2xl text-center overflow-y-auto">
            {/* Trophy Icon */}
            <div className="shrink-0 w-16 h-16 md:w-24 md:h-24 bg-amber-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6 border-2 md:border-4 border-amber-400 animate-pulse">
              <svg className="w-10 h-10 md:w-14 md:h-14 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
              </svg>
            </div>

            <h2 className="shrink-0 text-2xl md:text-4xl font-bold text-amber-400 mb-2 uppercase tracking-wider leading-tight">
              Congratulations!
            </h2>

            <p className="text-slate-300 text-lg md:text-xl mb-2">
              Brother <span className="text-amber-300 font-semibold">{playerName || 'Brother'}</span>
            </p>

            <p className="text-slate-400 text-sm md:text-base mb-2 italic">
              You have ascended the Winding Staircase and proven your proficiency in the Second Degree.
            </p>

            <p className="text-amber-500 text-base md:text-lg mb-6 font-semibold">
              You have received your wages in the Middle Chamber. The door to the Master Mason Degree awaits.
            </p>

            {/* Score Display */}
            <div className="w-full bg-slate-800/80 p-4 md:p-6 rounded-lg border border-slate-700 mb-4">
              <p className="text-slate-400 text-sm uppercase font-bold mb-2">Final Score</p>
              <p className="text-4xl md:text-5xl font-bold text-amber-400 mb-4">{score + 500}</p>

              {collectedTassels.size >= 3 && (
                <div className="bg-amber-900/30 p-3 rounded border border-amber-600 mb-4">
                  <p className="text-amber-400 font-bold">Middle Chamber Bonus: +1000</p>
                  <p className="text-slate-400 text-sm">All fifteen steps of the Winding Staircase completed!</p>
                </div>
              )}

              {/* Staircase Progress Display */}
              <div className="flex justify-center gap-4 mt-4">
                {[{id: 101, label: '3'}, {id: 102, label: '5'}, {id: 103, label: '7'}].map(step => (
                  <div
                    key={step.id}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 flex items-center justify-center font-bold text-lg ${
                      collectedTassels.has(step.id)
                        ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_12px_#fbbf24]'
                        : 'bg-slate-700 border-slate-600 text-slate-400'
                    }`}
                    title={collectedTassels.has(step.id) ? 'Completed' : 'Not Completed'}
                  >
                    {step.label}
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">Winding Staircase Progress</p>
            </div>

            <button
              onClick={() => resetGame(true)}
              className="w-full py-3 md:py-4 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg uppercase tracking-widest shadow-lg active:scale-95 transition-all text-sm md:text-lg"
            >
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      {gameState === GameState.PAUSED && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md flex flex-col items-center bg-slate-900 border-2 border-slate-600 rounded-xl p-6 md:p-8 shadow-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-200 mb-6 uppercase tracking-widest">Paused</h2>

            {/* Current Score */}
            <div className="w-full bg-slate-800/80 p-4 rounded-lg border border-slate-700 mb-6">
              <p className="text-slate-400 text-sm uppercase mb-1">Current Score</p>
              <p className="text-2xl font-bold text-cyan-400">{score} / {ORB_DATA.length * 100}</p>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-full py-3 mb-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg flex items-center justify-center gap-3 transition-all border border-slate-600"
            >
              {soundEnabled ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Sound: On
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  Sound: Off
                </>
              )}
            </button>

            <div className="w-full space-y-3">
              <button
                onClick={() => setGameState(GameState.PLAYING)}
                className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Resume
              </button>

              <button
                onClick={() => resetGame(false)}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Restart
              </button>

              <button
                onClick={() => resetGame(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg uppercase tracking-widest shadow-lg active:scale-95 transition-all border border-slate-600"
              >
                Main Menu
              </button>
            </div>

            <p className="text-slate-500 text-xs mt-4">Press Escape to resume</p>
          </div>
        </div>
      )}

      {gameState === GameState.GAME_OVER && activeQuestion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl max-h-[95vh] flex flex-col items-center bg-slate-900 border-2 md:border-4 border-amber-600 rounded-xl p-4 md:p-8 shadow-2xl text-center overflow-y-auto">
            <div className="shrink-0 w-14 h-14 md:w-20 md:h-20 bg-amber-900/30 rounded-full flex items-center justify-center mb-3 md:mb-6 border-2 md:border-4 border-amber-500">
                <svg className="w-8 h-8 md:w-10 md:h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h2 className="shrink-0 text-xl md:text-3xl font-bold text-amber-400 mb-2 uppercase tracking-wider leading-tight">Further Light Required</h2>
            <div className="shrink-0 w-full text-left bg-slate-800/50 p-3 md:p-4 rounded border border-slate-700 my-3 md:my-6">
                <p className="text-slate-400 text-xs md:text-sm uppercase font-bold mb-1">Question:</p>
                <p className="text-slate-200 mb-3 md:mb-4 font-serif text-sm md:text-base">
                  "{activeQuestion.text}"
                </p>
                <div className="bg-red-900/30 p-2 md:p-3 rounded border-l-4 border-red-500">
                   <p className="text-red-400 text-xs md:text-sm font-bold">Incorrect Answer</p>
                </div>
            </div>
            
            <button
              onClick={() => resetGame(false)}
              className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded uppercase tracking-widest shadow-lg active:scale-95 transition-all text-sm md:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
