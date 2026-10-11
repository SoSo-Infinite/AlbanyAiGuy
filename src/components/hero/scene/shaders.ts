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
uniform float uBoost;
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
  vec3 win = warm * (0.55 + 0.9 * glowAmt * lit) * uBoost;
  win += warm * waveLit * 2.1;
  float mask = clamp(inWin * max(lit, waveLit), 0.0, 1.0);
  col = mix(col, win, mask);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  vec3 nrm = normalize(vNormalW);
  float rim = pow(1.0 - max(dot(nrm, viewDir), 0.0), 1.85);
  col += vec3(0.22, 0.4, 0.62) * rim * (1.0 - roofFace);
  float edge = smoothstep(0.07, 0.0, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  col += vec3(0.28, 0.46, 0.62) * edge * 0.28 * (1.0 - roofFace);
  float rel = cameraPosition.z - vWorld.z;
  float haze = smoothstep(18.0, 34.0, rel);
  haze += smoothstep(1.5, -5.5, vWorld.z) * 0.42;
  haze += smoothstep(5.5, 13.5, vWorld.y) * 0.34;
  col = mix(col, vec3(0.035, 0.055, 0.09), clamp(haze, 0.0, 0.62));
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

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 dir = normalize(vDir);
  vec3 top = vec3(0.012, 0.02, 0.045);
  vec3 mid = vec3(0.03, 0.055, 0.11);
  vec3 hor = vec3(0.09, 0.13, 0.2);
  float up = dir.y;
  vec3 col = mix(hor, mid, smoothstep(-0.08, 0.22, up));
  col = mix(col, top, smoothstep(0.12, 0.78, up));

  vec3 moon = normalize(uMoon);
  float md = dot(dir, moon);
  float glow = pow(max(md, 0.0), 180.0);
  float disc = smoothstep(0.99925, 0.99972, md);
  float limb = smoothstep(0.9986, 0.9994, md) * (1.0 - disc);
  col += vec3(0.78, 0.86, 1.0) * glow * 1.05;
  col += vec3(0.92, 0.94, 0.98) * limb * 0.65;
  col = mix(col, vec3(0.97, 0.95, 0.88), disc);

  float band = exp(-pow((up - 0.045) * 11.0, 2.0));
  col += vec3(0.42, 0.26, 0.14) * band * 0.55;
  col += vec3(0.12, 0.2, 0.34) * band * 0.85;

  float lon = atan(dir.z, dir.x);
  float lat = asin(clamp(up, -1.0, 1.0));
  float cells = 96.0;
  vec2 gv = vec2(lon, lat) * cells;
  vec2 cell = floor(gv);
  vec2 f = fract(gv) - 0.5;
  float n = hash21(cell);
  vec2 jitter = vec2(hash21(cell + 19.2), hash21(cell + 4.7)) - 0.5;
  float d = length(f - jitter * 0.72);
  float rad = 0.055 + hash21(cell + 8.1) * 0.03;
  float blob = exp(-d * d / (rad * rad));
  float dens = mix(0.993, 0.972, smoothstep(-0.02, 0.72, up));
  float star = step(dens, n) * blob;
  float twinkle = 0.55 + n * 0.35;
  float tw = 0.8 + 0.2 * sin(uTime * twinkle + n * 6.28318);
  float horizonFade = smoothstep(-0.04, 0.32, up);
  float mag = mix(0.45, 1.0, smoothstep(dens, 0.998, n));
  col += vec3(0.95, 0.97, 1.0) * star * tw * horizonFade * mag;

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
uniform float uStreaks[8];
varying vec2 vUv;
#include <fog_pars_fragment>
void main() {
  vec3 col = vec3(0.015, 0.022, 0.04);
  float rip = sin(vUv.x * 18.0 + uTime * 0.22) * sin(vUv.y * 7.0 - uTime * 0.12);
  col += vec3(0.008, 0.012, 0.02) * rip;
  float along = smoothstep(0.16, 0.32, vUv.y) * (1.0 - smoothstep(0.62, 0.84, vUv.y));
  for (int i = 0; i < 8; i++) {
    float d = abs(vUv.x - uStreaks[i]);
    float streak = (exp(-d * d * 70000.0) + 0.4 * exp(-d * d * 14000.0)) * along;
    float tw = 0.84 + 0.16 * sin(uTime * 0.35 + float(i) * 1.1);
    vec3 warm = mix(vec3(1.0, 0.68, 0.3), vec3(0.45, 0.9, 1.0), step(0.5, fract(float(i) * 0.37)));
    col += warm * streak * 1.15 * tw;
  }
  float far = smoothstep(0.25, 0.92, vUv.y);
  col = mix(col, vec3(0.04, 0.07, 0.11), far * 0.5);
  gl_FragColor = vec4(pow(max(col, vec3(0.0)), vec3(2.2)), 0.96);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`;

export const EGG_FRAG = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormalW;
#include <fog_pars_fragment>
vec3 toLinear(vec3 c) {
  return pow(max(c, vec3(0.0)), vec3(2.2));
}
void main() {
  vec3 nrm = normalize(vNormalW);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float ndv = max(dot(nrm, viewDir), 0.0);
  float rim = pow(1.0 - ndv, 2.05);
  float up = clamp(nrm.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 concrete = mix(vec3(0.45, 0.41, 0.36), vec3(0.86, 0.82, 0.74), up);
  float under = pow(clamp(1.0 - nrm.y, 0.0, 1.0), 1.25);
  under *= smoothstep(0.4, 0.95, vUv.y);
  concrete += vec3(0.72, 0.4, 0.12) * under * 0.75;
  float h = clamp((vWorld.y - 0.9) / 2.6, 0.0, 1.0);
  float band = smoothstep(0.22, 0.3, h) * (1.0 - smoothstep(0.4, 0.5, h));
  concrete = mix(concrete, vec3(0.06, 0.05, 0.045), band * 0.9);
  concrete += vec3(0.62, 0.78, 0.95) * rim * 0.7;
  concrete += vec3(1.0, 0.78, 0.42) * pow(rim, 3.5) * 0.28;
  float rel = cameraPosition.z - vWorld.z;
  float haze = smoothstep(20.0, 36.0, rel) * 0.35;
  concrete = mix(concrete, vec3(0.08, 0.11, 0.16), haze);
  gl_FragColor = vec4(toLinear(concrete), 1.0);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`;

export const ROOF_FRAG = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormalW;
#include <fog_pars_fragment>
vec3 toLinear(vec3 c) {
  return pow(max(c, vec3(0.0)), vec3(2.2));
}
void main() {
  vec3 nrm = normalize(vNormalW);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float slope = clamp(nrm.y, 0.0, 1.0);
  vec3 col = mix(vec3(0.07, 0.06, 0.08), vec3(0.62, 0.34, 0.12), pow(slope, 0.55) * 0.9);
  float ridge = smoothstep(0.72, 0.98, slope);
  col += vec3(1.0, 0.72, 0.32) * ridge * 0.55;
  float rim = pow(1.0 - max(dot(nrm, viewDir), 0.0), 2.0);
  col += vec3(0.85, 0.55, 0.22) * rim * 0.35;
  float rel = cameraPosition.z - vWorld.z;
  float haze = smoothstep(18.0, 34.0, rel) * 0.4 + smoothstep(4.0, 8.0, vWorld.y) * 0.15;
  col = mix(col, vec3(0.07, 0.09, 0.13), clamp(haze, 0.0, 0.55));
  gl_FragColor = vec4(toLinear(col), 1.0);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`;

export const STEM_FRAG = /* glsl */ `
varying vec2 vUv;
varying vec3 vWorld;
varying vec3 vNormalW;
#include <fog_pars_fragment>
vec3 toLinear(vec3 c) {
  return pow(max(c, vec3(0.0)), vec3(2.2));
}
void main() {
  float h = clamp(vUv.y, 0.0, 1.0);
  vec3 col = mix(vec3(0.32, 0.29, 0.25), vec3(0.72, 0.66, 0.56), h);
  col += vec3(0.85, 0.48, 0.14) * pow(h, 1.6) * 0.7;
  vec3 nrm = normalize(vNormalW);
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float rim = pow(1.0 - max(dot(nrm, viewDir), 0.0), 2.2);
  col += vec3(0.7, 0.8, 0.9) * rim * 0.28;
  gl_FragColor = vec4(toLinear(col), 1.0);
  #include <fog_fragment>
  #include <colorspace_fragment>
}
`;

export const HORIZON_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const HORIZON_FRAG = /* glsl */ `
varying vec2 vUv;
void main() {
  float band = exp(-pow((vUv.y - 0.58) * 3.1, 2.0));
  float wide = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
  vec3 col = vec3(0.55, 0.32, 0.14) * 0.65 + vec3(0.2, 0.32, 0.5) * 0.45;
  float alpha = clamp(band * wide, 0.0, 1.0) * 0.55;
  gl_FragColor = vec4(col * alpha, alpha);
}
`;
