/* ==========================================================================
   IMAGE OPTIMIZER — prepares your camera photos for the website.

   WHAT IT DOES: takes every photo from LensworksPortoflio/Events and
   LensworksPortoflio/Photoshoots, shrinks it to web size (max 1200px,
   ~200KB instead of several MB), fixes rotation, cleans up the filename
   (spaces → hyphens, lowercase), and saves the result into images/events/
   or images/portraits/. Your originals are never touched.

   HOW TO USE IT:
     1. Drop your full-size photos into LensworksPortoflio/Events (for event
        pics) or LensworksPortoflio/Photoshoots (for portraits).
     2. Open a terminal in this "optimize" folder
        (in File Explorer: right-click the folder → "Open in Terminal").
     3. Run:  node optimize.mjs
     4. The web-ready copies appear in images/events/ or images/portraits/.
        Then add <a>/<img> tags for them in index.html (copy an existing
        tile block and change the file paths).

   Note: it re-processes every photo each run — that's fine, existing web
   copies are just regenerated with the same names.
   ========================================================================== */
import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

const ROOT = decodeURIComponent(new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));

const SOURCES = [
  { dir: join(ROOT, 'LensworksPortoflio', 'Events'),     out: join(ROOT, 'images', 'events') },
  { dir: join(ROOT, 'LensworksPortoflio', 'Photoshoots'), out: join(ROOT, 'images', 'portraits') },
];

function sanitize(filename) {
  return filename
    .replace(/\.[^.]+$/, '')          // remove extension
    .replace(/\s+/g, '-')             // spaces → hyphens
    .replace(/[()]/g, '')             // remove parentheses
    .replace(/-+/g, '-')              // collapse multiple hyphens
    .toLowerCase()
    + '.jpg';
}

async function processSource({ dir, out }) {
  await mkdir(out, { recursive: true });
  const files = await readdir(dir);
  const images = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));

  console.log(`\nProcessing ${images.length} images from ${dir}`);
  console.log(`Output → ${out}\n`);

  for (const file of images) {
    const inputPath = join(dir, file);
    const outName = sanitize(file);
    const outputPath = join(out, outName);

    const inSize = statSync(inputPath).size;

    await sharp(inputPath)
      .rotate()                        // auto-rotate from EXIF orientation
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .withMetadata()
      .jpeg({ quality: 82, progressive: true })
      .toFile(outputPath);

    const outSize = statSync(outputPath).size;
    const pct = Math.round((1 - outSize / inSize) * 100);
    console.log(`  ${file.padEnd(35)} → ${outName.padEnd(25)} ${(inSize/1024/1024).toFixed(1)}MB → ${(outSize/1024).toFixed(0)}KB  (-${pct}%)`);
  }
}

(async () => {
  console.log('Lensworks Photography — Image Optimizer');
  console.log('=========================================');
  for (const source of SOURCES) {
    await processSource(source);
  }
  console.log('\nDone! All images optimized.');
})();
