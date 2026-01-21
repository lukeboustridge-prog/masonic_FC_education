import { Question, Platform, Orb, OrbDefinition, PlatformType } from './types';

// Temple Visual Theme Colors - Fellow Craft (more golden/intellectual feel)
export const TEMPLE_COLORS = {
  STONE_DARK: '#2d2a26',
  STONE_MID: '#4a4540',
  STONE_LIGHT: '#6b6560',
  STONE_ACCENT: '#8b8580',
  STONE_WARM: '#5a4d3a',
  CANDLE_GLOW: '#ffb347',
  TORCH_GLOW: '#ff8c00',
  AMBIENT_WARM: '#3d3428',
  GOLD: '#d4af37',
  GOLD_BRIGHT: '#ffd700',
  ROYAL_BLUE: '#1e3a5f',
  MOSAIC_WHITE: '#e8e4df',
  MOSAIC_BLACK: '#1a1a1a',
  CEILING_DARK: '#1a1510',
  NIGHT_SKY: '#0d1117',
  // FC-specific colors
  STEP_THREE: '#8b4513',   // Sienna - Principal Officers
  STEP_FIVE: '#4a6741',    // Forest - Orders of Architecture
  STEP_SEVEN: '#4a5568',   // Slate blue - Liberal Arts
  CHAMBER_GOLD: '#b8860b',
  CHAMBER_DEEP: '#2d2a26',
};

// Room definitions for the Fellow Craft vertical journey
export const ROOM_DEFINITIONS = [
  { id: 1, name: 'Ground Floor - Porch', xStart: 0, xEnd: 800 },
  { id: 2, name: 'Three Steps', xStart: 250, xEnd: 700 },
  { id: 3, name: 'First Landing', xStart: 400, xEnd: 900 },
  { id: 4, name: 'Five Steps', xStart: 500, xEnd: 1100 },
  { id: 5, name: 'Second Landing', xStart: 850, xEnd: 1350 },
  { id: 6, name: 'Seven Steps', xStart: 950, xEnd: 1650 },
  { id: 7, name: 'Third Landing', xStart: 1500, xEnd: 2100 },
  { id: 8, name: 'Approach to Middle Chamber', xStart: 1650, xEnd: 2700 },
  { id: 9, name: 'Middle Chamber', xStart: 2500, xEnd: 4000 },
];

// Light sources for the ascending temple atmosphere
export const LIGHT_SOURCES = [
  // Ground Floor - Two great pillars lit by torches
  { x: 130, y: 280, radius: 150, intensity: 0.6, color: TEMPLE_COLORS.TORCH_GLOW },
  { x: 370, y: 280, radius: 150, intensity: 0.6, color: TEMPLE_COLORS.TORCH_GLOW },

  // Three Steps - Candles ascending
  { x: 400, y: 200, radius: 120, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 500, y: 120, radius: 120, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },

  // First Landing - Brighter
  { x: 650, y: 0, radius: 160, intensity: 0.6, color: TEMPLE_COLORS.CANDLE_GLOW },

  // Five Steps - Architectural lighting
  { x: 750, y: -200, radius: 130, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 900, y: -400, radius: 130, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },

  // Second Landing
  { x: 1100, y: -600, radius: 160, intensity: 0.6, color: TEMPLE_COLORS.CANDLE_GLOW },

  // Seven Steps - Liberal Arts illumination
  { x: 1200, y: -800, radius: 140, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 1350, y: -1000, radius: 140, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },
  { x: 1500, y: -1200, radius: 140, intensity: 0.5, color: TEMPLE_COLORS.CANDLE_GLOW },

  // Third Landing - Growing golden
  { x: 1750, y: -1400, radius: 180, intensity: 0.7, color: TEMPLE_COLORS.GOLD_BRIGHT },

  // Approach to Middle Chamber
  { x: 1900, y: -1600, radius: 160, intensity: 0.6, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 2150, y: -1800, radius: 180, intensity: 0.7, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 2400, y: -2000, radius: 200, intensity: 0.8, color: TEMPLE_COLORS.GOLD_BRIGHT },

  // Middle Chamber - Blazing golden light
  { x: 2800, y: -2200, radius: 250, intensity: 0.9, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 3200, y: -2300, radius: 280, intensity: 1.0, color: TEMPLE_COLORS.GOLD_BRIGHT },
  { x: 3500, y: -2400, radius: 300, intensity: 1.0, color: TEMPLE_COLORS.GOLD_BRIGHT },
];

