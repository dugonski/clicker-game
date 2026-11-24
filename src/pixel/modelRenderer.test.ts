import { pixelate } from './modelRenderer';
import { PIECES, getModel, isModelName, RAMPS, resolveRamp } from './models';

const ramp: [number, number, number][] = [
  [10, 0, 0],
  [20, 0, 0],
  [30, 0, 0],
  [40, 0, 0],
  [50, 0, 0],
];

/** Builds a raw WebGL buffer (bottom row first) from rows written top row first. */
function raw(rows: string[], light = 255) {
  const size = rows.length;
  const buffer = new Uint8Array(size * size * 4);
  rows.forEach((row, y) =>
    row.split('').forEach((char, x) => {
      if (char === '.') return;
      const i = ((size - 1 - y) * size + x) * 4;
      buffer[i] = light;
      buffer[i + 1] = 8; // part 0
      buffer[i + 2] = char === 'n' ? 10 : 200; // "n" is nearer to the camera
      buffer[i + 3] = 255;
    })
  );
  return buffer;
}

const pixel = (image: { data: Uint8ClampedArray; width: number }, x: number, y: number) =>
  Array.from(image.data.slice((y * image.width + x) * 4, (y * image.width + x) * 4 + 4));

test('pixelate paints the model, outlines its silhouette and leaves the rest empty', () => {
  const image = pixelate(raw(['.....', '.....', '..#..', '.....', '.....']), 5, [ramp], null);
  expect(pixel(image, 2, 2)).toEqual([50, 0, 0, 255]);
  expect(pixel(image, 2, 1)).toEqual([0x12, 0x0c, 0x0a, 255]);
  expect(pixel(image, 1, 2)).toEqual([0x12, 0x0c, 0x0a, 255]);
  expect(pixel(image, 0, 0)[3]).toBe(0);
});

test('pixelate draws a dark line where a nearer surface overlaps a farther one', () => {
  const image = pixelate(raw(['.....', '.##n.', '.....', '.....', '.....']), 5, [ramp], null);
  expect(pixel(image, 2, 1)).toEqual([10, 0, 0, 255]);
  expect(pixel(image, 1, 1)).toEqual([50, 0, 0, 255]);
});

test('pixelate uses darker shades for less light', () => {
  const image = pixelate(raw(['...', '.#.', '...'], 40), 3, [ramp], null);
  expect(pixel(image, 1, 1)[0]).toBeLessThanOrEqual(20);
});

test('every model builds, and every part has a colour ramp for every finish', () => {
  PIECES.forEach((piece) => expect(isModelName(piece)).toBe(true));
  (['pawn', 'knight', 'bishop', 'rook', 'queen', 'king', 'clock', 'board', 'book', 'club', 'engine', 'trophy'] as const).forEach(
    (name) => {
      const model = getModel(name);
      expect(model.group.children.length).toBeGreaterThan(0);
      expect(model.ramps.length).toBeLessThanOrEqual(16);
      (['ivory', 'ebony', 'gold', 'crystal'] as const).forEach((finish) =>
        model.ramps.forEach((r) => expect(RAMPS[resolveRamp(r, finish)]).toHaveLength(5))
      );
    }
  );
});
