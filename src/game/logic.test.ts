import { PLANETS, UPGRADES } from './data';
import { formatNumber } from './format';
import {
  GameState,
  availableUpgrades,
  canTravel,
  gameReducer,
  initialState,
  sanitizeState,
  stardustPerClick,
  stardustPerSecond,
} from './logic';

const withState = (patch: Partial<GameState>): GameState => ({ ...initialState, ...patch });

test('clicking earns one stardust at the start', () => {
  const state = gameReducer(initialState, { type: 'click' });
  expect(state.stardust).toBe(1);
  expect(state.clicks).toBe(1);
});

test('buildings cost more each time and produce over time', () => {
  let state = withState({ stardust: 100 });
  state = gameReducer(state, { type: 'buyBuilding', id: 'astronaut' });
  expect(state.stardust).toBe(85);
  state = gameReducer(state, { type: 'buyBuilding', id: 'astronaut' });
  expect(state.stardust).toBe(85 - 18);
  expect(stardustPerSecond(state)).toBeCloseTo(0.2);

  const later = gameReducer(state, { type: 'tick', seconds: 10 });
  expect(later.stardust).toBeCloseTo(state.stardust + 2);
});

test('cannot buy what is unaffordable or not unlocked yet', () => {
  expect(gameReducer(initialState, { type: 'buyBuilding', id: 'astronaut' })).toBe(initialState);
  const rich = withState({ stardust: 1e9 });
  expect(gameReducer(rich, { type: 'buyBuilding', id: 'rocket' })).toBe(rich);
});

test('building upgrades unlock by amount owned and double production', () => {
  const state = withState({ stardust: 1_000, buildings: { astronaut: 10 } });
  expect(availableUpgrades(state).map((u) => u.name)).toEqual(['Astronauts II']);

  const upgraded = gameReducer(state, { type: 'buyUpgrade', id: 'astronaut-2' });
  expect(upgraded.stardust).toBe(850);
  expect(stardustPerSecond(upgraded)).toBeCloseTo(2);
  expect(availableUpgrades(upgraded)).toEqual([]);
  expect(gameReducer(upgraded, { type: 'buyUpgrade', id: 'astronaut-2' })).toBe(upgraded);
});

test('click upgrades unlock by number of clicks', () => {
  const state = withState({ stardust: 100, clicks: 50 });
  const upgraded = gameReducer(state, { type: 'buyUpgrade', id: 'click-2' });
  expect(stardustPerClick(upgraded)).toBe(2);
});

test('travelling needs the planet goal and doubles income', () => {
  const goal = PLANETS[0].travelGoal as number;
  const notReady = withState({ planetEarned: goal - 1, buildings: { engineer: 1 } });
  expect(canTravel(notReady)).toBe(false);
  expect(gameReducer(notReady, { type: 'travel' })).toBe(notReady);

  const ready = { ...notReady, planetEarned: goal, stardust: 42 };
  const moon = gameReducer(ready, { type: 'travel' });
  expect(moon.planetIndex).toBe(1);
  expect(moon.planetEarned).toBe(0);
  expect(moon.stardust).toBe(42);
  expect(stardustPerSecond(moon)).toBe(2);
  expect(stardustPerClick(moon)).toBe(2);
});

test('there is nowhere to travel from the last planet', () => {
  const state = withState({ planetIndex: PLANETS.length - 1, planetEarned: 1e30 });
  expect(canTravel(state)).toBe(false);
});

test('sanitizeState repairs broken saves', () => {
  expect(sanitizeState(null)).toEqual(initialState);
  const repaired = sanitizeState({
    stardust: 'lots',
    planetIndex: 99,
    buildings: { astronaut: 3.7, unknown: 5, engineer: -2 },
    upgrades: ['astronaut-2', 'nope'],
  });
  expect(repaired.stardust).toBe(0);
  expect(repaired.planetIndex).toBe(PLANETS.length - 1);
  expect(repaired.buildings).toEqual({ astronaut: 3 });
  expect(repaired.upgrades).toEqual(['astronaut-2']);
});

test('upgrade ids are unique', () => {
  const ids = UPGRADES.map((u) => u.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('formatNumber', () => {
  expect(formatNumber(0)).toBe('0');
  expect(formatNumber(0.1)).toBe('0.1');
  expect(formatNumber(15)).toBe('15');
  expect(formatNumber(999.9)).toBe('999');
  expect(formatNumber(1_234)).toBe('1.23K');
  expect(formatNumber(3_000_000)).toBe('3.00M');
});
