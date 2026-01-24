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
export const DESIGN_HEIGHT = 360;

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
  INNER_GUARD: { x: 220, yOffset: 0 },          // Between the two great pillars
  SENIOR_WARDEN: { x: 500, yOffset: 0 },        // On ground floor, presents FC apron before staircase
  JUNIOR_WARDEN: { x: 1100, yOffset: -900 },    // Second landing - guards staircase
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

// Fellow Craft Questions (55 questions)
// Theme: Life and Discovery
export const QUESTIONS: Question[] = [
  // === CATEGORY 1: PREPARATION & ENTRY ===
  {
    id: 1,
    text: "How were you prepared to be passed to the Second Degree?",
    answers: [
      "In a manner somewhat similar to the former, but not hoodwinked; left arm, right breast, and right knee bare, left heel slipshod.",
      "Exactly as in the First Degree, with the same preparation.",
      "With both knees bare and a cable-tow twice around the body."
    ],
    correctAnswer: "In a manner somewhat similar to the former, but not hoodwinked; left arm, right breast, and right knee bare, left heel slipshod.",
    explanation: "The preparation is similar to the First Degree but differs: no hoodwink (eyes open for discovery), and the opposite limbs are made bare.",
    category: 'ritual'
  },
  {
    id: 2,
    text: "On what were you admitted into a Lodge of Fellow Craft Freemasons?",
    answers: [
      "The Square.",
      "The Compasses.",
      "The point of a sharp instrument."
    ],
    correctAnswer: "The Square.",
    explanation: "The candidate is admitted on the Square, reminding us to act on the square towards all mankind.",
    category: 'ritual'
  },
  {
    id: 3,
    text: "What is a Square?",
    answers: [
      "An instrument containing an angle of 90 degrees, or the fourth part of a circle.",
      "An instrument containing an angle of 45 degrees, or the eighth part of a circle.",
      "A perfect four-sided figure with equal sides."
    ],
    correctAnswer: "An instrument containing an angle of 90 degrees, or the fourth part of a circle.",
    explanation: "The Square is defined as an instrument containing an angle of 90 degrees, the fourth part of a circle.",
    category: 'working_tools'
  },
  {
    id: 4,
    text: "What does admission on the Square remind us?",
    answers: [
      "That we are bound by every law, both moral and Divine, to act on the square towards all mankind.",
      "That we must keep our working tools in perfect condition.",
      "That the Lodge is built on a square foundation."
    ],
    correctAnswer: "That we are bound by every law, both moral and Divine, to act on the square towards all mankind.",
    explanation: "Admission on the Square teaches that we must act honestly and fairly with all people.",
    category: 'ritual'
  },
  {
    id: 5,
    text: "Why were you not hoodwinked in this Degree?",
    answers: [
      "Having received light in the First Degree, the Fellow Craft proceeds with eyes open to discovery.",
      "Because the Second Degree is less secret than the First.",
      "Because the darkness represents death, which comes in the Third Degree."
    ],
    correctAnswer: "Having received light in the First Degree, the Fellow Craft proceeds with eyes open to discovery.",
    explanation: "Having received Masonic light as an Entered Apprentice, the Fellow Craft now proceeds with eyes open to discover the hidden mysteries of nature and science.",
    category: 'ritual'
  },

  // === CATEGORY 2: THE JOURNEY ===
  {
    id: 6,
    text: "Where did the Fellow Crafts receive their wages?",
    answers: [
      "In the middle chamber of King Solomon's Temple.",
      "At the entrance porch between the two pillars.",
      "In the Sanctum Sanctorum (Holy of Holies)."
    ],
    correctAnswer: "In the middle chamber of King Solomon's Temple.",
    explanation: "Fellow Crafts ascended to the middle chamber to receive their wages without scruple or diffidence.",
    category: 'ritual'
  },
  {
    id: 7,
    text: "How did they reach the middle chamber?",
    answers: [
      "By ascending a winding staircase.",
      "By passing between the two great pillars.",
      "By climbing Jacob's Ladder."
    ],
    correctAnswer: "By ascending a winding staircase.",
    explanation: "The Fellow Crafts reached the middle chamber by ascending a winding staircase of fifteen steps.",
    category: 'symbolism'
  },
  {
    id: 8,
    text: "How many steps were in the winding staircase?",
    answers: [
      "Fifteen steps, divided into three flights of three, five, and seven.",
      "Twelve steps, divided into three flights of four.",
      "Seven steps, representing the Liberal Arts and Sciences."
    ],
    correctAnswer: "Fifteen steps, divided into three flights of three, five, and seven.",
    explanation: "The winding staircase consists of fifteen steps in three flights: 3 + 5 + 7 = 15.",
    category: 'symbolism'
  },
  {
    id: 9,
    text: "What do the three steps symbolize?",
    answers: [
      "The three who rule a Lodge (Worshipful Master and two Wardens).",
      "Faith, Hope, and Charity.",
      "Wisdom, Strength, and Beauty."
    ],
    correctAnswer: "The three who rule a Lodge (Worshipful Master and two Wardens).",
    explanation: "The first three steps represent the three principal officers who rule the Lodge.",
    category: 'symbolism'
  },
  {
    id: 10,
    text: "What do the five steps symbolize?",
    answers: [
      "The five who hold a Lodge.",
      "The Five Orders of Architecture.",
      "The Five Points of Fellowship."
    ],
    correctAnswer: "The five who hold a Lodge.",
    explanation: "The five steps represent the five who hold a Lodge: the WM, two Wardens, and two Fellow Crafts.",
    category: 'symbolism'
  },
  {
    id: 11,
    text: "What do the seven steps symbolize?",
    answers: [
      "The seven who make a Lodge perfect.",
      "The Seven Liberal Arts and Sciences.",
      "The seven days of creation."
    ],
    correctAnswer: "The seven who make a Lodge perfect.",
    explanation: "Seven make a Lodge perfect, without which number no Lodge is perfect nor can any candidate be legally initiated.",
    category: 'symbolism'
  },
  {
    id: 12,
    text: "When you were made an EA, where were you placed? And now as a FC?",
    answers: [
      "As EA at the north-east to show newly admitted; as FC at the south-east to mark progress.",
      "As EA at the south-east; as FC at the north-east.",
      "As EA at the west; as FC at the east."
    ],
    correctAnswer: "As EA at the north-east to show newly admitted; as FC at the south-east to mark progress.",
    explanation: "The north-east represents the newly admitted; the south-east marks the progress made in Freemasonry.",
    category: 'ritual'
  },
  {
    id: 13,
    text: "Who opposed the Fellow Crafts at the foot of the winding staircase?",
    answers: [
      "The Junior Warden, to whom they communicated the Pass Word.",
      "The Senior Warden, to whom they gave the Sign.",
      "The Inner Guard, who tested them with the Square."
    ],
    correctAnswer: "The Junior Warden, to whom they communicated the Pass Word.",
    explanation: "The Junior Warden guards the foot of the staircase and receives the Pass Word (Shibboleth).",
    category: 'ritual'
  },
  {
    id: 14,
    text: "Who guarded the door of the middle chamber?",
    answers: [
      "The Senior Warden, to whom they communicated the Sign and Word of a Fellow Craft.",
      "The Junior Warden, with the Pass Word.",
      "The Worshipful Master, who tested their knowledge."
    ],
    correctAnswer: "The Senior Warden, to whom they communicated the Sign and Word of a Fellow Craft.",
    explanation: "The Senior Warden guards the door of the middle chamber and receives the Sign and Word.",
    category: 'ritual'
  },

  // === CATEGORY 3: TOOLS FOR LIVING ===
  {
    id: 15,
    text: "What are the Working Tools of a Fellow Craft Freemason?",
    answers: [
      "The Square, the Level, and the Plumb Rule.",
      "The 24-inch Gauge and Common Gavel.",
      "The Skirret, Pencil, and Compasses."
    ],
    correctAnswer: "The Square, the Level, and the Plumb Rule.",
    explanation: "The FC Working Tools are the Square (morality), Level (equality), and Plumb Rule (uprightness).",
    category: 'working_tools'
  },
  {
    id: 16,
    text: "What is the operative use of the Square?",
    answers: [
      "To try and adjust rectangular corners of buildings, and assist in bringing rude matter into due form.",
      "To lay levels and prove horizontals.",
      "To try and adjust uprights while fixing them on their proper bases."
    ],
    correctAnswer: "To try and adjust rectangular corners of buildings, and assist in bringing rude matter into due form.",
    explanation: "Operatively, the Square tests and adjusts right angles in construction.",
    category: 'working_tools'
  },
  {
    id: 17,
    text: "What does the Square teach us morally?",
    answers: [
      "To regulate our lives and actions according to the Masonic line and rule.",
      "That we are all sprung from the same stock and share the same hope.",
      "To walk justly and uprightly before God and man."
    ],
    correctAnswer: "To regulate our lives and actions according to the Masonic line and rule.",
    explanation: "The Square teaches us to regulate our conduct by morality and virtue, making us acceptable to the Divine Being.",
    category: 'working_tools'
  },
  {
    id: 18,
    text: "What is the operative use of the Level?",
    answers: [
      "To lay levels and prove horizontals.",
      "To try and adjust rectangular corners.",
      "To try and adjust uprights on their proper bases."
    ],
    correctAnswer: "To lay levels and prove horizontals.",
    explanation: "Operatively, the Level is used to test that surfaces are truly horizontal.",
    category: 'working_tools'
  },
  {
    id: 19,
    text: "What does the Level teach us morally?",
    answers: [
      "That we are all sprung from the same stock, partakers of the same nature, and sharers in the same hope.",
      "To regulate our lives and actions according to the Masonic line and rule.",
      "To walk justly and uprightly before God and man."
    ],
    correctAnswer: "That we are all sprung from the same stock, partakers of the same nature, and sharers in the same hope.",
    explanation: "The Level teaches equality - no eminence of situation should make us forget we are Brethren.",
    category: 'working_tools'
  },
  {
    id: 20,
    text: "What is the operative use of the Plumb Rule?",
    answers: [
      "To try and adjust uprights while fixing them on their proper bases.",
      "To lay levels and prove horizontals.",
      "To try and adjust rectangular corners of buildings."
    ],
    correctAnswer: "To try and adjust uprights while fixing them on their proper bases.",
    explanation: "Operatively, the Plumb Rule tests that structures are truly vertical.",
    category: 'working_tools'
  },
  {
    id: 21,
    text: "What does the Plumb Rule teach us morally?",
    answers: [
      "To walk justly and uprightly before God and man, turning neither to the right nor left from the paths of virtue.",
      "That we are all sprung from the same stock and share the same hope.",
      "To regulate our lives according to the Masonic line and rule."
    ],
    correctAnswer: "To walk justly and uprightly before God and man, turning neither to the right nor left from the paths of virtue.",
    explanation: "The Plumb Rule teaches uprightness of life and conduct, never deviating from virtue.",
    category: 'working_tools'
  },
  {
    id: 22,
    text: "To what is the Plumb Rule compared?",
    answers: [
      "Jacob's Ladder, as it connects heaven and earth and is the criterion of rectitude and truth.",
      "The two pillars, as it represents stability.",
      "The winding staircase, as it shows our ascent to knowledge."
    ],
    correctAnswer: "Jacob's Ladder, as it connects heaven and earth and is the criterion of rectitude and truth.",
    explanation: "The Plumb Rule is compared to Jacob's Ladder, connecting heaven and earth as the standard of truth.",
    category: 'working_tools'
  },
  {
    id: 23,
    text: "How do the three Working Tools together guide us?",
    answers: [
      "The Square teaches morality, the Level equality, and the Plumb Rule justness and uprightness of life.",
      "They teach us to build temples, both physical and spiritual.",
      "The Square measures, the Level balances, and the Plumb Rule divides."
    ],
    correctAnswer: "The Square teaches morality, the Level equality, and the Plumb Rule justness and uprightness of life.",
    explanation: "By square conduct, level steps, and upright intentions, we hope to ascend to those eternal mansions whence all goodness emanates.",
    category: 'working_tools'
  },

  // === CATEGORY 4: KNOWLEDGE & DISCOVERY ===
  {
    id: 24,
    text: "What are the peculiar objects of research in this Degree?",
    answers: [
      "The hidden mysteries of nature and science.",
      "The secrets of the Third Degree.",
      "The principles of Moral Truth and Virtue."
    ],
    correctAnswer: "The hidden mysteries of nature and science.",
    explanation: "The Fellow Craft degree focuses on discovering the hidden mysteries of nature and science.",
    category: 'liberal_arts'
  },
  {
    id: 25,
    text: "What study is particularly recommended to a Fellow Craft?",
    answers: [
      "The liberal arts and sciences, especially Geometry.",
      "The history of the Craft.",
      "The memorization of ritual."
    ],
    correctAnswer: "The liberal arts and sciences, especially Geometry.",
    explanation: "Geometry is established as the basis of our Art, and the liberal arts and sciences are particularly recommended.",
    category: 'liberal_arts'
  },
  {
    id: 26,
    text: "What does the Badge of a Fellow Craft point out?",
    answers: [
      "That as a Craftsman, you are expected to make the Liberal Arts and Sciences your future study.",
      "That you have completed your journey through the degrees.",
      "That you are now qualified to teach Entered Apprentices."
    ],
    correctAnswer: "That as a Craftsman, you are expected to make the Liberal Arts and Sciences your future study.",
    explanation: "The FC Badge indicates the expectation to study the Liberal Arts and Sciences to better discharge Masonic duty.",
    category: 'ritual'
  },
  {
    id: 27,
    text: "What principle did you learn in the First Degree?",
    answers: [
      "The principles of Moral Truth and Virtue.",
      "The hidden mysteries of nature and science.",
      "The secrets of the Master Mason."
    ],
    correctAnswer: "The principles of Moral Truth and Virtue.",
    explanation: "The EA degree teaches the foundation of Moral Truth and Virtue.",
    category: 'ritual'
  },
  {
    id: 28,
    text: "What are you now expected to do as a Fellow Craft?",
    answers: [
      "To extend your researches into the hidden mysteries of Nature and Science.",
      "To prepare for the Third Degree immediately.",
      "To teach newly admitted Entered Apprentices."
    ],
    correctAnswer: "To extend your researches into the hidden mysteries of Nature and Science.",
    explanation: "Building on the moral foundation of the EA degree, the FC extends research into nature and science.",
    category: 'liberal_arts'
  },

  // === CATEGORY 5: THE TEMPLE SYMBOLS ===
  {
    id: 29,
    text: "What were the names of the two Great Pillars at the entrance of King Solomon's Temple?",
    answers: [
      "Boaz on the left, Jachin on the right.",
      "Jachin on the left, Boaz on the right.",
      "Wisdom on the left, Strength on the right."
    ],
    correctAnswer: "Boaz on the left, Jachin on the right.",
    explanation: "Boaz (meaning 'in strength') stood on the left; Jachin (meaning 'to establish') on the right.",
    category: 'symbolism'
  },
  {
    id: 30,
    text: "What does Boaz denote?",
    answers: [
      "Strength.",
      "To establish.",
      "Wisdom."
    ],
    correctAnswer: "Strength.",
    explanation: "Boaz means 'in strength' - the left pillar represents strength.",
    category: 'symbolism'
  },
  {
    id: 31,
    text: "What does Jachin denote?",
    answers: [
      "To establish.",
      "Strength.",
      "Foundation."
    ],
    correctAnswer: "To establish.",
    explanation: "Jachin means 'to establish' - the right pillar represents establishment.",
    category: 'symbolism'
  },
  {
    id: 32,
    text: "What do the two names conjoined signify?",
    answers: [
      "Stability; for God said: 'In strength I will establish this Mine house to stand firm for ever.'",
      "Wisdom and Beauty combined.",
      "The union of heaven and earth."
    ],
    correctAnswer: "Stability; for God said: 'In strength I will establish this Mine house to stand firm for ever.'",
    explanation: "Together, Boaz and Jachin signify Stability - strength combined with establishment.",
    category: 'symbolism'
  },
  {
    id: 33,
    text: "What were the Pillars intended to remind the Israelites?",
    answers: [
      "The miraculous Pillar of Cloud and of Fire which went before them through the Red Sea.",
      "The pillars of Hercules at the edge of the known world.",
      "The two tablets of the law given to Moses."
    ],
    correctAnswer: "The miraculous Pillar of Cloud and of Fire which went before them through the Red Sea.",
    explanation: "The pillars commemorated the Pillar of Cloud by day and Fire by night that guided the Israelites.",
    category: 'symbolism'
  },
  {
    id: 34,
    text: "Who cast the two Pillars?",
    answers: [
      "Hiram, the Son of the Widow, servant of King Solomon.",
      "King Solomon himself.",
      "King Hiram of Tyre."
    ],
    correctAnswer: "Hiram, the Son of the Widow, servant of King Solomon.",
    explanation: "Hiram Abiff, the skilled craftsman and 'Son of the Widow,' cast the two great pillars.",
    category: 'symbolism'
  },
  {
    id: 35,
    text: "What ornamented the chapiters (capitals) of the Pillars?",
    answers: [
      "Network, Lilywork, and two rows of Pomegranates, one hundred in each row.",
      "Acanthus leaves and volutes.",
      "Celestial and terrestrial globes."
    ],
    correctAnswer: "Network, Lilywork, and two rows of Pomegranates, one hundred in each row.",
    explanation: "The capitals were adorned with Network, Lilywork, and 200 pomegranates (100 in each row).",
    category: 'symbolism'
  },
  {
    id: 36,
    text: "What does Network denote?",
    answers: [
      "Unity, from the connection of its meshes.",
      "Purity and Peace.",
      "Plenty, from its abundance."
    ],
    correctAnswer: "Unity, from the connection of its meshes.",
    explanation: "Network symbolizes Unity because of how its meshes connect together.",
    category: 'symbolism'
  },
  {
    id: 37,
    text: "What does Lilywork denote?",
    answers: [
      "Purity and Peace, from its whiteness.",
      "Unity, from its connection.",
      "Plenty, from its abundance."
    ],
    correctAnswer: "Purity and Peace, from its whiteness.",
    explanation: "Lilywork represents Purity and Peace, symbolized by its white color.",
    category: 'symbolism'
  },
  {
    id: 38,
    text: "What do Pomegranates denote?",
    answers: [
      "Plenty, from the exuberance of their seeds.",
      "Unity, from their compact form.",
      "Purity, from their color."
    ],
    correctAnswer: "Plenty, from the exuberance of their seeds.",
    explanation: "Pomegranates symbolize Plenty due to their many seeds.",
    category: 'symbolism'
  },
  {
    id: 39,
    text: "What Hebrew character drew the particular attention of our antient Brethren in the middle chamber?",
    answers: [
      "The letter G.",
      "The letter H.",
      "The Tetragrammaton."
    ],
    correctAnswer: "The letter G.",
    explanation: "The letter G is the sacred symbol in the centre of the Lodge and middle chamber.",
    category: 'symbolism'
  },
  {
    id: 40,
    text: "What does the letter G denote?",
    answers: [
      "God, the Grand Geometrician of the Universe.",
      "Geometry alone.",
      "The Grand Lodge."
    ],
    correctAnswer: "God, the Grand Geometrician of the Universe.",
    explanation: "The letter G represents God, the Grand Geometrician, whom we must humbly adore.",
    category: 'symbolism'
  },
  {
    id: 41,
    text: "Where is the Sacred Symbol situated?",
    answers: [
      "In the centre of the building.",
      "Above the Worshipful Master's chair.",
      "Between the two pillars."
    ],
    correctAnswer: "In the centre of the building.",
    explanation: "The letter G is positioned in the centre of the Lodge building.",
    category: 'symbolism'
  },
  {
    id: 42,
    text: "To whom does the Sacred Symbol allude?",
    answers: [
      "The Great Geometrician of the Universe.",
      "The Grand Master of the Grand Lodge.",
      "The architect Hiram Abiff."
    ],
    correctAnswer: "The Great Geometrician of the Universe.",
    explanation: "The Sacred Symbol alludes to God, the Great Geometrician of the Universe.",
    category: 'symbolism'
  },

  // === CATEGORY 6: REWARDS OF LABOR ===
  {
    id: 43,
    text: "As it is the hope of reward that sweetens labour, where did our antient Brethren go to receive their wages?",
    answers: [
      "Into the middle chamber of King Solomon's Temple.",
      "To the entrance porch of the Temple.",
      "To the Sanctum Sanctorum."
    ],
    correctAnswer: "Into the middle chamber of King Solomon's Temple.",
    explanation: "The hope of reward led the Fellow Crafts to the middle chamber to receive their wages.",
    category: 'ritual'
  },
  {
    id: 44,
    text: "How did the Fellow Crafts receive their wages?",
    answers: [
      "Without scruple or diffidence.",
      "With great ceremony and ritual.",
      "In secret, away from others."
    ],
    correctAnswer: "Without scruple or diffidence.",
    explanation: "They received wages without scruple (knowing they were entitled) and without diffidence (trusting their employers).",
    category: 'ritual'
  },
  {
    id: 45,
    text: "Why without scruple?",
    answers: [
      "Well knowing they were justly entitled to them.",
      "Because they had completed all their tasks.",
      "Because the wages were predetermined."
    ],
    correctAnswer: "Well knowing they were justly entitled to them.",
    explanation: "Without scruple means they knew their work earned them fair wages.",
    category: 'ritual'
  },
  {
    id: 46,
    text: "Why without diffidence?",
    answers: [
      "From the great reliance they placed on the integrity of their employers in those days.",
      "Because they feared no punishment.",
      "Because the wages were always the same amount."
    ],
    correctAnswer: "From the great reliance they placed on the integrity of their employers in those days.",
    explanation: "Without diffidence means they trusted completely in the honesty of King Solomon and his officers.",
    category: 'ritual'
  },
  {
    id: 47,
    text: "How were the Entered Apprentices paid?",
    answers: [
      "In corn, wine, and oil.",
      "In money.",
      "In precious metals."
    ],
    correctAnswer: "In corn, wine, and oil.",
    explanation: "Entered Apprentices received wages in kind: corn (nourishment), wine (refreshment), and oil (joy).",
    category: 'ritual'
  },
  {
    id: 48,
    text: "How were the Fellow Crafts paid?",
    answers: [
      "In money.",
      "In corn, wine, and oil.",
      "In precious stones."
    ],
    correctAnswer: "In money.",
    explanation: "Fellow Crafts, being more skilled, received monetary wages in the middle chamber.",
    category: 'ritual'
  },
  {
    id: 49,
    text: "What is the Pass Word of a Fellow Craft and what does it signify?",
    answers: [
      "Shibboleth, meaning an ear of corn and also a stream of water.",
      "Tubal-Cain, meaning a metalworker.",
      "Boaz, meaning strength."
    ],
    correctAnswer: "Shibboleth, meaning an ear of corn and also a stream of water.",
    explanation: "Shibboleth is Hebrew, meaning both an ear of corn and a stream of water (or running stream).",
    category: 'ritual'
  },
  {
    id: 50,
    text: "How is the Pass Word usually depicted in a Lodge of Fellow Craft Freemasons?",
    answers: [
      "By an ear of corn near a stream of water.",
      "By the letter G surrounded by rays.",
      "By the Square and Compasses."
    ],
    correctAnswer: "By an ear of corn near a stream of water.",
    explanation: "The Pass Word Shibboleth is depicted visually as an ear of corn near a stream of water.",
    category: 'symbolism'
  },
  {
    id: 51,
    text: "What do the ear of corn and stream of water together symbolize?",
    answers: [
      "Plenty.",
      "Strength and establishment.",
      "Purity and peace."
    ],
    correctAnswer: "Plenty.",
    explanation: "Together, the ear of corn and stream of water symbolize Plenty - abundance and provision.",
    category: 'symbolism'
  },

  // === CATEGORY 7: VIRTUES & CHARACTER ===
  {
    id: 52,
    text: "What is the highest perfection to which human nature can attain?",
    answers: [
      "To steer the bark of this life over the seas of passion, without quitting the helm of rectitude.",
      "To memorize all Masonic ritual perfectly.",
      "To rise to the highest office in the Grand Lodge."
    ],
    correctAnswer: "To steer the bark of this life over the seas of passion, without quitting the helm of rectitude.",
    explanation: "The highest human perfection is navigating life's passions while maintaining moral rectitude.",
    category: 'ritual'
  },
  {
    id: 53,
    text: "What should a Freemason hold in balance?",
    answers: [
      "A due medium between avarice and profusion; to hold the scales of justice with equal poise.",
      "The Square in one hand and Compasses in the other.",
      "Work and rest in equal measure."
    ],
    correctAnswer: "A due medium between avarice and profusion; to hold the scales of justice with equal poise.",
    explanation: "A Freemason should balance between greed and wastefulness, holding justice evenly, subduing passions, and keeping eternity in view.",
    category: 'ritual'
  },
  {
    id: 54,
    text: "What is expected of a Fellow Craft regarding other Brethren?",
    answers: [
      "To encourage industry and reward merit, supply wants and relieve necessities, never wrong them or see them wronged.",
      "To test them regularly on their Masonic knowledge.",
      "To report their failings to the Worshipful Master."
    ],
    correctAnswer: "To encourage industry and reward merit, supply wants and relieve necessities, never wrong them or see them wronged.",
    explanation: "Fellow Crafts should support Brethren, relieve their needs, protect them from wrong, and view their interests as inseparable from their own.",
    category: 'ritual'
  },
  {
    id: 55,
    text: "How should a Craftsman judge the offences of Brethren?",
    answers: [
      "Judge with candour, admonish with friendship, and reprehend with mercy.",
      "Report all offences immediately to the Worshipful Master.",
      "Ignore minor offences but report major ones."
    ],
    correctAnswer: "Judge with candour, admonish with friendship, and reprehend with mercy.",
    explanation: "Brethren should be judged fairly, advised as friends, and corrected with mercy.",
    category: 'ritual'
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

  // === THREE STEPS (Principal Officers) ===
  { x: 300, yOffset: -80, width: 200, height: 20, color: TEMPLE_COLORS.STEP_THREE, type: 'step' },
  { x: 380, yOffset: -160, width: 200, height: 20, color: TEMPLE_COLORS.STEP_THREE, type: 'step' },
  { x: 460, yOffset: -240, width: 200, height: 20, color: TEMPLE_COLORS.STEP_THREE, type: 'step' },

  // === FIRST LANDING (after 3 steps) ===
  { x: 500, yOffset: -320, width: 400, height: 40, color: TEMPLE_COLORS.STONE_MID, type: 'landing' },

  // === FIVE STEPS (Orders of Architecture) ===
  { x: 550, yOffset: -420, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 620, yOffset: -520, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 690, yOffset: -620, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 760, yOffset: -720, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },
  { x: 830, yOffset: -820, width: 180, height: 20, color: TEMPLE_COLORS.STEP_FIVE, type: 'step' },

  // === SECOND LANDING (after 5 steps) ===
  { x: 900, yOffset: -920, width: 400, height: 40, color: TEMPLE_COLORS.STONE_MID, type: 'landing' },

  // === SEVEN STEPS (Liberal Arts & Sciences) ===
  { x: 1000, yOffset: -1020, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1080, yOffset: -1120, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1160, yOffset: -1220, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1240, yOffset: -1320, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1320, yOffset: -1420, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1400, yOffset: -1520, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },
  { x: 1480, yOffset: -1620, width: 160, height: 20, color: TEMPLE_COLORS.STEP_SEVEN, type: 'step' },

  // === THIRD LANDING (after 7 steps) ===
  { x: 1550, yOffset: -1720, width: 500, height: 40, color: TEMPLE_COLORS.STONE_MID, type: 'landing' },

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
