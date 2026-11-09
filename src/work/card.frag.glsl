uniform sampler2D u_media;
uniform float u_mediaVideo; // three.js stores video frames still sRGB-encoded (no hardware decode)
uniform sampler2D u_overlay;
uniform vec4 u_crop;
uniform vec2 u_res;
uniform float u_axis;
uniform float u_dent;
uniform float u_hover;
uniform float u_shade;
uniform float u_shadeS;
uniform float u_corner;
uniform float u_alpha;
uniform vec3 u_fadeCol;   // theme: colour receding parts fade toward (display space)
uniform float u_fadeMax;  // theme: strongest fade (dark 0.8, light 0.55)
uniform float u_ovLate;   // theme: 1 = caption/scrim drawn after the fade + light (light theme keeps 4.5:1)

varying vec2 vUv;
varying float vWx;
varying vec3 vPos;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  // 1. Media (cover crop) with the caption/pill overlay on top.
  vec3 media = texture2D(u_media, u_crop.xy + vUv * u_crop.zw).rgb;
  vec3 rgb = u_mediaVideo > 0.5 ? media : toDisplay(media);
  vec4 ov = texture2D(u_overlay, vUv);
  if (u_ovLate < 0.5) rgb = mix(rgb, toDisplay(ov.rgb), ov.a);

  vec2 qd = 2.0 * vUv - 1.0;
  float dome = (1.0 - qd.x * qd.x) * (1.0 - qd.y * qd.y);

  // 2. Depth fade: receding parts sink toward near-black (dark) or the page colour (light).
  float D = max(u_sheetD, 1e-4);
  float depth = clamp((D - sheetZ(vWx)) / (2.0 * D), 0.0, 1.0);
  depth = clamp(depth + u_hover * dome * 0.35, 0.0, 1.0);
  rgb = mix(rgb, u_fadeCol, u_shade * u_fadeMax * pow(depth, u_shadeS));

  // 3. Lighting from analytic slopes (in sheet space, then back to world).
  float q = sheetQ(vWx);
  float dzdx = -u_sheetD * sheetSlope(q) * u_sheetT / u_sheetW;
  if (u_leanW > 0.0) dzdx += (u_leanA / u_leanW) * leanSlope(vWx / u_leanW);
  float dentK = u_hover * u_dent * u_res.y;
  vec2 dDome = vec2(-4.0 * qd.x * (1.0 - qd.y * qd.y) / u_res.x, -4.0 * qd.y * (1.0 - qd.x * qd.x) / u_res.y);
  vec2 dDent = -dentK * dDome; // card-local x/y; swap on phones to match sheet space
  if (u_axis > 0.5) dDent = dDent.yx;
  vec3 n = normalize(vec3(-(dzdx + dDent.x), -dDent.y, 1.0));
  float a = sheetRoll(vWx);
  float c = cos(a), s = sin(a);
  n.yz = vec2(n.y * c - n.z * s, n.y * s + n.z * c);
  if (u_axis > 0.5) n.xy = n.yx;

  vec3 L = normalize(vec3(-0.4, 0.5, 1.0));
  rgb *= 1.0 - 0.12 * (1.0 - (dot(n, L) * 0.5 + 0.5));
  vec3 V = normalize(cameraPosition - vPos);
  vec3 Hh = normalize(L + V);
  rgb += pow(max(dot(n, Hh), 0.0), 48.0) * 0.35;

  if (u_ovLate > 0.5) rgb = mix(rgb, toDisplay(ov.rgb), ov.a);

  // 4. Rounded corners (card space: aspect x 1).
  float aspect = u_res.x / u_res.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float d = roundBox(p, vec2(aspect, 1.0) * 0.5, u_corner);
  float fw = fwidth(d);
  float alpha = 1.0 - smoothstep(-fw, fw, d);

  // 5. Fade-in.
  gl_FragColor = vec4(toLinear(clamp(rgb, 0.0, 1.0)), alpha * u_alpha);
  #include <colorspace_fragment>
}
