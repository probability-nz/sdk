/**
 * Generates minimal GLB meshes for the Mixtour game example.
 *
 * Usage: npx tsx games/mixtour/scripts/generate-meshes.ts
 *
 * Produces:
 *   assets/piece.glb  — frustum (truncated cone)
 *   assets/tile.glb   — flat cuboid
 */

// Polyfill browser APIs for Node (GLTFExporter uses FileReader)
import { Blob } from 'node:buffer';
Object.assign(globalThis, { Blob });
// @ts-expect-error — minimal FileReader polyfill
globalThis.FileReader = class {
  result: ArrayBuffer | string | null = null;
  onloadend: (() => void) | null = null;
  readAsArrayBuffer(blob: Blob) {
    blob.arrayBuffer().then((ab) => {
      this.result = ab;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob: Blob) {
    blob.arrayBuffer().then((ab) => {
      this.result = 'data:application/octet-stream;base64,' + Buffer.from(ab).toString('base64');
      this.onloadend?.();
    });
  }
};

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BoxGeometry,
  CylinderGeometry,
  Mesh,
  MeshStandardMaterial,
  Scene,
} from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = resolve(__dirname, '../assets');

// -- Dimensions (meters, 1 unit = 1m) --
// Scaled to match a real tabletop board game.

// Piece: frustum (truncated cone) — stackable game token
// ~30mm base diameter, ~20mm top diameter, 12mm tall
// 5 stacked = 60mm, a comfortable tower height
const PIECE_BOTTOM_RADIUS = 0.015;
const PIECE_TOP_RADIUS = 0.01;
const PIECE_HEIGHT = 0.012;
const PIECE_SIDES = 3; // triangular cross-section for minimal poly

// Tile: flat square board tile
// 50mm square, 5mm thick — similar to a real board game tile
const TILE_SIZE = 0.05;
const TILE_THICKNESS = 0.005;

async function exportToGlb(scene: Scene): Promise<Buffer> {
  const exporter = new GLTFExporter();
  const glb = await exporter.parseAsync(scene, { binary: true });
  return Buffer.from(glb as ArrayBuffer);
}

async function main() {
  // 50% grey, non-metallic — color is overridden by manifest `color` field
  const material = new MeshStandardMaterial({ color: 0x808080, metalness: 0, roughness: 0.5 });

  // Piece — CylinderGeometry with different top/bottom radii creates a frustum
  const pieceGeo = new CylinderGeometry(
    PIECE_TOP_RADIUS,
    PIECE_BOTTOM_RADIUS,
    PIECE_HEIGHT,
    PIECE_SIDES,
  );
  // CylinderGeometry is centered at origin — shift up so base sits at y=0
  pieceGeo.translate(0, PIECE_HEIGHT / 2, 0);
  // Strip normals/UVs — renderer auto-generates flat normals, no textures used
  pieceGeo.deleteAttribute('normal');
  pieceGeo.deleteAttribute('uv');

  const pieceScene = new Scene();
  pieceScene.add(new Mesh(pieceGeo, material));

  // Tile — flat cuboid
  const tileGeo = new BoxGeometry(TILE_SIZE, TILE_THICKNESS, TILE_SIZE);
  // Shift up so bottom face sits at y=0
  tileGeo.translate(0, TILE_THICKNESS / 2, 0);
  tileGeo.deleteAttribute('normal');
  tileGeo.deleteAttribute('uv');

  const tileScene = new Scene();
  tileScene.add(new Mesh(tileGeo, material));

  const [pieceGlb, tileGlb] = await Promise.all([
    exportToGlb(pieceScene),
    exportToGlb(tileScene),
  ]);

  writeFileSync(resolve(ASSETS_DIR, 'piece.glb'), pieceGlb);
  writeFileSync(resolve(ASSETS_DIR, 'tile.glb'), tileGlb);

  console.log(`piece.glb: ${pieceGlb.length} bytes`);
  console.log(`tile.glb: ${tileGlb.length} bytes`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
