import * as THREE from 'three';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type ModelName = PieceType | 'clock' | 'board' | 'book' | 'club' | 'engine' | 'trophy';
export type Finish = 'ivory' | 'ebony' | 'gold' | 'crystal';

export const PIECES: PieceType[] = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];

/** Colour ramps from darkest to lightest. Every model part is painted with one of them. */
export const RAMPS = {
  ivory: ['#6b5747', '#a38b6f', '#cdb592', '#ead6b2', '#fff4dc'],
  ebony: ['#0d0908', '#211714', '#36261f', '#4d392d', '#6a5241'],
  gold: ['#5a360e', '#94601a', '#cf9228', '#f0c247', '#fff0a0'],
  crystal: ['#1b3557', '#2c6397', '#4f9fd2', '#93d9f2', '#e6fbff'],
  wood: ['#4a2a18', '#6e4026', '#935a36', '#b87a4c', '#d69d6a'],
  darkwood: ['#1f120b', '#33200f', '#4a2f1a', '#613f24', '#7a5232'],
  cream: ['#7d6a54', '#b3a07f', '#d8c6a2', '#efe1c2', '#fff8e8'],
  red: ['#4a0f15', '#7a1a24', '#ad2b35', '#d9474c', '#f27a72'],
  green: ['#173b22', '#25593a', '#367a4c', '#4f9c5f', '#77c07a'],
  grey: ['#1e2027', '#353943', '#545a66', '#7a818f', '#a7aebb'],
  ink: ['#0c0a0a', '#141112', '#1d191a', '#262122', '#302a2b'],
  screen: ['#0b2a2a', '#11423f', '#1b6a5e', '#33a083', '#7fe0b0'],
};

export type FixedRamp = keyof typeof RAMPS;
/** "body" and "accent" are painted according to the finish the model is rendered with. */
export type RampName = FixedRamp | 'body' | 'accent';

const ACCENT: Record<Finish, FixedRamp> = {
  ivory: 'ebony',
  ebony: 'ivory',
  gold: 'red',
  crystal: 'gold',
};

export const resolveRamp = (ramp: RampName, finish: Finish): FixedRamp =>
  ramp === 'body' ? finish : ramp === 'accent' ? ACCENT[finish] : ramp;

export interface Model {
  group: THREE.Group;
  /** Ramp of each part; a mesh's part index is stored in `mesh.userData.part`. */
  ramps: RampName[];
  /** Camera elevation in degrees. */
  elevation: number;
}

type Point = [number, number];

class ModelBuilder {
  readonly group = new THREE.Group();
  readonly ramps: RampName[] = [];

  add(
    geometry: THREE.BufferGeometry,
    ramp: RampName,
    position: [number, number, number] = [0, 0, 0],
    rotation: [number, number, number] = [0, 0, 0]
  ) {
    let part = this.ramps.indexOf(ramp);
    if (part === -1) part = this.ramps.push(ramp) - 1;
    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.userData.part = part;
    this.group.add(mesh);
    return mesh;
  }

  build(elevation = 20): Model {
    return { group: this.group, ramps: this.ramps, elevation };
  }
}

const lathe = (points: Point[], segments = 28) =>
  new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(Math.max(0, x), y)),
    segments
  );

/** Points on a circle of radius r around (cx, cy), from angle `from` to `to` in degrees. */
const arc = (cx: number, cy: number, r: number, from: number, to: number, steps: number): Point[] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const ball = (r: number) => new THREE.SphereGeometry(r, 10, 8);
const cylinder = (r: number, h: number, segments = 20) => new THREE.CylinderGeometry(r, r, h, segments);

/** The stepped foot shared by every chess piece. */
const BASE: Point[] = [
  [0, 0],
  [1, 0],
  [1, 0.14],
  [0.9, 0.22],
  [0.92, 0.3],
  [0.78, 0.38],
  [0.6, 0.44],
];

