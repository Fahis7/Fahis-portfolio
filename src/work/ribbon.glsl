// Shared ribbon functions (prepended to the card and floor shaders). Mirrors sheet.js.
#define PI 3.141592653589793
#define BANK -0.16
#define REAR_Y 0.1
#define REAR_Z 0.2
#define VTWIST 1.8
#define TAIL 1.0
#define SHIFT -0.2

uniform float u_sheetW;
uniform float u_sheetD;
uniform float u_sheetT;
uniform float u_sheetC;
uniform float u_sheetP;
uniform float u_sheetV;
uniform float u_leanA;
uniform float u_leanW;

float sheetQ(float wx) { return wx / u_sheetW * u_sheetT + SHIFT; }

float sheetShape(float q) {
  return mix(1.0 - q * q, sin(PI * q), u_sheetC) * exp(-TAIL * q * q);
}

float sheetSlope(float q) {
  float bowl = -2.0 * q * (1.0 + TAIL * (1.0 - q * q));
  float ess = PI * cos(PI * q) - 2.0 * TAIL * q * sin(PI * q);
  return mix(bowl, ess, u_sheetC) * exp(-q * q);
}

float sheetZ(float wx) { return -u_sheetD * sheetShape(sheetQ(wx)); }
float sheetRoll(float wx) { return BANK * sheetSlope(sheetQ(wx)) / PI * u_sheetC; }

float leanRamp(float s) { s = clamp(s, -1.0, 1.0); return s * (1.5 - 0.5 * s * s); }
float leanSlope(float s) { float a = min(abs(s), 1.0); return 1.5 * (1.0 - a * a); }
// Shading runs on display (sRGB-encoded) values, as the spec's numbers describe what is seen:
// "8% white" hairlines, #000 tints, 0.059 grey. Textures decode to linear on sampling and the
// renderer re-encodes on output, so convert in and out around the maths.
vec3 toDisplay(vec3 c) { c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
vec3 toLinear(vec3 c) { c = max(c, 0.0); return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c)); }

float leanZ(float wx) { return u_leanW > 0.0 ? u_leanA * leanRamp(wx / u_leanW) : 0.0; }