// Physics - slightly adjusted for vertical platforming
export const GRAVITY = 0.38;
export const FRICTION = 0.84;
export const MOVE_SPEED = 5.0;
export const JUMP_FORCE = -12; // Slightly higher for vertical level

export const WORLD_WIDTH = 4000;
export const WORLD_HEIGHT = 3000; // Much taller - vertical ascent

// Logical height for Scale-to-Fit
export const DESIGN_HEIGHT = 400;

// Checkpoints at each landing
export const CHECKPOINTS = [
  { x: 200, yOffset: 0 },       // Ground floor
  { x: 650, yOffset: -400 },    // After 3 steps
  { x: 1100, yOffset: -900 },   // After 5 steps
  { x: 1750, yOffset: -1600 },  // After 7 steps
  { x: 2400, yOffset: -2200 },  // Middle Chamber entrance
  { x: 3400, yOffset: -2600 },  // Middle Chamber
];

// NPC Locations
export const NPC_CONFIG = {
  SENIOR_DEACON: { x: 150, yOffset: 0 },        // Guides at start
  SENIOR_WARDEN: { x: 650, yOffset: -400 },     // First landing
  JUNIOR_WARDEN: { x: 1100, yOffset: -900 },    // Second landing
  WORSHIPFUL_MASTER: { x: 3500, yOffset: -2650 }, // Middle Chamber
};

// The Five Orders of Architecture - visual markers
export const ARCHITECTURE_ORDERS = [
  { id: 201, name: "Tuscan", x: 600, yOffset: -500,
    blurb: "The Tuscan Order is the most simple and solid of the five orders. It was invented in Tuscany, whence it derives its name." },
  { id: 202, name: "Doric", x: 700, yOffset: -600,
    blurb: "The Doric is the most ancient and was invented by the Greeks. Its column is eight diameters high, and has seldom any ornaments on base or capital." },
  { id: 203, name: "Ionic", x: 800, yOffset: -700,
    blurb: "The Ionic bears a kind of mean proportion between the more solid and delicate orders. Its column is nine diameters high; its capital is adorned with volutes." },
  { id: 204, name: "Corinthian", x: 900, yOffset: -800,
    blurb: "The Corinthian, the richest of the five orders, is deemed a masterpiece of art. Its column is ten diameters high, and its capital is adorned with two rows of leaves and eight volutes." },
  { id: 205, name: "Composite", x: 1000, yOffset: -900,
    blurb: "The Composite is compounded of the other orders, and was contrived by the Romans. Its capital has the two rows of leaves of the Corinthian and the volutes of the Ionic." }
];

// The Seven Liberal Arts & Sciences labels
export const LIBERAL_ARTS_LABELS = [
  { text: "GRAMMAR", x: 1150, yOffset: -1050 },
  { text: "RHETORIC", x: 1250, yOffset: -1150 },
  { text: "LOGIC", x: 1350, yOffset: -1250 },
  { text: "ARITHMETIC", x: 1450, yOffset: -1350 },
  { text: "GEOMETRY", x: 1550, yOffset: -1450 },
  { text: "MUSIC", x: 1650, yOffset: -1550 },
  { text: "ASTRONOMY", x: 1750, yOffset: -1650 }
];

// Staircase section markers
export const STAIRCASE_MARKERS = {
  THREE_STEPS: { startY: 0, endY: -400, label: "3 Steps - Principal Officers" },
  FIVE_STEPS: { startY: -400, endY: -900, label: "5 Steps - Orders of Architecture" },
  SEVEN_STEPS: { startY: -900, endY: -1600, label: "7 Steps - Liberal Arts & Sciences" }
};

