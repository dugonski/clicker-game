export interface Planet {
  id: string;
  name: string;
  /** Short flavour text shown under the planet name. */
  tagline: string;
  /** Stardust that must be collected on this planet before travelling on. Null for the last stop. */
  travelGoal: number | null;
}

export interface Building {
  id: string;
  name: string;
  plural: string;
  icon: string;
  description: string;
  baseCost: number;
  /** Stardust per second produced by a single unit. */
  baseRate: number;
  /** Index of the planet where this building becomes available. */
  unlockPlanet: number;
}

export type UpgradeTarget =
  | { kind: 'building'; buildingId: string; owned: number }
  | { kind: 'click'; clicks: number };

export interface Upgrade {
  id: string;
  name: string;
  icon: string;
  description: string;
  cost: number;
  target: UpgradeTarget;
}

export const PLANETS: Planet[] = [
  { id: 'earth', name: 'Earth', tagline: 'Home. Where every journey begins.', travelGoal: 3_000 },
  { id: 'moon', name: 'Moon', tagline: 'One small step from home.', travelGoal: 150_000 },
  { id: 'mars', name: 'Mars', tagline: 'The red frontier.', travelGoal: 15_000_000 },
  { id: 'jupiter', name: 'Jupiter', tagline: 'King of the gas giants.', travelGoal: 600_000_000 },
  { id: 'saturn', name: 'Saturn', tagline: 'Lord of the rings.', travelGoal: 20_000_000_000 },
  { id: 'uranus', name: 'Uranus', tagline: 'The tilted ice giant.', travelGoal: 600_000_000_000 },
  { id: 'neptune', name: 'Neptune', tagline: 'Windswept and deep blue.', travelGoal: 15_000_000_000_000 },
  { id: 'pluto', name: 'Pluto', tagline: 'The edge of the Solar System.', travelGoal: null },
];

export const BUILDINGS: Building[] = [
  {
    id: 'astronaut',
    name: 'Astronaut',
    plural: 'Astronauts',
    icon: '🧑‍🚀',
    description: 'Collects stardust by hand.',
    baseCost: 15,
    baseRate: 0.1,
    unlockPlanet: 0,
  },
  {
    id: 'engineer',
    name: 'Engineer',
    plural: 'Engineers',
    icon: '🧑‍🔧',
    description: 'Keeps the machines running.',
    baseCost: 100,
    baseRate: 1,
    unlockPlanet: 0,
  },
  {
    id: 'launchpad',
    name: 'Launch Pad',
    plural: 'Launch Pads',
    icon: '🏗️',
    description: 'Ground support for every mission.',
    baseCost: 1_100,
    baseRate: 8,
    unlockPlanet: 0,
  },
  {
    id: 'rocket',
    name: 'Rocket',
    plural: 'Rockets',
    icon: '🚀',
    description: 'Hauls stardust back from orbit.',
    baseCost: 12_000,
    baseRate: 47,
    unlockPlanet: 1,
  },
  {
    id: 'satellite',
    name: 'Satellite',
    plural: 'Satellites',
    icon: '🛰️',
    description: 'Scans the void for rich deposits.',
    baseCost: 130_000,
    baseRate: 260,
    unlockPlanet: 1,
  },
  {
    id: 'rover',
    name: 'Rover',
    plural: 'Rovers',
    icon: '🤖',
    description: 'Tireless surface explorer.',
    baseCost: 1_400_000,
    baseRate: 1_400,
    unlockPlanet: 2,
  },
  {
    id: 'colony',
    name: 'Space Colony',
    plural: 'Space Colonies',
    icon: '🏙️',
    description: 'A permanent home among the stars.',
    baseCost: 20_000_000,
    baseRate: 7_800,
    unlockPlanet: 2,
  },
  {
    id: 'station',
    name: 'Space Station',
    plural: 'Space Stations',
    icon: '🛸',
    description: 'An orbital refinery and research hub.',
    baseCost: 330_000_000,
    baseRate: 44_000,
    unlockPlanet: 3,
  },
  {
    id: 'miner',
    name: 'Ring Miner',
    plural: 'Ring Miners',
    icon: '⛏️',
    description: 'Harvests ice and rock from planetary rings.',
    baseCost: 5_100_000_000,
    baseRate: 260_000,
    unlockPlanet: 4,
  },
  {
    id: 'telescope',
    name: 'Deep Space Telescope',
    plural: 'Deep Space Telescopes',
    icon: '🔭',
    description: 'Finds stardust light-years away.',
    baseCost: 75_000_000_000,
    baseRate: 1_600_000,
    unlockPlanet: 5,
  },
  {
    id: 'starship',
    name: 'Starship',
    plural: 'Starships',
    icon: '🌠',
    description: 'A fleet-class interplanetary vessel.',
    baseCost: 1_000_000_000_000,
    baseRate: 10_000_000,
    unlockPlanet: 6,
  },
  {
    id: 'warpgate',
    name: 'Warp Gate',
    plural: 'Warp Gates',
    icon: '🌀',
    description: 'Bends space to bring the stars closer.',
    baseCost: 14_000_000_000_000,
    baseRate: 65_000_000,
    unlockPlanet: 7,
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
  name: `Mission Control ${ROMAN[i]}`,
  icon: '👆',
  description: 'Clicks are twice as powerful and gain +2% of your stardust per second.',
  cost: tier.cost,
  target: { kind: 'click' as const, clicks: tier.clicks },
}));

export const UPGRADES: Upgrade[] = [...clickUpgrades, ...buildingUpgrades];

/** Planet name as used mid-sentence: "the Moon", "Mars". */
export const planetLabel = (planet: Planet) => (planet.id === 'moon' ? 'the Moon' : planet.name);

/** Each building costs 15% more than the previous one of its kind. */
export const COST_GROWTH = 1.15;
/** Every planet reached doubles all stardust income. */
export const PLANET_BONUS = 2;
