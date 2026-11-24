import React, { useEffect, useRef } from 'react';
import { RANKS, Rank, withArticle } from '../../game/data';
import ModelView from '../ModelView/ModelView';
import styles from './PromotionAnimation.module.css';

/** Must match --duration in PromotionAnimation.module.css. */
export const PROMOTION_DURATION_MS = 6_000;

interface Props {
  from: Rank;
  to: Rank;
  onDone: () => void;
}

const SQUARES = Array.from({ length: 64 }, (_, i) => (Math.floor(i / 8) + i) % 2 === 1);

/**
 * The title match: your piece marches up the board, checkmates the black king,
 * and turns into the piece of your new title.
 */
const PromotionAnimation: React.FC<Props> = ({ from, to, onDone }) => {
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const timer = window.setTimeout(() => done.current(), PROMOTION_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.stage}>
        <div className={styles.board} aria-hidden="true">
          {SQUARES.map((dark, i) => (
            <span key={i} className={dark ? styles.dark : styles.light} />
          ))}
          <div className={`${styles.piece} ${styles.enemy}`}>
            <ModelView model="king" finish="ebony" pixels={32} size="100%" angle={0.6} />
          </div>
          <div className={`${styles.piece} ${styles.hero}`}>
            <ModelView model={from.piece} finish={from.finish} pixels={32} size="100%" angle={-0.4} />
          </div>
        </div>
        <div className={styles.flash} aria-hidden="true" />
        <div className={styles.reward} aria-hidden="true">
          <ModelView model={to.piece} finish={to.finish} pixels={64} size="min(50vw, 256px)" turnSeconds={4} />
        </div>
      </div>

      <p className={styles.caption}>
        <span className={styles.playing}>Title match…</span>
        <span className={styles.mate}>Checkmate!</span>
        <span className={styles.promoted}>
          You are now {to === RANKS[RANKS.length - 1] ? `the ${to.name}` : withArticle(to.name)}!
        </span>
      </p>
    </div>
  );
};

export default PromotionAnimation;