function pawn() {
  const m = new ModelBuilder();
  m.add(
    lathe([
      ...BASE,
      [0.44, 0.5],
      [0.36, 0.8],
      [0.3, 1.12],
      [0.52, 1.2],
      [0.52, 1.3],
      [0.3, 1.36],
      ...arc(0, 1.72, 0.4, -62, 90, 10),
    ]),
    'body'
  );
  return m.build();
}

function knight() {
  const m = new ModelBuilder();
  m.add(lathe([...BASE, [0.62, 0.5], [0.58, 0.62], [0, 0.62]]), 'body');

  // Side profile of the horse's head, facing +x.
  const outline: Point[] = [
    [-0.6, 0.6],
    [0.62, 0.6],
    [0.55, 0.85],
    [0.28, 1.15],
    [0.3, 1.4],
    [0.62, 1.62],
    [0.95, 1.82],
    [1.0, 2.02],
    [0.88, 2.18],
    [0.55, 2.36],
    [0.42, 2.62],
    [0.3, 2.86],
    [0.16, 2.62],
    [-0.12, 2.58],
    [-0.45, 2.36],
    [-0.62, 1.9],
    [-0.68, 1.3],
    [-0.62, 0.9],
  ];
  const shift = -0.12;
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x + shift, y)));
  const head = new THREE.ExtrudeGeometry(shape, {
    depth: 0.56,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 1,
    curveSegments: 4,
  });
  head.translate(0, 0, -0.28);
  m.add(head, 'body');

  // Eyes: one bar through the head shows on both sides.
  m.add(box(0.13, 0.11, 0.74), 'accent', [0.42 + shift, 2.2, 0]);
  // Mane
  const mane: Point[] = [
    [-0.24, 2.55],
    [-0.5, 2.33],
    [-0.66, 1.95],
    [-0.72, 1.55],
  ];
  mane.forEach(([x, y], i) => m.add(box(0.16, 0.2, 0.3), 'accent', [x + shift, y, 0], [0, 0, 0.5 + i * 0.25]));
  return m.build();
}

function bishop() {
  const m = new ModelBuilder();
  m.add(
    lathe([
      ...BASE,
      [0.42, 0.5],
      [0.34, 0.9],
      [0.27, 1.5],
      [0.5, 1.58],
      [0.5, 1.68],
      [0.28, 1.74],
      [0.36, 1.86],
      [0.42, 2.05],
      [0.4, 2.25],
      [0.32, 2.45],
      [0.18, 2.62],
      [0.06, 2.7],
      ...arc(0, 2.8, 0.11, -60, 90, 6),
    ]),
    'body'
  );
  // The diagonal slit in the mitre, on both sides.
  m.add(box(0.07, 0.42, 0.86), 'accent', [0.1, 2.22, 0], [0, 0, -0.6]);
  return m.build();
}

function rook() {
  const m = new ModelBuilder();
  m.add(
    lathe([
      ...BASE,
      [0.6, 0.5],
      [0.52, 0.8],
      [0.48, 1.5],
      [0.6, 1.6],
      [0.64, 1.7],
      [0.64, 1.92],
      [0.46, 1.92],
      [0.46, 1.84],
      [0, 1.84],
    ]),
    'body'
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    m.add(box(0.24, 0.22, 0.18), 'body', [0.55 * Math.cos(a), 2.02, 0.55 * Math.sin(a)], [0, -a + Math.PI / 2, 0]);
  }
  return m.build();
}

function queen() {
  const m = new ModelBuilder();
  m.add(
    lathe([
      ...BASE,
      [0.44, 0.5],
      [0.34, 0.9],
      [0.25, 1.75],
      [0.5, 1.84],
      [0.5, 1.94],
      [0.28, 2.0],
      [0.36, 2.14],
      [0.5, 2.4],
      [0.56, 2.52],
      [0.4, 2.5],
      [0.22, 2.54],
      [0.14, 2.62],
      [0, 2.64],
    ]),
    'body'
  );
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    m.add(ball(0.1), 'body', [0.52 * Math.cos(a), 2.58, 0.52 * Math.sin(a)]);
  }
  m.add(ball(0.15), 'body', [0, 2.78, 0]);
  return m.build();
}

