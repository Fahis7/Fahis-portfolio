/*
  cv.html: the CV in its own tab, with the site favicon and a proper title.
  The version comes from profile.cvVersion in src/data.js, so there is still one place to bump it.
  Desktop (fine pointer): the PDF in a full-size iframe. Phones / touch: the rendered page images
  from public/cv (iPhone Safari doesn't show PDFs in iframes well).
*/
import '@fontsource/inter/latin-600.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import { profile } from '../data.js';

const BASE = import.meta.env.BASE_URL;
const V = `?v=${profile.cvVersion}`;
const PDF = BASE + profile.resume + V;
// the CV page images (npm run cv:render); add more entries here if the CV grows past one page
const PAGES = [{ x1: 'cv/cv-page-1@1x.webp', x2: 'cv/cv-page-1.webp' }];

document.getElementById('cvp-download').href = PDF;

const desktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (desktop) {
  const frame = document.getElementById('cvp-frame');
  frame.src = PDF;
  frame.hidden = false;
} else {
  const box = document.getElementById('cvp-pages');
  PAGES.forEach((p, i) => {
    const img = new Image(827, 1170);
    img.src = BASE + p.x1 + V;
    img.srcset = `${BASE + p.x1 + V} 1x, ${BASE + p.x2 + V} 2x`;
    img.alt = PAGES.length > 1 ? `CV of Mohammed Fahis, page ${i + 1}` : 'CV of Mohammed Fahis, one page';
    img.decoding = 'async';
    box.appendChild(img);
  });
  box.hidden = false;
  document.getElementById('cvp-main').style.height = 'auto';
}
