/**
 * Draws planets as low-resolution pixel art. Every pixel is projected onto a sphere,
 * coloured by a small procedural texture and shaded with a 4-step dithered ramp,
 * so the planet can really rotate while still looking hand-pixelled.
 */

/** Width and height of the planet image, in art pixels. */
export const PLANET_PIXELS = 64;

type RGB = [number, number, number];
type Ramp = RGB[];
type Vec = [number, number, number];

const hex = (value: string): RGB => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];

const SHADOW: RGB = [18, 16, 48];
const SHADE_STEPS = [0.3, 0.58, 0.82, 1];

/** Four shades of a colour, from night side to full sunlight. */
const ramp = (value: string): Ramp => {
  const base = hex(value);
  return SHADE_STEPS.map((k) => base.map((c, i) => Math.round(c * k + SHADOW[i] * (1 - k) * 0.6)) as RGB);
};

const hash = (x: number, y: number, z: number) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const noise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const w = smooth(z - zi);
  const corner = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(corner(0, 0, 0), corner(1, 0, 0), u), lerp(corner(0, 1, 0), corner(1, 1, 0), u), v),
    lerp(lerp(corner(0, 0, 1), corner(1, 0, 1), u), lerp(corner(0, 1, 1), corner(1, 1, 1), u), v),
    w
  );
};

/** Layered noise in the 0..1 range. */
const fbm = (p: Vec, scale: number, seed = 0) => {
  let total = 0;
  let amplitude = 0.5;
  let frequency = scale;
  for (let i = 0; i < 4; i++) {
    total += amplitude * noise(p[0] * frequency + seed, p[1] * frequency + seed, p[2] * frequency + seed);
    amplitude *= 0.5;
    frequency *= 2;
  }
  return total / 0.9375;
};

const rotateY = (p: Vec, angle: number): Vec => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};

const bands = (colors: string[]) => colors.map(ramp);

const R = {
  ocean: ramp('#1e6fd9'),
  deepOcean: ramp('#1552b0'),
  land: ramp('#4fb04a'),
  forest: ramp('#2f8a44'),
  sand: ramp('#d9c27a'),
  ice: ramp('#f2f6ff'),
  cloud: ramp('#ffffff'),
  moon: ramp('#c3c7d1'),
  moonDark: ramp('#9498a6'),
  moonCrater: ramp('#7c8090'),
  moonRim: ramp('#e2e5ec'),
  mars: ramp('#cf5a34'),
  marsDark: ramp('#9c3b24'),
  marsLight: ramp('#e88a4f'),
  redSpot: ramp('#c9503a'),
  neptuneSpot: ramp('#dbe6ff'),
  pluto: ramp('#b89c84'),
  plutoHeart: ramp('#f3e6d3'),
  plutoDark: ramp('#84654f'),
  ringLight: ramp('#e6cf9a')[3],
  ringDark: ramp('#b89a62')[3],
};

const JUPITER = bands(['#a57b56', '#ecd8b6', '#bd8a5c', '#f2e3c8', '#c99c6e', '#eedab8', '#aa764e', '#e4caa4', '#9c7450']);
const SATURN = bands(['#c9a868', '#ecd9a6', '#d4b678', '#f1e2b8', '#cfae6e', '#e8d39c', '#bf9d5e']);
const URANUS = bands(['#8fdcdc', '#a9e8e8', '#9fe3e3', '#b7eeee', '#93dede']);
const NEPTUNE = bands(['#2947b8', '#3a66e6', '#2f55d4', '#4474f0', '#2f55d4', '#2947b8']);

const bandAt = (set: Ramp[], p: Vec, wobble: number) => {
  const v = (p[1] + 1) / 2 + (noise(p[0] * 3, p[1] * 3, p[2] * 3) - 0.5) * wobble;
  return set[Math.max(0, Math.min(set.length - 1, Math.floor(v * set.length)))];
};

const MOON_CRATERS: Array<[Vec, number]> = [
  [[0.62, -0.35, 0.7], 0.035],
  [[-0.5, 0.3, 0.81], 0.05],
  [[0.1, 0.75, 0.65], 0.025],
  [[-0.8, -0.5, -0.33], 0.04],
  [[0.3, 0.2, -0.93], 0.06],
  [[-0.2, -0.7, -0.68], 0.03],
  [[0.9, 0.3, -0.31], 0.03],
  [[-0.95, 0.1, 0.3], 0.02],
  [[0.45, -0.8, -0.4], 0.02],
];

