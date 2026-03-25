import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   NYT Games — Windows 95 styled games hub
   Wordle, Connections, Crossword Mini, Spelling Bee
   ═══════════════════════════════════════════════════════════════════ */

// ─── Types ───
type GameScreen = 'menu' | 'wordle' | 'connections' | 'crossword' | 'spellingbee';

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

type ConnectionCategory = {
  name: string;
  words: string[];
  color: string;
};

type ConnectionPuzzle = {
  categories: ConnectionCategory[];
};

type CrosswordCell = {
  letter: string;
  isBlack: boolean;
  number: number | null;
  userLetter: string;
};

type CrosswordClue = {
  number: number;
  text: string;
  row: number;
  col: number;
  length: number;
};

type CrosswordPuzzleData = {
  grid: string[][];
  acrossClues: CrosswordClue[];
  downClues: CrosswordClue[];
};

type SpellingBeePuzzle = {
  center: string;
  outer: string[];
  words: string[];
  pangrams: string[];
  maxScore: number;
};

// ─── WORDLE WORD LIST (500+ words) ───
const WORDLE_WORDS: string[] = [
  'CRANE','SLATE','AUDIO','RAISE','STARE','HOUSE','WORLD','PLANT','BRAIN','GHOST',
  'FLAME','GRIND','GLEAM','BLAZE','BREAD','CANDY','BEACH','CHAIR','DANCE','EAGLE',
  'FAIRY','GLASS','HAPPY','IMAGE','JUDGE','KNIFE','LAUGH','MAGIC','NOBLE','OCEAN',
  'PEACE','QUEEN','RIVER','SOLID','TIGER','UNITY','VIVID','WATCH','YOUTH','ZEBRA',
  'ABORT','ABOVE','ABUSE','ACTOR','ACUTE','ADMIT','ADOPT','ADULT','AFTER','AGAIN',
  'AGENT','AGREE','AHEAD','ALARM','ALBUM','ALERT','ALIEN','ALIGN','ALIVE','ALLEY',
  'ALLOW','ALONE','ALONG','ALTER','ANGEL','ANGER','ANGLE','ANGRY','ANIME','ANKLE',
  'ANNEX','APART','APPLE','APPLY','ARENA','ARGUE','ARISE','ARMOR','ARRAY','ASIDE',
  'ASSET','ATTIC','AVOID','AWAKE','AWARD','AWARE','BADGE','BAKER','BASED','BASIC',
  'BASIN','BASIS','BATCH','BEAST','BEGAN','BEGIN','BEING','BELOW','BENCH','BERRY',
  'BIRTH','BLACK','BLADE','BLAME','BLAND','BLANK','BLAST','BLEED','BLEND','BLESS',
  'BLIND','BLOCK','BLOND','BLOOD','BLOOM','BLOWN','BLUES','BLUNT','BOARD','BOGUS',
  'BONUS','BOOST','BOOTH','BOUND','BRACE','BRAND','BRAVE','BREAK','BREED','BRIEF',
  'BRING','BROAD','BROKE','BROOK','BROWN','BRUSH','BUILD','BUNCH','BURST','BUYER',
  'CABIN','CABLE','CAMEL','CARGO','CARRY','CATCH','CAUSE','CEDAR','CHAIN','CHALK',
  'CHANT','CHAOS','CHARM','CHART','CHASE','CHEAP','CHECK','CHEEK','CHEER','CHESS',
  'CHEST','CHIEF','CHILD','CHINA','CHORD','CHUNK','CHURN','CIVIC','CIVIL','CLAIM',
  'CLASH','CLASS','CLEAN','CLEAR','CLERK','CLICK','CLIFF','CLIMB','CLING','CLOCK',
  'CLONE','CLOSE','CLOTH','CLOUD','COACH','COAST','COLOR','COMET','COMIC','CORAL',
  'COUCH','COUNT','COURT','COVER','CRACK','CRAFT','CRASH','CRAZY','CREAM','CRIME',
  'CRISP','CROSS','CROWD','CRUEL','CRUSH','CURVE','CYCLE','DAILY','DAIRY','DAISY',
  'DEBUT','DECAY','DECOR','DECOY','DEITY','DELAY','DELTA','DEMON','DENSE','DEPOT',
  'DEPTH','DERBY','DETOX','DIARY','DIGIT','DITCH','DIZZY','DONOR','DOUBT','DOUGH',
  'DRAFT','DRAIN','DRAKE','DRAMA','DRANK','DRAPE','DRAWN','DREAD','DREAM','DRESS',
  'DRIED','DRIFT','DRILL','DRINK','DRIVE','DROIT','DRONE','DROPS','DROVE','DRUNK',
  'DRYER','DULLY','DUMMY','DUSTY','DWARF','DWELL','DYING','EARLY','EARTH','EASEL',
  'EATER','EDICT','EIGHT','ELDER','ELECT','ELITE','EMBER','EMERY','EMPTY','ENACT',
  'ENEMY','ENJOY','ENTER','ENTRY','EQUAL','ERROR','ESSAY','EVENT','EVERY','EXACT',
  'EXALT','EXILE','EXIST','EXTRA','FABLE','FACET','FAITH','FALSE','FANCY','FATAL',
  'FAULT','FEAST','FENCE','FERRY','FETCH','FEVER','FIBER','FIELD','FIERY','FIFTH',
  'FIFTY','FIGHT','FINAL','FIRST','FIXED','FLASH','FLESH','FLICK','FLIER','FLING',
  'FLOAT','FLOCK','FLOOD','FLOOR','FLORA','FLOUR','FLUID','FLUSH','FLUTE','FOCUS',
  'FOGGY','FORCE','FORGE','FORTH','FORTY','FORUM','FOUND','FOYER','FRAIL','FRAME',
  'FRANK','FRAUD','FRESH','FRONT','FROST','FROZE','FRUIT','FULLY','FUNGI','GAMMA',
  'GAUGE','GENRE','GIANT','GIDDY','GIVEN','GLAND','GLARE','GLIDE','GLINT','GLOBE',
  'GLOOM','GLORY','GLOSS','GLOVE','GOING','GORGE','GRACE','GRADE','GRAIN','GRAND',
  'GRANT','GRAPE','GRAPH','GRASP','GRASS','GRAVE','GRATE','GREEN','GREET','GRIEF',
  'GRILL','GRIME','GROOM','GROSS','GROUP','GROVE','GROWN','GUARD','GUESS','GUIDE',
  'GUILD','GUILT','GUISE','GULCH','GUMMY','GUST','HABIT','HARSH','HASTE','HATCH',
  'HAUNT','HAVEN','HEART','HEAVY','HEDGE','HEIST','HENCE','HERBS','HILLY','HINGE',
  'HOBBY','HOIST','HOMER','HONOR','HORSE','HOTEL','HOVER','HUMAN','HUMID','HUMOR',
  'HURRY','HYPER','IDEAL','IDIOT','IMPLY','INBOX','INDEX','INDIE','INFER','INNER',
  'INPUT','INTER','INTRO','ISSUE','IVORY','JEWEL','JOINT','JOKER','JOLLY','JUICE',
  'JUICY','JUMBO','JUMPY','KAYAK','KEBAB','KNACK','KNEEL','KNOCK','LABEL','LANCE',
  'LARGE','LASER','LATCH','LATER','LAYER','LEAPT','LEARN','LEASE','LEAST','LEAVE',
  'LEGAL','LEMON','LEVEL','LEVER','LIGHT','LILAC','LIMIT','LINEN','LINER','LOGIC',
  'LOOSE','LOVER','LOWER','LOYAL','LUCID','LUCKY','LUNAR','LUNCH','LUNGE','LUSTY',
  'LYRIC','MACRO','MAFIA','MAJOR','MAKER','MANOR','MAPLE','MARCH','MARRY','MARSH',
  'MATCH','MAYOR','MEDAL','MEDIA','MERCY','MERGE','MERIT','METAL','METER','MIGHT',
  'MINOR','MINUS','MIRTH','MODEL','MOIST','MONEY','MONTH','MORAL','MOTEL','MOTOR',
  'MOUNT','MOURN','MOUSE','MOUTH','MOVIE','MUDDY','MUSIC','NAIVE','NERVE','NEVER',
  'NICHE','NIGHT','NINJA','NOISE','NORTH','NOTED','NOVEL','NUDGE','NURSE','NYLON',
  'OFFER','OFTEN','OLIVE','ONSET','OPERA','ORBIT','ORDER','OTHER','OUGHT','OUTER',
  'OXIDE','OZONE','PANIC','PANEL','PAPER','PARTY','PASTA','PATCH','PAUSE','PEARL',
  'PENAL','PENNY','PERCH','PHASE','PHONE','PHOTO','PIANO','PIECE','PILOT','PINCH',
  'PIXEL','PIZZA','PLACE','PLAIN','PLANK','PLAZA','PLEAD','PLEAT','PLIER','PLUCK',
  'PLUMB','PLUME','PLUMP','PLUNK','POACH','POINT','POLAR','PORCH','POSER','POUCH',
  'POUND','POWER','PRESS','PRICE','PRIDE','PRIME','PRISM','PRINT','PRIOR','PRIZE',
  'PROBE','PROOF','PRONE','PROSE','PROUD','PROVE','PROXY','PRUNE','PULSE','PUNCH',
  'PUPIL','PURSE','PUSHY','QUACK','QUALM','QUERY','QUEST','QUEUE','QUICK','QUIET',
  'QUILT','QUIRK','QUOTA','QUOTE','RADAR','RADII','RADIO','RAINY','RALLY','RANCH',
  'RANGE','RAPID','RATIO','REACH','REACT','READY','REALM','REBEL','REIGN','RELAX',
  'RELAY','RENAL','RENEW','REPAY','REPEL','REPLY','RETRY','RIDER','RIDGE','RIFLE',
  'RIGHT','RIGID','RIGOR','RINSE','RISEN','RISKY','RIVAL','ROBIN','ROBOT','ROCKY',
  'ROGUE','ROOST','ROUGE','ROUGH','ROUND','ROUTE','ROYAL','RUGBY','RULER','RURAL',
  'RUSTY','SADLY','SAINT','SALAD','SALTY','SANDY','SATIN','SAUCE','SAUNA','SCALE',
  'SCARE','SCARF','SCARY','SCENE','SCENT','SCOPE','SCORE','SCOUT','SCRAP','SENSE',
  'SERVE','SETUP','SEVEN','SHADE','SHAKE','SHALL','SHAME','SHAPE','SHARE','SHARK',
  'SHARP','SHAVE','SHEEP','SHEER','SHEET','SHELF','SHELL','SHIFT','SHINE','SHINY',
  'SHIRE','SHIRT','SHOCK','SHOOT','SHORE','SHORT','SHOUT','SHOVE','SIGHT','SIGMA',
  'SILLY','SINCE','SIREN','SIXTH','SIXTY','SIZED','SKILL','SKULL','SLAIN','SLANG',
  'SLASH','SLEEP','SLICE','SLIDE','SLOPE','SMALL','SMART','SMELL','SMILE','SMITH',
  'SMOKE','SNACK','SNAKE','SOLAR','SOLVE','SORRY','SOUND','SOUTH','SPACE','SPARE',
  'SPARK','SPEAK','SPEAR','SPELL','SPEND','SPICE','SPINE','SPLIT','SPOKE','SPOON',
  'SPRAY','SQUAD','STACK','STAFF','STAGE','STAIN','STAKE','STALE','STALL','STAMP',
  'STAND','STARK','START','STATE','STAYS','STEAK','STEAL','STEAM','STEEL','STEEP',
  'STEER','STERN','STICK','STIFF','STILL','STING','STOCK','STOLE','STONE','STOOD',
  'STOOL','STORE','STORM','STORY','STOUT','STOVE','STRAP','STRAW','STRIP','STUCK',
  'STUDY','STUFF','STUMP','STUNG','STUNT','STYLE','SUGAR','SUITE','SUNNY','SUPER',
  'SURGE','SWAMP','SWEAR','SWEAT','SWEEP','SWEET','SWEPT','SWIFT','SWING','SWIRL',
  'SWORD','SWORE','SWUNG','TABLE','TASTE','TEACH','TEASE','TEMPO','TENSE','TENTH',
  'THEME','THICK','THIEF','THING','THINK','THIRD','THOSE','THREE','THREW','THROW',
  'THUMB','TIDAL','TIGHT','TIMER','TIRED','TITLE','TODAY','TOKEN','TOTAL','TOUCH',
  'TOUGH','TOWEL','TOWER','TOXIC','TRACE','TRACK','TRADE','TRAIL','TRAIN','TRAIT',
  'TRASH','TREAT','TREND','TRIAL','TRIBE','TRICK','TRIED','TROOP','TROUT','TRUCK',
  'TRULY','TRUMP','TRUNK','TRUST','TRUTH','TULIP','TUMOR','TUNER','TWICE','TWIST',
  'ULTRA','UNCLE','UNDER','UNFIT','UNION','UNITE','UNTIL','UPPER','UPSET','URBAN',
  'USAGE','USHER','USUAL','UTTER','VAGUE','VALID','VALOR','VALUE','VAULT','VERSE',
  'VIDEO','VIGOR','VINYL','VIOLA','VIRAL','VIRUS','VISIT','VITAL','VOCAL','VODKA',
  'VOICE','VOTER','VOUCH','VALVE','WAFER','WAGON','WASTE','WEARY','WEAVE','WEDGE',
  'WEIRD','WHALE','WHEAT','WHEEL','WHERE','WHICH','WHILE','WHINE','WHITE','WHOLE',
  'WHOSE','WIDEN','WIDTH','WITCH','WOMAN','WOMEN','WORRY','WORSE','WORST','WORTH',
  'WOULD','WOUND','WRATH','WRIST','WROTE','YACHT','YIELD','YOUNG',
];

