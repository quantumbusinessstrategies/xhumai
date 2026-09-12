import { useEffect, useRef } from "react";
import * as THREE from "three";

const ARM_COUNT = 5;
const SPIRAL = 0.48;
const EH = 0.06141;
const STAR_N = 28000;
const FAR_N = 2400;
const DISK_R = 11.2;
const TRAIL_N = 96;
const WAVE_N = 72;
const T_SING = 5.82;
const T_BLOOM = 8.68;
const T_SUCK = 10.02;
const T_RING = 14.5;
const T_NOVA = 21.3;

function ease3(u) {
  const x = Math.max(0, Math.min(1, u));
  return x * x * (3 - 2 * x);
}

function smooth01(t, a, b) {
  return ease3((t - a) / Math.max(1e-6, b - a));
}

function remapOuterR(r, maxR) {
  if (r <= maxR * 0.8) return r;
  if (Math.random() < 0.75) return Math.pow(Math.random(), 2.55) * maxR * 0.25;
  return maxR * (0.25 + Math.random() * 0.75);
}

function packInner(r, maxR) {
  if (r <= maxR * 0.6) return r;
  return Math.pow(Math.random(), 1.2) * maxR * 0.4;
}

function makeOrbTexture() {
  const s = 64;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.22, "rgba(255,255,255,0.88)");
  g.addColorStop(0.5, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeNebulaTexture() {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < 18; i++) {
    const x = s * (0.12 + Math.random() * 0.76);
    const y = s * (0.32 + Math.random() * 0.36);
    const r = 14 + Math.random() * 42;
    const h = 18 + Math.random() * 310;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `hsla(${h}, 78%, 70%, 0.38)`);
    g.addColorStop(0.45, `hsla(${h}, 70%, 58%, 0.1)`);
    g.addColorStop(1, "hsla(0,0%,0%,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.5, r * 0.42, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function pastel(h, sat = 0.55, lit = 0.72) {
  return new THREE.Color().setHSL(h, sat, lit);
}

function pickKind() {
  const r = Math.random();
  if (r < 0.35) return 0;
  if (r < 0.55) return 1;
  if (r < 0.75) return 2;
  if (r < 0.85) return 3;
  if (r < 0.9) return 4;
  if (r < 0.93) return 5;
  return 6;
}

function kindColor(kind, seed, col, rad) {
  if (rad < 1.35) return col.setHSL(0.09 + seed * 0.05, 0.62, 0.78);
  if (kind === 0) return col.setHSL(0.0, 0.0, 0.94 + seed * 0.06);
  if (kind === 1) {
    const hues = [0.0, 0.58, 0.33, 0.15, 0.92, 0.08];
    return col.setHSL(hues[Math.floor(seed * 6) % 6], 0.58, 0.74);
  }
  if (kind === 3) return col.setHSL(0.58, 0.28, 0.95);
  if (kind === 4) return col.setHSL(seed, 0.38, 0.8);
  if (kind === 5) return col.setHSL(seed, 0.72, 0.8);
  if (kind === 6) return col.setHSL(0.78 + seed * 0.12, 0.68, 0.72);
  return col.setHSL(seed, 0.58, 0.72);
}

const POINT_VERT = /* glsl */ `
attribute float aKind;
attribute float aSeed;
attribute float aSize;
uniform float uTime;
uniform float uBirth;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vKind;
varying float vAlpha;
varying float vSeed;
varying float vHeat;
varying float vCore;

void main() {
  vColor = color;
  vKind = aKind;
  vSeed = aSeed;
  vec3 p = position;
  float r0 = length(p.xz);
  float th = atan(p.z, p.x);
  float petals = 1.0 + 0.1 * sin(th * 6.0 + aSeed * 5.5);
  float rLive = r0;
  float yMul = 1.0;
  float szT = 1.0;
  vHeat = 0.0;
  vCore = 0.0;
  float seq = uBirth;
  vHeat = 0.0;
  vCore = 0.0;
  float yLive = p.y;
  float yAbs = 0.0;
  if (seq < 21.30) {
    if (seq < 5.82) {
      float pulse = 1.0 + 0.22 * sin(seq * 11.0 + 1.5708) + 0.14 * sin(seq * 29.0 + 0.8);
      float leave = smoothstep(5.22, 5.82, seq);
      rLive = mix(0.00022 * pulse, 0.0032, leave);
      yMul = mix(0.012, 0.08, leave);
      szT = mix(0.22 + 0.1 * pulse, 0.42, leave);
      vHeat = mix(1.0, 0.85, leave);
      vCore = mix(1.0, 0.7, leave);
    } else if (seq < 8.68) {
      float k = smoothstep(5.82, 8.68, seq);
      float e = k * k * (3.0 - 2.0 * k);
      float polar = clamp(aSeed * 2.0 - 1.0, -1.0, 1.0);
      polar = mix(polar, clamp(p.y / max(r0, 0.12), -1.0, 1.0), 0.28);
      float sphR = mix(0.004, 3.15 + fract(aSeed * 11.3) * 5.6, e);
      float lat = sqrt(max(0.0, 1.0 - polar * polar));
      float toDisk = e * e * (3.0 - 2.0 * e);
      rLive = mix(sphR * lat, r0 * 0.52 * petals, toDisk);
      yLive = mix(sphR * polar, p.y * 0.62, toDisk);
      yAbs = 1.0;
      yMul = 1.0;
      szT = mix(0.5, 1.18, e);
      vHeat = mix(1.0, 0.12, e);
      vCore = mix(1.0, 0.0, e);
    } else if (seq < 10.02) {
      float k = smoothstep(8.68, 10.02, seq);
      float s = k * k * (3.0 - 2.0 * k);
      rLive = mix(r0 * 0.52 * petals, 0.00026, s);
      yLive = mix(p.y * 0.62, 0.0, s);
      yAbs = 1.0 - s;
      yMul = mix(0.62, 0.012, s);
      szT = mix(1.08, 0.28, s);
      vHeat = mix(0.2, 1.0, s);
      vCore = mix(0.0, 2.0, s);
    } else if (seq < 14.50) {
      float enter = smoothstep(10.02, 10.72, seq);
      float growl = 1.0 + (0.38 * sin(seq * 28.0) + 0.18 * sin(seq * 53.0)) * enter;
      rLive = mix(0.00026, (0.0002 + 0.0001 * sin(th * 22.0 + seq * 18.0)) * growl, enter);
      yMul = 0.01;
      szT = 0.26 * growl;
      vHeat = 1.0;
      vCore = 2.0;
    } else {
      float k = smoothstep(14.50, 21.30, seq);
      float seedK = fract(aSeed * 7.13 + aSeed * aSeed * 3.1);
      float boom = 1.0 - pow(1.0 - k, 1.32 + seedK * 0.55);
      float spray = (aSeed - 0.5) * 1.2 * sin(k * 3.14159) * (1.0 - smoothstep(0.58, 1.0, k));
      th += spray;
      float over = mix(1.18, 1.9, seedK);
      float chaos = 1.0 + 0.32 * sin(th * 7.0 + seq * 4.4 + aSeed * 18.0) * (k * (1.0 - k) * 4.0);
      rLive = mix(0.0008, r0 * over, boom) * chaos;
      float settle = smoothstep(0.16, 1.0, k);
      settle = settle * settle * (3.0 - 2.0 * settle);
      rLive = mix(rLive, r0, settle * (0.35 + 0.65 * seedK));
      yMul = mix(0.08, 1.0, k);
      yMul *= 1.0 + 0.5 * sin(aSeed * 31.0 + seq * 5.6) * k * (1.0 - settle);
      szT = mix(2.3, 1.0, settle);
      vHeat = (1.0 - settle) * (0.65 + 0.35 * seedK);
      vCore = 3.0;
    }
  }
  float spin = uTime * (0.0056 + 0.208 / (rLive * rLive + 0.42));
  if (rLive < 0.518) spin += uTime * (0.185 / (rLive + 0.22));
  float r = rLive;
  if (aKind > 6.5) {
    float xh = cos(th + spin) * rLive;
    float zh = sin(th + spin) * rLive;
    vec4 mvh = modelViewMatrix * vec4(xh, p.y * yMul, zh, 1.0);
    gl_Position = projectionMatrix * mvh;
    float tw = pow(0.5 + 0.5 * sin(uTime * (2.2 + aSeed * 6.5) + aSeed * 28.0), 12.0);
    gl_PointSize = clamp(aSize * szT * uPixelRatio * (300.0 / -mvh.z) * (0.7 + 1.8 * tw), 1.0, 14.0);
    vAlpha = 0.2 + 0.8 * tw;
    return;
  }
  if (seq > 21.30 && r0 < 0.595) {
    float fall = fract(uTime * (0.0096 + aSeed * 0.0064) + aSeed * 7.1);
    r = mix(rLive, 0.065, fall * smoothstep(0.595, 0.145, r0));
    if (r < 0.079) {
      r = 9.6 + fract(aSeed * 13.7) * 1.6;
      th = aSeed * 6.28318 + r * 0.48;
    }
  }
  float wob = 0.0;
  float pop = 1.0;
  if (aKind > 1.5 && aKind < 2.5) {
    wob = sin(uTime * (1.4 + aSeed * 2.4) + aSeed * 20.0) * 0.012;
    float g = fract(uTime * 0.42 + aSeed * 9.0);
    if (g > 0.985) { p.y += (aSeed - 0.5) * 0.14; r += 0.06; }
    float pk = fract(uTime * 0.12 + aSeed * 4.0);
    if (pk > 0.96 && pk < 0.975) pop = 0.0;
    p.y += sin(uTime * 2.1 + aSeed * 30.0) * 0.006;
  }
  if (aKind > 5.5) {
    p.y += sin(uTime * 0.7 + aSeed * 12.0) * 0.022;
  }
  float breath = 1.0 + 0.016 * sin(uTime * 0.38) + 0.006 * sin(uTime * 0.86);
  float x = cos(th + spin) * (r + wob) * breath;
  float z = sin(th + spin) * (r + wob) * breath;
  if (seq < 5.22) {
    x += 0.00042 * sin(seq * 41.0 + aSeed * 8.0);
    z += 0.00036 * cos(seq * 37.0 + aSeed * 6.0);
  }
  vec3 wp = vec3(x, mix(p.y * yMul * (1.0 + 0.024 * sin(uTime * 0.38 + aSeed)), yLive, yAbs), z);
  vec4 mv = modelViewMatrix * vec4(wp, 1.0);
  gl_Position = projectionMatrix * mv;
  float sz = aSize * szT;
  if (aKind > 2.5 && aKind < 3.5) sz *= 1.8;
  if (aKind > 4.5 && aKind < 5.5) sz *= 1.12 + 0.12 * sin(uTime * 3.2 + aSeed * 40.0);
  sz *= 1.0 + 0.045 * sin(uTime * 0.38);
  float collapsed = step(0.5, vCore) * (1.0 - step(2.5, vCore));
  float maxSz = mix(56.0, 2.15, collapsed);
  gl_PointSize = clamp(sz * uPixelRatio * (320.0 / -mv.z), 1.0, maxSz);
  vAlpha = pop;
}
`;

const POINT_FRAG_OK = /* glsl */ `
uniform sampler2D uMap;
uniform float uTime;
varying vec3 vColor;
varying float vKind;
varying float vAlpha;
varying float vSeed;
varying float vHeat;
varying float vCore;

vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

void main() {
  if (vAlpha < 0.5) discard;
  vec4 tex = texture2D(uMap, gl_PointCoord);
  if (tex.a < 0.04) discard;
  vec3 c = vColor;
  if (vKind > 1.5 && vKind < 2.5) {
    c = hsl2rgb(vec3(fract(vSeed + uTime * 0.03), 0.55, 0.72));
  }
  if (vKind > 2.5 && vKind < 3.5) {
    float hue = fract(uTime * 0.045 + vSeed);
    vec3 glow = hsl2rgb(vec3(hue, 0.55, 0.75));
    vec3 blue = vec3(0.72, 0.86, 1.0);
    c = mix(vec3(1.0), mix(glow, blue, step(0.5, vSeed)), 0.55);
  }
  if (vKind > 3.5 && vKind < 4.5) {
    float ir = 0.5 + 0.5 * sin(uTime * 0.5 + vSeed * 12.0 + gl_PointCoord.x * 6.0);
    c = mix(c, vec3(0.85, 0.95, 1.0), 0.35 + 0.35 * ir);
  }
  if (vKind > 4.5 && vKind < 5.5) {
    c = hsl2rgb(vec3(fract(uTime * 0.16 + vSeed * 3.0), 0.65, 0.78));
  }
  if (vKind > 5.5) {
    c = hsl2rgb(vec3(fract(0.78 + uTime * 0.055 + vSeed), 0.7, 0.68));
  }
  if (vKind > 6.5) {
    c = mix(vec3(1.0), vec3(0.92, 0.96, 1.0), 0.25);
  }
  float br = vKind > 6.5 ? 1.18 : 1.28;
  if (vCore > 0.5 && vCore < 2.5) {
    vec3 rain = hsl2rgb(vec3(fract(uTime * 2.55 + vSeed * 2.1), 1.0, 0.58));
    vec3 rain2 = hsl2rgb(vec3(fract(uTime * 1.8 + vSeed * 5.0 + 0.33), 0.98, 0.62));
    vec3 white = vec3(1.0, 0.97, 0.9);
    float lick = 0.5 + 0.5 * sin(uTime * 34.0 + vSeed * 22.0);
    c = mix(mix(rain, rain2, lick), white, 0.22 + 0.28 * vHeat);
    br *= 3.4 + 1.6 * vHeat;
  } else if (vCore > 2.5) {
    vec3 fire = vec3(1.0, 0.42 + 0.22 * vSeed, 0.12);
    c = mix(c, mix(fire, vec3(1.0, 0.88, 0.55), vSeed), clamp(vHeat, 0.0, 1.0));
  }
  gl_FragColor = vec4(c * br * tex.a, tex.a);
}
`;

const LENS_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const LENS_FRAG = /* glsl */ `
uniform sampler2D tDiffuse;
uniform vec2 uBH;
uniform vec2 uRes;
uniform float uTime;
uniform float uPunch;
varying vec2 vUv;
void main() {
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 p = (vUv - uBH) * aspect;
  float r = length(p);
  float rs = 0.0021;
  if (uPunch > 0.5 && r < rs * 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  float inv = rs * rs / max(r * r, 1e-6);
  float swirl = 0.22 * inv / max(r, 0.002) * uPunch;
  float s = sin(swirl);
  float c = cos(swirl);
  vec2 pr = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  float stretch = 1.0 - 0.38 * inv * smoothstep(0.05, rs, r) * uPunch;
  vec2 warped = uBH + (pr * stretch) / aspect;
  vec2 dir = pr * mix(0.0032, 0.0016, uPunch);
  vec3 rgb;
  rgb.r = texture2D(tDiffuse, clamp(warped + dir, 0.0, 1.0)).r;
  rgb.g = texture2D(tDiffuse, clamp(warped, 0.0, 1.0)).g;
  rgb.b = texture2D(tDiffuse, clamp(warped - dir * 1.15, 0.0, 1.0)).b;
  vec2 px = 1.0 / max(uRes, vec2(1.0));
  vec3 bloom = vec3(0.0);
  bloom += max(texture2D(tDiffuse, clamp(warped + vec2(px.x * 2.4, 0.0), 0.0, 1.0)).rgb - 0.62, 0.0);
  bloom += max(texture2D(tDiffuse, clamp(warped - vec2(px.x * 2.4, 0.0), 0.0, 1.0)).rgb - 0.62, 0.0);
  bloom += max(texture2D(tDiffuse, clamp(warped + vec2(0.0, px.y * 2.4), 0.0, 1.0)).rgb - 0.62, 0.0);
  bloom += max(texture2D(tDiffuse, clamp(warped - vec2(0.0, px.y * 2.4), 0.0, 1.0)).rgb - 0.62, 0.0);
  rgb += bloom * mix(0.55, 0.18, uPunch);
  float kiss = smoothstep(rs * 1.1, rs * 0.94, r) * smoothstep(rs * 0.62, rs * 0.98, r);
  rgb += vec3(1.0, 0.82, 0.58) * kiss * 0.62 * uPunch;
  float wrap = smoothstep(rs * 1.45, rs * 1.02, r) * (1.0 - smoothstep(rs * 1.02, rs * 0.78, r));
  rgb += vec3(0.95, 0.78, 1.0) * wrap * 0.1 * uPunch;
  rgb *= 1.0 - 0.12 * dot(pr, pr);
  float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  rgb = mix(vec3(luma), rgb, 1.12);
  rgb = pow(max(rgb, 0.0), vec3(0.86));
  rgb *= 1.06;
  float g = fract(sin(dot(vUv * uRes + uTime * 9.0, vec2(12.9898, 78.233))) * 43758.5453);
  rgb += (g - 0.5) * 0.01;
  gl_FragColor = vec4(clamp(rgb, 0.0, 1.2), 1.0);
}
`;

const BLOB_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vObj;
varying vec3 vWorldN;
varying vec3 vWorldP;
varying float vDye;
varying float vDye2;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}
float fbm(vec3 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 3; i++) {
    s += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}

