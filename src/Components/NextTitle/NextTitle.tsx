import React from 'react';
import { Rank, withArticle } from '../../game/data';
import { formatNumber } from '../../game/format';
import styles from './NextTitle.module.css';

interface Props {
  current: Rank;
  next: Rank | null;
  earned: number;
  progress: number;
  ready: boolean;
  onPlay: () => void;
}

/** Shows how close the player is to the next title and holds the title-match button. */
const NextTitle: React.FC<Props> = ({ current, next, earned, progress, ready, onPlay }) => {
  if (!next || current.promotionGoal === null) {
    return (
      <section className={styles.panel}>
        <h2 className={styles.title}>Undisputed champion</h2>
        <p className={styles.text}>There is no one left to beat. New challengers are on their way.</p>
      </section>
    );
  }

  const percent = Math.floor(progress * 100);

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>Next title: {next.name}</h2>
      <div
        className={styles.bar}
        role="progressbar"
        aria-label={`Progress to ${next.name}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
      </div>
      <p className={styles.text}>
        {formatNumber(Math.min(earned, current.promotionGoal))} / {formatNumber(current.promotionGoal)} moves made as{' '}
        {withArticle(current.name)} ({percent}%)
      </p>
      <button type="button" className={styles.play} disabled={!ready} onClick={onPlay}>
        {ready ? 'Play the title match' : 'Keep practising…'}
      </button>
      <p className={styles.hint}>Each new title doubles all move income.</p>
    </section>
  );
};

export default NextTitle;
