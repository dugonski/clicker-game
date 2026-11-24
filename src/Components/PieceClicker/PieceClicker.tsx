import React, { useRef, useState } from 'react';
import { Rank } from '../../game/data';
import { formatNumber } from '../../game/format';
import ModelView from '../ModelView/ModelView';
import styles from './PieceClicker.module.css';

interface Props {
  rank: Rank;
  perClick: number;
  onClick: () => void;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
}

/** The big spinning piece in the middle of the screen: click it to make moves. */
const PieceClicker: React.FC<Props> = ({ rank, perClick, onClick }) => {
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
        aria-label={`Click the ${rank.piece} to make moves`}
      >
        <ModelView
          model={rank.piece}
          finish={rank.finish}
          pixels={64}
          size="var(--piece-size)"
          turnSeconds={10}
        />
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

export default PieceClicker;