// ─── CONNECTIONS PUZZLES (20 sets) ───
const CONNECTIONS_PUZZLES: ConnectionPuzzle[] = [
  { categories: [
    { name: 'FRUITS', words: ['APPLE','GRAPE','LEMON','MANGO'], color: '#f9df6d' },
    { name: 'PLANETS', words: ['EARTH','MARS','VENUS','PLUTO'], color: '#a0c35a' },
    { name: 'CARD GAMES', words: ['POKER','BRIDGE','HEARTS','SPADES'], color: '#b0c4ef' },
    { name: 'TYPES OF DANCE', words: ['SALSA','WALTZ','TANGO','SWING'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'FISH', words: ['BASS','TROUT','SALMON','TUNA'], color: '#f9df6d' },
    { name: 'TREES', words: ['MAPLE','CEDAR','BIRCH','ASPEN'], color: '#a0c35a' },
    { name: 'METALS', words: ['STEEL','IRON','BRASS','COPPER'], color: '#b0c4ef' },
    { name: 'FABRICS', words: ['SILK','DENIM','LINEN','SATIN'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'COLORS', words: ['CORAL','IVORY','AMBER','TEAL'], color: '#f9df6d' },
    { name: 'GEMS', words: ['RUBY','PEARL','TOPAZ','OPAL'], color: '#a0c35a' },
    { name: 'DANCES', words: ['POLKA','MAMBO','RUMBA','FOXTROT'], color: '#b0c4ef' },
    { name: 'CURRENCIES', words: ['DOLLAR','POUND','FRANC','RUPEE'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'DOGS', words: ['CORGI','BOXER','HUSKY','COLLIE'], color: '#f9df6d' },
    { name: 'CATS', words: ['TABBY','CALICO','PERSIAN','BENGAL'], color: '#a0c35a' },
    { name: 'BIRDS', words: ['ROBIN','FALCON','EAGLE','WREN'], color: '#b0c4ef' },
    { name: 'SNAKES', words: ['COBRA','VIPER','PYTHON','MAMBA'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'PASTA', words: ['PENNE','RIGATONI','FUSILLI','ORZO'], color: '#f9df6d' },
    { name: 'BREAD', words: ['BAGEL','NAAN','PRETZEL','BAGUETTE'], color: '#a0c35a' },
    { name: 'CHEESE', words: ['BRIE','GOUDA','FETA','SWISS'], color: '#b0c4ef' },
    { name: 'SPICES', words: ['CUMIN','THYME','BASIL','SAGE'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'WEATHER', words: ['STORM','SUNNY','FOGGY','SLEET'], color: '#f9df6d' },
    { name: 'EMOTIONS', words: ['HAPPY','ANGRY','PROUD','MOODY'], color: '#a0c35a' },
    { name: 'SIZES', words: ['LARGE','SMALL','GIANT','PETITE'], color: '#b0c4ef' },
    { name: 'SPEEDS', words: ['QUICK','RAPID','SWIFT','BRISK'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'TOOLS', words: ['DRILL','HAMMER','WRENCH','PLIER'], color: '#f9df6d' },
    { name: 'WEAPONS', words: ['SWORD','LANCE','MACE','SPEAR'], color: '#a0c35a' },
    { name: 'INSTRUMENTS', words: ['PIANO','FLUTE','DRUMS','HARP'], color: '#b0c4ef' },
    { name: 'VEHICLES', words: ['TRUCK','SEDAN','COUPE','YACHT'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'BODY PARTS', words: ['ELBOW','ANKLE','WRIST','SPINE'], color: '#f9df6d' },
    { name: 'ROOMS', words: ['ATTIC','LOBBY','FOYER','SUITE'], color: '#a0c35a' },
    { name: 'SPORTS', words: ['RUGBY','POLO','GOLF','TENNIS'], color: '#b0c4ef' },
    { name: 'SUBJECTS', words: ['MATH','LATIN','DRAMA','MUSIC'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'FLOWERS', words: ['DAISY','TULIP','LILAC','LOTUS'], color: '#f9df6d' },
    { name: 'VEGETABLES', words: ['ONION','BEETS','CARROT','LEEK'], color: '#a0c35a' },
    { name: 'HERBS', words: ['MINT','DILL','PARSLEY','CHIVE'], color: '#b0c4ef' },
    { name: 'NUTS', words: ['PECAN','WALNUT','ALMOND','ACORN'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'COUNTRIES', words: ['CHILE','JAPAN','INDIA','EGYPT'], color: '#f9df6d' },
    { name: 'CITIES', words: ['PARIS','TOKYO','MIAMI','ROME'], color: '#a0c35a' },
    { name: 'RIVERS', words: ['NILE','RHINE','THAMES','GANGES'], color: '#b0c4ef' },
    { name: 'MOUNTAINS', words: ['ALPS','ANDES','ROCKY','OZARK'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'MOVIES', words: ['JAWS','ROCKY','ALIEN','GHOST'], color: '#f9df6d' },
    { name: 'TV SHOWS', words: ['LOST','HOUSE','FARGO','MONK'], color: '#a0c35a' },
    { name: 'SONGS', words: ['HELLO','ANGEL','TOXIC','JOLENE'], color: '#b0c4ef' },
    { name: 'BOOKS', words: ['DUNE','HOLES','BELOVED','EMMA'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'COFFEE', words: ['LATTE','MOCHA','DECAF','ESPRESSO'], color: '#f9df6d' },
    { name: 'TEA', words: ['CHAI','MATCHA','OOLONG','EARL'], color: '#a0c35a' },
    { name: 'COCKTAILS', words: ['MOJITO','COSMO','JULEP','TODDY'], color: '#b0c4ef' },
    { name: 'SODAS', words: ['COLA','PEPSI','FANTA','SPRITE'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'GREEK GODS', words: ['ZEUS','HERA','ARES','APOLLO'], color: '#f9df6d' },
    { name: 'NORSE GODS', words: ['ODIN','THOR','LOKI','FREYA'], color: '#a0c35a' },
    { name: 'ROMAN GODS', words: ['MARS','JUNO','DIANA','PLUTO'], color: '#b0c4ef' },
    { name: 'EGYPTIAN GODS', words: ['ISIS','OSIRIS','ANUBIS','SETH'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'HATS', words: ['BERET','FEDORA','TURBAN','BEANIE'], color: '#f9df6d' },
    { name: 'SHOES', words: ['BOOTS','CLOGS','HEELS','SANDAL'], color: '#a0c35a' },
    { name: 'TOPS', words: ['BLOUSE','TUNIC','VEST','POLO'], color: '#b0c4ef' },
    { name: 'BOTTOMS', words: ['JEANS','SKIRT','SHORTS','KHAKI'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'DESSERTS', words: ['FUDGE','TORTE','CREPE','MOUSSE'], color: '#f9df6d' },
    { name: 'BREAKFAST', words: ['TOAST','WAFFLE','BACON','BAGEL'], color: '#a0c35a' },
    { name: 'SOUPS', words: ['GUMBO','BROTH','BISQUE','RAMEN'], color: '#b0c4ef' },
    { name: 'SAUCES', words: ['PESTO','GRAVY','SALSA','AIOLI'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'MATH TERMS', words: ['ANGLE','GRAPH','PRIME','CURVE'], color: '#f9df6d' },
    { name: 'MUSIC TERMS', words: ['TEMPO','CHORD','SCALE','PITCH'], color: '#a0c35a' },
    { name: 'ART TERMS', words: ['BRUSH','SHADE','EASEL','FRAME'], color: '#b0c4ef' },
    { name: 'SCIENCE TERMS', words: ['ORBIT','PRISM','LASER','FORCE'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'WATER BODIES', words: ['CREEK','MARSH','CANAL','FJORD'], color: '#f9df6d' },
    { name: 'LAND FORMS', words: ['CLIFF','RIDGE','DUNE','MESA'], color: '#a0c35a' },
    { name: 'FORESTS', words: ['GROVE','COPSE','THICKET','WOODS'], color: '#b0c4ef' },
    { name: 'URBAN', words: ['ALLEY','PLAZA','BLOCK','TOWER'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'GAMES', words: ['CHESS','DARTS','BINGO','POKER'], color: '#f9df6d' },
    { name: 'TOYS', words: ['BLOCKS','DOLLS','TRAIN','KITES'], color: '#a0c35a' },
    { name: 'CRAFTS', words: ['QUILT','KNITS','BEADS','CLAY'], color: '#b0c4ef' },
    { name: 'HOBBIES', words: ['HIKING','DIVING','BAKING','YOGA'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'BOATS', words: ['KAYAK','CANOE','FERRY','BARGE'], color: '#f9df6d' },
    { name: 'PLANES', words: ['DRONE','GLIDER','BLIMP','JET'], color: '#a0c35a' },
    { name: 'TRAINS', words: ['METRO','TRAM','BULLET','CARGO'], color: '#b0c4ef' },
    { name: 'CARS', words: ['SEDAN','COUPE','TRUCK','LIMO'], color: '#ba81c5' },
  ]},
  { categories: [
    { name: 'EMOTIONS', words: ['BLISS','GRIEF','SHAME','ENVY'], color: '#f9df6d' },
    { name: 'TASTES', words: ['SWEET','SALTY','SOUR','BITTER'], color: '#a0c35a' },
    { name: 'TEXTURES', words: ['ROUGH','SILKY','BUMPY','GRAINY'], color: '#b0c4ef' },
    { name: 'SOUNDS', words: ['CRACK','THUMP','CHIME','GROWL'], color: '#ba81c5' },
  ]},
];

// ─── CROSSWORD PUZZLES (10) ───
const CROSSWORD_PUZZLES: CrosswordPuzzleData[] = [
  {
    grid: [
      ['C','A','N','E','S'],
      ['A','#','O','#','T'],
      ['R','I','S','E','S'],
      ['E','#','E','#','E'],
      ['S','T','E','E','L'],
    ],
    acrossClues: [
      { number: 1, text: 'Walking sticks', row: 0, col: 0, length: 5 },
      { number: 5, text: 'Gets up', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Strong metal', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Attention', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Sound from a crowd', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Guides a vehicle', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['B','R','A','V','E'],
      ['L','#','N','#','A'],
      ['A','R','T','S','Y'],
      ['S','#','S','#','E'],
      ['T','R','E','N','D'],
    ],
    acrossClues: [
      { number: 1, text: 'Courageous', row: 0, col: 0, length: 5 },
      { number: 5, text: 'Creative, informal', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Fashion movement', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Explosion', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Tiny insects', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Visual organ', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['S','T','O','N','E'],
      ['H','#','A','#','V'],
      ['A','L','K','A','I'],
      ['R','#','S','#','L'],
      ['P','A','S','T','E'],
    ],
    acrossClues: [
      { number: 1, text: 'Rock', row: 0, col: 0, length: 5 },
      { number: 5, text: 'Chemical base', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Glue-like substance', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Pointed', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Trees in a group', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Wicked', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['F','L','A','M','E'],
      ['I','#','R','#','N'],
      ['S','T','E','N','D'],
      ['H','#','A','#','S'],
      ['Y','E','L','L','S'],
    ],
    acrossClues: [
      { number: 1, text: 'Fire', row: 0, col: 0, length: 5 },
      { number: 5, text: 'To care for', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Shouts', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Not fancy', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Zone', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Concludes', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['G','R','A','I','N'],
      ['L','#','C','#','O'],
      ['O','R','A','C','K'],
      ['B','#','T','#','S'],
      ['E','D','G','E','S'],
    ],
    acrossClues: [
      { number: 1, text: 'Wheat or rice', row: 0, col: 0, length: 5 },
      { number: 5, text: 'A break or split', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Borders', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Sphere', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Performing', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Not yes', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['P','L','A','N','T'],
      ['A','#','I','#','R'],
      ['S','C','R','U','B'],
      ['T','#','E','#','E'],
      ['A','L','D','E','R'],
    ],
    acrossClues: [
      { number: 1, text: 'Green living thing', row: 0, col: 0, length: 5 },
      { number: 5, text: 'Clean vigorously', row: 2, col: 0, length: 5 },
      { number: 7, text: 'A type of tree', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Noodle dish', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Ventilated', row: 0, col: 2, length: 5 },
      { number: 3, text: 'A large wood', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['W','A','T','E','R'],
      ['I','#','A','#','A'],
      ['D','E','L','T','A'],
      ['T','#','E','#','N'],
      ['H','A','S','T','E'],
    ],
    acrossClues: [
      { number: 1, text: 'H2O', row: 0, col: 0, length: 5 },
      { number: 5, text: 'River mouth area', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Hurry', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Breadth', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Stories', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Raise, as a flag', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['M','O','U','S','E'],
      ['A','#','N','#','L'],
      ['R','A','D','A','R'],
      ['C','#','E','#','E'],
      ['H','E','R','O','S'],
    ],
    acrossClues: [
      { number: 1, text: 'Small rodent', row: 0, col: 0, length: 5 },
      { number: 5, text: 'Detection system', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Brave ones', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Walk in step', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Below', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Senior', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['C','H','A','I','R'],
      ['L','#','G','#','I'],
      ['I','N','G','O','T'],
      ['M','#','E','#','E'],
      ['B','A','S','I','C'],
    ],
    acrossClues: [
      { number: 1, text: 'Seat', row: 0, col: 0, length: 5 },
      { number: 5, text: 'Metal bar', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Fundamental', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Go up', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Periods', row: 0, col: 2, length: 5 },
      { number: 3, text: 'Custom', row: 0, col: 4, length: 5 },
    ],
  },
  {
    grid: [
      ['T','R','A','I','L'],
      ['A','#','W','#','I'],
      ['B','R','A','W','L'],
      ['L','#','R','#','A'],
      ['E','A','D','E','R'],
    ],
    acrossClues: [
      { number: 1, text: 'Path through woods', row: 0, col: 0, length: 5 },
      { number: 5, text: 'A big fight', row: 2, col: 0, length: 5 },
      { number: 7, text: 'Person in charge', row: 4, col: 0, length: 5 },
    ],
    downClues: [
      { number: 1, text: 'Flat surface', row: 0, col: 0, length: 5 },
      { number: 2, text: 'Prize or recognition', row: 0, col: 2, length: 5 },
      { number: 3, text: 'White fabric', row: 0, col: 4, length: 5 },
    ],
  },
];

// ─── SPELLING BEE PUZZLES (10) ───
const SPELLING_BEE_PUZZLES: SpellingBeePuzzle[] = [
  {
    center: 'A',
    outer: ['R','T','N','G','I','L'],
    words: ['ALIGNING','AILING','AIRING','AILING','ALTARING','ANTING','GRAIN','GRAIL','GRANT','GRATING',
            'RAILING','RAINING','RATING','RATION','RANG','RAIL','RAIN','TAIL','TAILING','TARING',
            'TRAIL','TRAILING','TRAIN','TRIAL','NATAL','NASAL','LARIAT','GRATIN','TIARA','ALIGN',
            'AGAIN','ANGLIA','ANTAL','ATRIA'],
    pangrams: ['TRAILING','RAILING'],
    maxScore: 0,
  },
  {
    center: 'E',
    outer: ['S','T','R','P','A','L'],
    words: ['ESTAL','PLASTER','PLASTERS','STAPLE','STAPLER','PETAL','PETALS','RESET','REPAST',
            'LAPSE','ELAPSE','LEAPT','LATER','ALERT','ALTER','LASER','PLEAT','PEARL','STALE',
            'STEAL','LEAST','EASEL','SLATE','PARSE','PESTER','RELAPSE','STEEP','STEEL','STEER',
            'SEPAL','TEASE','LEASE','PLEASE','REPEAL','REPEAT','RELATE','ERATE'],
    pangrams: ['PLASTER','STAPLER','PSALTER'],
    maxScore: 0,
  },
  {
    center: 'O',
    outer: ['C','N','D','L','W','E'],
    words: ['CLONE','CLONED','CLOWN','CLOWNED','CODDLE','CODON','COLED','CONE','CONED','COOL',
            'COOLED','DOWN','DOWEL','DONE','DOLE','DOLCE','ENDOW','LODE','LONE','LOON',
            'LOWED','MELON','NODE','NOODLE','ONCE','OWED','OWNED','OLDEN','OZONE','WOOD',
            'WOODEN','WOOLEN','WORN','WOKEN','WOLD','WONDER','CONDOLE','COLOGNE'],
    pangrams: ['CLOWNED'],
    maxScore: 0,
  },
  {
    center: 'I',
    outer: ['N','G','H','T','S','L'],
    words: ['GLINT','GLINTS','HINT','HINTS','HISS','HITTING','INSIGHT','INSIST','INSTILL','LIGHT',
            'LIGHTING','LIGHTS','LILTING','LISTING','NIGHT','NIGHTS','NIGHTISH','SIGH','SIGHING',
            'SIGHT','SIGHTING','SIGHTS','SILT','SILTING','SING','SINGING','SLING','SLINGING',
            'SLIT','SLITTING','STING','STINGING','TILING','TILLING','TILTING','TINS','THING','THINGS'],
    pangrams: ['LIGHTING','SLIGHTING'],
    maxScore: 0,
  },
  {
    center: 'U',
    outer: ['B','D','G','L','N','E'],
    words: ['BULGE','BULGED','BUNDLE','BUNGLE','BUNGLED','BUDGE','DUNE','DUNG','DUNG','DUEL',
            'DULGE','GLUE','GLUED','GRUEL','GRUNGE','GUIDE','GULDEN','LUNG','LUNGE','LUNGED',
            'NUDE','NUDGE','UNDER','UNDUE','UNDONE','UNGLUE','UNGLUED','UNBEND','BULB','UNBUNDLE'],
    pangrams: ['BUNGLED','UNGLUED'],
    maxScore: 0,
  },
  {
    center: 'R',
    outer: ['A','E','M','P','S','T'],
    words: ['RAMP','RAMPS','REAM','REAMS','REAP','REAPS','REST','REPS','REPAST','ASTER',
            'MASTER','TRAM','TRAMS','TRAP','TRAPS','TRAMP','TRAMPS','PRAM','PRAMS','STREAM',
            'STEAMER','REMASTER','SPARE','SPEAR','STARE','PARSE','PESTER','ARREST','RESTATE',
            'PRIMATE','TRAMPEST','RAREST','RASP','RASTER','SPARSER'],
    pangrams: ['TRAMPLES','REMASTER'],
    maxScore: 0,
  },
  {
    center: 'D',
    outer: ['A','E','I','N','S','W'],
    words: ['DAWNED','DAIS','DINE','DINED','DINES','INSIDE','AIDED','WADED','WANED','WISED',
            'ASIDE','SNIDE','SIDED','WINDED','ADDED','DENIED','DWINED','SANDED','INDEED',
            'SANDWICHED','DESIGNED','WIDENED','DEADENS','DISEASE','DEADEN','SADDENED',
            'WINDSIDE','DANDIES','EDDIES','DAINTIES','DAISED'],
    pangrams: ['SANDWICHED'],
    maxScore: 0,
  },
  {
    center: 'L',
    outer: ['A','C','E','K','N','S'],
    words: ['LACE','LACK','LACES','LACKS','LAKE','LAKES','LANE','LANES','LANCE','LEAN',
            'LEANS','LEAKS','CLEAN','CLEANS','CLANK','CLANKS','ANKLE','ANKLES','SLACKEN',
            'SNACK','SLAKE','SCALE','SCALES','SLACK','LANCE','LANCES','ANKLE','LAKES',
            'NACELLE','LANCE','SCALLOP'],
    pangrams: ['SLACKEN'],
    maxScore: 0,
  },
  {
    center: 'T',
    outer: ['A','E','H','I','N','R'],
    words: ['THAN','THAT','THEIR','THEN','THERE','THIN','THINE','THING','THINK','THIRD',
            'THREE','TREAT','TRAIN','TRAIT','TENTH','TITAN','TAINT','TITHE','TEETH','THREAT',
            'TERRAIN','THEATER','THEATRE','RETAIN','RETINA','ITERATE','ATTIRE','ENTERTAIN',
            'INHERIT','NITRATE','RATTAN','HAIRNET','EARTHEN'],
    pangrams: ['EARTHEN','HAIRNET','INHERIT'],
    maxScore: 0,
  },
  {
    center: 'S',
    outer: ['A','E','G','L','M','T'],
    words: ['SAGE','SALE','SALT','SALTS','SAME','SEAL','SEAM','SEAT','SETS','SLAM',
            'SLAT','SLATE','SMELT','STAGE','STALE','STALL','STEAM','STEAL','STEEL',
            'STEMS','STELAE','SEGMENTAL','MALTASE','STALEST','SMALLEST','GLASSES',
            'ELASTASE','GAMETES','MESSES','STEALS','STAGES','MEATS','MEALS','GAZES'],
    pangrams: ['SEGMENTAL'],
    maxScore: 0,
  },
];

// Compute maxScore for each spelling bee puzzle
SPELLING_BEE_PUZZLES.forEach(p => {
  const uniqueWords = [...new Set(p.words)];
  p.words = uniqueWords;
  p.maxScore = uniqueWords.reduce((sum, w) => {
    if (w.length === 4) return sum + 1;
    const isPangram = p.pangrams.includes(w);
    return sum + w.length + (isPangram ? 7 : 0);
  }, 0);
});

// ─── Shared Styles ───
const S = {
  container: {
    width: '100%',
    height: '100%',
    background: '#c0c0c0',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: 'inherit',
    overflow: 'hidden',
  },
  btn: {
    background: '#c0c0c0',
    border: '2px outset #dfdfdf',
    padding: '4px 12px',
    fontFamily: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
    minHeight: 24,
  },
  btnActive: {
    border: '2px inset #dfdfdf',
  },
  input: {
    border: '2px inset #dfdfdf',
    background: '#fff',
    padding: '2px 4px',
    fontFamily: 'inherit',
    fontSize: 12,
    outline: 'none',
  },
  sunken: {
    border: '2px inset #808080',
    background: '#fff',
  },
  raised: {
    border: '2px outset #dfdfdf',
    background: '#c0c0c0',
  },
  titleBar: {
    background: '#000080',
    color: '#fff',
    fontWeight: 'bold' as const,
    padding: '2px 6px',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
};

// ─── Helper ───
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

// ═══════════════════════════════════════════════
// MAIN MENU
// ═══════════════════════════════════════════════
function GameMenu({ onSelect }: { onSelect: (g: GameScreen) => void }) {
  const tiles: { id: GameScreen; name: string; icon: string }[] = [
    { id: 'wordle', name: 'Wordle', icon: '🟩' },
    { id: 'connections', name: 'Connections', icon: '🔗' },
    { id: 'crossword', name: 'Crossword Mini', icon: '✏️' },
    { id: 'spellingbee', name: 'Spelling Bee', icon: '🐝' },
  ];

  return (
    <div style={{ ...S.container, padding: 12, gap: 8 }}>
      <div style={S.titleBar}>
        <span>NYT Games</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        flex: 1,
        padding: 8,
      }}>
        {tiles.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            style={{
              ...S.raised,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              padding: 12,
            }}
          >
            <span style={{ fontSize: 32 }}>{t.icon}</span>
            <span style={{ fontWeight: 'bold' }}>{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// WORDLE
// ═══════════════════════════════════════════════
function WordleGame({ onBack }: { onBack: () => void }) {
  const [answer, setAnswer] = useState(() => WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)]!);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const getLetterStatus = useCallback((guess: string): LetterStatus[] => {
    const result: LetterStatus[] = Array(5).fill('absent');
    const ansArr = (answer ?? '').split('');
    const used = Array(5).fill(false);

    // First pass: correct positions
    for (let i = 0; i < 5; i++) {
      if (guess[i] === ansArr[i]) {
        result[i] = 'correct';
        used[i] = true;
      }
    }
    // Second pass: present but wrong position
    for (let i = 0; i < 5; i++) {
      if (result[i] === 'correct') continue;
      for (let j = 0; j < 5; j++) {
        if (!used[j] && guess[i] === ansArr[j]) {
          result[i] = 'present';
          used[j] = true;
          break;
        }
      }
    }
    return result;
  }, [answer]);

  const keyboardStatus = useMemo(() => {
    const status: Record<string, LetterStatus> = {};
    guesses.forEach(g => {
      const s = getLetterStatus(g);
      for (let i = 0; i < 5; i++) {
        const letter = g[i]!;
        const cur = status[letter];
        if (s[i] === 'correct') status[letter] = 'correct';
        else if (s[i] === 'present' && cur !== 'correct') status[letter] = 'present';
        else if (!cur) status[letter] = 'absent';
      }
    });
    return status;
  }, [guesses, getLetterStatus]);

  const submitGuess = useCallback(() => {
    if (current.length !== 5 || gameOver) return;
    const upper = current.toUpperCase();
    const newGuesses = [...guesses, upper];
    setGuesses(newGuesses);
    setCurrent('');
    if (upper === answer) {
      setMessage('You won!');
      setGameOver(true);
    } else if (newGuesses.length >= 6) {
      setMessage(`Game over! Word: ${answer}`);
      setGameOver(true);
    }
  }, [current, guesses, answer, gameOver]);

  const handleKey = useCallback((key: string) => {
    if (gameOver) return;
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACK') {
      setCurrent(p => p.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && current.length < 5) {
      setCurrent(p => p + key);
    }
  }, [gameOver, current, submitGuess]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const k = e.key.toUpperCase();
    if (k === 'ENTER') handleKey('ENTER');
    else if (k === 'BACKSPACE') handleKey('BACK');
    else if (/^[A-Z]$/.test(k)) handleKey(k);
  }, [handleKey]);

  const newGame = useCallback(() => {
    setAnswer(WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)]!);
    setGuesses([]);
    setCurrent('');
    setGameOver(false);
    setMessage('');
  }, []);

  const statusColor = (s: LetterStatus) => {
    if (s === 'correct') return '#6aaa64';
    if (s === 'present') return '#c9b458';
    if (s === 'absent') return '#787c7e';
    return '#d3d6da';
  };

  const kbRows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','BACK'],
  ];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ ...S.container, padding: 4, gap: 4, outline: 'none' }}
    >
      <div style={{ ...S.titleBar, gap: 8 }}>
        <button onClick={onBack} style={{ ...S.btn, padding: '1px 6px', fontSize: 11 }}>← Back</button>
        <span style={{ flex: 1, textAlign: 'center' }}>Wordle</span>
        {gameOver && <button onClick={newGame} style={{ ...S.btn, padding: '1px 6px', fontSize: 11 }}>New Game</button>}
      </div>

      {message && (
        <div style={{ textAlign: 'center', padding: 4, fontWeight: 'bold', fontSize: 12 }}>{message}</div>
      )}

      {/* Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'center' }}>
        {Array.from({ length: 6 }).map((_, row) => {
          const guess = guesses[row];
          const isCurrent = row === guesses.length && !gameOver;
          const statuses = guess ? getLetterStatus(guess) : null;
          return (
            <div key={row} style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 5 }).map((_, col) => {
                const letter = guess ? guess[col] : (isCurrent ? (current[col] || '') : '');
                const bg = statuses ? statusColor(statuses[col] ?? 'absent') : '#c0c0c0';
                const textColor = statuses ? '#fff' : '#000';
                return (
                  <div key={col} style={{
                    width: 36, height: 36,
                    border: statuses ? 'none' : '2px inset #808080',
                    background: bg,
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}>
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: 4 }}>
        {kbRows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 2 }}>
            {row.map(key => {
              const ks = keyboardStatus[key];
              const bg = ks ? statusColor(ks) : '#c0c0c0';
              const fg = ks ? '#fff' : '#000';
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  style={{
                    ...S.btn,
                    padding: '4px 6px',
                    fontSize: 10,
                    minWidth: key.length > 1 ? 44 : 24,
                    background: bg,
                    color: fg,
                  }}
                >
                  {key === 'BACK' ? '⌫' : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CONNECTIONS
// ═══════════════════════════════════════════════
function ConnectionsGame({ onBack }: { onBack: () => void }) {
  const [puzzleIndex] = useState(() => Math.floor(Math.random() * CONNECTIONS_PUZZLES.length));
  const puzzle = CONNECTIONS_PUZZLES[puzzleIndex]!;
  const [shuffledWords, setShuffledWords] = useState<string[]>(() =>
    shuffleArray(puzzle.categories.flatMap(c => c.words))
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<ConnectionCategory[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');

  const solvedWords = useMemo(() => new Set(solved.flatMap(c => c.words)), [solved]);

  const toggleWord = useCallback((w: string) => {
    if (gameOver || solvedWords.has(w)) return;
    setSelected(prev =>
      prev.includes(w) ? prev.filter(x => x !== w) : prev.length < 4 ? [...prev, w] : prev
    );
  }, [gameOver, solvedWords]);

  const submit = useCallback(() => {
    if (selected.length !== 4) return;
    const match = puzzle.categories.find(c =>
      !solved.includes(c) && c.words.every(w => selected.includes(w))
    );
    if (match) {
      setSolved(prev => [...prev, match]);
      setSelected([]);
      if (solved.length + 1 === 4) {
        setMessage('You solved it!');
        setGameOver(true);
      }
    } else {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      if (newMistakes >= 4) {
        setMessage('Out of guesses!');
        setGameOver(true);
        setSolved(puzzle.categories);
      }
    }
  }, [selected, puzzle, solved, mistakes]);

  const shuffle = useCallback(() => {
    setShuffledWords(prev => shuffleArray(prev));
  }, []);

  const deselectAll = useCallback(() => setSelected([]), []);

  const newGame = useCallback(() => {
    onBack();
  }, [onBack]);

  return (
    <div style={{ ...S.container, padding: 4, gap: 4 }}>
      <div style={{ ...S.titleBar, gap: 8 }}>
        <button onClick={onBack} style={{ ...S.btn, padding: '1px 6px', fontSize: 11 }}>← Back</button>
        <span style={{ flex: 1, textAlign: 'center' }}>Connections</span>
      </div>

      {message && (
        <div style={{ textAlign: 'center', padding: 4, fontWeight: 'bold', fontSize: 12 }}>{message}</div>
      )}

      <div style={{ padding: '0 8px', fontSize: 11 }}>Mistakes: {'●'.repeat(mistakes)}{'○'.repeat(4 - mistakes)}</div>

      {/* Solved categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 8px' }}>
        {solved.map(cat => (
          <div key={cat.name} style={{
            background: cat.color,
            border: '2px outset #dfdfdf',
            padding: '6px 8px',
            textAlign: 'center',
            fontSize: 11,
          }}>
            <div style={{ fontWeight: 'bold' }}>{cat.name}</div>
            <div>{cat.words.join(', ')}</div>
          </div>
        ))}
      </div>

      {/* Word grid */}
      {!gameOver && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 3,
          padding: '0 8px',
          flex: 1,
          alignContent: 'start',
        }}>
          {shuffledWords.filter(w => !solvedWords.has(w)).map(w => (
            <button
              key={w}
              onClick={() => toggleWord(w)}
              style={{
                ...S.btn,
                fontSize: 10,
                padding: '8px 2px',
                background: selected.includes(w) ? '#5a5a5a' : '#c0c0c0',
                color: selected.includes(w) ? '#fff' : '#000',
                border: selected.includes(w) ? '2px inset #dfdfdf' : '2px outset #dfdfdf',
                wordBreak: 'break-all' as const,
              }}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 4, padding: 8, justifyContent: 'center' }}>
        {!gameOver && (
          <>
            <button onClick={shuffle} style={S.btn}>Shuffle</button>
            <button onClick={deselectAll} style={S.btn}>Deselect All</button>
            <button onClick={submit} style={{ ...S.btn, fontWeight: 'bold' }}>Submit</button>
          </>
        )}
        {gameOver && <button onClick={newGame} style={S.btn}>New Game</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CROSSWORD MINI
// ═══════════════════════════════════════════════
function CrosswordGame({ onBack }: { onBack: () => void }) {
  const [puzzleIndex] = useState(() => Math.floor(Math.random() * CROSSWORD_PUZZLES.length));
  const puzzleData = CROSSWORD_PUZZLES[puzzleIndex]!;

  const buildGrid = useCallback((): CrosswordCell[][] => {
    return puzzleData.grid.map((row, ri) =>
      row.map((ch, ci) => {
        const isBlack = ch === '#';
        // Determine numbering
        let num: number | null = null;
        if (!isBlack) {
          const acrossClue = puzzleData.acrossClues.find(c => c.row === ri && c.col === ci);
          const downClue = puzzleData.downClues.find(c => c.row === ri && c.col === ci);
          if (acrossClue) num = acrossClue.number;
          else if (downClue) num = downClue.number;
        }
        return { letter: ch, isBlack, number: num, userLetter: '' };
      })
    );
  }, [puzzleData]);

  const [grid, setGrid] = useState<CrosswordCell[][]>(buildGrid);
  const [selRow, setSelRow] = useState(0);
  const [selCol, setSelCol] = useState(0);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [timer, setTimer] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!completed) setTimer(t => t + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [completed]);

  const checkCompletion = useCallback((g: CrosswordCell[][]) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (!g[r][c].isBlack && g[r][c].userLetter !== g[r][c].letter) return false;
      }
    }
    return true;
  }, []);

  const handleCellClick = useCallback((r: number, c: number) => {
    if (grid[r][c].isBlack) return;
    if (r === selRow && c === selCol) {
      setDirection(d => d === 'across' ? 'down' : 'across');
    } else {
      setSelRow(r);
      setSelCol(c);
    }
  }, [grid, selRow, selCol]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (completed) return;
    const key = e.key.toUpperCase();
    if (/^[A-Z]$/.test(key)) {
      const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
      newGrid[selRow][selCol].userLetter = key;
      setGrid(newGrid);
      if (checkCompletion(newGrid)) {
        setCompleted(true);
      }
      // Advance cursor
      if (direction === 'across' && selCol < 4) {
        let nc = selCol + 1;
        while (nc < 5 && newGrid[selRow][nc].isBlack) nc++;
        if (nc < 5) setSelCol(nc);
      } else if (direction === 'down' && selRow < 4) {
        let nr = selRow + 1;
        while (nr < 5 && newGrid[nr][selCol].isBlack) nr++;
        if (nr < 5) setSelRow(nr);
      }
    } else if (e.key === 'Backspace') {
      const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
      newGrid[selRow][selCol].userLetter = '';
      setGrid(newGrid);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setDirection(d => d === 'across' ? 'down' : 'across');
    }
  }, [grid, selRow, selCol, direction, completed, checkCompletion]);

  const revealAll = useCallback(() => {
    const newGrid = grid.map(row => row.map(cell => ({
      ...cell,
      userLetter: cell.isBlack ? '' : cell.letter,
    })));
    setGrid(newGrid);
    setCompleted(true);
  }, [grid]);

  const checkGrid = useCallback(() => {
    setShowCheck(true);
    setTimeout(() => setShowCheck(false), 2000);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => { containerRef.current?.focus(); }, []);

  // Determine which cells to highlight
  const highlightCells = useMemo(() => {
    const cells = new Set<string>();
    if (direction === 'across') {
      for (let c = 0; c < 5; c++) {
        if (!grid[selRow][c].isBlack) cells.add(`${selRow}-${c}`);
        else if (c <= selCol) cells.clear();
        else break;
      }
      // Refine: only cells in the same word
      const wordCells = new Set<string>();
      let inWord = false;
      for (let c = 0; c < 5; c++) {
        if (grid[selRow][c].isBlack) {
          if (inWord) break;
          continue;
        }
        if (c <= selCol) { wordCells.clear(); inWord = false; }
        wordCells.add(`${selRow}-${c}`);
        if (c === selCol) inWord = true;
      }
      return inWord ? wordCells : cells;
    } else {
      const wordCells = new Set<string>();
      let inWord = false;
      for (let r = 0; r < 5; r++) {
        if (grid[r][selCol].isBlack) {
          if (inWord) break;
          wordCells.clear();
          continue;
        }
        wordCells.add(`${r}-${selCol}`);
        if (r === selRow) inWord = true;
      }
      return wordCells;
    }
  }, [grid, selRow, selCol, direction]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{ ...S.container, padding: 4, gap: 4, outline: 'none' }}
    >
      <div style={{ ...S.titleBar, gap: 8 }}>
        <button onClick={onBack} style={{ ...S.btn, padding: '1px 6px', fontSize: 11 }}>← Back</button>
        <span style={{ flex: 1, textAlign: 'center' }}>Crossword Mini</span>
        <span style={{ fontSize: 11 }}>{formatTime(timer)}</span>
      </div>

      {completed && <div style={{ textAlign: 'center', padding: 4, fontWeight: 'bold', fontSize: 12 }}>Solved in {formatTime(timer)}!</div>}

      <div style={{ display: 'flex', flex: 1, gap: 8, padding: 4, overflow: 'auto' }}>
        {/* Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {grid.map((row, ri) => (
            <div key={ri} style={{ display: 'flex' }}>
              {row.map((cell, ci) => {
                const isSelected = ri === selRow && ci === selCol;
                const isHighlighted = highlightCells.has(`${ri}-${ci}`);
                const isWrong = showCheck && !cell.isBlack && cell.userLetter && cell.userLetter !== cell.letter;
                return (
                  <div
                    key={ci}
                    onClick={() => handleCellClick(ri, ci)}
                    style={{
                      width: 32, height: 32,
                      background: cell.isBlack ? '#000' : isSelected ? '#a0c0ff' : isHighlighted ? '#d0e0ff' : '#fff',
                      border: '1px solid #808080',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: cell.isBlack ? 'default' : 'pointer',
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: isWrong ? 'red' : '#000',
                    }}
                  >
                    {cell.number && (
                      <span style={{ position: 'absolute', top: 1, left: 2, fontSize: 7, fontWeight: 'normal' }}>
                        {cell.number}
                      </span>
                    )}
                    {!cell.isBlack && cell.userLetter}
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button onClick={checkGrid} style={{ ...S.btn, fontSize: 10 }}>Check</button>
            <button onClick={revealAll} style={{ ...S.btn, fontSize: 10 }}>Reveal</button>
          </div>
        </div>

        {/* Clues */}
        <div style={{ flex: 1, overflow: 'auto', fontSize: 10 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>ACROSS</div>
          {puzzleData.acrossClues.map(c => (
            <div key={`a${c.number}`} style={{ marginBottom: 2 }}>{c.number}. {c.text}</div>
          ))}
          <div style={{ fontWeight: 'bold', marginTop: 8, marginBottom: 4 }}>DOWN</div>
          {puzzleData.downClues.map(c => (
            <div key={`d${c.number}`} style={{ marginBottom: 2 }}>{c.number}. {c.text}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SPELLING BEE
// ═══════════════════════════════════════════════
function SpellingBeeGame({ onBack }: { onBack: () => void }) {
  const [puzzleIndex] = useState(() => Math.floor(Math.random() * SPELLING_BEE_PUZZLES.length));
  const puzzle = SPELLING_BEE_PUZZLES[puzzleIndex]!;
  const [outerLetters, setOuterLetters] = useState<string[]>(() => [...puzzle.outer]);
  const [input, setInput] = useState('');
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allLetters = useMemo(() => new Set([puzzle.center, ...puzzle.outer]), [puzzle]);

  const getRank = useCallback((s: number) => {
    const pct = puzzle.maxScore > 0 ? (s / puzzle.maxScore) * 100 : 0;
    if (pct >= 100) return 'Queen Bee';
    if (pct >= 70) return 'Genius';
    if (pct >= 50) return 'Amazing';
    if (pct >= 40) return 'Great';
    if (pct >= 25) return 'Nice';
    if (pct >= 15) return 'Solid';
    if (pct >= 8) return 'Moving Up';
    if (pct >= 2) return 'Good';
    return 'Beginner';
  }, [puzzle.maxScore]);

  const submit = useCallback(() => {
    const word = input.toUpperCase();
    setInput('');

    if (word.length < 4) { setMessage('Too short!'); return; }
    if (!word.includes(puzzle.center)) { setMessage('Missing center letter!'); return; }
    if (![...word].every(c => allLetters.has(c))) { setMessage('Invalid letter!'); return; }
    if (found.includes(word)) { setMessage('Already found!'); return; }
    if (!puzzle.words.map(w => w.toUpperCase()).includes(word)) { setMessage('Not in word list!'); return; }

    const pts = word.length === 4 ? 1 : word.length + (puzzle.pangrams.map(p => p.toUpperCase()).includes(word) ? 7 : 0);
    setScore(s => s + pts);
    setFound(f => [...f, word]);
    if (puzzle.pangrams.map(p => p.toUpperCase()).includes(word)) {
      setMessage(`Pangram! +${pts}`);
    } else {
      setMessage(`+${pts}`);
    }
  }, [input, puzzle, found, allLetters]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit();
  }, [submit]);

  const shuffleOuter = useCallback(() => {
    setOuterLetters(prev => shuffleArray(prev));
  }, []);

  // Hexagon positions for honeycomb (center + 6 outer)
  const hexPositions = useMemo(() => {
    const cx = 70, cy = 70, r = 32;
    const angles = [270, 330, 30, 90, 150, 210]; // top, then clockwise
    return {
      center: { x: cx, y: cy },
      outer: angles.map(a => ({
        x: cx + r * 1.8 * Math.cos((a * Math.PI) / 180),
        y: cy + r * 1.8 * Math.sin((a * Math.PI) / 180),
      })),
    };
  }, []);

  const HexButton = useCallback(({ letter, x, y, isCenter }: { letter: string; x: number; y: number; isCenter: boolean }) => {
    return (
      <g
        onClick={() => { setInput(p => p + letter); inputRef.current?.focus(); }}
        style={{ cursor: 'pointer' }}
      >
        <polygon
          points={hexPoints(x, y, 24)}
          fill={isCenter ? '#f7da21' : '#e6e6e6'}
          stroke='#808080'
          strokeWidth={2}
        />
        <text x={x} y={y + 5} textAnchor='middle' fontSize={16} fontWeight='bold' fontFamily='inherit' fill='#000'>
          {letter}
        </text>
      </g>
    );
  }, []);

  return (
    <div style={{ ...S.container, padding: 4, gap: 4 }}>
      <div style={{ ...S.titleBar, gap: 8 }}>
        <button onClick={onBack} style={{ ...S.btn, padding: '1px 6px', fontSize: 11 }}>← Back</button>
        <span style={{ flex: 1, textAlign: 'center' }}>Spelling Bee</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flex: 1, padding: 4, overflow: 'hidden' }}>
        {/* Left: Honeycomb + input */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 160 }}>
          <div style={{ fontSize: 11, fontWeight: 'bold' }}>
            {getRank(score)} — {score} pts
          </div>

          {/* Score bar */}
          <div style={{ width: '100%', height: 8, ...S.sunken }}>
            <div style={{
              width: `${Math.min(100, puzzle.maxScore > 0 ? (score / puzzle.maxScore) * 100 : 0)}%`,
              height: '100%',
              background: '#f7da21',
            }} />
          </div>

          {/* Honeycomb */}
          <svg width={140} height={140} viewBox='0 0 140 140'>
            <HexButton letter={puzzle.center} x={hexPositions.center.x} y={hexPositions.center.y} isCenter={true} />
            {outerLetters.map((letter, i) => (
              <HexButton key={i} letter={letter} x={hexPositions.outer[i].x} y={hexPositions.outer[i].y} isCenter={false} />
            ))}
          </svg>

          {message && <div style={{ fontSize: 11, fontWeight: 'bold', color: '#333' }}>{message}</div>}

          {/* Input */}
          <div style={{ display: 'flex', gap: 2, width: '100%' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              style={{ ...S.input, flex: 1, textTransform: 'uppercase' }}
              placeholder='Type a word...'
            />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setInput(p => p.slice(0, -1))} style={{ ...S.btn, fontSize: 10 }}>Delete</button>
            <button onClick={shuffleOuter} style={{ ...S.btn, fontSize: 10 }}>Shuffle</button>
            <button onClick={submit} style={{ ...S.btn, fontSize: 10, fontWeight: 'bold' }}>Enter</button>
          </div>
        </div>

        {/* Right: Found words */}
        <div style={{ flex: 1, ...S.sunken, padding: 4, overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
            Found: {found.length} / {puzzle.words.length}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {found.map(w => (
              <span key={w} style={{
                fontSize: 10,
                background: puzzle.pangrams.map(p => p.toUpperCase()).includes(w) ? '#f7da21' : '#e0e0e0',
                padding: '1px 4px',
                border: '1px solid #999',
              }}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to generate hexagon points
function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }).map((_, i) => {
    const angle = (60 * i - 30) * (Math.PI / 180);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');
}

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export function NYTGames() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [gameKey, setGameKey] = useState(0);

  const goToMenu = useCallback(() => {
    setScreen('menu');
    setGameKey(k => k + 1);
  }, []);

  switch (screen) {
    case 'wordle': return <WordleGame key={gameKey} onBack={goToMenu} />;
    case 'connections': return <ConnectionsGame key={gameKey} onBack={goToMenu} />;
    case 'crossword': return <CrosswordGame key={gameKey} onBack={goToMenu} />;
    case 'spellingbee': return <SpellingBeeGame key={gameKey} onBack={goToMenu} />;
    default: return <GameMenu onSelect={setScreen} />;
  }
}

export default NYTGames;
