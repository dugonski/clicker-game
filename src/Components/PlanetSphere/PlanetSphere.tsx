import React, { useEffect, useRef } from 'react';
import { PLANET_PIXELS, renderPlanet } from '../../pixel/planetRenderer';
import styles from './PlanetSphere.module.css';

interface Props {
  /** Planet id from the game data, e.g. "earth". */
  planet: string;
  /** Diameter as any CSS length. */
  size?: string;
}

const FRAME_MS = 120;
const SECONDS_PER_TURN = 48;

/** A slowly rotating pixel-art planet, drawn on a tiny canvas and scaled up. */
const PlanetSphere: React.FC<Props> = ({ planet, size = 'var(--planet-size)' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const image = context.createImageData(PLANET_PIXELS, PLANET_PIXELS);
    const draw = (seconds: number) => {
      renderPlanet(planet, (seconds / SECONDS_PER_TURN) * Math.PI * 2, image);
      context.putImageData(image, 0, 0);
    };
    draw(0);

    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (still) return;

    const start = performance.now();
    const timer = window.setInterval(() => draw((performance.now() - start) / 1000), FRAME_MS);
    return () => window.clearInterval(timer);
  }, [planet]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.planet}
      width={PLANET_PIXELS}
      height={PLANET_PIXELS}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
};

export default PlanetSphere;
