// One-shot asset generator. Run once with `bun scripts/generate-assets.mjs`.
// Outputs public/favicon.svg, public/favicon.ico, public/apple-touch-icon.png, public/og.png.
import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(here, "..", "public");

// Catppuccin Mocha, the site's dark palette, plus the Ghostty config's
// split-divider orange as the accent.
const FG = "#cdd6f4";
const BG = "#1e1e2e";
const MUTE = "#9399b2";
const ACCENT = "#ff8c42";

// Catppuccin Latte, for the icon only.
const ICON_BG = "#eff1f5";
const ICON_FG = "#4c4f69";
const ICON_ACCENT = "#b34d00";

// Geometric A.A monogram - two angular A's flanking a square period. The
// period carries the accent, the same orange the page uses for its cursor
// and for the dot in the wordmark.
const MARK_LETTERS = `
  <path d="M14 4 L1 60 L27 60 Z M14 18 L7 38 L21 38 Z" fill-rule="evenodd"/>
  <path d="M50 4 L37 60 L63 60 Z M50 18 L43 38 L57 38 Z" fill-rule="evenodd"/>
`;
const MARK_DOT = `<rect x="30" y="52" width="4" height="8"/>`;
const mark = (fg, accent) =>
  `<g fill="${fg}">${MARK_LETTERS}</g><g fill="${accent}">${MARK_DOT}</g>`;

const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${ICON_BG}"/>
  ${mark(ICON_FG, ICON_ACCENT)}
</svg>`;

// 1200x630 share card - the page itself: mono name, the services line and
// the accent cursor, on the Mocha ground.
// One variant per locale, so the EN page never shares a Polish preview.
const ogSvg = (tagline) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BG}"/>
  <text x="72" y="70"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="22"
        letter-spacing="4"
        fill="${MUTE}">ADRIAN ANTOSIAK</text>
  <text x="72" y="290"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="118"
        font-weight="700"
        fill="${FG}">Adrian<tspan fill="${ACCENT}">.</tspan></text>
  <text x="72" y="418"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="118"
        font-weight="700"
        fill="${FG}">Antosiak</text>
  <text x="72" y="506"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="34"
        fill="${MUTE}">${tagline}</text>
  <rect x="${72 + tagline.length * 20.4 + 14}" y="476" width="5" height="39" fill="${ACCENT}"/>
  <text x="72" y="570"
        font-family="'JetBrains Mono', ui-monospace, monospace"
        font-size="22"
        letter-spacing="2"
        fill="${MUTE}" opacity="0.7">adrianantosiak.pl</text>
  <g transform="translate(1040 36) scale(1.4)">${mark(FG, ACCENT)}</g>
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

// og.png / og-en.png 1200x630
await sharp(Buffer.from(ogSvg("aplikacje / AI / www")))
  .resize(1200, 630)
  .png()
  .toFile(resolve(OUT, "og.png"));
console.log("wrote og.png");

await sharp(Buffer.from(ogSvg("apps / AI / web")))
  .resize(1200, 630)
  .png()
  .toFile(resolve(OUT, "og-en.png"));
console.log("wrote og-en.png");

console.log("done");
