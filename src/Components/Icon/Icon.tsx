import React from 'react';
import { isModelName } from '../../pixel/models';
import { modelImageUrl } from '../../pixel/modelRenderer';
import { SpriteName } from '../../pixel/sprites';
import { IconName } from '../../game/data';
import PixelSprite from '../PixelSprite/PixelSprite';

interface Props {
  name: IconName;
  /** Display size in CSS pixels. */
  size?: number;
  className?: string;
}

/** Resolution of model icons; shown at 2× in the shop. */
const ICON_PIXELS = 32;
/** Three-quarter view, so pieces like the knight show their shape. */
const ICON_ANGLE = 0.5;

/** A shop icon: a 3D model rendered as pixel art, or a flat sprite for interface glyphs. */
const Icon: React.FC<Props> = ({ name, size = 64, className }) => {
  if (!isModelName(name)) return <PixelSprite name={name as SpriteName} size={size} className={className} />;

  const url = modelImageUrl(name, { pixels: ICON_PIXELS, angle: ICON_ANGLE, fit: 'tight' });
  const style: React.CSSProperties = { width: size, height: size, imageRendering: 'pixelated', display: 'block' };
  return url ? (
    <img src={url} alt="" className={className} style={style} />
  ) : (
    <span className={className} style={style} aria-hidden="true" />
  );
};

export default Icon;
