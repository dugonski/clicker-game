import { BUILDINGS, COST_GROWTH, RANKS, RANK_BONUS, UPGRADES, Building, Upgrade } from './data';

export interface GameState {
  moves: number;
  totalEarned: number;
  /** Moves earned since the current title was won. */
  rankEarned: number;
  rankIndex: number;
  clicks: number;
  buildings: Record<string, number>;
  upgrades: string[];
}

export type GameAction =
  | { type: 'click' }
  | { type: 'tick'; seconds: number }
  | { type: 'buyBuilding'; id: string }
  | { type: 'buyUpgrade'; id: string }
  | { type: 'promote' }
  | { type: 'reset' };

export const initialState: GameState = {
  moves: 0,
  totalEarned: 0,
  rankEarned: 0,
  rankIndex: 0,
  clicks: 0,
  buildings: {},
  upgrades: [],
};

const findBuilding = (id: string) => BUILDINGS.find((b) => b.id === id);
const findUpgrade = (id: string) => UPGRADES.find((u) => u.id === id);

export const owned = (state: GameState, buildingId: string) => state.buildings[buildingId] ?? 0;

export const rankMultiplier = (state: GameState) => Math.pow(RANK_BONUS, state.rankIndex);

export const buildingCost = (state: GameState, building: Building) =>
  Math.ceil(building.baseCost * Math.pow(COST_GROWTH, owned(state, building.id)));

const purchasedUpgrades = (state: GameState) =>
  state.upgrades.map(findUpgrade).filter((u): u is Upgrade => u !== undefined);

/** Moves per second produced by a single unit of this building, all bonuses included. */
export const buildingRate = (state: GameState, building: Building) => {
  const tiers = purchasedUpgrades(state).filter(
    (u) => u.target.kind === 'building' && u.target.buildingId === building.id
  ).length;
  return building.baseRate * Math.pow(2, tiers) * rankMultiplier(state);
};

export const movesPerSecond = (state: GameState) =>
  BUILDINGS.reduce((sum, b) => sum + owned(state, b.id) * buildingRate(state, b), 0);

export const movesPerClick = (state: GameState) => {
  const tiers = purchasedUpgrades(state).filter((u) => u.target.kind === 'click').length;
  return Math.pow(2, tiers) * rankMultiplier(state) + movesPerSecond(state) * 0.02 * tiers;
};

export const isBuildingUnlocked = (state: GameState, building: Building) =>
  building.unlockRank <= state.rankIndex;

const isUpgradeUnlocked = (state: GameState, upgrade: Upgrade) =>
  upgrade.target.kind === 'click'
    ? state.clicks >= upgrade.target.clicks
    : owned(state, upgrade.target.buildingId) >= upgrade.target.owned;

/** Upgrades the player has unlocked but not bought yet, cheapest first. */
export const availableUpgrades = (state: GameState) =>
  UPGRADES.filter((u) => !state.upgrades.includes(u.id) && isUpgradeUnlocked(state, u)).sort(
    (a, b) => a.cost - b.cost
  );

export const nextRank = (state: GameState) => RANKS[state.rankIndex + 1] ?? null;

/** Progress towards the next title match, from 0 to 1. */
export const promotionProgress = (state: GameState) => {
  const goal = RANKS[state.rankIndex].promotionGoal;
  return goal === null ? 0 : Math.min(1, state.rankEarned / goal);
};

export const canPromote = (state: GameState) => nextRank(state) !== null && promotionProgress(state) >= 1;

const earn = (state: GameState, amount: number): GameState => ({
  ...state,
  moves: state.moves + amount,
  totalEarned: state.totalEarned + amount,
  rankEarned: state.rankEarned + amount,
});

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'click':
      return { ...earn(state, movesPerClick(state)), clicks: state.clicks + 1 };

    case 'tick':
      return action.seconds > 0 ? earn(state, movesPerSecond(state) * action.seconds) : state;

    case 'buyBuilding': {
      const building = findBuilding(action.id);
      if (!building || !isBuildingUnlocked(state, building)) return state;
      const cost = buildingCost(state, building);
      if (state.moves < cost) return state;
      return {
        ...state,
        moves: state.moves - cost,
        buildings: { ...state.buildings, [building.id]: owned(state, building.id) + 1 },
      };
    }

    case 'buyUpgrade': {
      const upgrade = findUpgrade(action.id);
      if (!upgrade || state.upgrades.includes(upgrade.id)) return state;
      if (!isUpgradeUnlocked(state, upgrade) || state.moves < upgrade.cost) return state;
      return {
        ...state,
        moves: state.moves - upgrade.cost,
        upgrades: [...state.upgrades, upgrade.id],
      };
    }

    case 'promote':
      if (!canPromote(state)) return state;
      return { ...state, rankIndex: state.rankIndex + 1, rankEarned: 0 };

    case 'reset':
      return initialState;

    default:
      return state;
  }
}

const finiteOr = (value: unknown, fallback: number) =>
  typeof value === 'number' && isFinite(value) && value >= 0 ? value : fallback;

/** Turns whatever was found in storage into a valid game state. */
export function sanitizeState(raw: unknown): GameState {
  if (typeof raw !== 'object' || raw === null) return initialState;
  const data = raw as Record<string, unknown>;

  const buildings: Record<string, number> = {};
  const rawBuildings = (typeof data.buildings === 'object' && data.buildings !== null
    ? data.buildings
    : {}) as Record<string, unknown>;
  BUILDINGS.forEach((b) => {
    const count = Math.floor(finiteOr(rawBuildings[b.id], 0));
    if (count > 0) buildings[b.id] = count;
  });

  const rawUpgrades: unknown[] = Array.isArray(data.upgrades) ? data.upgrades : [];
  const upgrades = UPGRADES.map((u) => u.id).filter((id) => rawUpgrades.includes(id));

  return {
    moves: finiteOr(data.moves, 0),
    totalEarned: finiteOr(data.totalEarned, 0),
    rankEarned: finiteOr(data.rankEarned, 0),
    rankIndex: Math.min(RANKS.length - 1, Math.floor(finiteOr(data.rankIndex, 0))),
    clicks: Math.floor(finiteOr(data.clicks, 0)),
    buildings,
    upgrades,
  };
}
