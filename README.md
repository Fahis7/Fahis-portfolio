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
- **CV:** add `public/resume.pdf` and set `resume: 'resume.pdf'` in `profile`.
- **Share preview:** `public/og-image.png` (1200×630).

## Run locally
```bash
npm ci
npm run dev
```
