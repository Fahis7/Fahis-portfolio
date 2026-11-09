uniform float u_diag;
uniform float u_axis;
uniform float u_dent;
uniform float u_hover;
uniform vec2 u_res;

varying vec2 vUv;
varying float vWx;
varying vec3 vPos;

void main() {
  vUv = uv;
  vec3 p = position;

  // 1. Hover dent: push the middle of the card back.
  vec2 qd = 2.0 * uv - 1.0;
  float dome = (1.0 - qd.x * qd.x) * (1.0 - qd.y * qd.y);
  p.z -= u_hover * u_dent * u_res.y * dome;

  // 2. To world space.
  vec3 w = (modelMatrix * vec4(p, 1.0)).xyz;

  // 3. Phone: the same ribbon runs down y.
  if (u_axis > 0.5) w.xy = w.yx;
  float x = w.x;
  float sx = x / u_sheetW;

  // 4. Wind: resting bank plus the velocity wring at the edges.
  float a = sheetRoll(x);
  if (u_sheetV > 0.0) a += VTWIST * u_sheetV * smoothstep(0.3, 0.9, abs(sx)) * sign(sx);
  float c = cos(a), s = sin(a);
  w.yz = vec2(w.y * c - w.z * s, w.y * s + w.z * c);

  // 5. Bend.
  w.z += u_sheetP * sheetZ(x);

  // 6. Diagonal climb and rear lift while moving.
  w.y += u_diag * x;
  if (u_sheetV > 0.0) {
    float m = 1.0 - smoothstep(-1.0, 0.3, sx);
    w.y += REAR_Y * u_sheetW * u_sheetV * m;
    w.z += REAR_Z * u_sheetW * u_sheetV * m;
  }

  // 7. Lean ("door").
  w.z += leanZ(x);

  vWx = x;
  if (u_axis > 0.5) w.xy = w.yx;
  vPos = w;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
