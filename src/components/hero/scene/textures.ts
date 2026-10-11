import * as THREE from "three";

export type HeroTextures = {
  glow: THREE.CanvasTexture;
  phone: THREE.CanvasTexture;
  check: THREE.CanvasTexture;
  ring: THREE.CanvasTexture;
  shake: THREE.CanvasTexture;
  mascot: THREE.CanvasTexture;
  dispose: () => void;
};

function canvasTexture(
  draw: (ctx: CanvasRenderingContext2D, size: number) => void,
  size = 128,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function bleedRgb(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  const cutoff = 20;
  for (let pass = 0; pass < 3; pass++) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < h - 1; y++) {
      const row = y * w;
      for (let x = 1; x < w - 1; x++) {
        const i = (row + x) * 4;
        if (copy[i + 3] > cutoff) continue;
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        const neighbors = [i - 4, i + 4, i - w * 4, i + w * 4];
        for (const j of neighbors) {
          if (copy[j + 3] > cutoff) {
            r += copy[j];
            g += copy[j + 1];
            b += copy[j + 2];
            n += 1;
          }
        }
        if (n > 0) {
          data[i] = r / n;
          data[i + 1] = g / n;
          data[i + 2] = b / n;
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}

function loadMascot(): Promise<THREE.CanvasTexture> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject(new Error("mascot"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      bleedRgb(ctx, canvas.width, canvas.height);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = 4;
      resolve(tex);
    };
    img.onerror = () => reject(new Error("mascot"));
    img.src = "/mascot/mascot-whirlwind-709.webp";
  });
}

export async function createHeroTextures(): Promise<HeroTextures> {
  const glow = canvasTexture((ctx, size) => {
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.12, "rgba(255,255,255,0.55)");
    g.addColorStop(0.28, "rgba(255,255,255,0.08)");
    g.addColorStop(0.42, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
  const phone = canvasTexture((ctx, size) => {
    ctx.translate(size / 2, size / 2);
    ctx.strokeStyle = "#e8fbff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(-28, -48, 56, 96, 10);
    ctx.stroke();
    ctx.fillStyle = "rgba(0,200,240,0.28)";
    ctx.fillRect(-20, -28, 40, 52);
    ctx.fillStyle = "#e8fbff";
    ctx.fillRect(-8, -40, 16, 5);
  });
  const check = canvasTexture((ctx, size) => {
    ctx.translate(size / 2, size / 2);
    ctx.strokeStyle = "#d8ffe8";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18, 2);
    ctx.lineTo(-4, 16);
    ctx.lineTo(20, -16);
    ctx.stroke();
  });
  const ring = canvasTexture((ctx, size) => {
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.28,
      size / 2,
      size / 2,
      size * 0.48,
    );
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.55, "rgba(255,255,255,0.95)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  });
  const shake = canvasTexture((ctx, size) => {
    ctx.strokeStyle = "#d8fbff";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const y = size * (0.32 + i * 0.16);
        ctx.beginPath();
        ctx.moveTo(size / 2 + side * 28, y);
        ctx.lineTo(size / 2 + side * (42 + i * 6), y - 8);
        ctx.stroke();
      }
    }
  });
  const mascot = await loadMascot();
  const all = [glow, phone, check, ring, shake, mascot];
  return {
    glow,
    phone,
    check,
    ring,
    shake,
    mascot,
    dispose: () => {
      for (const tex of all) tex.dispose();
    },
  };
}

export function glowMaterial(
  map: THREE.Texture,
  color: string,
  opacity = 1,
): THREE.SpriteMaterial {
  return new THREE.SpriteMaterial({
    map,
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    fog: false,
    // AdditiveBlending ignores alpha unless this is set.
    premultipliedAlpha: true,
    alphaTest: 0.04,
  });
}
