import { SPRITES, PALETTE, SPRITE_PIXELS } from '../pixel/sprites';
import { BUILDINGS, RANKS, UPGRADES, withArticle } from './data';
import { formatNumber } from './format';
import {
  GameState,
  availableUpgrades,
  canPromote,
  gameReducer,
  initialState,
  sanitizeState,
  movesPerClick,
  movesPerSecond,
} from './logic';

const withState = (patch: Partial<GameState>): GameState => ({ ...initialState, ...patch });

test('clicking makes one move at the start', () => {
  const state = gameReducer(initialState, { type: 'click' });
  expect(state.moves).toBe(1);
  expect(state.clicks).toBe(1);
});

test('buildings cost more each time and produce over time', () => {
  let state = withState({ moves: 100 });
  state = gameReducer(state, { type: 'buyBuilding', id: 'pawn' });
  expect(state.moves).toBe(85);
  state = gameReducer(state, { type: 'buyBuilding', id: 'pawn' });
  expect(state.moves).toBe(85 - 18);
  expect(movesPerSecond(state)).toBeCloseTo(0.2);

  const later = gameReducer(state, { type: 'tick', seconds: 10 });
  expect(later.moves).toBeCloseTo(state.moves + 2);
});

test('cannot buy what is unaffordable or not unlocked yet', () => {
  expect(gameReducer(initialState, { type: 'buyBuilding', id: 'pawn' })).toBe(initialState);
  const rich = withState({ moves: 1e9 });
  expect(gameReducer(rich, { type: 'buyBuilding', id: 'rook' })).toBe(rich);
});

test('building upgrades unlock by amount owned and double production', () => {
  const state = withState({ moves: 1_000, buildings: { pawn: 10 } });
  expect(availableUpgrades(state).map((u) => u.name)).toEqual(['Pawns II']);

  const upgraded = gameReducer(state, { type: 'buyUpgrade', id: 'pawn-2' });
  expect(upgraded.moves).toBe(850);
  expect(movesPerSecond(upgraded)).toBeCloseTo(2);
  expect(availableUpgrades(upgraded)).toEqual([]);
  expect(gameReducer(upgraded, { type: 'buyUpgrade', id: 'pawn-2' })).toBe(upgraded);
});

test('click upgrades unlock by number of clicks', () => {
  const state = withState({ moves: 100, clicks: 50 });
  const upgraded = gameReducer(state, { type: 'buyUpgrade', id: 'click-2' });
  expect(movesPerClick(upgraded)).toBe(2);
});

test('a title match needs the goal and doubles income', () => {
  const goal = RANKS[0].promotionGoal as number;
  const notReady = withState({ rankEarned: goal - 1, buildings: { knight: 1 } });
  expect(canPromote(notReady)).toBe(false);
  expect(gameReducer(notReady, { type: 'promote' })).toBe(notReady);

  const ready = { ...notReady, rankEarned: goal, moves: 42 };
  const club = gameReducer(ready, { type: 'promote' });
  expect(club.rankIndex).toBe(1);
  expect(club.rankEarned).toBe(0);
  expect(club.moves).toBe(42);
  expect(movesPerSecond(club)).toBe(2);
  expect(movesPerClick(club)).toBe(2);
});

test('there is no title after World Champion', () => {
  const state = withState({ rankIndex: RANKS.length - 1, rankEarned: 1e30 });
  expect(canPromote(state)).toBe(false);
});

test('sanitizeState repairs broken saves', () => {
  expect(sanitizeState(null)).toEqual(initialState);
  const repaired = sanitizeState({
    moves: 'lots',
    rankIndex: 99,
    buildings: { pawn: 3.7, unknown: 5, knight: -2 },
    upgrades: ['pawn-2', 'nope'],
  });
  expect(repaired.moves).toBe(0);
  expect(repaired.rankIndex).toBe(RANKS.length - 1);
  expect(repaired.buildings).toEqual({ pawn: 3 });
  expect(repaired.upgrades).toEqual(['pawn-2']);
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

test('sprites are square and only use palette colours', () => {
  Object.values(SPRITES).forEach((rows) => {
    expect(rows).toHaveLength(SPRITE_PIXELS);
    rows.forEach((row) => {
      expect(row).toHaveLength(SPRITE_PIXELS);
      row.split('').forEach((char) => expect(char === '.' || char in PALETTE).toBe(true));
    });
  });
});

test('every building icon and rank piece is drawable', () => {
  BUILDINGS.forEach((b) => expect(typeof b.icon).toBe('string'));
  expect(RANKS.map((r) => r.piece)).toEqual(['pawn', 'knight', 'bishop', 'rook', 'queen', 'king', 'king', 'king']);
});

test('withArticle', () => {
  expect(withArticle('Beginner')).toBe('a Beginner');
  expect(withArticle('International Master')).toBe('an International Master');
  expect(withArticle('FIDE Master')).toBe('a FIDE Master');
});