/** Picks the colour ramp for a point on the unit sphere. `turn` is the planet's rotation in radians. */
function surface(planet: string, view: Vec, turn: number): Ramp {
  const p = rotateY(view, turn);
  const lat = Math.abs(p[1]);

  switch (planet) {
    case 'earth': {
      if (fbm(rotateY(view, turn * 1.6), 2.4, 40) > 0.68) return R.cloud;
      if (lat > 0.86 + (noise(p[0] * 4, p[1] * 4, p[2] * 4) - 0.5) * 0.12) return R.ice;
      const height = fbm(p, 1.7, 7);
      if (height < 0.47) return R.deepOcean;
      if (height < 0.53) return R.ocean;
      if (lat < 0.35 && fbm(p, 2.5, 90) > 0.6) return R.sand;
      return height > 0.62 ? R.forest : R.land;
    }
    case 'moon': {
      for (let i = 0; i < MOON_CRATERS.length; i++) {
        const [c, size] = MOON_CRATERS[i];
        const distance = 1 - (p[0] * c[0] + p[1] * c[1] + p[2] * c[2]);
        if (distance < size * 0.6) return R.moonCrater;
        if (distance < size) return R.moonRim;
      }
      return fbm(p, 1.5, 3) > 0.56 ? R.moonDark : R.moon;
    }
    case 'mars': {
      if (lat > 0.9) return R.ice;
      const n = fbm(p, 1.8, 21);
      if (n > 0.6) return R.marsDark;
      return n < 0.4 ? R.marsLight : R.mars;
    }
    case 'jupiter': {
      const longitude = Math.atan2(p[0], p[2]);
      if (Math.pow(longitude / 0.5, 2) + Math.pow((p[1] - 0.3) / 0.13, 2) < 1) return R.redSpot;
      return bandAt(JUPITER, p, 0.07);
    }
    case 'saturn':
      return bandAt(SATURN, p, 0.03);
    case 'uranus':
      return bandAt(URANUS, p, 0.04);
    case 'neptune': {
      if (lat < 0.45 && fbm([p[0], p[1] * 5, p[2]], 2, 12) > 0.68) return R.neptuneSpot;
      return bandAt(NEPTUNE, p, 0.06);
    }
    case 'pluto': {
      if (p[1] > -0.25 && fbm(p, 1.2, 55) > 0.6) return R.plutoHeart;
      return fbm(p, 2.2, 5) > 0.6 ? R.plutoDark : R.pluto;
    }
    default:
      return R.moon;
  }
}

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const LIGHT: Vec = [-0.58, -0.58, 0.57];
const RING_TILT = (-18 * Math.PI) / 180;

/** Renders one frame of a planet into `image` (a PLANET_PIXELS-square RGBA buffer). */
export function renderPlanet(planet: string, turn: number, image: { data: Uint8ClampedArray }) {
  const size = PLANET_PIXELS;
  const half = size / 2;
  const hasRings = planet === 'saturn';
  const radius = hasRings ? half * 0.56 : half;
  const data = image.data;
  const tiltCos = Math.cos(RING_TILT);
  const tiltSin = Math.sin(RING_TILT);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const offset = (py * size + px) * 4;
      const cx = px + 0.5 - half;
      const cy = py + 0.5 - half;
      let color: RGB | null = null;

      const x = cx / radius;
      const y = cy / radius;
      const d2 = x * x + y * y;
      if (d2 <= 1) {
        const normal: Vec = [x, y, Math.sqrt(1 - d2)];
        const shades = surface(planet, normal, turn);
        const light = Math.max(0, normal[0] * LIGHT[0] + normal[1] * LIGHT[1] + normal[2] * LIGHT[2]);
        const dither = (BAYER[py & 3][px & 3] / 16 - 0.5) * 0.22;
        const step = Math.floor((light * 1.15 + dither) * shades.length);
        color = shades[Math.max(0, Math.min(shades.length - 1, step))];
      }

      if (hasRings) {
        const u = (cx * tiltCos + cy * tiltSin) / half;
        const v = (-cx * tiltSin + cy * tiltCos) / half;
        const rho = Math.sqrt(u * u + Math.pow(v / 0.26, 2));
        const inRing = rho > 0.66 && rho < 1 && !(rho > 0.84 && rho < 0.875);
        // The near half of the ring (below the centre) passes in front of the planet.
        if (inRing && (v > 0 || color === null)) color = rho > 0.84 ? R.ringDark : R.ringLight;
      }

      if (color) {
        data[offset] = color[0];
        data[offset + 1] = color[1];
        data[offset + 2] = color[2];
        data[offset + 3] = 255;
      } else {
        data[offset + 3] = 0;
      }
    }
  }
}
