import React from 'react';
import { PALETTE, SPRITES, SpriteName } from '../../pixel/sprites';

interface Props {
  name: SpriteName;
  /** Rendered width and height in CSS pixels. Use a multiple of the sprite size to keep pixels square. */
  size?: number;
  className?: string;
}

/** Renders a pixel-art sprite as crisp SVG rectangles. */
const PixelSprite: React.FC<Props> = ({ name, size = 48, className }) => {
  const rows = SPRITES[name];
  const rects: React.ReactNode[] = [];

  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const char = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === char) end++;
      if (char !== '.') {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={PALETTE[char]} />);
      }
      x = end;
    }
  });

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {rects}
    </svg>
  );
};

export default PixelSprite;
