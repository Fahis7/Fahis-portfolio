// WebGL ribbon of project cards (docs/ribbon-spec.md), mountable into any container.
//
//   const reel = mountRibbon(container, { mode, theme, cards, list, onOpen, onReady, onFocusCard, debug });
//   reel.setScrollProgress(p); reel.setTheme('light' | 'dark'); reel.destroy();
//
// mode 'free':   the spec's virtual scroll (wheel, touch, keys), as on work.html.
// mode 'scroll': no input listeners; setScrollProgress(p), p 0..1, moves the ribbon through one
//                full pass of the cards. current still eases toward target, so scroll speed
//                bends and wrings the ribbon exactly as the virtual scroll does.
import * as THREE from 'three';
import RIBBON from './ribbon.glsl?raw';
import CARD_VERT from './card.vert.glsl?raw';
import CARD_FRAG from './card.frag.glsl?raw';
import FLOOR_VERT from './floor.vert.glsl?raw';
import FLOOR_FRAG from './floor.frag.glsl?raw';
import { FOV, CAM_Z, halfHeight, computeLayout, place, rectToWorld, outline, sheetParams, applySpeed } from './sheet.js';

const FONT = 'Inter Tight Variable';

// data.js projects -> ribbon cards
export function cardsFromProjects(projects, base) {
  return projects.map((p) => ({
    id: p.id,
    title: p.title,
    tagline: p.tagline,
    live: Boolean(p.demo),
    link: p.demo || p.github,
    aspect: p.reel.aspect,
    poster: base + p.reel.poster,
    video: p.reel.video ? base + p.reel.video : null,
  }));
}

// Display-space (sRGB) colour of a CSS colour string, as [r, g, b] in 0..1.
function cssRGB(str) {
  const c = document.createElement('canvas').getContext('2d');
  c.fillStyle = '#000';
  c.fillStyle = str;
  const hex = c.fillStyle;
  if (hex[0] === '#') return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const m = hex.match(/[\d.]+/g) || [0, 0, 0];
  return m.slice(0, 3).map((v) => +v / 255);
}

