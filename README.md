# Mohammed Fahis · Portfolio

Live: https://fahis7.github.io/Fahis-portfolio/

React 19 + Vite, no animation libraries. Deployed to GitHub Pages on every push to `main`.

## What's where
| File | What it does |
|---|---|
| `src/data.js` | **All content**: projects (incl. the code each card "decodes" into), skills, experience, links |
| `src/Belt.jsx` | The scanner belt: card positions, particle dissolve (canvas), drag / wheel / keyboard, counter |
| `src/MiniSites.jsx` | Drawn mini websites, shown only for projects without a live capture (HTML/CSS, sized in `cqw`) |
| `src/main.jsx` | Page sections |
| `src/styles.css` | All styles |

## Common edits
- **Add a project:** add an entry to `projects` in `src/data.js` with its `reel` media in `public/showreel/`.
- **Real screenshots:** a project captured live (`reel.video` set) shows its `reel.poster` on the belt, the case-study preview and the contact trail (`realShot` in `src/data.js`). Without a live capture it falls back to its drawn `site` from `MiniSites.jsx`.
- **CV:** the PDF is `public/Mohammed_Fahis_CV.pdf` (`profile.resume` in `src/data.js`; every View / Download CV link is built from it). The in-page viewer shows it as images in `public/cv/`. To update the CV:
  1. Replace `public/Mohammed_Fahis_CV.pdf` with the new PDF (same file name).
  2. Run `npm run cv:render` to regenerate `public/cv/cv-page-1.webp` (200 dpi, ~1654×2339) and `public/cv/cv-page-1@1x.webp` (~827×1170). It needs poppler and webp: `brew install poppler webp`.
  3. Commit the PDF and both images.
- **Share preview:** `public/og-image.png` (1200×630).

## Run locally
```bash
npm ci
npm run dev
```
