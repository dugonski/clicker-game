import React, { useEffect, useMemo, useRef } from 'react';
import { Planet, planetLabel } from '../../game/data';
import PlanetSphere from '../PlanetSphere/PlanetSphere';
import styles from './TravelAnimation.module.css';

export const TRAVEL_DURATION_MS = 5_000;

interface Props {
  from: Planet;
  to: Planet;
  onArrive: () => void;
}

const STAR_COUNT = 70;

/** Full-screen cutscene: the rocket leaves one planet and arrives at the next. */
const TravelAnimation: React.FC<Props> = ({ from, to, onArrive }) => {
  const arrive = useRef(onArrive);
  arrive.current = onArrive;

  useEffect(() => {
    const timer = window.setTimeout(() => arrive.current(), TRAVEL_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        delay: `${-Math.random() * 1.2}s`,
        duration: `${0.5 + Math.random() * 0.9}s`,
        width: `${30 + Math.random() * 90}px`,
      })),
    []
  );

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.stars} aria-hidden="true">
        {stars.map((s) => (
          <span
            key={s.id}
            className={styles.star}
            style={{ top: s.top, width: s.width, animationDelay: s.delay, animationDuration: s.duration }}
          />
        ))}
      </div>

      <div className={styles.from}>
        <PlanetSphere planet={from.id} size="min(16rem, 50vw)" />
      </div>
      <div className={styles.to}>
        <PlanetSphere planet={to.id} size="min(16rem, 50vw)" />
      </div>

      <div className={styles.rocket} aria-hidden="true">
        <span className={styles.flame} />
        <span className={styles.ship}>🚀</span>
      </div>

      <p className={styles.caption}>
        <span className={styles.leaving}>Leaving {planetLabel(from)}…</span>
        <span className={styles.arriving}>Welcome to {planetLabel(to)}!</span>
      </p>
    </div>
  );
};

export default TravelAnimation;