// Fellow Craft Questions (30 questions)
export const QUESTIONS: Question[] = [
  // === RITUAL QUESTIONS ===
  {
    id: 1,
    text: "How were you prepared to be passed to the Second Degree?",
    answers: [
      "In a manner somewhat similar to the former.",
      "Exactly as in the First Degree.",
      "With both breasts bare."
    ],
    correctAnswer: "In a manner somewhat similar to the former.",
    explanation: "The preparation for the Second Degree is similar to the First, but with the right arm, right breast, and right knee made bare, and the left heel slipshod.",
    category: 'ritual'
  },
  {
    id: 2,
    text: "On what were you admitted to the Second Degree?",
    answers: [
      "The point of a sword.",
      "The Square.",
      "The Compasses."
    ],
    correctAnswer: "The Square.",
    explanation: "In the Second Degree, the candidate is admitted on the Square, presented to the right breast, to teach that the Square of Virtue should be the rule of our actions.",
    category: 'ritual'
  },
  {
    id: 3,
    text: "What is the password leading from the First to the Second Degree?",
    answers: [
      "Tubal-Cain",
      "Shibboleth",
      "Boaz"
    ],
    correctAnswer: "Shibboleth",
    explanation: "Shibboleth denotes 'plenty' and is depicted in our Lodges by an ear of corn near to a fall of water. It was the password used by the Gileadites.",
    category: 'ritual'
  },
  {
    id: 4,
    text: "What are the working tools of a Fellow Craft Mason?",
    answers: [
      "The 24-inch Gauge and Common Gavel.",
      "The Square, Level, and Plumb Rule.",
      "The Skirret, Pencil, and Compasses."
    ],
    correctAnswer: "The Square, Level, and Plumb Rule.",
    explanation: "The Square teaches morality, the Level equality, and the Plumb Rule justness and uprightness of life and actions.",
    category: 'working_tools'
  },
  {
    id: 5,
    text: "What does the Square teach?",
    answers: [
      "To act upon the Square with all mankind.",
      "To keep within due bounds.",
      "To measure our work."
    ],
    correctAnswer: "To act upon the Square with all mankind.",
    explanation: "The Square teaches us to regulate our actions by rule and line, and to harmonize our conduct by the principles of morality and virtue.",
    category: 'working_tools'
  },
  {
    id: 6,
    text: "What does the Level teach?",
    answers: [
      "That we are all equal in the sight of the Great Architect.",
      "To build on a firm foundation.",
      "To keep our secrets level."
    ],
    correctAnswer: "That we are all equal in the sight of the Great Architect.",
    explanation: "The Level demonstrates that we are descended from the same stock, partake of the same nature, and share the same hope.",
    category: 'working_tools'
  },
  {
    id: 7,
    text: "What does the Plumb Rule teach?",
    answers: [
      "Justness and uprightness of life and actions.",
      "To build our walls straight.",
      "To measure depth."
    ],
    correctAnswer: "Justness and uprightness of life and actions.",
    explanation: "The Plumb Rule teaches us to walk uprightly in our several stations before God and man.",
    category: 'working_tools'
  },

  // === WINDING STAIRCASE ===
  {
    id: 8,
    text: "How many steps are in the Winding Staircase?",
    answers: [
      "Twelve",
      "Fifteen",
      "Seven"
    ],
    correctAnswer: "Fifteen",
    explanation: "The Winding Staircase consists of fifteen steps, divided into three, five, and seven.",
    category: 'symbolism'
  },
  {
    id: 9,
    text: "What do the first three steps of the Winding Staircase represent?",
    answers: [
      "The three Principal Officers of the Lodge.",
      "Faith, Hope, and Charity.",
      "The Three Great Lights."
    ],
    correctAnswer: "The three Principal Officers of the Lodge.",
    explanation: "The first three steps allude to the three principal officers of the Lodge: the Worshipful Master, Senior Warden, and Junior Warden.",
    category: 'symbolism'
  },
  {
    id: 10,
    text: "What do the five steps represent?",
    answers: [
      "The five senses of human nature.",
      "The Five Points of Fellowship.",
      "The Five Orders of Architecture."
    ],
    correctAnswer: "The Five Orders of Architecture.",
    explanation: "The five steps allude to the Five Orders of Architecture: Tuscan, Doric, Ionic, Corinthian, and Composite.",
    category: 'architecture'
  },
  {
    id: 11,
    text: "What do the seven steps represent?",
    answers: [
      "The seven days of creation.",
      "The Seven Liberal Arts and Sciences.",
      "The seven ancient wonders."
    ],
    correctAnswer: "The Seven Liberal Arts and Sciences.",
    explanation: "The seven steps allude to the Seven Liberal Arts and Sciences: Grammar, Rhetoric, Logic, Arithmetic, Geometry, Music, and Astronomy.",
    category: 'liberal_arts'
  },

  // === FIVE ORDERS OF ARCHITECTURE ===
  {
    id: 12,
    text: "Which is the most simple and solid of the Five Orders?",
    answers: [
      "Doric",
      "Tuscan",
      "Ionic"
    ],
    correctAnswer: "Tuscan",
    explanation: "The Tuscan Order, invented in Tuscany, is the most simple and solid of the five orders.",
    category: 'architecture'
  },
  {
    id: 13,
    text: "Which Order is deemed a masterpiece of art?",
    answers: [
      "Ionic",
      "Composite",
      "Corinthian"
    ],
    correctAnswer: "Corinthian",
    explanation: "The Corinthian, the richest of the five orders, is deemed a masterpiece of art. Its capital is adorned with two rows of leaves and eight volutes.",
    category: 'architecture'
  },
  {
    id: 14,
    text: "Which Order was invented by the Greeks and is the most ancient?",
    answers: [
      "Tuscan",
      "Doric",
      "Ionic"
    ],
    correctAnswer: "Doric",
    explanation: "The Doric is the most ancient of the five orders and was invented by the Greeks. Its column is eight diameters high.",
    category: 'architecture'
  },
  {
    id: 15,
    text: "What adorns the capital of the Ionic Order?",
    answers: [
      "Two rows of leaves",
      "Volutes (scrolls)",
      "Acanthus leaves"
    ],
    correctAnswer: "Volutes (scrolls)",
    explanation: "The Ionic Order's capital is adorned with volutes, or scrolls. Its column is nine diameters high.",
    category: 'architecture'
  },
  {
    id: 16,
    text: "Which Order was contrived by the Romans?",
    answers: [
      "Corinthian",
      "Composite",
      "Tuscan"
    ],
    correctAnswer: "Composite",
    explanation: "The Composite Order was contrived by the Romans and combines elements from the other orders - the leaves of the Corinthian and volutes of the Ionic.",
    category: 'architecture'
  },

  // === SEVEN LIBERAL ARTS & SCIENCES ===
  {
    id: 17,
    text: "Which of the Liberal Arts is considered most important to Masonry?",
    answers: [
      "Rhetoric",
      "Geometry",
      "Astronomy"
    ],
    correctAnswer: "Geometry",
    explanation: "Geometry, the fifth science, is considered most revered by Masons as it is the basis on which the superstructure of Freemasonry is erected.",
    category: 'liberal_arts'
  },
  {
    id: 18,
    text: "What does Grammar teach us?",
    answers: [
      "To speak fluently",
      "The proper arrangement of words",
      "The powers of numbers"
    ],
    correctAnswer: "The proper arrangement of words",
    explanation: "Grammar is the key by which alone the door can be opened to the understanding of speech. It is the proper arrangement of words.",
    category: 'liberal_arts'
  },
  {
    id: 19,
    text: "What does Rhetoric teach us?",
    answers: [
      "To write beautifully",
      "To speak copiously and fluently on any subject",
      "To argue logically"
    ],
    correctAnswer: "To speak copiously and fluently on any subject",
    explanation: "Rhetoric teaches us to speak copiously and fluently on any subject, not merely with propriety alone but with all the advantages of force and elegance.",
    category: 'liberal_arts'
  },
  {
    id: 20,
    text: "What sublime science inspires the contemplative mind to soar aloft?",
    answers: [
      "Music",
      "Geometry",
      "Astronomy"
    ],
    correctAnswer: "Astronomy",
    explanation: "Astronomy is that sublime science which inspires the contemplative mind to soar aloft, and read the wisdom, strength, and beauty of the great Creator in the heavens.",
    category: 'liberal_arts'
  },

  // === SYMBOLISM ===
  {
    id: 21,
    text: "What does the letter 'G' displayed in the Lodge denote?",
    answers: [
      "The Grand Lodge",
      "God and Geometry",
      "The Great Architect only"
    ],
    correctAnswer: "God and Geometry",
    explanation: "The letter 'G' denotes God, the Grand Geometrician of the Universe, and also Geometry, the fifth science.",
    category: 'symbolism'
  },
  {
    id: 22,
    text: "Why is Geometry so important to Masons?",
    answers: [
      "It helps us build better buildings.",
      "It is the basis on which Freemasonry is erected.",
      "It was King Solomon's favorite subject."
    ],
    correctAnswer: "It is the basis on which Freemasonry is erected.",
    explanation: "Geometry is the basis on which the superstructure of Freemasonry is erected. By it we may trace nature through her various windings.",
    category: 'symbolism'
  },
  {
    id: 23,
    text: "Where does the Fellow Craft receive his wages?",
    answers: [
      "At the door of the Lodge",
      "In the Middle Chamber of King Solomon's Temple",
      "At the Altar"
    ],
    correctAnswer: "In the Middle Chamber of King Solomon's Temple",
    explanation: "Fellow Crafts received their wages in the Middle Chamber of King Solomon's Temple, without scruple or diffidence.",
    category: 'ritual'
  },
  {
    id: 24,
    text: "What were the wages of a Fellow Craft?",
    answers: [
      "Gold and silver coins",
      "Corn, wine, and oil",
      "Precious stones"
    ],
    correctAnswer: "Corn, wine, and oil",
    explanation: "The wages of a Fellow Craft were corn, wine, and oil - representing nourishment, refreshment, and joy.",
    category: 'ritual'
  },
  {
    id: 25,
    text: "What is depicted by an ear of corn near a fall of water?",
    answers: [
      "The wages of a Fellow Craft",
      "The word Shibboleth meaning 'plenty'",
      "The harvest festival"
    ],
    correctAnswer: "The word Shibboleth meaning 'plenty'",
    explanation: "Shibboleth, depicted by an ear of corn near to a fall of water, signifies plenty and was the password of the Gileadites.",
    category: 'symbolism'
  },

  // === ADDITIONAL QUESTIONS ===
  {
    id: 26,
    text: "On which pillar is the terrestrial globe depicted?",
    answers: [
      "The right-hand pillar (Jachin)",
      "The left-hand pillar (Boaz)",
      "Both pillars equally"
    ],
    correctAnswer: "The left-hand pillar (Boaz)",
    explanation: "The left-hand pillar (Boaz) is adorned with the terrestrial globe, while the right-hand pillar (Jachin) bears the celestial globe.",
    category: 'symbolism'
  },
  {
    id: 27,
    text: "What do the two great pillars at the entrance of the Temple represent?",
    answers: [
      "Wisdom and Strength only",
      "Stability and establishment",
      "The sun and moon"
    ],
    correctAnswer: "Stability and establishment",
    explanation: "The two pillars, Boaz (meaning 'in strength') and Jachin (meaning 'to establish'), together represent stability and establishment.",
    category: 'symbolism'
  },
  {
    id: 28,
    text: "How many senses of human nature are there?",
    answers: [
      "Three",
      "Five",
      "Seven"
    ],
    correctAnswer: "Five",
    explanation: "There are five senses of human nature: Hearing, Seeing, Feeling, Smelling, and Tasting. The Fellow Craft is encouraged to cultivate all five.",
    category: 'symbolism'
  },
  {
    id: 29,
    text: "What science treats of the powers and properties of magnitudes?",
    answers: [
      "Arithmetic",
      "Geometry",
      "Logic"
    ],
    correctAnswer: "Geometry",
    explanation: "Geometry treats of the powers and properties of magnitudes in general, where length, breadth, and thickness are considered.",
    category: 'liberal_arts'
  },
  {
    id: 30,
    text: "What does Music teach?",
    answers: [
      "The art of forming concords to compose delightful harmony",
      "The seven notes of the scale",
      "How to play instruments"
    ],
    correctAnswer: "The art of forming concords to compose delightful harmony",
    explanation: "Music teaches the art of forming concords, so as to compose delightful harmony by a mathematical and proportional arrangement of acute, grave, and mixed sounds.",
    category: 'liberal_arts'
  }
];

