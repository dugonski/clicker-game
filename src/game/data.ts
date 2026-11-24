import { Finish, ModelName, PieceType } from '../pixel/models';
import { SpriteName } from '../pixel/sprites';

/** A 3D model (pieces, buildings) or a flat interface sprite. */
export type IconName = ModelName | SpriteName;

export interface Rank {
  id: string;
  name: string;
  /** Short flavour text shown under the title. */
  tagline: string;
  /** The piece you click while holding this title. */
  piece: PieceType;
  finish: Finish;
  /** Moves that must be earned with this title before the next title match. Null for the last title. */
  promotionGoal: number | null;
}

export interface Building {
  id: string;
  name: string;
  plural: string;
  icon: IconName;
  description: string;
  baseCost: number;
  /** Moves per second produced by a single unit. */
  baseRate: number;
  /** Index of the rank where this building becomes available. */
  unlockRank: number;
}

export type UpgradeTarget =
  | { kind: 'building'; buildingId: string; owned: number }
  | { kind: 'click'; clicks: number };

export interface Upgrade {
  id: string;
  name: string;
  icon: IconName;
  description: string;
  cost: number;
  target: UpgradeTarget;
}

export const RANKS: Rank[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    tagline: 'Everyone starts by learning how the pieces move.',
    piece: 'pawn',
    finish: 'ivory',
    promotionGoal: 3_000,
  },
  {
    id: 'club',
    name: 'Club Player',
    tagline: 'Tuesday nights at the local chess club.',
    piece: 'knight',
    finish: 'ivory',
    promotionGoal: 150_000,
  },
  {
    id: 'cm',
    name: 'Candidate Master',
    tagline: 'Your first official title.',
    piece: 'bishop',
    finish: 'ivory',
    promotionGoal: 15_000_000,
  },
  {
    id: 'fm',
    name: 'FIDE Master',
    tagline: 'Recognised by the world chess federation.',
    piece: 'rook',
    finish: 'ivory',
    promotionGoal: 600_000_000,
  },
  {
    id: 'im',
    name: 'International Master',
    tagline: 'Three norms and a lot of coffee.',
    piece: 'queen',
    finish: 'ivory',
    promotionGoal: 20_000_000_000,
  },
  {
    id: 'gm',
    name: 'Grandmaster',
    tagline: 'The highest title in chess.',
    piece: 'king',
    finish: 'ivory',
    promotionGoal: 600_000_000_000,
  },
  {
    id: 'super-gm',
    name: 'Super Grandmaster',
    tagline: 'Rated above 2700. A golden reputation.',
    piece: 'king',
    finish: 'gold',
    promotionGoal: 15_000_000_000_000,
  },
  {
    id: 'champion',
    name: 'World Champion',
    tagline: 'The best player in the world.',
    piece: 'king',
    finish: 'crystal',
    promotionGoal: null,
  },
];

