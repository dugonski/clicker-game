import { useEffect, useReducer, useRef } from 'react';
import { gameReducer, initialState, sanitizeState, GameState } from '../game/logic';

const SAVE_KEY = 'space-clicker-save';
const TICK_MS = 100;
const SAVE_MS = 5_000;

function loadState(): GameState {
  try {
    const saved = window.localStorage.getItem(SAVE_KEY);
    return saved ? sanitizeState(JSON.parse(saved)) : initialState;
  } catch {
    return initialState;
  }
}

function saveState(state: GameState) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be unavailable (private mode, quota); the game still works without saving.
  }
}

/** Game state with a production tick and automatic saving to localStorage. */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'tick', seconds: (now - last) / 1000 });
      last = now;
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const save = () => saveState(latest.current);
    const timer = window.setInterval(save, SAVE_MS);
    window.addEventListener('beforeunload', save);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('beforeunload', save);
      save();
    };
  }, []);

  return { state, dispatch };
}
