// Renders public/Mohammed_Fahis_CV.pdf (page 1) into the images the in-page CV viewer shows:
//   public/cv/cv-page-1.webp     ~1654x2339 (200 dpi, 2x screens)
//   public/cv/cv-page-1@1x.webp  ~827x1170  (100 dpi)
// Needs poppler (pdftoppm) and webp (cwebp): brew install poppler webp
// Run: npm run cv:render
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PDF = 'public/Mohammed_Fahis_CV.pdf';
const OUT = 'public/cv';
const QUALITY = '88';
const tmp = mkdtempSync(join(tmpdir(), 'cv-render-'));

try {
  mkdirSync(OUT, { recursive: true });
  for (const [dpi, file] of [[200, 'cv-page-1.webp'], [100, 'cv-page-1@1x.webp']]) {
    const png = join(tmp, `page-${dpi}`);
    execFileSync('pdftoppm', ['-r', String(dpi), '-f', '1', '-l', '1', '-png', '-singlefile', PDF, png]);
    execFileSync('cwebp', ['-quiet', '-q', QUALITY, `${png}.png`, '-o', join(OUT, file)]);
    console.log(`wrote ${join(OUT, file)} (${dpi} dpi)`);
  }
} catch (e) {
  if (e.code === 'ENOENT') console.error('cv:render needs pdftoppm and cwebp on PATH: brew install poppler webp');
  else console.error(e.message);
  process.exitCode = 1;
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