export const BUILDINGS: Building[] = [
  {
    id: 'pawn',
    name: 'Pawn',
    plural: 'Pawns',
    icon: 'pawn',
    description: 'Pushes forward, one square at a time.',
    baseCost: 15,
    baseRate: 0.1,
    unlockRank: 0,
  },
  {
    id: 'knight',
    name: 'Knight',
    plural: 'Knights',
    icon: 'knight',
    description: 'Jumps over problems in an L-shape.',
    baseCost: 100,
    baseRate: 1,
    unlockRank: 0,
  },
  {
    id: 'bishop',
    name: 'Bishop',
    plural: 'Bishops',
    icon: 'bishop',
    description: 'Slices across the board on the diagonals.',
    baseCost: 1_100,
    baseRate: 8,
    unlockRank: 0,
  },
  {
    id: 'rook',
    name: 'Rook',
    plural: 'Rooks',
    icon: 'rook',
    description: 'Controls whole files and ranks.',
    baseCost: 12_000,
    baseRate: 47,
    unlockRank: 1,
  },
  {
    id: 'queen',
    name: 'Queen',
    plural: 'Queens',
    icon: 'queen',
    description: 'The most powerful piece on the board.',
    baseCost: 130_000,
    baseRate: 260,
    unlockRank: 1,
  },
  {
    id: 'king',
    name: 'King',
    plural: 'Kings',
    icon: 'king',
    description: 'Slow, but worth the whole game.',
    baseCost: 1_400_000,
    baseRate: 1_400,
    unlockRank: 2,
  },
  {
    id: 'clock',
    name: 'Chess Clock',
    plural: 'Chess Clocks',
    icon: 'clock',
    description: 'Every second counts.',
    baseCost: 20_000_000,
    baseRate: 7_800,
    unlockRank: 2,
  },
  {
    id: 'board',
    name: 'Chessboard',
    plural: 'Chessboards',
    icon: 'board',
    description: 'More boards, more games.',
    baseCost: 330_000_000,
    baseRate: 44_000,
    unlockRank: 3,
  },
  {
    id: 'book',
    name: 'Opening Book',
    plural: 'Opening Books',
    icon: 'book',
    description: 'Centuries of theory at your fingertips.',
    baseCost: 5_100_000_000,
    baseRate: 260_000,
    unlockRank: 4,
  },
  {
    id: 'club',
    name: 'Chess Club',
    plural: 'Chess Clubs',
    icon: 'club',
    description: 'A room full of players, all moving for you.',
    baseCost: 75_000_000_000,
    baseRate: 1_600_000,
    unlockRank: 5,
  },
  {
    id: 'engine',
    name: 'Chess Engine',
    plural: 'Chess Engines',
    icon: 'engine',
    description: 'Calculates millions of moves per second.',
    baseCost: 1_000_000_000_000,
    baseRate: 10_000_000,
    unlockRank: 6,
  },
  {
    id: 'tournament',
    name: 'Tournament',
    plural: 'Tournaments',
    icon: 'trophy',
    description: 'Where legends are made.',
    baseCost: 14_000_000_000_000,
    baseRate: 65_000_000,
    unlockRank: 7,
  },
];

const ROMAN = ['II', 'III', 'IV', 'V'];
const BUILDING_TIERS = [
  { owned: 10, costFactor: 10 },
  { owned: 25, costFactor: 50 },
  { owned: 50, costFactor: 500 },
  { owned: 100, costFactor: 50_000 },
];
const CLICK_TIERS = [
  { clicks: 50, cost: 100 },
  { clicks: 250, cost: 2_500 },
  { clicks: 1_000, cost: 100_000 },
  { clicks: 5_000, cost: 10_000_000 },
];

const buildingUpgrades: Upgrade[] = BUILDINGS.flatMap((building) =>
  BUILDING_TIERS.map((tier, i) => ({
    id: `${building.id}-${i + 2}`,
    name: `${building.plural} ${ROMAN[i]}`,
    icon: building.icon,
    description: `${building.plural} are twice as efficient.`,
    cost: building.baseCost * tier.costFactor,
    target: { kind: 'building' as const, buildingId: building.id, owned: tier.owned },
  }))
);

const clickUpgrades: Upgrade[] = CLICK_TIERS.map((tier, i) => ({
  id: `click-${i + 2}`,
  name: `Tactics Training ${ROMAN[i]}`,
  icon: 'click',
  description: 'Clicks are twice as powerful and gain +2% of your moves per second.',
  cost: tier.cost,
  target: { kind: 'click' as const, clicks: tier.clicks },
}));

export const UPGRADES: Upgrade[] = [...clickUpgrades, ...buildingUpgrades];

/** Each building costs 15% more than the previous one of its kind. */
export const COST_GROWTH = 1.15;
/** Every title earned doubles all move income. */
export const RANK_BONUS = 2;

/** "a Beginner", "an International Master" */
export const withArticle = (name: string) => `${/^[AEIOU]/i.test(name) ? 'an' : 'a'} ${name}`;