function king() {
  const m = new ModelBuilder();
  m.add(
    lathe([
      ...BASE,
      [0.46, 0.5],
      [0.35, 0.9],
      [0.27, 1.9],
      [0.52, 1.98],
      [0.52, 2.08],
      [0.3, 2.14],
      [0.42, 2.4],
      [0.5, 2.62],
      [0.44, 2.7],
      [0.24, 2.74],
      [0, 2.76],
    ]),
    'body'
  );
  m.add(box(0.16, 0.54, 0.16), 'body', [0, 3.0, 0]);
  m.add(box(0.46, 0.16, 0.16), 'body', [0, 3.06, 0]);
  return m.build();
}

function clock() {
  const m = new ModelBuilder();
  m.add(box(1.8, 0.9, 0.72), 'wood', [0, 0.45, 0]);
  m.add(box(1.86, 0.08, 0.78), 'darkwood', [0, 0.04, 0]);
  [-1, 1].forEach((side) => {
    m.add(cylinder(0.3, 0.06), 'cream', [side * 0.44, 0.48, 0.37], [Math.PI / 2, 0, 0]);
  });
  // Hands: one clock shows 12 o'clock, the other is running at 2 o'clock.
  m.add(box(0.05, 0.22, 0.03), 'ink', [-0.44, 0.57, 0.41]);
  m.add(box(0.05, 0.22, 0.03), 'ink', [0.49, 0.56, 0.41], [0, 0, -0.9]);
  m.add(cylinder(0.13, 0.12), 'red', [-0.44, 0.96, 0]);
  m.add(cylinder(0.13, 0.04), 'grey', [0.44, 0.92, 0]);
  return m.build();
}

/** A small pawn or king standing on another model. */
function miniPiece(m: ModelBuilder, type: 'pawn' | 'king', ramp: RampName, x: number, y: number, z: number, scale: number) {
  const source = type === 'pawn' ? pawn() : king();
  source.group.children.forEach((child) => {
    const mesh = child as THREE.Mesh;
    const geometry = mesh.geometry.clone();
    geometry.rotateX(mesh.rotation.x);
    geometry.rotateY(mesh.rotation.y);
    geometry.rotateZ(mesh.rotation.z);
    geometry.translate(mesh.position.x, mesh.position.y, mesh.position.z);
    geometry.scale(scale, scale, scale);
    m.add(geometry, ramp, [x, y, z]);
  });
}

function board() {
  const m = new ModelBuilder();
  const tile = 0.26;
  m.add(box(tile * 8 + 0.2, 0.12, tile * 8 + 0.2), 'darkwood', [0, 0.06, 0]);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      m.add(box(tile, 0.04, tile), (row + col) % 2 ? 'wood' : 'cream', [
        (col - 3.5) * tile,
        0.14,
        (row - 3.5) * tile,
      ]);
    }
  }
  miniPiece(m, 'king', 'ebony', -0.5 * tile, 0.16, -2.5 * tile, 0.32);
  miniPiece(m, 'pawn', 'ivory', 1.5 * tile, 0.16, 1.5 * tile, 0.32);
  return m.build(38);
}

function book() {
  const m = new ModelBuilder();
  m.add(box(1.5, 0.3, 1.1), 'red', [0, 0.15, 0]);
  m.add(box(1.44, 0.22, 1.12), 'cream', [0.06, 0.15, 0]);
  // A second, smaller book lying slightly turned on top.
  m.add(box(1.3, 0.28, 1.0), 'green', [0, 0.44, 0], [0, 0.35, 0]);
  m.add(box(1.24, 0.2, 1.02), 'cream', [0.05, 0.44, 0.02], [0, 0.35, 0]);
  m.add(box(0.06, 0.29, 1.01), 'gold', [-0.45, 0.44, -0.16], [0, 0.35, 0]);
  return m.build(28);
}

