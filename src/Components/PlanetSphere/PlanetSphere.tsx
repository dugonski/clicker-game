import React from 'react';
import styles from './PlanetSphere.module.css';

interface Props {
  /** Planet id from the game data, e.g. "earth". */
  planet: string;
  /** Diameter as any CSS length. */
  size?: string;
}

/** A planet drawn purely with CSS gradients. */
const PlanetSphere: React.FC<Props> = ({ planet, size = '14rem' }) => (
  <span
    className={`${styles.wrap} ${styles[planet] ?? ''}`}
    style={{ '--size': size } as React.CSSProperties}
    aria-hidden="true"
  >
    {planet === 'saturn' && <span className={`${styles.ring} ${styles.ringBack}`} />}
    <span className={styles.sphere} />
    {planet === 'saturn' && <span className={`${styles.ring} ${styles.ringFront}`} />}
  </span>
);

export default PlanetSphere;
