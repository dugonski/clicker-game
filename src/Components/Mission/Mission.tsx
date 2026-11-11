import React from 'react';
import { Planet, planetLabel } from '../../game/data';
import { formatNumber } from '../../game/format';
import styles from './Mission.module.css';

interface Props {
  current: Planet;
  next: Planet | null;
  collected: number;
  progress: number;
  ready: boolean;
  onLaunch: () => void;
}

/** Shows how close the player is to the next planet and holds the launch button. */
const Mission: React.FC<Props> = ({ current, next, collected, progress, ready, onLaunch }) => {
  if (!next || current.travelGoal === null) {
    return (
      <section className={styles.mission}>
        <h2 className={styles.title}>Mission complete</h2>
        <p className={styles.text}>
          You reached the edge of the Solar System. New destinations are still being charted.
        </p>
      </section>
    );
  }

  const percent = Math.floor(progress * 100);

  return (
    <section className={styles.mission}>
      <h2 className={styles.title}>Next destination: {planetLabel(next)}</h2>
      <div
        className={styles.bar}
        role="progressbar"
        aria-label={`Progress to ${planetLabel(next)}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </div>
      <p className={styles.text}>
        {formatNumber(Math.min(collected, current.travelGoal))} / {formatNumber(current.travelGoal)} stardust
        collected on {planetLabel(current)} ({percent}%)
      </p>
      <button type="button" className={styles.launch} disabled={!ready} onClick={onLaunch}>
        🚀 {ready ? `Launch to ${planetLabel(next)}` : 'Preparing launch…'}
      </button>
      <p className={styles.hint}>Arriving at a new planet doubles all stardust income.</p>
    </section>
  );
};

export default Mission;
