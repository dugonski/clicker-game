/**
 * Renders the 3D models as pixel art.
 *
 * 1. three.js draws the model into a tiny render target (e.g. 64×64). Instead of colours, the
 *    shader writes the light intensity (red), the part index (green) and the depth (blue).
 * 2. `pixelate` turns that buffer into the final image: each part is painted from its colour
 *    ramp with ordered dithering, depth jumps become dark inner lines, the silhouette gets a
 *    one-pixel outline and a dithered shadow is drawn under the model.
 *
 * The result is scaled up with `image-rendering: pixelated`, so the pieces are real 3D
 * objects that look hand-pixelled.
 */
import * as THREE from 'three';
import { Finish, FixedRamp, Model, ModelName, RAMPS, getModel, resolveRamp } from './models';

export interface PixelImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface RenderOptions {
  /** Width and height of the image, in art pixels. */
  pixels: number;
  finish?: Finish;
  /** Rotation around the vertical axis, in radians. */
  angle?: number;
  /**
   * "turn" (default) leaves room for the model to spin without ever leaving the frame.
   * "tight" fits the model as seen at this angle, for still images such as icons.
   */
  fit?: 'turn' | 'tight';
}

type RGB = [number, number, number];

const hex = (value: string): RGB => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];

const OUTLINE: RGB = hex('#120c0a');
const SHADOW: [number, number, number, number] = [0, 0, 0, 90];
const LIGHT = new THREE.Vector3(-0.55, 0.65, 0.55).normalize();
const MAX_PARTS = 16;
const NEAR = 0.1;
const FAR = 20;
/** Depth difference (in world units) between neighbouring pixels that draws an inner line. */
const EDGE_DEPTH = 0.22;

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export interface Shadow {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/**
 * Turns the raw render (read straight from WebGL, so bottom row first) into pixel art.
 * `ramps[i]` is the colour ramp of part i.
 */
export function pixelate(raw: Uint8Array, size: number, ramps: RGB[][], shadow: Shadow | null): PixelImage {
  const data = new Uint8ClampedArray(size * size * 4);
  const at = (x: number, y: number) => ((size - 1 - y) * size + x) * 4;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < size && y < size && raw[at(x, y) + 3] > 0;
  const edgeDepth = (EDGE_DEPTH / (FAR - NEAR)) * 255;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const o = (y * size + x) * 4;
      let color: RGB | null = null;

      if (inside(x, y)) {
        const i = at(x, y);
        const part = Math.min(ramps.length - 1, Math.floor((raw[i + 1] / 256) * MAX_PARTS));
        const ramp = ramps[part];
        const depth = raw[i + 2];
        const nearerNeighbour = [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ].some(([dx, dy]) => inside(x + dx, y + dy) && raw[at(x + dx, y + dy) + 2] < depth - edgeDepth);

        if (nearerNeighbour) {
          color = ramp[0];
        } else {
          const dither = (BAYER[y & 3][x & 3] / 16 - 0.5) * 0.1;
          const light = raw[i] / 255 + dither;
          color = ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor(light * ramp.length)))];
        }
      } else if (inside(x + 1, y) || inside(x - 1, y) || inside(x, y + 1) || inside(x, y - 1)) {
        color = OUTLINE;
      }

      if (color) {
        data[o] = color[0];
        data[o + 1] = color[1];
        data[o + 2] = color[2];
        data[o + 3] = 255;
      } else if (shadow) {
        const dx = (x + 0.5 - shadow.cx) / shadow.rx;
        const dy = (y + 0.5 - shadow.cy) / shadow.ry;
        if (dx * dx + dy * dy <= 1) data.set(SHADOW, o);
      }
    }
  }

  return { width: size, height: size, data };
}

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uPart;
  uniform vec3 uLight;
  varying vec3 vNormal;
  void main() {
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    float light = 0.2 + 0.8 * max(dot(n, uLight), 0.0);
    gl_FragColor = vec4(light, (uPart + 0.5) / ${MAX_PARTS.toFixed(1)}, gl_FragCoord.z, 1.0);
  }