function club() {
  const m = new ModelBuilder();
  m.add(box(1.5, 0.9, 1.1), 'cream', [0, 0.45, 0]);
  const roof = new THREE.ConeGeometry(1.12, 0.62, 4);
  roof.rotateY(Math.PI / 4);
  roof.scale(1, 1, 0.78);
  m.add(roof, 'red', [0, 1.21, 0]);
  m.add(box(0.32, 0.52, 0.04), 'darkwood', [0, 0.26, 0.56]);
  [-0.48, 0.48].forEach((x) => m.add(box(0.26, 0.24, 0.04), 'gold', [x, 0.56, 0.56]));
  m.add(cylinder(0.025, 0.6, 6), 'grey', [0, 1.75, 0]);
  m.add(box(0.36, 0.22, 0.03), 'green', [0.19, 1.93, 0]);
  return m.build(24);
}

function engine() {
  const m = new ModelBuilder();
  m.add(box(0.9, 0.08, 0.5), 'grey', [0, 0.04, 0]);
  m.add(box(0.2, 0.5, 0.14), 'grey', [0, 0.32, -0.08]);
  m.add(box(1.6, 1.08, 0.16), 'grey', [0, 1.06, 0]);
  m.add(box(1.4, 0.88, 0.02), 'screen', [0, 1.08, 0.08]);
  // A tiny chessboard on the screen.
  const tile = 0.16;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      m.add(box(tile, tile, 0.02), (row + col) % 2 ? 'green' : 'cream', [
        (col - 1.5) * tile - 0.22,
        (row - 1.5) * tile + 1.08,
        0.1,
      ]);
    }
  }
  m.add(box(0.36, 0.05, 0.02), 'screen', [0.4, 1.3, 0.1]);
  m.add(box(0.28, 0.05, 0.02), 'screen', [0.36, 1.18, 0.1]);
  m.add(box(0.36, 0.05, 0.02), 'screen', [0.4, 1.06, 0.1]);
  return m.build();
}

function trophy() {
  const m = new ModelBuilder();
  m.add(box(1.1, 0.36, 1.1), 'darkwood', [0, 0.18, 0]);
  m.add(box(0.6, 0.1, 0.02), 'gold', [0, 0.18, 0.56]);
  m.add(
    lathe(
      [
        [0, 0.36],
        [0.46, 0.36],
        [0.46, 0.44],
        [0.26, 0.5],
        [0.12, 0.66],
        [0.1, 0.94],
        [0.2, 1.06],
        [0.36, 1.12],
        [0.54, 1.3],
        [0.64, 1.62],
        [0.68, 2.02],
        [0.58, 2.02],
        [0.54, 1.72],
        [0, 1.64],
      ],
      24
    ),
    'gold'
  );
  [-1, 1].forEach((side) => {
    const handle = new THREE.TorusGeometry(0.26, 0.06, 6, 12, Math.PI);
    m.add(handle, 'gold', [side * 0.64, 1.6, 0], [0, 0, (-side * Math.PI) / 2]);
  });
  return m.build();
}

const BUILDERS: Record<ModelName, () => Model> = {
  pawn,
  knight,
  bishop,
  rook,
  queen,
  king,
  clock,
  board,
  book,
  club,
  engine,
  trophy,
};

const cache = new Map<ModelName, Model>();

export function getModel(name: ModelName): Model {
  let model = cache.get(name);
  if (!model) {
    model = BUILDERS[name]();
    cache.set(name, model);
  }
  return model;
}

export const isModelName = (name: string): name is ModelName => name in BUILDERS;
