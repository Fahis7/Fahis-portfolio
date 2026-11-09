uniform vec2 u_cells;
uniform float u_alpha;
uniform float u_lightX;
uniform mat4 u_mirrorVP;
uniform sampler2D u_refl;
uniform float u_reflOn;
// theme (display space); dark values reproduce the spec exactly
uniform vec3 u_floorBase;
uniform vec3 u_lineCol;
uniform float u_lineA;
uniform float u_contact;
uniform float u_reflK;
uniform float u_reflMix;

varying vec2 vUv;
varying float vFar;
varying vec3 vPos;

void main() {
  float fade = 1.0 - smoothstep(0.2, 0.95, vFar);
  vec3 col = mix(u_floorBase, u_floorBase, smoothstep(0.0, 0.8, vFar));
  col *= 1.0 - u_contact * exp(-14.0 * abs(vFar));

  // Hairline grid: 8% white (dark) or 7% ink (light).
  vec2 g = vec2(vUv.x * u_cells.x, vFar * u_cells.y);
  vec2 fw = 1.5 * fwidth(g);
  vec2 l = 1.0 - smoothstep(vec2(0.0), fw, abs(fract(g) - 0.5));
  float line = max(l.x, l.y);
  col = mix(col, u_lineCol, line * u_lineA * fade);

  // Reflection of the cards, on the lines only.
  if (u_reflOn > 0.5) {
    vec3 wp = vPos;
    wp.x -= (wp.x - u_lightX) * 0.35 * abs(vFar);
    vec4 clip = u_mirrorVP * vec4(wp, 1.0);
    vec2 ruv = clip.xy / clip.w * 0.5 + 0.5;
    vec2 e = smoothstep(0.0, 0.1, ruv) * smoothstep(0.0, 0.1, 1.0 - ruv);
    float edges = e.x * e.y * step(0.0, clip.w);
    float weight = vFar > 0.0 ? exp(-6.0 * vFar) : exp(2.2 * vFar);
    vec3 refl = toDisplay(texture2D(u_refl, ruv).rgb);
    if (u_reflMix > 0.5) col = mix(col, refl, line * 0.5 * weight * edges * fade * u_reflK);
    else col += refl * line * 0.5 * weight * edges * fade * u_reflK;
  }

  gl_FragColor = vec4(toLinear(clamp(col, 0.0, 1.0)), u_alpha * fade);
  #include <colorspace_fragment>
}
