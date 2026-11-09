// Ribbon maths shared by the renderer, CPU picking and the seam test.
// Mirrors card.vert.glsl exactly (see docs/ribbon-spec.md, sections 3, 4 and 6).

export const FOV = 53.4;
export const CAM_Z = 41.18;
export const PHONE_MAX = 649;

export const BANK = -0.16;
export const REAR_Y = 0.1;
export const REAR_Z = 0.2;
export const VTWIST = 1.8;
export const TAIL = 1.0;
export const SHIFT = -0.2;
export const SPAN = 1.15;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const halfHeight = () => Math.tan((FOV / 2) * Math.PI / 180) * CAM_Z;

// q(wx) = wx / W * T + SHIFT
export const q = (wx, P) => (wx / P.sheetW) * P.sheetT + SHIFT;

export function shape(qv, C) {
  return (C * Math.sin(Math.PI * qv) + (1 - C) * (1 - qv * qv)) * Math.exp(-TAIL * qv * qv);
}

export function shapeSlope(qv, C) {
  const bowl = -2 * qv * (1 + TAIL * (1 - qv * qv));
  const ess = Math.PI * Math.cos(Math.PI * qv) - 2 * TAIL * qv * Math.sin(Math.PI * qv);
  return (C * ess + (1 - C) * bowl) * Math.exp(-qv * qv);
}

export const zOf = (wx, P) => -P.sheetD * shape(q(wx, P), P.sheetC);
export const roll = (wx, P) => (BANK * shapeSlope(q(wx, P), P.sheetC) / Math.PI) * P.sheetC;
export const ramp = (s) => { const c = clamp(s, -1, 1); return c * (1.5 - 0.5 * c * c); };

// Deform a world-space point (after the model matrix) exactly like the vertex shader (steps 3 to 7).
export function deform(px, py, pz, P) {
  let x = px, y = py, z = pz;
  if (P.axis) { const t = x; x = y; y = t; }
  const W = P.sheetW;
  let a = roll(x, P);
  if (P.sheetV > 0) a += VTWIST * P.sheetV * smoothstep(0.3, 0.9, Math.abs(x / W)) * Math.sign(x / W);
  const c = Math.cos(a), s = Math.sin(a);
  const y2 = y * c - z * s, z2 = y * s + z * c;
  y = y2; z = z2;
  z += P.sheetP * zOf(x, P);
  y += P.diag * x;
  if (P.sheetV > 0) {
    const m = 1 - smoothstep(-1, 0.3, x / W);
    y += REAR_Y * W * P.sheetV * m;
    z += REAR_Z * W * P.sheetV * m;
  }
  if (P.leanW > 0) z += P.leanA * ramp(x / P.leanW);
  if (P.axis) { const t = x; x = y; y = t; }
  return [x, y, z];
}

// Per-mode constant uniforms (spec section 6 table). D and V are set per frame.
export function sheetParams(phone, W, H) {
  return phone
    ? { phone, sheetW: H, sheetD: 0, sheetT: 1, sheetC: 0, sheetP: 1, sheetV: 0, leanA: 0, leanW: 0, diag: 0, axis: 1, dent: 0.035, shade: 0, shadeS: 0.6 }
    : { phone, sheetW: W, sheetD: 0, sheetT: SPAN, sheetC: 1, sheetP: 1, sheetV: 0, leanA: W * -0.12, leanW: W, diag: 0.03, axis: 0, dent: 0.035, shade: 1, shadeS: 1 };
}

// Bend depth D and wring V from the normalised speed r (spec section 8).
export function applySpeed(P, r, W, H) {
  if (P.phone) { P.sheetD = H * 0.18 * 1.1 * r; P.sheetV = 0; }
  else { P.sheetD = W * 0.2 * (1 + 1.1 * r); P.sheetV = r; }
}

/*
  Layout (spec section 4). `aspects` = one entry per project, in data.js order.
  If one pass of the list is too short for the wrap seam to stay off-screen
  (L must cover the viewport plus a full card on each side, plus a margin for the
  3D bend), the list is repeated. Each instance remembers its project index.
*/
export function computeLayout(vw, vh, aspects) {
  const phone = vw <= PHONE_MAX;
  const U = phone ? vw / 390 : vw / 1500;
  const sizes = aspects.map((a) => {
    if (phone) { const w = vw - 40 * U; return { w, h: w / a }; }
    const h = Math.min(0.435 * vh, 550 * U);
    return { w: h * a, h };
  });
  const gap = phone ? 20 * U : 10 * U;
  const along = (s) => (phone ? s.h : s.w);
  const L1 = sizes.reduce((sum, s) => sum + along(s) + gap, 0);
  const span = phone ? vh : vw;
  const maxSize = Math.max(...sizes.map(along));
  const need = span + 2 * maxSize + (phone ? 0.5 : 0.25) * span;
  const reps = Math.max(1, Math.ceil(need / L1));

  const cards = [];
  let base = 0;
  for (let r = 0; r < reps; r++) {
    sizes.forEach((s, i) => { cards.push({ project: i, w: s.w, h: s.h, base }); base += along(s) + gap; });
  }
  const L = base;
  const lo = -(L - span) / 2;
  return {
    phone, U, gap, L, L1, reps, span, lo, cards,
    radius: (phone ? 15 : 20) * U,
    start: phone ? -0.177 * vh : 100,
  };
}

// CSS-px rect of a card for a given scroll position `current`.
export function place(layout, card, current, vw, vh) {
  const { phone, L, lo } = layout;
  let pos = card.base - current;
  pos = lo + ((((pos - lo) % L) + L) % L);
  return phone
    ? { x: (vw - card.w) / 2, y: pos, w: card.w, h: card.h, pos }
    : { x: pos, y: (vh - card.h) / 2, w: card.w, h: card.h, pos };
}

// CSS rect → world-space plane centre and size on z = 0 (spec section 3).
export function rectToWorld(r, vw, vh, H) {
  const k = (2 * H) / vh;
  return { cx: (r.x + r.w / 2 - vw / 2) * k, cy: -(r.y + r.h / 2 - vh / 2) * k, sw: r.w * k, sh: r.h * k };
}

// Deformed outline (5 columns × top and bottom edges) of a card, in world space.
export function outline(world, P) {
  const pts = [];
  for (let i = 0; i <= 4; i++) {
    const x = world.cx + (i / 4 - 0.5) * world.sw;
    for (const e of [-0.5, 0.5]) pts.push(deform(x, world.cy + e * world.sh, 0, P));
  }
  return pts;
}
