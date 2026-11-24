import React, { useState } from 'react';
import { RANKS } from './game/data';
import { formatNumber } from './game/format';
import {
  canPromote,
  movesPerClick,
  movesPerSecond,
  nextRank,
  promotionProgress,
  rankMultiplier,
} from './game/logic';
import { useGame } from './hooks/useGame';
import NextTitle from './Components/NextTitle/NextTitle';
import PieceClicker from './Components/PieceClicker/PieceClicker';
import PixelSprite from './Components/PixelSprite/PixelSprite';
import PromotionAnimation from './Components/PromotionAnimation/PromotionAnimation';
import Shop from './Components/Shop/Shop';
import styles from './App.module.css';

export default function App() {
  const { state, dispatch } = useGame();
  const [playing, setPlaying] = useState(false);

  const rank = RANKS[state.rankIndex];
  const next = nextRank(state);
  const perClick = movesPerClick(state);

  const handleMatchOver = () => {
    dispatch({ type: 'promote' });
    setPlaying(false);
  };

  const handleReset = () => {
    if (window.confirm('Start over as a Beginner? All progress will be lost.')) {
      dispatch({ type: 'reset' });
    }
  };

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Chess Clicker</h1>
          <p className={styles.location}>
            <strong>{rank.name}</strong> · {rank.tagline}
          </p>
        </header>

        <div className={styles.stats}>
          <p className={styles.moves}>
            <PixelSprite name="move" size={48} />
            <span aria-label="Moves">{formatNumber(state.moves)}</span>
          </p>
          <p className={styles.rates}>
            {formatNumber(movesPerSecond(state))} moves per second · {formatNumber(perClick)} per click
            {state.rankIndex > 0 && ` · ×${rankMultiplier(state)} title bonus`}
          </p>
        </div>

        <PieceClicker rank={rank} perClick={perClick} onClick={() => dispatch({ type: 'click' })} />

        <NextTitle
          current={rank}
          next={next}
          earned={state.rankEarned}
          progress={promotionProgress(state)}
          ready={canPromote(state) && !playing}
          onPlay={() => setPlaying(true)}
        />

        <button type="button" className={styles.reset} onClick={handleReset}>
          Reset progress
        </button>
      </main>

      <div className={styles.sidebar}>
        <Shop
          state={state}
          onBuyBuilding={(id) => dispatch({ type: 'buyBuilding', id })}
          onBuyUpgrade={(id) => dispatch({ type: 'buyUpgrade', id })}
        />
      </div>

      {playing && next && <PromotionAnimation from={rank} to={next} onDone={handleMatchOver} />}
    </div>
  );
}