// Working Tools for Fellow Craft
const FC_TOOLS = {
  SQUARE: {
    name: "The Square",
    spriteKey: "square",
    blurb: "The Square teaches us to regulate our actions by rule and line, and to harmonize our conduct by the principles of morality and virtue."
  },
  LEVEL: {
    name: "The Level",
    spriteKey: "level",
    blurb: "The Level demonstrates that we are descended from the same stock, partake of the same nature, and share the same hope."
  },
  PLUMB: {
    name: "The Plumb Rule",
    spriteKey: "plumb",
    blurb: "The Plumb Rule teaches us to walk uprightly in our several stations before God and man."
  },
  CORN: {
    name: "Ear of Corn",
    spriteKey: "corn",
    blurb: "The Ear of Corn near a fall of water depicts Shibboleth, signifying plenty."
  },
  LETTER_G: {
    name: "The Letter G",
    spriteKey: "letter_g",
    blurb: "The letter G denotes God, the Grand Geometrician of the Universe, and also Geometry, the fifth science."
  }
};

// yOffset: 0 is the ground level. Negative is Up.
// Platform types: 'floor' | 'step' | 'pillar_base' | 'platform' | 'landing' | 'column_base'
export const PLATFORM_DATA: Array<{
  x: number;
  yOffset: number;
  width: number;
  height: number;
  color: string;
  type?: PlatformType;
}> = [
  // === GROUND FLOOR (Porch with Two Great Pillars) ===
  { x: 0, yOffset: 0, width: 800, height: 600, color: TEMPLE_COLORS.STONE_MID, type: 'floor' },
  // Pillar bases
  { x: 100, yOffset: -50, width: 60, height: 50, color: TEMPLE_COLORS.STONE_LIGHT, type: 'pillar_base' },
  { x: 340, yOffset: -50, width: 60, height: 50, color: TEMPLE_COLORS.STONE_LIGHT, type: 'pillar_base' },

  // === THREE STEPS (Principal Officers) ===
  { x: 300, yOffset: -80, width: 200, height: 20, color: TEMPLE_COLORS.STEP_THREE, type: 'step' },
  { x: 380, yOffset: -160, width: 200, height: 20, color: TEMPLE_COLORS.STEP_THREE, type: 'step' },
  { x: 460, yOffset: -240, width: 200, height: 20, color: TEMPLE_COLORS.STEP_THREE, type: 'step' },

  // === FIRST LANDING (after 3 steps) ===
  { x: 500, yOffset: -320, width: 400, height: 100, color: TEMPLE_COLORS.STONE_MID, type: 'landing' },

  // === FIVE STEPS (Orders of Architecture) ===
  { x: 550, yOffset: -420, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 620, yOffset: -520, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 690, yOffset: -620, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 760, yOffset: -720, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 830, yOffset: -820, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },

  // === SECOND LANDING (after 5 steps) ===
  { x: 900, yOffset: -920, width: 400, height: 100, color: TEMPLE_COLORS.STONE_MID, type: 'landing' },

  // === SEVEN STEPS (Liberal Arts & Sciences) ===
  { x: 1000, yOffset: -1020, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1080, yOffset: -1120, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1160, yOffset: -1220, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1240, yOffset: -1320, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1320, yOffset: -1420, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1400, yOffset: -1520, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1480, yOffset: -1620, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },

  // === THIRD LANDING (after 7 steps) ===
  { x: 1550, yOffset: -1720, width: 500, height: 100, color: TEMPLE_COLORS.STONE_MID, type: 'landing' },

  // === APPROACH TO MIDDLE CHAMBER ===
  { x: 1700, yOffset: -1850, width: 200, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 1900, yOffset: -1980, width: 200, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 2100, yOffset: -2110, width: 200, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },
  { x: 2300, yOffset: -2240, width: 300, height: 20, color: TEMPLE_COLORS.STONE_LIGHT, type: 'step' },

  // === MIDDLE CHAMBER ===
  { x: 2500, yOffset: -2400, width: 1500, height: 600, color: TEMPLE_COLORS.CHAMBER_DEEP, type: 'floor' },
  // Raised platform for WM/Goal
  { x: 3200, yOffset: -2500, width: 400, height: 20, color: TEMPLE_COLORS.GOLD, type: 'altar' },
  { x: 3300, yOffset: -2580, width: 200, height: 20, color: TEMPLE_COLORS.GOLD_BRIGHT, type: 'altar' },
];