export function mountRibbon(container, opts = {}) {
  const { mode = 'free', cards = [], list = null, debug = null } = opts;
  const onOpen = opts.onOpen || ((card) => window.open(card.link, '_blank', 'noopener,noreferrer'));
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = motionQuery.matches;
  const onMotion = (e) => { reduce = e.matches; };
  motionQuery.addEventListener('change', onMotion);

  // Every listener goes through on() so destroy() can remove them all.
  const offs = [];
  const on = (el, type, fn, o) => { el.addEventListener(type, fn, o); offs.push(() => el.removeEventListener(type, fn, o)); };

  /* ───────────── renderer, camera, scene ───────────── */

  const canvas = document.createElement('canvas');
  canvas.className = 'ribbon-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x000000, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 2000);
  camera.position.set(0, 0, CAM_Z);
  const mirrorCam = camera.clone();
  const H = halfHeight();

  const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  blank.needsUpdate = true;
  const clearOverlay = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  clearOverlay.needsUpdate = true;

  // Uniforms shared by every card (and the floor's lean).
  const sheet = {
    u_sheetW: { value: 1 }, u_sheetD: { value: 0 }, u_sheetT: { value: 1 }, u_sheetC: { value: 1 }, u_sheetP: { value: 1 },
    u_sheetV: { value: 0 }, u_leanA: { value: 0 }, u_leanW: { value: 0 }, u_diag: { value: 0 }, u_axis: { value: 0 },
    u_dent: { value: 0.035 }, u_shade: { value: 1 }, u_shadeS: { value: 1 },
  };
  // Theme uniforms (display-space colours). Dark values reproduce the spec exactly.
  const look = {
    u_fadeCol: { value: new THREE.Vector3(0.059, 0.059, 0.059) }, u_fadeMax: { value: 0.8 }, u_ovLate: { value: 0 },
    u_floorBase: { value: new THREE.Vector3(0, 0, 0) }, u_lineCol: { value: new THREE.Vector3(1, 1, 1) }, u_lineA: { value: 0.08 },
    u_contact: { value: 0.55 }, u_reflK: { value: 1 }, u_reflMix: { value: 0 },
  };

  /* ───────────── cards → items (one per project; layout instances may repeat them) ───────────── */

  const items = cards.map((c) => ({
    c,
    aspect: c.aspect,
    uMedia: { value: blank },
    uMediaVideo: { value: 0 },
    uOverlay: { value: clearOverlay },
    uCrop: { value: new THREE.Vector4(0, 0, 1, 1) },
    img: null, imageTex: null, videoTex: null, videoEl: null,
    overlayCanvas: null, overlayTex: null,
    loaded: false, alpha: 0, near: false,
  }));

  const cardGeo = new THREE.PlaneGeometry(1, 1, 96, 24);
  let instances = []; // { card, item, mesh, mat, hover, rect, world }

  function makeCardMesh(item) {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        ...sheet, ...look,
        u_media: item.uMedia, u_mediaVideo: item.uMediaVideo, u_overlay: item.uOverlay, u_crop: item.uCrop,
        u_hover: { value: 0 }, u_res: { value: new THREE.Vector2(1, 1) }, u_corner: { value: 0.05 }, u_alpha: { value: 0 },
      },
      vertexShader: RIBBON + CARD_VERT,
      fragmentShader: RIBBON + CARD_FRAG,
      transparent: true, depthTest: false, depthWrite: false,
      extensions: { derivatives: true },
    });
    const mesh = new THREE.Mesh(cardGeo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = 0;
    scene.add(mesh);
    return { mesh, mat };
  }

  /* ───────────── floor and reflection (desktop only) ───────────── */

  const floorGeo = new THREE.PlaneGeometry(1, 1, 48, 24).rotateX(-Math.PI / 2);
  const reflTarget = new THREE.WebGLRenderTarget(2, 2);
  const floorMat = new THREE.ShaderMaterial({
    uniforms: {
      ...sheet, ...look,
      u_run: { value: 1 }, u_cells: { value: new THREE.Vector2(1, 1) }, u_alpha: { value: 0 }, u_lightX: { value: 0 },
      u_mirrorVP: { value: new THREE.Matrix4() }, u_refl: { value: reflTarget.texture }, u_reflOn: { value: 1 },
    },
    vertexShader: RIBBON + FLOOR_VERT,
    fragmentShader: RIBBON + FLOOR_FRAG,
    transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
    extensions: { derivatives: true },
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.renderOrder = -1;
  floor.frustumCulled = false;
  scene.add(floor);

  // pixel ratio cap: 2, or 1.5 on phones (sharp enough, much lighter to render), landscape phones included; re-read on every layout
  const maxDpr = () => Math.min(devicePixelRatio || 1, window.matchMedia('(max-width: 649px), (pointer: coarse) and (max-width: 950px)').matches ? 1.5 : 2);

  /* ───────────── theme ───────────── */

  let theme = null;
  function setTheme(t) {
    theme = t === 'light' ? 'light' : 'dark';
    if (theme === 'dark') {
      renderer.setClearColor(0x000000, 1);
      look.u_fadeCol.value.set(0.059, 0.059, 0.059); look.u_fadeMax.value = 0.8; look.u_ovLate.value = 0;
      look.u_floorBase.value.set(0, 0, 0); look.u_lineCol.value.set(1, 1, 1); look.u_lineA.value = 0.08;
      look.u_contact.value = 0.55; look.u_reflK.value = 1; look.u_reflMix.value = 0;
    } else {
      // Light: everything settles into the page background (--bg), not near-black.
      const bgCss = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#eef0f2';
      const bg = cssRGB(bgCss);
      renderer.setClearColor(new THREE.Color(bgCss), 1);
      look.u_fadeCol.value.set(...bg); look.u_fadeMax.value = 0.55; look.u_ovLate.value = 1;
      look.u_floorBase.value.set(...bg); look.u_lineCol.value.set(15 / 255, 17 / 255, 21 / 255); look.u_lineA.value = 0.07;
      look.u_contact.value = 0.12; look.u_reflK.value = 0.5; look.u_reflMix.value = 1;
    }
    requestRender();
  }

  /* ───────────── layout ───────────── */

  let vw = 0, vh = 0, W = 1, layout = null, P = null;
  let current = 0, target = 0, pending = 0, progress = 0;
  let fontsReady = false;

  function setCrop(item, mediaAspect) {
    const a = item.aspect;
    let sx = 1, sy = 1;
    if (a > mediaAspect) sy = mediaAspect / a; else sx = a / mediaAspect;
    item.uCrop.value.set((1 - sx) / 2, (1 - sy) / 2, sx, sy);
  }

  function doLayout(initial = false) {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return false;
    vw = w; vh = h;
    renderer.setPixelRatio(maxDpr());
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    W = H * camera.aspect;

    const wasPhone = layout ? layout.phone : null;
    layout = computeLayout(vw, vh, items.map((i) => i.aspect));
    P = sheetParams(layout.phone, W, H);
    for (const key of ['sheetW', 'sheetT', 'sheetC', 'sheetP', 'leanA', 'leanW', 'diag', 'axis', 'dent', 'shade', 'shadeS']) {
      sheet['u_' + key].value = P[key];
    }
    if (mode === 'scroll') { target = layout.start + progress * layout.L1; if (initial || wasPhone !== layout.phone) current = target; pending = 0; }
    else if (initial || wasPhone !== layout.phone) { current = target = layout.start; pending = 0; }

    // (Re)build card meshes when the number of instances changes.
    if (instances.length !== layout.cards.length) {
      instances.forEach((inst) => { scene.remove(inst.mesh); inst.mat.dispose(); });
      instances = layout.cards.map((card) => ({ card, item: items[card.project], hover: 0, rect: null, world: null, ...makeCardMesh(items[card.project]) }));
    }
    const k = (2 * H) / vh;
    instances.forEach((inst, i) => {
      inst.card = layout.cards[i];
      inst.mat.uniforms.u_res.value.set(inst.card.w * k, inst.card.h * k);
      inst.mat.uniforms.u_corner.value = layout.radius / inst.card.h;
    });

    // Floor (spec section 7).
    floor.visible = !layout.phone;
    if (!layout.phone) {
      const cardH = layout.cards[0].h;
      const a = (-cardH * k) / 2 - 0.06 * H;
      const o = 6 * H;
      const near = Math.min(CAM_Z * (1 - Math.abs(a) / H) + 0.2 * H, CAM_Z * 0.8);
      floor.scale.set(W * 2 * 4, 1, near + o);
      floor.position.set(0, a, (near - o) / 2);
      const cell = 0.22 * H;
      floorMat.uniforms.u_cells.value.set((W * 8) / cell, o / cell);
      floorMat.uniforms.u_run.value = o;
      floorMat.uniforms.u_lightX.value = -0.6 * W;
      const m = a - 0.07 * H;
      mirrorCam.copy(camera);
      mirrorCam.position.set(0, 2 * m - camera.position.y, CAM_Z);
      mirrorCam.updateMatrixWorld();
      floorMat.uniforms.u_mirrorVP.value.multiplyMatrices(mirrorCam.projectionMatrix, mirrorCam.matrixWorldInverse);
      const db = renderer.getDrawingBufferSize(new THREE.Vector2());
      reflTarget.setSize(Math.max(2, Math.round(db.x / 2)), Math.max(2, Math.round(db.y / 2)));
    }

    if (fontsReady) items.forEach(paintOverlay);
    return true;
  }

  /* ───────────── overlay: caption + pill (spec section 5) ───────────── */

  function paintOverlay(item, index) {
    const card = layout.cards.find((c) => c.project === index);
    if (!card) return;
    const { U, phone } = layout;
    const s = (2 * maxDpr()) / 1.5;
    const cw = Math.max(2, Math.round(card.w * s));
    const ch = Math.max(2, Math.round(card.h * s));
    const cv = item.overlayCanvas || (item.overlayCanvas = document.createElement('canvas'));
    const resized = cv.width !== cw || cv.height !== ch;
    cv.width = cw; cv.height = ch;
    const g = cv.getContext('2d');
    g.clearRect(0, 0, cw, ch);
    g.save();
    g.scale(cw / card.w, ch / card.h);

    // Bottom scrim so the caption reaches 4.5:1 even over the brightest frames.
    const scrim = g.createLinearGradient(0, card.h * 0.6, 0, card.h);
    scrim.addColorStop(0, 'rgba(0, 0, 0, 0)');
    scrim.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
    g.fillStyle = scrim;
    g.fillRect(0, card.h * 0.6, card.w, card.h * 0.4);

    const fs = (phone ? 16 : 18) * U;
    const inset = (phone ? 10 : 20) * U;
    g.font = `400 ${fs}px "${FONT}", sans-serif`;
    if ('letterSpacing' in g) g.letterSpacing = `${-0.05 * fs}px`;
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#fff';
    g.shadowColor = 'rgba(0, 0, 0, 0.5)';
    g.shadowBlur = 12 * U * s; // shadowBlur ignores the transform
    if (!(debug && debug.noCaption)) g.fillText(item.c.title, inset, card.h - 10 * U - 0.22 * fs);
    g.shadowColor = 'transparent';
    g.shadowBlur = 0;

    const R = 12.5 * U;
    const cx = card.w - inset - R;
    const cy = card.h - 10 * U - R;
    g.fillStyle = '#000';
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    const a = 4.5 * U;
    g.strokeStyle = '#fff'; g.lineWidth = 1.4 * U; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(cx - a, cy); g.lineTo(cx + a, cy);
    if (phone) { g.moveTo(cx + 0.2 * a, cy - 0.8 * a); g.lineTo(cx + a, cy); g.lineTo(cx + 0.2 * a, cy + 0.8 * a); }
    else { g.moveTo(cx, cy - a); g.lineTo(cx, cy + a); }
    g.stroke();
    g.restore();

    // WebGL2 texture storage can't change size: replace the texture when the canvas does.
    if (resized && item.overlayTex) { item.overlayTex.dispose(); item.overlayTex = null; }
    if (!item.overlayTex) {
      const t = new THREE.CanvasTexture(cv);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = maxAniso;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.generateMipmaps = true;
      item.overlayTex = t;
      item.uOverlay.value = t;
    } else {
      item.overlayTex.needsUpdate = true;
    }
  }

  /* ───────────── media: poster first; video (once on screen) swaps in on its first frame ───────────── */

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function setupPoster(item, img) {
    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    tex.needsUpdate = true;
    item.imageTex = tex;
    item.uMedia.value = tex;
    setCrop(item, img.naturalWidth / img.naturalHeight);
  }

  function setupVideo(item) {
    if (reduce || !item.c.video || item.videoEl || destroyed) return;
    const v = document.createElement('video');
    v.crossOrigin = 'anonymous';
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('playsinline', ''); v.setAttribute('muted', '');
    v.preload = 'auto';
    v.src = item.c.video;
    const swap = () => {
      if (item.videoTex || destroyed) return;
      const vt = new THREE.VideoTexture(v);
      vt.colorSpace = THREE.SRGBColorSpace;
      vt.needsUpdate = true; // upload this first frame now, so there is no black flash
      item.videoTex = vt;
      item.uMedia.value = vt;
      item.uMediaVideo.value = 1;
      setCrop(item, v.videoWidth / v.videoHeight);
    };
    if ('requestVideoFrameCallback' in v) v.requestVideoFrameCallback(swap);
    else v.addEventListener('playing', swap, { once: true });
    item.videoEl = v;
  }

  /* ───────────── input (free mode only): wheel, touch, keys (spec section 8) ───────────── */

  function push(d) {
    target += d;
    if (!layout.phone) target = current + Math.tanh((target - current) / vw) * vw;
  }

  let hovered = -1, focusItem = -1;

  if (mode === 'free') {
    let lastWheel = 0, lastBurst = -Infinity;
    on(window, 'wheel', (e) => {
      if (e.ctrlKey) return;
      let d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (e.deltaMode === 1) d *= 16; else if (e.deltaMode === 2) d *= vh;
      const now = performance.now();
      const gapMs = now - lastWheel;
      if (gapMs < 30) lastBurst = now;
      const big = Math.abs(d) >= 40 && gapMs >= 30 && now - lastBurst > 500;
      lastWheel = now;
      if (big) pending += d * 1.25 * 2; else push(d * 1.25);
    }, { passive: true });

    let touchY = null, lastTouchDelta = 0;
    on(window, 'touchstart', (e) => { touchY = e.touches[0].clientY; lastTouchDelta = 0; }, { passive: true });
    on(window, 'touchmove', (e) => {
      if (touchY === null) return;
      const y = e.touches[0].clientY;
      lastTouchDelta = touchY - y;
      touchY = y;
      push(lastTouchDelta * 3.25);
    }, { passive: true });
    on(window, 'touchend', () => { if (touchY !== null) push(lastTouchDelta * 35); touchY = null; lastTouchDelta = 0; }, { passive: true });

    on(window, 'keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const onControl = e.target instanceof Element && e.target.closest('a, button');
      let d = null;
      switch (e.key) {
        case 'ArrowDown': case 'ArrowRight': d = 100; break;
        case 'ArrowUp': case 'ArrowLeft': d = -100; break;
        case 'PageDown': d = 0.9 * vh; break;
        case 'PageUp': d = -0.9 * vh; break;
        case ' ': if (onControl) return; d = (e.shiftKey ? -1 : 1) * 0.9 * vh; break;
        case 'Enter': {
          if (onControl) return; // links handle their own Enter
          const inst = instances[hovered] || centreInstance();
          if (inst) { e.preventDefault(); onOpen(inst.item.c); }
          return;
        }
        default: return;
      }
      e.preventDefault();
      push(d);
    });
  }

  /* ───────────── hover + click picking (CPU outline, spec section 9) ───────────── */

  const pointer = { x: 9, y: 9, inside: false };
  const v3 = new THREE.Vector3();
  const toNdc = (e) => { const r = container.getBoundingClientRect(); return [((e.clientX - r.left) / vw) * 2 - 1, -((e.clientY - r.top) / vh) * 2 + 1]; };

  on(container, 'pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    [pointer.x, pointer.y] = toNdc(e);
    pointer.inside = true;
  });
  on(container, 'pointerleave', () => { pointer.x = pointer.y = 9; pointer.inside = false; });

  function pick(nx, ny) {
    let best = -1, bestZ = -Infinity;
    instances.forEach((inst, i) => {
      if (!inst.world || inst.item.alpha <= 0) return;
      const r = inst.rect;
      const pos = layout.phone ? r.y : r.x, size = layout.phone ? r.h : r.w;
      if (pos + size < -0.5 * layout.span || pos > 1.5 * layout.span) return;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, zs = 0;
      for (const [x, y, z] of outline(inst.world, P)) {
        v3.set(x, y, z).project(camera);
        x0 = Math.min(x0, v3.x); x1 = Math.max(x1, v3.x); y0 = Math.min(y0, v3.y); y1 = Math.max(y1, v3.y); zs += z;
      }
      if (nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1 && zs > bestZ) { best = i; bestZ = zs; }
    });
    return best;
  }

  function centreInstance() {
    let best = null, bestD = Infinity;
    for (const inst of instances) {
      if (!inst.rect) continue;
      const c = layout.phone ? inst.rect.y + inst.rect.h / 2 : inst.rect.x + inst.rect.w / 2;
      const d = Math.abs(c - layout.span / 2);
      if (d < bestD) { bestD = d; best = inst; }
    }
    return best;
  }

  // A click/tap opens a card only if it is a real tap: it moved under TAP_MOVE px (at any
  // point, not just start to end), lasted under TAP_MS, and the ribbon was not still gliding
  // from an earlier fling when the finger or button went down.
  const TAP_MOVE = 8;     // px
  const TAP_MS = 300;     // ms
  const GLIDE_PX = 2;     // |target - current| above this means the ribbon is still moving
  let gesture = null;
  on(canvas, 'pointerdown', (e) => {
    gesture = { x: e.clientX, y: e.clientY, t: performance.now(), up: Infinity, moved: 0, gliding: Math.abs(target - current) + Math.abs(pending) > GLIDE_PX };
  });
  on(canvas, 'pointermove', (e) => {
    if (gesture && gesture.up === Infinity) gesture.moved = Math.max(gesture.moved, Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y));
  });
  on(canvas, 'pointerup', () => { if (gesture) gesture.up = performance.now(); });
  on(canvas, 'pointercancel', () => { gesture = null; });
  on(canvas, 'click', (e) => {
    const g = gesture;
    gesture = null;
    if (!g) return;
    const moved = Math.max(g.moved, Math.hypot(e.clientX - g.x, e.clientY - g.y));
    const held = (g.up === Infinity ? performance.now() : g.up) - g.t;
    if (moved >= TAP_MOVE || held >= TAP_MS || g.gliding) return;
    const i = pick(...toNdc(e));
    if (i >= 0) onOpen(instances[i].item.c);
  });

  /* ───────────── screen-reader list (real links) ───────────── */

  // Ribbon position that centres the nearest copy of item i.
  function centreTarget(i) {
    let best = null;
    for (const inst of instances) {
      if (inst.card.project !== i) continue;
      const size = layout.phone ? inst.card.h : inst.card.w;
      const t0 = inst.card.base - (layout.span - size) / 2;
      const t = t0 + Math.round((current - t0) / layout.L) * layout.L;
      if (best === null || Math.abs(t - current) < Math.abs(best - current)) best = t;
    }
    return best;
  }
  // Scroll progress (0..1) at which item i is centred.
  function progressFor(i) {
    const inst = instances.find((x) => x.card.project === i);
    if (!inst) return 0;
    const size = layout.phone ? inst.card.h : inst.card.w;
    const t0 = inst.card.base - (layout.span - size) / 2;
    const L1 = layout.L1;
    return ((((t0 - layout.start) % L1) + L1) % L1) / L1;
  }

  const listNodes = [];
  if (list) {
    items.forEach((item, i) => {
      const art = document.createElement('article');
      const h = document.createElement(opts.listHeading || 'h2');
      const a = document.createElement('a');
      a.href = item.c.link; a.target = '_blank'; a.rel = 'noreferrer';
      a.textContent = item.c.live ? item.c.title : `${item.c.title} (code on GitHub)`;
      const p = document.createElement('p');
      p.textContent = item.c.tagline;
      h.appendChild(a); art.append(h, p); list.appendChild(art);
      listNodes.push(art);
      on(a, 'focus', () => {
        focusItem = i;
        if (mode === 'scroll') opts.onFocusCard?.(i, progressFor(i));
        else { const t = centreTarget(i); if (t !== null) { target = t; pending = 0; } }
        requestRender();
      });
      on(a, 'blur', () => { if (focusItem === i) focusItem = -1; });
    });
  }

  /* ───────────── frame loop (only while on screen and the tab is visible) ───────────── */

  let raf = 0, last = performance.now(), readyAt = -1, onScreen = false, destroyed = false, lastR = 0, lastCentre = -1;
  const mirrorVP = floorMat.uniforms.u_mirrorVP.value;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Pending wheel flicks ease in.
    if (pending !== 0) {
      if (Math.abs(pending) < 0.05) { push(pending); pending = 0; }
      else { const step = pending * (1 - Math.pow(1 - 0.22, Math.min(dt * 60, 4))); push(step); pending -= step; }
    }

    const ratio = Math.min(dt * 60, 2);
    if (reduce) current = target;
    else current = Math.round((current + (target - current) * 0.1 * ratio) * 100) / 100;

    const t = Math.tanh((target - current) / (layout.phone ? 245 : 550));
    const vel = t * Math.abs(t);
    const r = reduce ? 0 : Math.min(1, Math.abs(vel));
    lastR = r;
    applySpeed(P, r, W, H);
    sheet.u_sheetD.value = P.sheetD;
    sheet.u_sheetV.value = P.sheetV;

    // Place cards; work out which projects are near the screen.
    items.forEach((it) => { it.near = false; });
    for (const inst of instances) {
      inst.rect = place(layout, inst.card, current, vw, vh);
      inst.world = rectToWorld(inst.rect, vw, vh, H);
      inst.mesh.position.set(inst.world.cx, inst.world.cy, 0);
      inst.mesh.scale.set(inst.world.sw, inst.world.sh, 1);
      const pos = layout.phone ? inst.rect.y : inst.rect.x;
      const size = layout.phone ? inst.rect.h : inst.rect.w;
      if (pos + size > -0.5 * layout.span && pos < 1.5 * layout.span) inst.item.near = true;
    }

    // Hover (desktop pointer, not with reduced motion); keyboard focus shows the same dent.
    const canHover = !layout.phone && !reduce;
    hovered = canHover && pointer.inside ? pick(pointer.x, pointer.y) : -1;
    canvas.style.cursor = hovered >= 0 ? 'pointer' : '';
    const centre = centreInstance();
    let focusInst = -1;
    if (focusItem >= 0 && !reduce && centre && centre.card.project === focusItem) focusInst = instances.indexOf(centre);
    instances.forEach((inst, i) => {
      const goal = i === hovered || i === focusInst ? 1 : 0;
      const rate = goal > inst.hover ? 8 : 6;
      inst.hover += (goal - inst.hover) * (1 - Math.exp(-rate * dt));
      inst.mat.uniforms.u_hover.value = reduce ? 0 : inst.hover;
    });
    const centreProject = centre ? centre.card.project : -1;
    if (centreProject !== lastCentre) { lastCentre = centreProject; opts.onCentre?.(centreProject); }

    // Fades.
    for (const it of items) if (it.loaded && it.overlayTex && it.alpha < 1) it.alpha = Math.min(1, it.alpha + dt / 0.6);
    for (const inst of instances) inst.mat.uniforms.u_alpha.value = inst.item.alpha;
    if (readyAt >= 0) floorMat.uniforms.u_alpha.value = Math.min(0.9, ((now - readyAt) / 800) * 0.9);

    // Videos play only near the screen (the loop itself only runs while on screen and visible).
    for (const it of items) {
      const v = it.videoEl;
      if (!v) continue;
      const play = it.loaded && it.near && !document.hidden;
      if (play && v.paused) v.play().catch(() => {});
      else if (!play && !v.paused) v.pause();
    }

    // Reflection pass (desktop): cards only, from the mirrored camera, at half resolution.
    if (!layout.phone && !(debug && debug.noRefl)) {
      floor.visible = false;
      renderer.setRenderTarget(reflTarget);
      renderer.render(scene, mirrorCam);
      renderer.setRenderTarget(null);
      floor.visible = true;
      mirrorVP.multiplyMatrices(mirrorCam.projectionMatrix, mirrorCam.matrixWorldInverse);
    }
    renderer.render(scene, camera);
  }

  const shouldRun = () => onScreen && !document.hidden && !destroyed && layout !== null;
  function startLoop() {
    if (raf || !shouldRun()) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stopLoop() {
    cancelAnimationFrame(raf);
    raf = 0;
    items.forEach((it) => it.videoEl && !it.videoEl.paused && it.videoEl.pause());
  }
  function syncLoop() { if (shouldRun()) startLoop(); else stopLoop(); }
  // Make sure a change shows even if the loop was idle (it only runs while on screen anyway).
  function requestRender() { if (!raf && shouldRun()) startLoop(); }

  on(document, 'visibilitychange', syncLoop);

  const io = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    // Scroll mode: if the page left the band while the ribbon was still easing (a fast flick),
    // settle it now, so coming back never replays stale catch-up motion.
    if (!onScreen && mode === 'scroll') { current = target; pending = 0; }
    if (onScreen) items.forEach((it) => it.loaded && setupVideo(it));
    syncLoop();
  });
  io.observe(container);

  let resizeTimer = 0, sized = false;
  const ro = new ResizeObserver(() => {
    if (!sized) { sized = doLayout(true); syncLoop(); return; }
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => doLayout(), 100);
  });
  ro.observe(container);

  /* ───────────── boot (spec section 10) ───────────── */

  let readyCalled = false;
  function markReady() {
    if (readyCalled) return;
    readyCalled = true;
    readyAt = performance.now();
    opts.onReady?.();
  }

  setTheme(opts.theme || 'dark');
  sized = doLayout(true);

  let failsafe = setTimeout(markReady, 8000);
  (async () => {
    // Wait for Inter Tight at most 3 s; if it arrives later, repaint every caption with it.
    const font = document.fonts.load(`400 18px "${FONT}"`).then(() => document.fonts.check(`400 18px "${FONT}"`)).catch(() => false);
    let fontLate = false;
    const fontCapped = Promise.race([font, new Promise((r) => setTimeout(() => { fontLate = true; r(false); }, 3000))]);
    font.then((ok) => { if (ok && fontLate && fontsReady && !destroyed && layout) items.forEach(paintOverlay); });
    try {
      const [, ...imgs] = await Promise.all([fontCapped, ...items.map((it) => loadImage(it.c.poster))]);
      if (destroyed) return;
      fontsReady = true;
      items.forEach((it, i) => {
        setupPoster(it, imgs[i]);
        if (layout) paintOverlay(it, i);
        it.loaded = true;
        if (onScreen) setupVideo(it);
      });
    } catch (err) {
      console.warn('Showreel media failed to load', err);
    } finally {
      clearTimeout(failsafe);
      if (!destroyed) markReady();
    }
  })();

  /* ───────────── API ───────────── */

  function setScrollProgress(p) {
    progress = Math.min(1, Math.max(0, p));
    if (mode !== 'scroll' || !layout) return;
    target = layout.start + progress * layout.L1;
    pending = 0;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stopLoop();
    clearTimeout(failsafe); clearTimeout(resizeTimer);
    io.disconnect(); ro.disconnect();
    offs.forEach((off) => off());
    motionQuery.removeEventListener('change', onMotion);
    items.forEach((it) => {
      it.imageTex?.dispose(); it.videoTex?.dispose(); it.overlayTex?.dispose();
      if (it.videoEl) { it.videoEl.pause(); it.videoEl.removeAttribute('src'); it.videoEl.load(); }
    });
    instances.forEach((inst) => { scene.remove(inst.mesh); inst.mat.dispose(); });
    cardGeo.dispose(); floorGeo.dispose(); floorMat.dispose(); reflTarget.dispose();
    blank.dispose(); clearOverlay.dispose();
    renderer.dispose();
    renderer.forceContextLoss?.();
    canvas.remove();
    listNodes.forEach((n) => n.remove());
  }

  // State for tests (used only when the page passes ?debug).
  const state = {
    get current() { return current; },
    get target() { return target; },
    get r() { return lastR; },
    get theme() { return theme; },
    get ready() { return readyCalled; },
    get running() { return raf !== 0; },
    get onScreen() { return onScreen; },
    get layout() { return layout && { phone: layout.phone, L: layout.L, L1: layout.L1, span: layout.span, reps: layout.reps, cards: layout.cards.length, start: layout.start }; },
    get cards() {
      return instances.map((inst, i) => ({ i, project: inst.card.project, id: inst.item.c.id, link: inst.item.c.link, rect: inst.rect, hover: inst.hover, alpha: inst.item.alpha }));
    },
    get media() {
      return items.map((it) => ({ id: it.c.id, kind: it.uMedia.value === it.videoTex && it.videoTex ? 'video' : it.uMedia.value === it.imageTex && it.imageTex ? 'poster' : 'none', hasVideo: !!it.videoEl, paused: it.videoEl ? it.videoEl.paused : null, near: it.near, readyState: it.videoEl ? it.videoEl.readyState : null }));
    },
    centreOnInstance(i) {
      const inst = instances[i];
      const size = layout.phone ? inst.card.h : inst.card.w;
      const t0 = inst.card.base - (layout.span - size) / 2;
      target = t0 + Math.round((current - t0) / layout.L) * layout.L;
      pending = 0;
    },
    progressFor,
  };

  return { setScrollProgress, setTheme, destroy, state };
}
