uniform vec2 u_cells;
uniform float u_alpha;
uniform float u_lightX;
uniform mat4 u_mirrorVP;
uniform sampler2D u_refl;
uniform float u_reflOn;

varying vec2 vUv;
varying float vFar;
varying vec3 vPos;

void main() {
  float fade = 1.0 - smoothstep(0.2, 0.95, vFar);
  vec3 col = mix(vec3(0.0), vec3(0.0), smoothstep(0.0, 0.8, vFar));
  col *= 1.0 - 0.55 * exp(-14.0 * abs(vFar));

  // Hairline grid at 8% white.
  vec2 g = vec2(vUv.x * u_cells.x, vFar * u_cells.y);
  vec2 fw = 1.5 * fwidth(g);
  vec2 l = 1.0 - smoothstep(vec2(0.0), fw, abs(fract(g) - 0.5));
  float line = max(l.x, l.y);
  col += line * 0.08 * fade;

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
    col += refl * line * 0.5 * weight * edges * fade;
  }

  gl_FragColor = vec4(toLinear(clamp(col, 0.0, 1.0)), u_alpha * fade);
  #include <colorspace_fragment>
}