void main() {
  float n = fbm(position * 0.22 + uTime * 0.055);
  float n2 = fbm(position * 0.85 + vec3(uTime * 0.09, -uTime * 0.07, uTime * 0.04));
  vec3 p = position + normal * ((n - 0.35) * 1.85 + (n2 - 0.35) * 0.62);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vObj = p;
  vWorldP = wp.xyz;
  vWorldN = normalize(mat3(modelMatrix) * normal);
  vDye = n;
  vDye2 = n2;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const BLOB_FRAG = /* glsl */ `
uniform float uTime;
varying vec3 vObj;
varying vec3 vWorldN;
varying vec3 vWorldP;
varying float vDye;
varying float vDye2;

vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb = clamp(abs(mod(hsl.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return hsl.z + hsl.y * (rgb - 0.5) * (1.0 - abs(2.0 * hsl.z - 1.0));
}

void main() {
  vec3 V = normalize(cameraPosition - vWorldP);
  float fres = pow(1.0 - abs(dot(normalize(vWorldN), V)), 2.4);
  float dye = vDye;
  float dye2 = vDye2;
  float h = fract(dye * 0.85 + dye2 * 0.4 + uTime * 0.028 + vObj.y * 0.04);
  vec3 c1 = hsl2rgb(vec3(h, 0.48, 0.78));
  vec3 c2 = hsl2rgb(vec3(fract(h + 0.33), 0.4, 0.82));
  vec3 c3 = hsl2rgb(vec3(fract(h + 0.66 + 0.04 * sin(uTime * 0.2)), 0.45, 0.76));
  vec3 c = mix(mix(c1, c2, dye), c3, dye2);
  float a = 0.03 * (0.65 + 0.7 * fres);
  gl_FragColor = vec4(c, a);
}
`;

function makeTorchTexture() {
  const s = 128;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.12, "rgba(255,236,210,0.55)");
  g.addColorStop(0.32, "rgba(190,210,255,0.22)");
  g.addColorStop(0.55, "rgba(230,170,255,0.1)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeTieDyeTexture() {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  const cx = s / 2;
  ctx.fillStyle = "#f7f4ee";
  ctx.beginPath();
  ctx.arc(cx, cx, cx - 1, 0, Math.PI * 2);
  ctx.fill();
  const hues = [0, 28, 48, 165, 195, 265, 310];
  for (let i = 0; i < 40; i++) {
    const x = cx + (Math.random() - 0.5) * s * 0.78;
    const y = cx + (Math.random() - 0.5) * s * 0.78;
    const r = 16 + Math.random() * 70;
    const h = hues[i % hues.length] + (Math.random() - 0.5) * 16;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `hsla(${h}, 62%, 78%, 0.88)`);
    g.addColorStop(0.5, `hsla(${h}, 48%, 84%, 0.4)`);
    g.addColorStop(1, `hsla(${h}, 30%, 92%, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "destination-in";
  const cut = ctx.createRadialGradient(cx, cx, 0, cx, cx, cx);
  cut.addColorStop(0, "rgba(0,0,0,1)");
  cut.addColorStop(0.86, "rgba(0,0,0,1)");
  cut.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = cut;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function fillDisk() {
  const positions = new Float32Array(STAR_N * 3);
  const colors = new Float32Array(STAR_N * 3);
  const kinds = new Float32Array(STAR_N);
  const seeds = new Float32Array(STAR_N);
  const sizes = new Float32Array(STAR_N);
  const col = new THREE.Color();
  let w = 0;
  for (let a = 0; w < STAR_N && a < STAR_N * 5; a++) {
    const kind = pickKind();
    const inArm = Math.random() < 0.94;
    const u = Math.random();
    let rad = Math.pow(u, inArm ? 0.92 : 1.7) * DISK_R;
    const seed = Math.random();
    const i3 = w * 3;
    const wasOuter = rad > DISK_R * 0.8;
    if (wasOuter) rad = remapOuterR(rad, DISK_R);
    else if (rad > DISK_R * 0.75) rad = Math.random() * DISK_R * 0.15;
    if (rad > DISK_R * 0.93) continue;
    if (inArm) rad = packInner(rad, DISK_R);
    const arm = Math.floor(Math.random() * ARM_COUNT);
    const spread = inArm ? (Math.random() - 0.5) * 0.22 : Math.random() * Math.PI * 2;
    const theta = inArm ? (arm / ARM_COUNT) * Math.PI * 2 + rad * SPIRAL + spread : spread;
    const diskH = (0.26 + rad * 0.042) * (inArm ? 0.92 : 1.18);
    positions[i3] = Math.cos(theta) * rad;
    positions[i3 + 1] = (Math.random() - 0.5) * diskH;
    positions[i3 + 2] = Math.sin(theta) * rad;
    kinds[w] = kind;
    seeds[w] = seed;
    kindColor(kind, seed, col, rad);
    if (inArm && Math.abs(spread) < 0.05 && rad > 2.2) {
      col.offsetHSL(0, -0.12, -0.22);
    }
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
    const base = kind === 3 ? 0.05 : kind === 5 ? 0.033 : kind === 4 ? 0.037 : 0.012 + Math.pow(Math.random(), 2.15) * 0.038;
    const up = (1 + Math.random() * 14) / 100;
    const down = (1 + Math.random() * 14) / 100;
    let sz = base * (1 + up - down);
    if (Math.random() < 0.07) sz *= 1.7 + Math.random() * 1.5;
    if (Math.random() < 0.1) sz *= 0.42;
    sizes[w] = Math.max(0.005, sz);
    if (sz < 0.02 && Math.random() < 0.12) kinds[w] = 7;
    w++;
  }
  const small = [];
  for (let i = 0; i < w; i++) if (sizes[i] < 0.022) small.push(i);
  small.sort((a, b) => {
    const ra = Math.hypot(positions[a * 3], positions[a * 3 + 2]);
    const rb = Math.hypot(positions[b * 3], positions[b * 3 + 2]);
    return rb - ra;
  });
  const moveN = Math.max(1, Math.floor(small.length * 0.05));
  for (let k = 0; k < moveN; k++) {
    const i = small[k];
    const rad = Math.random() * DISK_R * 0.6;
    const th = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(th) * rad;
    positions[i * 3 + 2] = Math.sin(th) * rad;
  }
  return { positions, colors, kinds, seeds, sizes, count: w };
}

function tesseractLines(t, out) {
  const rot = (x, y, a) => {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  };
  const verts = [];
  for (let i = 0; i < 16; i++) {
    let x = i & 1 ? 1 : -1;
    let y = i & 2 ? 1 : -1;
    let z = i & 4 ? 1 : -1;
    let w = i & 8 ? 1 : -1;
    [x, w] = rot(x, w, t);
    [y, z] = rot(y, z, t * 0.7);
    const d = 2.2 / (2.6 - w);
    verts.push([x * d, y * d, z * d]);
  }
  const dest = out ?? new Float32Array(192);
  let p = 0;
  for (let i = 0; i < 16; i++) {
    for (let b = 0; b < 4; b++) {
      const j = i ^ (1 << b);
      if (j > i) {
        dest[p++] = verts[i][0];
        dest[p++] = verts[i][1];
        dest[p++] = verts[i][2];
        dest[p++] = verts[j][0];
        dest[p++] = verts[j][1];
        dest[p++] = verts[j][2];
      }
    }
  }
  return dest;
}

function sierpinski(level, a, b, c, d, out) {
  if (level === 0) {
    const e = [a, b, c, d];
    const edges = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];
    for (const [i, j] of edges) {
      out.push(e[i].x, e[i].y, e[i].z, e[j].x, e[j].y, e[j].z);
    }
    return;
  }
  const m = (p, q) => p.clone().add(q).multiplyScalar(0.5);
  sierpinski(level - 1, a, m(a, b), m(a, c), m(a, d), out);
  sierpinski(level - 1, b, m(a, b), m(b, c), m(b, d), out);
  sierpinski(level - 1, c, m(a, c), m(b, c), m(c, d), out);
  sierpinski(level - 1, d, m(a, d), m(b, d), m(c, d), out);
}

function makeBinaryCanvas() {
  const c = document.createElement("canvas");
  c.width = 192;
  c.height = 72;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  const draw = (glitch) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, 192, 72);
    ctx.font = "10px monospace";
    ctx.fillStyle = "#3dff6a";
    const g = glitch && Math.random() < 0.7;
    const ox = g ? (Math.random() - 0.5) * 18 : 0;
    const oy = g && Math.random() < 0.4 ? (Math.random() - 0.5) * 8 : 0;
    for (let y = 0; y < 5; y++) {
      if (g && Math.random() < 0.18) continue;
      ctx.globalAlpha = 0.35 + Math.random() * 0.5;
      for (let x = 0; x < 11; x++) {
        const ch = Math.random() < 0.5 ? "0" : "1";
        const jx = g && Math.random() < 0.12 ? (Math.random() - 0.5) * 10 : 0;
        ctx.fillText(ch, 6 + x * 16 + ox + jx, 14 + y * 13 + oy);
      }
    }
    if (g && Math.random() < 0.45) {
      ctx.globalAlpha = 0.35;
      ctx.fillRect(Math.random() * 160, Math.random() * 60, 24 + Math.random() * 40, 2);
    }
    tex.needsUpdate = true;
  };
  draw(false);
  return { tex, draw };
}


function keplerPos(el, out) {
  const e = el.e;
  let E = el.M;
  for (let k = 0; k < 4; k++) E = el.M + e * Math.sin(E);
  const r = el.a * (1 - e * Math.cos(E));
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const x = r * Math.cos(nu);
  const y = r * Math.sin(nu);
  const ci = Math.cos(el.i);
  const si = Math.sin(el.i);
  const cO = Math.cos(el.Omega);
  const sO = Math.sin(el.Omega);
  const co = Math.cos(el.omega);
  const so = Math.sin(el.omega);
  const x1 = x * co - y * so;
  const y1 = x * so + y * co;
  const y2 = y1 * ci;
  const z2 = y1 * si;
  out.set(x1 * cO - y2 * sO, z2, x1 * sO + y2 * cO);
  return r;
}

export function GalaxyCanvas({ onPhase }) {
  const mountRef = useRef(null);
  const phaseRef = useRef(onPhase);
  phaseRef.current = onPhase;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02010a);
    const camera = new THREE.PerspectiveCamera(36, 1, 0.06, 400);
    camera.position.set(0, 0.52, 4.55);
    camera.lookAt(0, 0.08, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x02010a, 1);
    mount.appendChild(renderer.domElement);

    const rt = new THREE.WebGLRenderTarget(8, 8, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
    const lensScene = new THREE.Scene();
    const lensCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const lensMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: rt.texture },
        uBH: { value: new THREE.Vector2(0.5, 0.5) },
        uRes: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uPunch: { value: 0 },
      },
      vertexShader: LENS_VERT,
      fragmentShader: LENS_FRAG,
    });
    lensScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), lensMat));

    const orb = makeOrbTexture();
    const tilt = new THREE.Group();
    scene.add(tilt);
    const disk = new THREE.Group();
    tilt.add(disk);

    const farPos = new Float32Array(FAR_N * 3);
    const farCol = new Float32Array(FAR_N * 3);
    const fc = new THREE.Color();
    for (let i = 0; i < FAR_N; i++) {
      const u = Math.random() * 2 - 1;
      const phi = Math.random() * Math.PI * 2;
      const r = 42 + Math.random() * 70;
      const s = Math.sqrt(1 - u * u);
      farPos[i * 3] = r * s * Math.cos(phi);
      farPos[i * 3 + 1] = r * u * 0.55;
      farPos[i * 3 + 2] = r * s * Math.sin(phi);
      fc.setHSL(Math.random(), 0.55, 0.74 + Math.random() * 0.2);
      farCol[i * 3] = fc.r;
      farCol[i * 3 + 1] = fc.g;
      farCol[i * 3 + 2] = fc.b;
    }
    const farGeo = new THREE.BufferGeometry();
    farGeo.setAttribute("position", new THREE.BufferAttribute(farPos, 3));
    farGeo.setAttribute("color", new THREE.BufferAttribute(farCol, 3));
    const farPts = new THREE.Points(
      farGeo,
      new THREE.PointsMaterial({
        size: 0.16,
        map: orb,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    scene.add(farPts);
    farPts.visible = false;

    const diskData = fillDisk();
    const diskGeo = new THREE.BufferGeometry();
    diskGeo.setAttribute("position", new THREE.BufferAttribute(diskData.positions, 3));
    diskGeo.setAttribute("color", new THREE.BufferAttribute(diskData.colors, 3));
    diskGeo.setAttribute("aKind", new THREE.BufferAttribute(diskData.kinds, 1));
    diskGeo.setAttribute("aSeed", new THREE.BufferAttribute(diskData.seeds, 1));
    diskGeo.setAttribute("aSize", new THREE.BufferAttribute(diskData.sizes, 1));
    diskGeo.setDrawRange(0, diskData.count);
    const diskMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uBirth: { value: 0 },
        uMap: { value: orb },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG_OK,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const diskPts = new THREE.Points(diskGeo, diskMat);
    disk.add(diskPts);

    const nebTex = makeNebulaTexture();
    const nebulae = [];
    for (let i = 0; i < 2; i++) {
      const spr = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: nebTex,
          transparent: true,
          opacity: 0.14,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          rotation: i * 0.9,
        }),
      );
      spr.scale.set(11.5 + i, 5.4 + i * 0.3, 1);
      spr.position.y = (i - 1) * 0.08;
      spr.visible = false;
      disk.add(spr);
      nebulae.push(spr);
    }

    const horizon = new THREE.Mesh(
      new THREE.SphereGeometry(EH, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000 }),
    );
    horizon.visible = false;
    disk.add(horizon);

    const tube = EH * 0.065;
    const einstein = new THREE.Mesh(
      new THREE.TorusGeometry(EH + tube * 0.3, tube, 18, 96),
      new THREE.MeshBasicMaterial({
        color: 0xffd9a8,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    einstein.rotation.x = Math.PI / 2;
    einstein.visible = false;
    disk.add(einstein);

    const heatN = 640;
    const heatPos = new Float32Array(heatN * 3);
    const heatCol = new Float32Array(heatN * 3);
    const hc = new THREE.Color();
    for (let i = 0; i < heatN; i++) {
      const rr = EH * 0.98 + Math.pow(Math.random(), 0.75) * 0.13;
      const th = Math.random() * Math.PI * 2;
      heatPos[i * 3] = Math.cos(th) * rr;
      heatPos[i * 3 + 1] = (Math.random() - 0.5) * 0.04 * (1.2 + rr * 2);
      heatPos[i * 3 + 2] = Math.sin(th) * rr;
      hc.setHSL(0.04 + Math.random() * 0.08, 0.88, 0.52 + Math.random() * 0.4);
      heatCol[i * 3] = hc.r;
      heatCol[i * 3 + 1] = hc.g;
      heatCol[i * 3 + 2] = hc.b;
    }
    const heatGeo = new THREE.BufferGeometry();
    heatGeo.setAttribute("position", new THREE.BufferAttribute(heatPos, 3));
    heatGeo.setAttribute("color", new THREE.BufferAttribute(heatCol, 3));
    const heatPts = new THREE.Points(
      heatGeo,
      new THREE.PointsMaterial({
        size: 0.027,
        map: orb,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    disk.add(heatPts);
    heatPts.visible = false;

    const JET_H = 5.4;
    const jetGeo = new THREE.CylinderGeometry(0.0265, 0.0063, JET_H, 8, 12, true);
    const JET_VERT = /* glsl */ `
      varying float vAlong;
      void main() {
        vAlong = clamp((position.y - 0.15) / 5.4, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const JET_FRAG = /* glsl */ `
      uniform float uPulse;
      uniform vec3 uColor;
      varying float vAlong;
      void main() {
        float fade = pow(1.0 - vAlong, 1.45);
        float core = exp(-vAlong * 3.4);
        vec3 col = mix(uColor * 1.35, uColor, vAlong);
        float a = uPulse * (0.22 * fade + 0.38 * core);
        gl_FragColor = vec4(col * a, a);
      }
    `;
    const jetMat = new THREE.ShaderMaterial({
      uniforms: {
        uPulse: { value: 0.2 },
        uColor: { value: new THREE.Color(0xeef6ff) },
      },
      vertexShader: JET_VERT,
      fragmentShader: JET_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    jetGeo.translate(0, 2.85, 0);
    const jetA = new THREE.Mesh(jetGeo, jetMat);
    const jetB = new THREE.Mesh(jetGeo, jetMat.clone());
    jetB.rotation.x = Math.PI;
    jetA.position.y = EH * 1.25;
    jetB.position.y = -EH * 1.25;
    const jetGlowTex = orb;
    const jetGlowMat = new THREE.SpriteMaterial({
      map: jetGlowTex,
      color: 0xf4fbff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const jetGlowA = new THREE.Sprite(jetGlowMat);
    const jetGlowB = new THREE.Sprite(jetGlowMat.clone());
    jetGlowA.position.set(0, EH * 1.45, 0);
    jetGlowB.position.set(0, -EH * 1.45, 0);
    jetGlowA.scale.set(0.22, 0.22, 1);
    jetGlowB.scale.set(0.22, 0.22, 1);
    disk.add(jetA, jetB, jetGlowA, jetGlowB);

    const electrons = [];
    const eHues = [0.55, 0.92, 0.12, 0.33, 0.78, 0.08];
    for (let i = 0; i < 6; i++) {
      const color = pastel(eHues[i], 0.7, 0.78);
      const mesh = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.SphereGeometry(0.01717, 10, 8)),
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const hist = new Float32Array(TRAIL_N * 3);
      const waveHist = new Float32Array(WAVE_N * 3);
      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute("position", new THREE.BufferAttribute(hist, 3));
      const trail = new THREE.Line(
        trailGeo,
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.11,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      const waveGeo = new THREE.BufferGeometry();
      waveGeo.setAttribute("position", new THREE.BufferAttribute(waveHist, 3));
      const wave = new THREE.Line(
        waveGeo,
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.07,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      );
      disk.add(mesh, trail, wave);
      const e = 0.82 + Math.random() * 0.12;
      const peri = EH * 1.35 + Math.random() * 0.18;
      const a = peri / (1 - e);
      electrons.push({
        mesh,
        trail,
        wave,
        hist,
        waveHist,
        a,
        e,
        i: (Math.random() - 0.5) * Math.PI,
        Omega: Math.random() * Math.PI * 2,
        omega: Math.random() * Math.PI * 2,
        n: 0.22 + i * 0.035,
        M: (i / 6) * Math.PI * 2,
        vis: 1,
        last: new THREE.Vector3(),
      });
    }

    const sacred = new THREE.Group();
    disk.add(sacred);
    const wireMat = (c) => new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.9 });

    const tessGeo = new THREE.BufferGeometry();
    tessGeo.setAttribute("position", new THREE.BufferAttribute(tesseractLines(0), 3));
    const tess = new THREE.LineSegments(tessGeo, wireMat(0xd9b8ff));
    tess.scale.setScalar(0.0625);
    tess.position.set(3.13, 0.2, 0.91);
    sacred.add(tess);

    const tess2Geo = new THREE.BufferGeometry();
    tess2Geo.setAttribute("position", new THREE.BufferAttribute(tesseractLines(0.8), 3));
    const tess2 = new THREE.LineSegments(tess2Geo, wireMat(0x9cf0ff));
    tess2.scale.setScalar(0.0446);
    tess2.position.set(-2.35, -0.16, 2.74);
    sacred.add(tess2);

    const placements = [];
    const addWire = (geom, color, x, y, z, s = 1) => {
      const m = new THREE.LineSegments(geom, wireMat(color));
      m.scale.setScalar(s * 0.525);
      let rr = Math.hypot(x, z) * 1.48;
      rr = Math.min(6.5, Math.max(1.85, rr));
      const th = Math.atan2(z, x);
      m.position.set(Math.cos(th) * rr, y * 0.9, Math.sin(th) * rr);
      sacred.add(m);
      placements.push({ mesh: m, spin: 0.08 + Math.random() * 0.16 });
      return m;
    };
    addWire(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.136, 0)), 0x9cf0ff, -2.61, 0.14, 1.35);
    addWire(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.102, 0)), 0xffc6e4, 3.06, -0.18, -0.99);
    addWire(new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(0.153, 0)), 0xffc6e4, 3.15, 0.09, -1.53);
    addWire(new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(0.0935, 0)), 0xffe29a, -2.88, 0.25, -1.8);
    addWire(new THREE.WireframeGeometry(new THREE.OctahedronGeometry(0.0935, 0)), 0xb8ffd4, 3.96, 0.07, 0.225);
    const bin = makeBinaryCanvas();
    const addBin = (x, y, z) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.18),
        new THREE.MeshBasicMaterial({
          map: bin.tex,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      );
      let rr = Math.hypot(x, z) * 1.48;
      rr = Math.min(6.5, Math.max(1.85, rr));
      const th = Math.atan2(z, x);
      mesh.position.set(Math.cos(th) * rr, y * 0.9, Math.sin(th) * rr);
      mesh.scale.setScalar(0.525);
      sacred.add(mesh);
      placements.push({ mesh, spin: 0.04 + Math.random() * 0.08 });
      return mesh;
    };
    addBin(1.08, 0.29, 3.24);
    addBin(-1.89, -0.22, 2.79);
    addWire(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.11, 1)), 0xb8e0ff, 2.05, 0.26, -2.4);
    addWire(new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(0.1, 1)), 0xffd0f0, -2.2, -0.22, 2.55);
    addWire(new THREE.WireframeGeometry(new THREE.OctahedronGeometry(0.09, 1)), 0xe8ffc6, 0.4, 0.32, 3.05);
    const fadeWires = [];
    const addFade = (geom, color, x, y, z) => {
      const m = addWire(geom, color, x, y, z);
      (m.material).opacity = 0;
      fadeWires.push(m);
    };
    addFade(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.12, 1)), 0xffe6b0, -3.05, 0.12, 0.4);
    addFade(new THREE.WireframeGeometry(new THREE.DodecahedronGeometry(0.1, 1)), 0xd4c6ff, 2.7, -0.28, 1.7);
    addFade(new THREE.WireframeGeometry(new THREE.OctahedronGeometry(0.1, 1)), 0xc6fff0, -0.7, 0.2, -2.6);

    const sOut = [];
    sierpinski(
      2,
      new THREE.Vector3(0, 0.22, 0),
      new THREE.Vector3(-0.2, -0.12, 0.18),
      new THREE.Vector3(0.2, -0.12, 0.18),
      new THREE.Vector3(0, -0.12, -0.22),
      sOut,
    );
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.Float32BufferAttribute(sOut, 3));
    const sierp = new THREE.LineSegments(sGeo, wireMat(0xffe29a));
    sierp.position.set(-2.35, 0.18, -4.18);
    sierp.scale.setScalar(0.446);
    sacred.add(sierp);

    const wild = new THREE.Group();
    for (let i = 0; i < 50; i++) {
      const s = 0.027 + Math.random() * 0.024;
      const roll = i % 5;
      const geom =
        roll === 0
          ? new THREE.IcosahedronGeometry(s * 0.92, i % 10 === 0 ? 1 : 0)
          : roll === 1
            ? new THREE.OctahedronGeometry(s, i % 11 === 0 ? 1 : 0)
            : roll === 2
              ? new THREE.DodecahedronGeometry(s * 0.88, 0)
              : roll === 3
                ? new THREE.TetrahedronGeometry(s, 0)
                : new THREE.ConeGeometry(s * 0.7, s * 1.4, 5);
      const m = new THREE.LineSegments(
        new THREE.WireframeGeometry(geom),
        wireMat(pastel(Math.random(), 0.6, 0.7).getHex()),
      );
      let rr;
      if (s < 0.038 && Math.random() < 0.65) rr = 0.42 + Math.random() * 2.35;
      else rr = 2.35 + Math.random() * 6.2;
      const th = Math.random() * Math.PI * 2;
      m.position.set(Math.cos(th) * rr, (Math.random() - 0.5) * 0.7, Math.sin(th) * rr);
      m.scale.setScalar(0.525);
      m.userData.spin = 0.08 + Math.random() * 0.28;
      wild.add(m);
    }
    disk.add(wild);

    const blobMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: BLOB_VERT,
      fragmentShader: BLOB_FRAG,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const blob = new THREE.Mesh(new THREE.IcosahedronGeometry(8.8, 3), blobMat);
    tilt.add(blob);
    sacred.visible = false;
    wild.visible = false;
    blob.visible = false;
    jetA.visible = false;
    jetB.visible = false;
    jetGlowA.visible = false;
    jetGlowB.visible = false;
    electrons.forEach((el) => {
      el.mesh.visible = false;
      el.trail.visible = false;
      el.wave.visible = false;
    });

    const torchTex = makeTorchTexture();
    const tieTex = makeTieDyeTexture();
    const fusionMat = new THREE.SpriteMaterial({
      map: tieTex,
      color: 0xffffff,
      transparent: true,
      depthWrite: false,
      rotation: 0,
    });
    const fusionBall = new THREE.Sprite(fusionMat);
    fusionBall.scale.set(2.45, 2.45, 1);
    const fusionSkin2 = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tieTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    fusionSkin2.scale.set(2.2, 2.2, 1);
    const fusionHeart = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: orb,
        color: 0xfff7ea,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    fusionHeart.scale.set(0.72, 0.72, 1);
    const torchHalo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: torchTex,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    torchHalo.scale.set(1.45, 1.45, 1);
    const torchHalo2 = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: torchTex,
        color: 0xff66aa,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    torchHalo2.scale.set(2.05, 2.05, 1);
    const sparkN = 320;
    const sparkPos = new Float32Array(sparkN * 3);
    const sparkCol = new Float32Array(sparkN * 3);
    const sc = new THREE.Color();
    for (let i = 0; i < sparkN; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const rr = 0.72 + Math.random() * 0.55;
      sparkPos[i * 3] = rr * Math.sin(ph) * Math.cos(th);
      sparkPos[i * 3 + 1] = rr * Math.cos(ph);
      sparkPos[i * 3 + 2] = rr * Math.sin(ph) * Math.sin(th);
      sc.setHSL(Math.random(), 0.38, 0.88);
      sparkCol[i * 3] = sc.r;
      sparkCol[i * 3 + 1] = sc.g;
      sparkCol[i * 3 + 2] = sc.b;
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkCol, 3));
    const fusionSparks = new THREE.Points(
      sparkGeo,
      new THREE.PointsMaterial({
        size: 0.038,
        map: orb,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      }),
    );
    const fusion = new THREE.Group();
    fusion.add(fusionBall);
    fusion.add(fusionSkin2);
    fusion.add(fusionHeart);
    fusion.add(torchHalo);
    fusion.add(torchHalo2);
    fusion.add(fusionSparks);
    fusion.scale.setScalar(0.072);
    disk.add(fusion);

    const ndc = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    const vel = new THREE.Vector3();
    const side = new THREE.Vector3();
    const clock = new THREE.Clock();
    let raf = 0;
    let lastPhase = "";
    let frame = 0;
    const tessPos = tessGeo.getAttribute("position");
    const tess2Pos = tess2Geo.getAttribute("position");
    const tessArr = tessPos.array;
    const tess2Arr = tess2Pos.array;

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      rt.setSize(w, h);
      lensMat.uniforms.uRes.value.set(w, h);
      diskMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      frame++;
      const raw = Math.min(clock.getDelta(), 0.1);
      const dtE = raw * 0.4624;
      const dt = dtE * 0.5;
      const t = clock.getElapsedTime();
      const tW = t * 0.34;
      diskMat.uniforms.uTime.value = tW * 0.68;
      diskMat.uniforms.uBirth.value = t;
      lensMat.uniforms.uTime.value = tW;
      blobMat.uniforms.uTime.value = tW;
      const phase =
        t < T_SING
          ? "singularity"
          : t < T_BLOOM
            ? "bloom"
            : t < T_SUCK
              ? "suck"
              : t < T_RING
                ? "ring"
                : t < T_NOVA
                  ? "nova"
                  : "live";
      if (phase !== lastPhase) {
        lastPhase = phase;
        phaseRef.current?.(phase);
      }
      let camZ = 2.08;
      let camX = 0;
      let camY = 0.52;
      if (t < T_SING) {
        camZ = 2.08;
        const fade = 1 - smooth01(t, T_SING - 0.6, T_SING);
        camX = Math.sin(t * 11.2) * 0.008 * fade;
        camY = 0.52 + Math.cos(t * 9.4) * 0.007 * fade;
      } else if (t < T_BLOOM) {
        camZ = 2.08 + 1.7 * smooth01(t, T_SING, T_BLOOM);
      } else if (t < T_SUCK) {
        camZ = 3.78 - 2.0 * smooth01(t, T_BLOOM, T_SUCK);
      } else if (t < T_RING) {
        const ringShake = 1 - smooth01(t, T_RING - 0.6, T_RING);
        camZ = 1.78 + Math.sin(t * 7.4) * 0.022 * ringShake;
        camX = Math.sin(t * 9.6) * 0.007 * ringShake;
        camY = 0.52 + Math.cos(t * 8.2) * 0.007 * ringShake;
      } else {
        camZ = 1.78 + 2.77 * smooth01(t, T_RING, T_NOVA);
      }
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0.08, 0);

      const suckK = t < T_BLOOM ? 1 : 1 - smooth01(t, T_BLOOM, T_SUCK);
      const novaK = t < T_RING ? 0 : Math.min(1, smooth01(t, T_RING, T_RING + (T_NOVA - T_RING) * 0.62));
      const novaExplode = t < T_RING ? 0 : t >= T_NOVA ? 1 : 1 - Math.pow(1 - novaK, 1.4);
      let geoScale = 0;
      if (t >= T_SING && t < T_SUCK) {
        const up = smooth01(t, T_SING + (T_BLOOM - T_SING) * 0.38, T_BLOOM);
        geoScale = Math.min(up, suckK);
      } else if (t >= T_RING) {
        geoScale = novaExplode;
      }
      sacred.visible = geoScale > 0.02;
      wild.visible = geoScale > 0.02;
      sacred.scale.setScalar(geoScale);
      wild.scale.setScalar(geoScale);
      const lateK = t < T_RING ? 0 : smooth01(t, T_RING + 0.12, T_RING + 2.15);
      blob.visible = lateK > 0.03;
      blob.scale.setScalar((t >= T_NOVA ? 1 : novaExplode) * Math.max(lateK, 0.04));
      const late = lateK > 0.05;
      jetA.visible = late;
      jetB.visible = late;
      jetGlowA.visible = late;
      jetGlowB.visible = late;
      farPts.visible = lateK > 0.08;
      const nebK = t < T_NOVA - 1.5 ? 0 : smooth01(t, T_NOVA - 1.5, T_NOVA + 0.7);
      nebulae.forEach((n) => {
        n.visible = nebK > 0.04;
        (n.material).opacity = 0.14 * nebK;
      });
      for (const el of electrons) {
        el.mesh.visible = lateK > 0.08;
        el.trail.visible = lateK > 0.18;
        el.wave.visible = lateK > 0.18;
      }
      fadeWires.forEach((m, i) => {
        const mat = m.material;
        if (t > T_RING + 0.45) {
          const u = Math.max(0, t - T_RING - 0.7 - i * 0.55);
          mat.opacity = Math.min(0.9, u * 0.2);
        } else {
          mat.opacity = 0;
        }
      });
      const fusionAmt =
        t < T_SING
          ? 1
          : t < T_BLOOM
            ? 1 - smooth01(t, T_SING, T_SING + 1.05)
            : t < T_SUCK
              ? smooth01(t, T_SUCK - 0.78, T_SUCK)
              : t < T_RING
                ? 1
                : 1 - smooth01(t, T_RING, T_RING + 1.15);
      const corePulse =
        t < T_SING || (t >= T_SING && t < T_SING + 1.05)
          ? 0.072 + 0.01 * Math.sin(t * 14) + 0.006 * Math.sin(t * 37)
          : t >= T_SUCK - 0.78 && t < T_RING + 1.15
            ? t < T_RING
              ? 0.058 + 0.012 * Math.sin(t * 24) + 0.008 * Math.sin(t * 55)
              : 0.058 * fusionAmt
            : 0.072 * fusionAmt;
      fusion.visible = fusionAmt > 0.02;
      diskPts.visible = fusionAmt < 0.72;
      const gravWin = 0.5 + 0.5 * Math.sin(t * 6.8);
      const fight = Math.sin(t * 6.8);
      const s = Math.max(0.003, corePulse) * (0.9 + 0.12 * Math.sin(t * 6.8));
      fusion.scale.set(s * (1 + 0.1 * fight), s * (1 - 0.16 * gravWin), s * (1 + 0.1 * fight));
      fusion.rotation.y += dt * (t >= T_SUCK && t < T_RING ? 2.4 : 1.55);
      fusion.rotation.z += dt * 0.55;
      fusionMat.rotation = t * 0.65;
      fusionMat.opacity = fusionAmt;
      (fusionSkin2.material).rotation = -t * 0.42;
      (fusionSkin2.material).opacity = 0.38 * fusionAmt;
      (fusionHeart.material).color.setHSL((t * 0.1) % 1, 0.16, 0.96);
      (fusionHeart.material).opacity = 0.85 * fusionAmt;
      fusionHeart.scale.setScalar(0.62 + 0.22 * gravWin);
      (torchHalo.material).rotation = t * 0.55;
      (torchHalo.material).color.setHSL((t * 0.09) % 1, 0.28, 0.92);
      (torchHalo.material).opacity = (0.28 + 0.1 * Math.sin(t * 8)) * fusionAmt;
      (torchHalo2.material).rotation = -t * 0.38;
      (torchHalo2.material).color.setHSL((t * 0.09 + 0.33) % 1, 0.24, 0.9);
      (torchHalo2.material).opacity = (0.18 + 0.08 * Math.sin(t * 6.2 + 1.2)) * fusionAmt;
      fusionSparks.rotation.y += dt * 2.4;
      fusionSparks.rotation.x += dt * 0.9;
      (fusionSparks.material).size = 0.016 + 0.01 * (0.5 + 0.5 * Math.sin(t * 12));
      (fusionSparks.material).opacity = fusionAmt;
      const punch = t < T_RING ? 0 : smooth01(t, T_RING + 0.4, T_RING + 1.9);
      horizon.visible = punch > 0.06;
      horizon.scale.setScalar(Math.max(0.02, punch));
      einstein.visible = punch > 0.06;
      (einstein.material).opacity = 0.75 * punch;
      heatPts.visible = punch > 0.06;
      (heatPts.material).opacity = punch;
      lensMat.uniforms.uPunch.value = punch;
      const breath = 1 + 0.016 * Math.sin(tW * 0.323) + 0.007 * Math.sin(tW * 0.731);
      disk.scale.setScalar(breath);
      disk.rotation.y += 0.0048 * dt;
      const TILT = 0.174533;
      tilt.rotation.x = TILT + Math.sin(tW * 0.075) * 0.024;
      tilt.rotation.z = Math.sin(disk.rotation.y * 0.35 + tW * 0.05) * 0.018;

      einstein.rotation.z += 0.22 * dt;
      heatPts.rotation.y += 0.34 * dt;

      const send = Math.pow(Math.max(0, Math.sin(tW * 0.89)), 4);
      const jetOp = (0.08 + send * 0.29) * lateK;
      const ja = jetA.material;
      const jb = jetB.material;
      ja.uniforms.uPulse.value = jetOp;
      jb.uniforms.uPulse.value = jetOp;
      const pastelW = 0.52 + 0.035 * Math.sin(tW * 0.153);
      ja.uniforms.uColor.value.setHSL(pastelW, 0.14, 0.9);
      jb.uniforms.uColor.value.setHSL(pastelW + 0.02, 0.12, 0.92);
      jetA.scale.set(1, 0.88 + send * 0.34, 1);
      jetB.scale.set(1, 0.88 + send * 0.34, 1);
      const glow = (0.16 + send * 0.5) * lateK;
      (jetGlowA.material).opacity = glow;
      (jetGlowB.material).opacity = glow;
      const gs = 0.18 + send * 0.16;
      jetGlowA.scale.set(gs, gs, 1);
      jetGlowB.scale.set(gs, gs, 1);

      if (late) {
      for (const el of electrons) {
        if (Math.random() < 0.0055) {
          el.M = Math.random() * Math.PI * 2;
          el.vis = 0;
          if (Math.random() < 0.35) {
            el.i = (Math.random() - 0.5) * Math.PI;
            el.Omega = Math.random() * Math.PI * 2;
          }
        }
        el.vis += ((el.vis < 0.5 ? 0 : 1) + (Math.random() < 0.008 ? 0 : 1) - el.vis) * 0.12;
        const rNow = keplerPos(el, tmp);
        const periBoost = 1 + 3.4 / (rNow + 0.07);
        el.M += el.n * dtE * periBoost;
        keplerPos(el, tmp);
        vel.copy(tmp).sub(el.last);
        el.mesh.position.copy(tmp);
        el.mesh.position.x += Math.sin(t * 46 + el.M * 9) * 0.0016;
        el.mesh.position.y += Math.cos(t * 53 + el.M * 7) * 0.0014;
        el.mesh.position.z += Math.sin(t * 41 + el.M * 5) * 0.0013;
        el.mesh.rotation.x += dtE * 4.2;
        el.mesh.rotation.y += dtE * 5.1;
        el.last.copy(tmp);
        (el.mesh.material).opacity = 0.12 + el.vis * 0.86;
        el.mesh.scale.setScalar((0.85 + 0.2 / (rNow + 0.15)) * 0.85 * Math.max(0.05, novaExplode));

        el.hist.copyWithin(3, 0);
        el.hist[0] = tmp.x;
        el.hist[1] = tmp.y;
        el.hist[2] = tmp.z;
        (el.trail.geometry.getAttribute("position")).needsUpdate = true;
        (el.trail.material).opacity = 0.036 + el.vis * 0.084;

        side.set(-vel.z, 0.2, vel.x);
        if (side.lengthSq() < 1e-8) side.set(0, 1, 0);
        side.normalize();
        el.waveHist.copyWithin(3, 0);
        const amp = (0.045 + 0.02 * Math.sin(t * 2 + el.M)) * 0.8;
        const wave = Math.sin(t * 9.5 + el.M * 6) * amp;
        el.waveHist[0] = tmp.x + side.x * wave;
        el.waveHist[1] = tmp.y + side.y * wave + Math.sin(t * 11 + el.M) * 0.01;
        el.waveHist[2] = tmp.z + side.z * wave;
        (el.wave.geometry.getAttribute("position")).needsUpdate = true;
        (el.wave.material).opacity = 0.024 + el.vis * 0.064;
      }
      }

      if (frame % 2 === 0) {
        tesseractLines(tW * 0.16, tessArr);
        tessPos.needsUpdate = true;
        tesseractLines(tW * 0.13 + 1.2, tess2Arr);
        tess2Pos.needsUpdate = true;
      }
      tess.rotation.y += dt * 0.12;
      tess2.rotation.y -= dt * 0.1;
      sierp.rotation.y += dt * 0.09;
      if (sacred.visible) {
        placements.forEach((p) => {
          p.mesh.rotation.x += dt * p.spin;
          p.mesh.rotation.y += dt * p.spin * 0.7;
        });
        wild.children.forEach((ch) => {
          ch.rotation.x += dt * ch.userData.spin;
          ch.rotation.y += dt * ch.userData.spin * 0.55;
        });
        if (frame % 2 === 0) bin.draw(true);
      }

      farPts.rotation.y += dt * 0.007;

      ndc.set(0, 0, 0).project(camera);
      lensMat.uniforms.uBH.value.set(ndc.x * 0.5 + 0.5, ndc.y * 0.5 + 0.5);

      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(lensScene, lensCam);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      rt.dispose();
      orb.dispose();
      nebTex.dispose();
      diskGeo.dispose();
      diskMat.dispose();
      blob.geometry.dispose();
      blobMat.dispose();
      fusionMat.dispose();
      sparkGeo.dispose();
      torchTex.dispose();
      tieTex.dispose();
      farGeo.dispose();
      electrons.forEach((el) => {
        el.trail.geometry.dispose();
        el.wave.geometry.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="galaxy-mount" aria-hidden />;
}
