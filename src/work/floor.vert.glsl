uniform float u_run;

varying vec2 vUv;
varying float vFar;
varying vec3 vPos;

void main() {
  vUv = uv;
  vec3 w = (modelMatrix * vec4(position, 1.0)).xyz;
  vFar = -w.z / u_run;
  w.z += leanZ(w.x); // the floor turns with the ribbon
  vPos = w;
  gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
}
