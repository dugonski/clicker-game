import React, { useEffect, useRef } from 'react';
import { Finish, ModelName } from '../../pixel/models';
import { renderModel } from '../../pixel/modelRenderer';

interface Props {
  model: ModelName;
  finish?: Finish;
  /** Resolution of the pixel art. */
  pixels: number;
  /** Display size, as any CSS length. */
  size: string;
  /** Seconds per full turn; 0 keeps the model still. */
  turnSeconds?: number;
  /** Starting rotation, in radians. */
  angle?: number;
  className?: string;
}

/** Frames per second of the rotation; low on purpose, like hand-drawn sprite animation. */
const FPS = 12;

/** A 3D model drawn as pixel art on a tiny canvas, scaled up without smoothing. */
const ModelView: React.FC<Props> = ({ model, finish = 'ivory', pixels, size, turnSeconds = 0, angle = 0, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    const draw = (seconds: number) => {
      const spin = turnSeconds ? (seconds / turnSeconds) * Math.PI * 2 : 0;
      const image = renderModel(model, { pixels, finish, angle: angle + spin });
      if (image) context.putImageData(new ImageData(image.data, image.width, image.height), 0, 0);
    };
    draw(0);

    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!turnSeconds || still) return;
    const start = performance.now();
    const timer = window.setInterval(() => draw((performance.now() - start) / 1000), 1000 / FPS);
    return () => window.clearInterval(timer);
  }, [model, finish, pixels, turnSeconds, angle]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={pixels}
      height={pixels}
      style={{ width: size, height: size, imageRendering: 'pixelated', display: 'block' }}
      aria-hidden="true"
    />
  );
};

export default ModelView;