`;

interface Framing {
  /** Size of the square view, in world units. */
  view: number;
  /** World point the camera looks at. */
  target: THREE.Vector3;
  /** Distance from the axis to the furthest vertex, used for the shadow. */
  radius: number;
  minY: number;
}

interface Stage {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  materials: THREE.ShaderMaterial[];
  targets: Map<number, THREE.WebGLRenderTarget>;
  framing: Map<string, Framing>;
  prepared: Set<ModelName>;
}

let stage: Stage | null | undefined;

function getStage(): Stage | null {
  if (stage !== undefined) return stage;
  try {
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setClearColor(0x000000, 0);
    const materials = Array.from(
      { length: MAX_PARTS },
      (_, part) =>
        new THREE.ShaderMaterial({
          vertexShader: VERTEX_SHADER,
          fragmentShader: FRAGMENT_SHADER,
          uniforms: { uPart: { value: part }, uLight: { value: LIGHT } },
          side: THREE.DoubleSide,
        })
    );
    stage = {
      renderer,
      scene: new THREE.Scene(),
      camera: new THREE.OrthographicCamera(-1, 1, 1, -1, NEAR, FAR),
      materials,
      targets: new Map(),
      framing: new Map(),
      prepared: new Set(),
    };
  } catch {
    // No WebGL (old browser, tests): models are simply not drawn.
    stage = null;
  }
  return stage;
}

/**
 * Fits the camera to the model. With `angle` null the model fills the image at any rotation;
 * otherwise it is fitted tightly as seen at that angle.
 */
function frame(model: Model, angle: number | null): Framing {
  const el = (model.elevation * Math.PI) / 180;
  const cos = Math.cos(el);
  const sin = Math.sin(el);
  let radius = 0;
  let minY = Infinity;
  let maxY = -Infinity;
  // Screen-space bounds: x to the right, v upwards.
  let left = Infinity;
  let right = -Infinity;
  let bottom = Infinity;
  let top = -Infinity;
  const point = new THREE.Vector3();

  model.group.rotation.set(0, angle ?? 0, 0);
  model.group.updateMatrixWorld(true);
  model.group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const positions = mesh.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
      radius = Math.max(radius, Math.hypot(point.x, point.z));
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
      const v = point.y * cos - point.z * sin;
      left = Math.min(left, point.x);
      right = Math.max(right, point.x);
      bottom = Math.min(bottom, v);
      top = Math.max(top, v);
    }
  });

  if (angle === null) {
    // Leave room for every rotation: a cylinder of the model's widest radius.
    left = -radius;
    right = radius;
    top = maxY * cos + radius * sin;
    bottom = minY * cos - radius * sin;
  }
  const view = Math.max(right - left, top - bottom) * (angle === null ? 1.1 : 1.06);
  const target = new THREE.Vector3((left + right) / 2, (top + bottom) / 2 / cos, 0);
  return { view, radius, minY, target };
}

const rampCache = new Map<string, RGB[]>();
const toRGB = (ramp: FixedRamp) => {
  let rgb = rampCache.get(ramp);
  if (!rgb) {
    rgb = RAMPS[ramp].map(hex);
    rampCache.set(ramp, rgb);
  }
  return rgb;
};

/** Draws a model as pixel art, or returns null when WebGL is not available. */
export function renderModel(
  name: ModelName,
  { pixels, finish = 'ivory', angle = 0, fit = 'turn' }: RenderOptions
): PixelImage | null {
  const s = getStage();
  if (!s) return null;

  const model = getModel(name);
  if (!s.prepared.has(name)) {
    model.group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) mesh.material = s.materials[mesh.userData.part];
    });
    s.prepared.add(name);
  }
  const frameKey = fit === 'tight' ? `${name}@${angle}` : name;
  let framing = s.framing.get(frameKey);
  if (!framing) {
    framing = frame(model, fit === 'tight' ? angle : null);
    s.framing.set(frameKey, framing);
  }

  let target = s.targets.get(pixels);
  if (!target) {
    target = new THREE.WebGLRenderTarget(pixels, pixels);
    s.targets.set(pixels, target);
  }

  const el = (model.elevation * Math.PI) / 180;
  const half = framing.view / 2;
  const { camera } = s;
  camera.left = -half;
  camera.right = half;
  camera.top = half;
  camera.bottom = -half;
  camera.position.set(0, Math.sin(el), Math.cos(el)).multiplyScalar(10).add(framing.target);
  camera.up.set(0, 1, 0);
  camera.lookAt(framing.target);
  camera.updateProjectionMatrix();

  model.group.rotation.set(0, angle, 0);
  s.scene.add(model.group);
  const raw = new Uint8Array(pixels * pixels * 4);
  s.renderer.setRenderTarget(target);
  s.renderer.clear();
  s.renderer.render(s.scene, camera);
  s.renderer.readRenderTargetPixels(target, 0, 0, pixels, pixels, raw);
  s.renderer.setRenderTarget(null);
  s.scene.remove(model.group);

  // Shadow ellipse on the ground under the model.
  const scale = pixels / framing.view;
  const groundY = framing.minY * Math.cos(el) - framing.target.y * Math.cos(el);
  const shadow: Shadow = {
    cx: pixels / 2 - framing.target.x * scale,
    cy: pixels / 2 - groundY * scale,
    rx: framing.radius * scale * 0.95,
    ry: Math.max(1, framing.radius * scale * Math.sin(el) * 0.95),
  };

  const ramps = model.ramps.map((ramp) => toRGB(resolveRamp(ramp, finish)));
  return pixelate(raw, pixels, ramps, shadow);
}

const urlCache = new Map<string, string | null>();

/** A still image of a model as a PNG data URL, cached. Null when it cannot be drawn. */
export function modelImageUrl(name: ModelName, options: RenderOptions): string | null {
  const key = `${name}|${options.finish ?? 'ivory'}|${options.pixels}|${options.angle ?? 0}|${options.fit ?? 'turn'}`;
  if (urlCache.has(key)) return urlCache.get(key) as string | null;

  let url: string | null = null;
  const image = renderModel(name, options);
  const canvas = document.createElement('canvas');
  const context = image ? canvas.getContext('2d') : null;
  if (image && context) {
    canvas.width = image.width;
    canvas.height = image.height;
    context.putImageData(new ImageData(image.data, image.width, image.height), 0, 0);
    url = canvas.toDataURL();
  }
  urlCache.set(key, url);
  return url;
}
