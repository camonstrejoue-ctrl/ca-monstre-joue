#!/usr/bin/env node
// Redimensionne + recompresse une image selon les règles du projet Ça Monstre Joue
// (voir CLAUDE.md, section "Poids et format des images").
//
// Usage:
//   node optimize-image.js <fichier> [--max 2400] [--quality 82] [--keep-format]
//
// Par défaut : redimensionne à 2400px max sur le plus grand côté, recompresse en JPEG
// qualité 82, respecte l'orientation EXIF, et convertit les PNG en JPEG.
// --keep-format : ne convertit pas le format (utile pour les logos/icônes à transparence).

const path = require('path');
const fs = require('fs');

let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error(
    "sharp n'est pas installé. Lance d'abord :\n" +
    `  npm install --no-save --prefix "${__dirname}/.." sharp\n` +
    "puis relance ce script."
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = { max: 2400, quality: 82, keepFormat: false, input: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--max') args.max = parseInt(argv[++i], 10);
    else if (a === '--quality') args.quality = parseInt(argv[++i], 10);
    else if (a === '--keep-format') args.keepFormat = true;
    else if (!args.input) args.input = a;
  }
  return args;
}

async function main() {
  const { max, quality, keepFormat, input } = parseArgs(process.argv.slice(2));
  if (!input) {
    console.error('Usage: node optimize-image.js <fichier> [--max 2400] [--quality 82] [--keep-format]');
    process.exit(1);
  }

  const inputPath = path.resolve(input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Fichier introuvable : ${inputPath}`);
    process.exit(1);
  }

  const sizeBefore = fs.statSync(inputPath).size;
  const ext = path.extname(inputPath).toLowerCase();
  const isPng = ext === '.png';
  const convertToJpeg = isPng && !keepFormat;

  const outputPath = convertToJpeg
    ? inputPath.slice(0, -ext.length) + '.jpg'
    : inputPath;

  let pipeline = sharp(inputPath).rotate(); // auto-oriente selon l'EXIF, puis strip le tag
  pipeline = pipeline.resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true });

  if (convertToJpeg || ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9 });
  } else if (ext === '.webp') {
    pipeline = pipeline.webp({ quality });
  }
  // Autres formats (svg, gif...) : laissés tels quels, ne devraient pas passer par ce script.

  const tmpPath = outputPath + '.tmp';
  await pipeline.toFile(tmpPath);

  if (outputPath !== inputPath) {
    fs.unlinkSync(inputPath); // supprime l'original si l'extension a changé (png -> jpg)
  }
  fs.renameSync(tmpPath, outputPath);

  const sizeAfter = fs.statSync(outputPath).size;
  const fmtKb = (n) => (n / 1024).toFixed(0) + ' Ko';
  const renamed = outputPath !== inputPath;

  console.log(JSON.stringify({
    input: inputPath,
    output: outputPath,
    renamed,
    sizeBeforeBytes: sizeBefore,
    sizeAfterBytes: sizeAfter,
    sizeBefore: fmtKb(sizeBefore),
    sizeAfter: fmtKb(sizeAfter),
  }, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
