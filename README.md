# Mohammed Fahis — Portfolio

Live: https://fahis7.github.io/Fahis-portfolio/

React 19 + Vite, no animation libraries. Deployed to GitHub Pages on every push to `main`.

## What's where
| File | What it does |
|---|---|
| `src/data.js` | **All content** — projects (incl. the code each card "decodes" into), skills, experience, links |
| `src/Belt.jsx` | The scanner belt: card positions, particle dissolve (canvas), drag / wheel / keyboard, counter |
| `src/MiniSites.jsx` | The mini website drawn for each project card (HTML/CSS, sized in `cqw`) |
| `src/main.jsx` | Page sections |
| `src/styles.css` | All styles |

## Common edits
- **Add a project:** add an entry to `projects` in `src/data.js`. Reuse an existing `site` design or add a new one in `MiniSites.jsx`.
- **Real screenshots:** put an image in `public/projects/` and set `image: 'projects/<file>'` on the project.
- **CV:** add `public/resume.pdf` and set `resume: 'resume.pdf'` in `profile`.
- **Share preview:** `public/og-image.png` (1200×630).

## Run locally
```bash
npm ci
npm run dev
```
