/**
 * Generates the Mixtour game manifest (main.json).
 *
 * Usage: npx tsx games/mixtour/scripts/generate-manifest.ts
 *
 * Produces: main.json
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../main.json');

// -- Board layout --
const GRID_SIZE = 5;
const TILE_SPACING = 0.052; // 50mm tile + 2mm gap
const TILE_COLORS = { light: '#e8d4a2', dark: '#b58863' };

// -- Piece layout --
const PIECES_PER_PLAYER = 20;
const PIECE_HEIGHT = 0.012;
const PILE_COLS = 4;
const PILE_SPACING = 0.032; // spacing between pieces in pile
const PILE_OFFSET_X = 0.16; // distance from board center to pile center

type Piece = {
  name?: string;
  template?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  locked?: boolean;
};

// Center the grid around origin
const gridOffset = ((GRID_SIZE - 1) * TILE_SPACING) / 2;

function colLabel(col: number): string {
  return String.fromCharCode(97 + col); // a, b, c, d, e
}

// Generate 25 board tiles in a 5x5 grid
function generateTiles(): Piece[] {
  const tiles: Piece[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const isDark = (row + col) % 2 === 1;
      tiles.push({
        name: `${colLabel(col)}${row + 1}`,
        template: 'tile',
        position: [
          col * TILE_SPACING - gridOffset,
          0,
          row * TILE_SPACING - gridOffset,
        ],
        color: isDark ? TILE_COLORS.dark : TILE_COLORS.light,
        locked: true,
      });
    }
  }
  return tiles;
}

// Generate a pile of pieces to one side of the board
function generatePile(template: string, side: -1 | 1): Piece[] {
  const pieces: Piece[] = [];
  const rows = Math.ceil(PIECES_PER_PLAYER / PILE_COLS);
  const pileOffsetZ = ((rows - 1) * PILE_SPACING) / 2;

  for (let i = 0; i < PIECES_PER_PLAYER; i++) {
    const col = i % PILE_COLS;
    const row = Math.floor(i / PILE_COLS);
    pieces.push({
      template,
      position: [
        side * PILE_OFFSET_X + col * PILE_SPACING * side,
        PIECE_HEIGHT / 2,
        row * PILE_SPACING - pileOffsetZ,
      ],
    });
  }
  return pieces;
}

const manifest = {
  $schema: 'https://probability.nz/schemas/game-manifest/1.0',
  templates: {
    tile: { src: 'assets/tile.glb' },
    'white-piece': { src: 'assets/piece.glb', color: 'white' },
    'red-piece': { src: 'assets/piece.glb', color: '#cc3333' },
  },
  scenarios: [
    {
      name: 'Ready',
      children: [
        ...generateTiles(),
        ...generatePile('white-piece', -1),
        ...generatePile('red-piece', 1),
      ],
    },
  ],
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Wrote ${OUT}`);
console.log(`  ${GRID_SIZE * GRID_SIZE} tiles + ${PIECES_PER_PLAYER * 2} pieces = ${GRID_SIZE * GRID_SIZE + PIECES_PER_PLAYER * 2} total children`);
