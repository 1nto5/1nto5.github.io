// One-shot asset generator. Run once with `bun scripts/generate-assets.mjs`.
// Outputs public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png, public/og.png.
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "..", "public");

const FG = "#0b0b0b";
const BG = "#f3f1ec";
const ACCENT = "#ff5a1f";

// Monochrome "A.A" favicon.
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${FG}"/>
  <text x="32" y="44"
        font-family="'Inter Tight', system-ui, sans-serif"
        font-size="28"
        font-weight="800"
        letter-spacing="-1"
        text-anchor="middle"
        fill="${BG}">A.A</text>
</svg>`;

// 1200x630 share card - name + tagline + location on cream background.
const ogSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <rect x="0" y="0" width="1200" height="12" fill="${FG}"/>
  <rect x="0" y="618" width="1200" height="12" fill="${FG}"/>
  <text x="72" y="70"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="22"
        letter-spacing="4"
        fill="${FG}">ADRIAN ANTOSIAK</text>
  <text x="72" y="290"
        font-family="'Inter Tight', system-ui, sans-serif"
        font-size="140"
        font-weight="800"
        letter-spacing="-6"
        fill="${FG}">Adrian</text>
  <text x="72" y="430"
        font-family="'Inter Tight', system-ui, sans-serif"
        font-size="140"
        font-weight="800"
        letter-spacing="-6"
        fill="${FG}">Antosiak.</text>
  <text x="72" y="508"
        font-family="'Inter Tight', system-ui, sans-serif"
        font-size="36"
        font-weight="500"
        fill="${FG}">AI  -  aplikacje  -  strony  -  IT</text>
  <text x="72" y="570"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="22"
        letter-spacing="2"
        fill="${FG}" opacity="0.55">Szczytno - Warmia-Mazury - Polska i zdalnie na swiecie</text>
  <circle cx="1100" cy="72" r="14" fill="${ACCENT}"/>
</svg>`;

await mkdir(OUT, { recursive: true });

// favicon.svg - raw vector, no rasterization
await writeFile(resolve(OUT, "favicon.svg"), faviconSvg);
console.log("wrote favicon.svg");

// favicon.ico - 32x32 PNG wrapped in ICO container
const png32 = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
// ICO = ICONDIR(6) + ICONDIRENTRY(16) + png bytes
const ico = Buffer.alloc(6 + 16 + png32.length);
ico.writeUInt16LE(0, 0);            // reserved
ico.writeUInt16LE(1, 2);            // type = icon
ico.writeUInt16LE(1, 4);            // count
ico.writeUInt8(32, 6);              // width
ico.writeUInt8(32, 7);              // height
ico.writeUInt8(0, 8);               // colors in palette
ico.writeUInt8(0, 9);               // reserved
ico.writeUInt16LE(1, 10);           // planes
ico.writeUInt16LE(32, 12);          // bits per pixel
ico.writeUInt32LE(png32.length, 14);// size of image data
ico.writeUInt32LE(22, 18);          // offset to image data
png32.copy(ico, 22);
await writeFile(resolve(OUT, "favicon.ico"), ico);
console.log("wrote favicon.ico");

// apple-touch-icon.png 180x180
await sharp(Buffer.from(faviconSvg))
  .resize(180, 180)
  .png()
  .toFile(resolve(OUT, "apple-touch-icon.png"));
console.log("wrote apple-touch-icon.png");

// og.png 1200x630
await sharp(Buffer.from(ogSvg))
  .resize(1200, 630)
  .png()
  .toFile(resolve(OUT, "og.png"));
console.log("wrote og.png");

console.log("done");