export const GOAL_X = 3500;
export const GOAL_Y_OFFSET = -2580;

// Orb definitions throughout the ascent
export const ORB_DATA: OrbDefinition[] = [
  // === GROUND FLOOR - Introduction ===
  {
    id: 1,
    x: 250,
    yOffset: -35,
    radius: 20,
    ...FC_TOOLS.SQUARE,
    blurb: "You are presented with the Square, the first working tool of a Fellow Craft. In this degree, it teaches morality."
  },

  // === THREE STEPS (Principal Officers) ===
  { id: 2, x: 400, yOffset: -115, radius: 20, questionId: 9, ...FC_TOOLS.SQUARE },
  { id: 3, x: 480, yOffset: -195, radius: 20, questionId: 4, ...FC_TOOLS.LEVEL },
  { id: 4, x: 560, yOffset: -275, radius: 20, questionId: 5, ...FC_TOOLS.PLUMB },

  // === FIRST LANDING ===
  { id: 5, x: 700, yOffset: -355, radius: 20, questionId: 6, ...FC_TOOLS.LEVEL },
  { id: 6, x: 800, yOffset: -355, radius: 20, questionId: 7, ...FC_TOOLS.PLUMB },

  // === FIVE STEPS (Orders of Architecture) ===
  { id: 7, x: 640, yOffset: -455, radius: 20, questionId: 12, ...FC_TOOLS.SQUARE }, // Tuscan
  { id: 8, x: 710, yOffset: -555, radius: 20, questionId: 14, ...FC_TOOLS.SQUARE }, // Doric
  { id: 9, x: 780, yOffset: -655, radius: 20, questionId: 15, ...FC_TOOLS.LEVEL },  // Ionic
  { id: 10, x: 850, yOffset: -755, radius: 20, questionId: 13, ...FC_TOOLS.PLUMB }, // Corinthian
  { id: 11, x: 920, yOffset: -855, radius: 20, questionId: 16, ...FC_TOOLS.SQUARE }, // Composite

  // === SECOND LANDING ===
  { id: 12, x: 1100, yOffset: -955, radius: 20, questionId: 10, ...FC_TOOLS.LEVEL },
  { id: 13, x: 1200, yOffset: -955, radius: 20, questionId: 8, ...FC_TOOLS.SQUARE },

  // === SEVEN STEPS (Liberal Arts & Sciences) ===
  { id: 14, x: 1080, yOffset: -1055, radius: 20, questionId: 18, ...FC_TOOLS.PLUMB }, // Grammar
  { id: 15, x: 1160, yOffset: -1155, radius: 20, questionId: 19, ...FC_TOOLS.SQUARE }, // Rhetoric
  { id: 16, x: 1240, yOffset: -1255, radius: 20, questionId: 29, ...FC_TOOLS.LEVEL },  // Logic
  { id: 17, x: 1320, yOffset: -1355, radius: 20, questionId: 30, ...FC_TOOLS.PLUMB },  // Arithmetic
  { id: 18, x: 1400, yOffset: -1455, radius: 20, questionId: 17, ...FC_TOOLS.LETTER_G }, // Geometry - SPECIAL
  { id: 19, x: 1480, yOffset: -1555, radius: 20, questionId: 20, ...FC_TOOLS.SQUARE },  // Music
  { id: 20, x: 1560, yOffset: -1655, radius: 20, questionId: 11, ...FC_TOOLS.LEVEL },   // Astronomy

  // === THIRD LANDING ===
  { id: 21, x: 1750, yOffset: -1755, radius: 20, questionId: 21, ...FC_TOOLS.LETTER_G },
  { id: 22, x: 1900, yOffset: -1755, radius: 20, questionId: 22, ...FC_TOOLS.LETTER_G },

  // === MIDDLE CHAMBER APPROACH ===
  { id: 23, x: 1800, yOffset: -1885, radius: 20, questionId: 3, ...FC_TOOLS.CORN },
  { id: 24, x: 2000, yOffset: -2015, radius: 20, questionId: 25, ...FC_TOOLS.CORN },
  { id: 25, x: 2200, yOffset: -2145, radius: 20, questionId: 26, ...FC_TOOLS.SQUARE },
  { id: 26, x: 2450, yOffset: -2275, radius: 20, questionId: 27, ...FC_TOOLS.PLUMB },

  // === MIDDLE CHAMBER ===
  { id: 27, x: 2800, yOffset: -2435, radius: 20, questionId: 23, ...FC_TOOLS.CORN },
  { id: 28, x: 3000, yOffset: -2435, radius: 20, questionId: 24, ...FC_TOOLS.CORN },
  { id: 29, x: 3300, yOffset: -2535, radius: 20, questionId: 1, ...FC_TOOLS.SQUARE },
  { id: 30, x: 3400, yOffset: -2615, radius: 20, questionId: 2, ...FC_TOOLS.LEVEL },
];

// Tassels removed for FC - replaced with staircase progress tracking
export const TASSELS: any[] = [];
