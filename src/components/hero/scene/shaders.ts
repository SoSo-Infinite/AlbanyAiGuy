/** Window grids, sky, and water. Included by the client scene only. */

export const WINDOW_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormalW;
#include <fog_pars_vertex>
void main() {
  vUv = uv;
  vec3 transformed = vec3(position);
  #ifdef USE_INSTANCING
    vec4 worldPosition = modelMatrix * instanceMatrix * vec4(transformed, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  #else
    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
  #endif
  vWorld = worldPosition.xyz;
  #include <project_vertex>
  #include <fog_vertex>
}
`;

export const WINDOW_FRAG = /* glsl */ `
uniform float uTime;
uniform float uWave;
uniform vec3 uWaveOrigin;
uniform vec2 uGrid;
uniform vec3 uFacade;
uniform vec3 uGold;
uniform vec3 uCyan;
uniform float uSeed;
uniform float uKind;
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormalW;
#include <fog_pars_fragment>

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 col = uFacade * (0.82 + 0.22 * vUv.y);
  float roofFace = step(0.72, abs(vNormalW.y));
  vec2 cell = floor(vUv * uGrid);
  vec2 f = fract(vUv * uGrid);
  float inWin = 0.0;
  if (uKind < 0.5) {
    float m = 0.18;
    inWin = step(m, f.x) * step(f.x, 1.0 - m) * step(m, f.y) * step(f.y, 1.0 - m);
    inWin *= step(0.5, cell.y) * step(cell.y, uGrid.y - 1.5);
    inWin *= 1.0 - roofFace;
    if (roofFace > 0.5) col = uFacade * 0.45;
  } else {
    float rows = 7.0;
    float cols = 14.0;
    cell = floor(vec2(vUv.x * cols, vUv.y * rows));
    vec2 ef = fract(vec2(vUv.x * cols, vUv.y * rows));
    float band = smoothstep(0.18, 0.28, vUv.y) * smoothstep(0.86, 0.72, vUv.y);
    inWin = band * step(0.2, ef.x) * step(ef.x, 0.8) * step(0.32, ef.y) * step(ef.y, 0.72);
  }
  vec2 seedCell = cell + vec2(uSeed, uSeed * 0.37);
  float h = hash(seedCell);
  float lit = step(0.4, h);
  float freq = 0.12 + h * 0.22;
  float flick = 0.64 + 0.36 * sin(uTime * freq * 6.28318 + hash(seedCell + 3.0) * 6.28318);
  float does = step(0.76, hash(seedCell + 9.0));
  float glowAmt = mix(1.0, flick, does);
  vec3 warm = mix(uGold, uCyan, step(0.73, h));
  float dist = distance(vWorld, uWaveOrigin);
  float radius = max(uWave, 0.0) * 11.0;
  float waveBand = exp(-abs(dist - radius) * 1.5) * step(0.0, uWave);
  float waveLit = waveBand * step(0.2, hash(seedCell + 1.7));
  vec3 win = warm * (0.45 + 0.7 * glowAmt * lit);
  win += warm * waveLit * 1.25;
  float mask = clamp(inWin * max(lit, waveLit), 0.0, 1.0);
  col = mix(col, win, mask);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float rim = pow(1.0 - max(dot(normalize(vNormalW), viewDir), 0.0), 2.5);
  col += vec3(0.06, 0.1, 0.18) * rim * (1.0 - roofFace);
  gl_FragColor = vec4(col, 1.0);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`;

export const SKY_VERT = /* glsl */ `
varying vec3 vDir;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vDir = worldPos.xyz - cameraPosition;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const SKY_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uMoon;
varying vec3 vDir;
vec3 toLinear(vec3 c) {
  return pow(max(c, vec3(0.0)), vec3(2.2));
}

void main() {
  vec3 dir = normalize(vDir);
  vec3 top = vec3(0.016, 0.028, 0.055);
  vec3 mid = vec3(0.035, 0.06, 0.12);
  vec3 hor = vec3(0.07, 0.11, 0.18);
  float up = dir.y;
  vec3 col = mix(hor, mid, smoothstep(-0.05, 0.28, up));
  col = mix(col, top, smoothstep(0.18, 0.85, up));
  vec3 moon = normalize(uMoon);
  float md = dot(dir, moon);
  float disc = smoothstep(0.9982, 0.9993, md);
  float glow = pow(max(md, 0.0), 24.0);
  col += vec3(0.55, 0.64, 0.78) * glow * 0.55;
  col = mix(col, vec3(0.93, 0.94, 0.9), disc);
  vec2 suv = dir.xz / max(0.2, dir.y + 0.45);
  vec2 cell = floor(suv * 26.0);
  float n = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  float star = step(0.986, n);
  float tw = 0.7 + 0.3 * sin(uTime * (0.35 + n * 0.4) + n * 12.0);
  col += vec3(0.9, 0.94, 1.0) * star * tw * smoothstep(0.02, 0.22, up);
  gl_FragColor = vec4(toLinear(col), 1.0);
  #include <colorspace_fragment>
}
`;

export const WATER_VERT = /* glsl */ `
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = uv;
  vec3 transformed = vec3(position);
  #include <project_vertex>
  #include <fog_vertex>
}
`;

export const WATER_FRAG = /* glsl */ `
uniform float uTime;
uniform float uStreaks[6];
varying vec2 vUv;
#include <fog_pars_fragment>
void main() {
  vec3 col = vec3(0.02, 0.035, 0.055);
  float rip = sin(vUv.x * 34.0 + uTime * 0.35) * sin(vUv.y * 16.0 - uTime * 0.22);
  col += vec3(0.015, 0.025, 0.04) * rip;
  for (int i = 0; i < 6; i++) {
    float d = abs(vUv.x - uStreaks[i]);
    float streak = exp(-d * d * 1100.0) * smoothstep(0.0, 0.2, vUv.y);
    float tw = 0.78 + 0.22 * sin(uTime * 0.45 + float(i) * 1.3);
    col += vec3(0.85, 0.58, 0.26) * streak * 0.32 * tw;
  }
  float alpha = 0.94;
  gl_FragColor = vec4(pow(max(col, vec3(0.0)), vec3(2.2)), alpha);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`;
