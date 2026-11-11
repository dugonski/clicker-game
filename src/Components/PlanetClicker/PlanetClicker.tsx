import React, { useRef, useState } from 'react';
import { Planet } from '../../game/data';
import { formatNumber } from '../../game/format';
import PlanetSphere from '../PlanetSphere/PlanetSphere';
import styles from './PlanetClicker.module.css';

interface Props {
  planet: Planet;
  perClick: number;
  onClick: () => void;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
}

/** The big planet in the middle of the screen: click it to collect stardust. */
const PlanetClicker: React.FC<Props> = ({ planet, perClick, onClick }) => {
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const nextId = useRef(0);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick();
    const rect = event.currentTarget.getBoundingClientRect();
    // Keyboard activation has no pointer position, so fall back to the centre.
    const fromKeyboard = event.detail === 0;
    const floater: Floater = {
      id: nextId.current++,
      x: fromKeyboard ? rect.width / 2 : event.clientX - rect.left,
      y: fromKeyboard ? rect.height / 2 : event.clientY - rect.top,
      text: `+${formatNumber(perClick)}`,
    };
    setFloaters((current) => [...current.slice(-14), floater]);
  };

  const removeFloater = (id: number) => setFloaters((current) => current.filter((f) => f.id !== id));

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        aria-label={`Click ${planet.name} to collect stardust`}
      >
        <PlanetSphere planet={planet.id} />
        {floaters.map((f) => (
          <span
            key={f.id}
            className={styles.floater}
            style={{ left: f.x, top: f.y }}
            onAnimationEnd={() => removeFloater(f.id)}
          >
            {f.text}
          </span>
        ))}
      </button>
    </div>
  );
};

export default PlanetClicker;
