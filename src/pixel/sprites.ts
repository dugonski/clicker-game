/** One character per pixel. "." is transparent; every other character is a palette colour. */
export const PALETTE: Record<string, string> = {
  K: '#120c0a', // outline
  W: '#ffffff',
  L: '#d8c6a2', // light cream
  G: '#b3a07f', // cream shadow
  c: '#efe1c2', // cream
  T: '#935a36', // wood
  t: '#4a2f1a', // dark wood
  Y: '#f0c247', // gold
  y: '#cf9228', // dark gold
  D: '#7d6a54', // dark cream
};

/** Width and height of every sprite, in art pixels. */
export const SPRITE_PIXELS = 16;

/** Small interface glyphs. Chess pieces and buildings are 3D models (see models.ts). */
export const SPRITES = {
  /** The currency: a tiny chessboard. */
  move: [
    '.KKKKKKKKKKKKKK.',
    'KYYYYYYYYYYYYYyK',
    'KYcccTTTcccTTTyK',
    'KYcWcTTTcWcTTTyK',
    'KYcccTTTcccTTTyK',
    'KYTTTcccTTTcccyK',
    'KYTTTcWcTTTcWcyK',
    'KYTTTcccTTTcccyK',
    'KYcccTTTcccTTTyK',
    'KYcWcTTTcWcTTTyK',
    'KYcccTTTcccTTTyK',
    'KYTTTcccTTTcccyK',
    'KYTTTcWcTTTcWcyK',
    'KYTTTcccTTTcccyK',
    'KyyyyyyyyyyyyyyK',
    '.KKKKKKKKKKKKKK.',
  ],
  click: [
    '................',
    '..KK............',
    '..KWK...........',
    '..KWWK..........',
    '..KWWWK.........',
    '..KWWWWK........',
    '..KWWWWWK.......',
    '..KWWWWWWK......',
    '..KWWWWWWWK.....',
    '..KWWWWWWWWK....',
    '..KWWWWWLKKKK...',
    '..KWWLWWLK......',
    '..KWLKKWWLK.....',
    '..KLK.KWWLK.....',
    '..KK...KWLK.....',
    '........KKK.....',
  ],
  lock: [
    '................',
    '.....KKKKKK.....',
    '....KccccLGK....',
    '...KcGKKKKcGK...',
    '...KcK....KGK...',
    '...KcK....KGK...',
    '..KKKKKKKKKKKK..',
    '..KYYYYYYYYYyK..',
    '..KYWYYYYYYyyK..',
    '..KYYYYKKYYyyK..',
    '..KYYYKKKKYyyK..',
    '..KYYYYKKYYyyK..',
    '..KYYYYKKYyyyK..',
    '..KYyyyyyyyyyK..',
    '..KKKKKKKKKKKK..',
    '................',
  ],
};

export type SpriteName = keyof typeof SPRITES;
