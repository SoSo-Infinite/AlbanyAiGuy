import { hashUnit } from "@/lib/hero/motion";
import {
  albanyPlazaNight,
  type Landmark,
  POSTER,
  projectToPoster,
} from "./scene/albany-plaza-night";

const STARS = (() => {
  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 48; i++) {
    const n = hashUnit(i * 19.7 + 4);
    const m = hashUnit(i * 7.3 + 11);
    stars.push({
      x: 70 + n * (POSTER.w - 140),
      y: 36 + m * 460,
      r: hashUnit(i + 2) > 0.86 ? 1.8 : 0.85,
      o: 0.35 + hashUnit(i + 5) * 0.55,
    });
  }
  return stars;
})();

function screenBox(lm: Landmark) {
  const base = projectToPoster(lm.position);
  const top = projectToPoster({
    x: lm.position.x,
    y: lm.position.y + lm.size.h,
    z: lm.position.z,
  });
  const w = lm.size.w * POSTER.xScale * base.s;
  return {
    x: base.x - w / 2,
    y: top.y,
    w,
    h: Math.max(8, base.y - top.y),
    baseY: base.y,
    s: base.s,
    cx: base.x,
  };
}

function Windows({
  x,
  y,
  w,
  h,
  cols,
  rows,
  seed,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
  seed: number;
}) {
  const pad = 0.2;
  const cw = w / cols;
  const rh = h / rows;
  const nodes: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const n = hashUnit(seed + row * 17.2 + col * 9.4);
      if (n < 0.2) continue;
      const group = (row + col) % 3;
      const name = group === 0 ? "a" : group === 1 ? "b" : "c";
      nodes.push(
        <rect
          key={`${seed}-${row}-${col}`}
          className={`hero-win hero-win-${name}`}
          x={x + col * cw + cw * pad}
          y={y + row * rh + rh * pad}
          width={Math.max(1, cw * (1 - pad * 2))}
          height={Math.max(1, rh * (1 - pad * 2))}
          fill={n > 0.72 ? "#7eebff" : "#ffc56b"}
          opacity={0.55 + n * 0.4}
        />,
      );
    }
  }
  return nodes;
}

function Tower({
  lm,
  cols,
  rows,
  fill,
  crown,
}: {
  lm: Landmark;
  cols: number;
  rows: number;
  fill: string;
  crown?: "band" | "steps";
}) {
  const box = screenBox(lm);
  const capH = Math.max(6, box.h * 0.035);
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill={fill}
        rx={1.5}
      />
      <Windows
        x={box.x + box.w * 0.08}
        y={box.y + box.h * 0.06}
        w={box.w * 0.84}
        h={box.h * (crown === "band" ? 0.78 : 0.86)}
        cols={cols}
        rows={rows}
        seed={lm.position.x * 10 + box.h}
      />
      {crown === "band" ? (
        <g>
          <rect
            x={box.x - box.w * 0.04}
            y={box.y + box.h * 0.84}
            width={box.w * 1.08}
            height={box.h * 0.055}
            fill="#0c121c"
          />
          <rect
            x={box.x + box.w * 0.08}
            y={box.y + box.h * 0.9}
            width={box.w * 0.84}
            height={box.h * 0.07}
            fill="#24344a"
          />
          <line
            x1={box.cx}
            y1={box.y}
            x2={box.cx}
            y2={box.y - box.h * 0.06}
            stroke="#9aa8b8"
            strokeWidth={1.4}
          />
          <circle
            cx={box.cx}
            cy={box.y - box.h * 0.065}
            r={3.2}
            fill="#ff3b3b"
          />
          <circle
            cx={box.cx}
            cy={box.y - box.h * 0.065}
            r={8}
            fill="#ff3b3b"
            opacity={0.35}
          />
        </g>
      ) : null}
      {crown === "steps" ? (
        <g>
          <rect
            x={box.x + box.w * 0.12}
            y={box.y - box.h * 0.045}
            width={box.w * 0.76}
            height={box.h * 0.05}
            fill="#24344a"
          />
          <rect
            x={box.x + box.w * 0.28}
            y={box.y - box.h * 0.09}
            width={box.w * 0.44}
            height={box.h * 0.048}
            fill="#1c2a3e"
          />
          <rect
            x={box.x + box.w * 0.4}
            y={box.y - box.h * 0.13}
            width={box.w * 0.2}
            height={box.h * 0.042}
            fill="#31445e"
          />
        </g>
      ) : null}
      {crown == null ? (
        <rect
          x={box.x - box.w * 0.06}
          y={box.y - capH * 0.3}
          width={box.w * 1.12}
          height={capH}
          fill="#121a28"
        />
      ) : null}
    </g>
  );
}

function Capitol({ lm }: { lm: Landmark }) {
  const box = screenBox(lm);
  const wallH = box.h;
  const roofH = wallH * 0.72;
  const turretW = box.w * 0.1;
  const turretH = wallH * 1.15;
  const turrets = [-0.46, -0.18, 0.18, 0.46];
  return (
    <g>
      <rect x={box.x} y={box.y} width={box.w} height={wallH} fill="#2a3548" />
      <polygon
        points={`${box.x - 6},${box.y + 8} ${box.cx},${box.y - roofH} ${box.x + box.w + 6},${box.y + 8}`}
        fill="#1a2230"
      />
      <polygon
        points={`${box.cx - box.w * 0.16},${box.y - roofH * 0.15} ${box.cx},${box.y - roofH - turretH * 0.35} ${box.cx + box.w * 0.16},${box.y - roofH * 0.15}`}
        fill="#243044"
      />
      {turrets.map((t) => {
        const tx = box.cx + t * box.w - turretW / 2;
        const ty = box.y - turretH * 0.55;
        return (
          <g key={t}>
            <rect
              x={tx}
              y={ty}
              width={turretW}
              height={turretH}
              fill="#243044"
            />
            <polygon
              points={`${tx - 3},${ty + 4} ${tx + turretW / 2},${ty - turretW * 1.15} ${tx + turretW + 3},${ty + 4}`}
              fill="#121822"
            />
          </g>
        );
      })}
      <Windows
        x={box.x + box.w * 0.06}
        y={box.y + wallH * 0.12}
        w={box.w * 0.88}
        h={wallH * 0.78}
        cols={8}
        rows={3}
        seed={42}
      />
    </g>
  );
}

function Egg({ lm }: { lm: Landmark }) {
  const base = projectToPoster(lm.position);
  const rx = lm.size.w * POSTER.xScale * 0.4 * base.s;
  const ry = lm.size.h * POSTER.yScale * 0.52 * base.s;
  const foot = base.y;
  const stemTop = foot - ry * 0.22;
  const bodyY = stemTop - ry * 0.08;
  return (
    <g>
      <path
        d={`M ${base.x - rx * 0.62} ${foot}
            C ${base.x - rx * 0.34} ${foot - ry * 0.05},
              ${base.x - rx * 0.22} ${stemTop},
              ${base.x - rx * 0.16} ${stemTop}
            L ${base.x + rx * 0.2} ${stemTop}
            C ${base.x + rx * 0.34} ${stemTop},
              ${base.x + rx * 0.7} ${foot - ry * 0.02},
              ${base.x + rx * 0.78} ${foot} Z`}
        fill="url(#hero-egg-stem)"
      />
      <g transform={`translate(${base.x} ${bodyY}) rotate(-18)`}>
        <path
          d={`M 0 ${-ry}
              C ${rx * 0.78} ${-ry * 0.78}, ${rx * 1.02} ${-ry * 0.08}, ${rx * 0.9} ${ry * 0.38}
              C ${rx * 0.62} ${ry * 0.92}, ${-rx * 0.62} ${ry * 0.92}, ${-rx * 0.9} ${ry * 0.38}
              C ${-rx * 1.02} ${-ry * 0.08}, ${-rx * 0.78} ${-ry * 0.78}, 0 ${-ry} Z`}
          fill="url(#hero-egg-shade)"
        />
        <ellipse
          cx={0}
          cy={ry * 0.58}
          rx={rx * 0.78}
          ry={ry * 0.11}
          fill="#4a4338"
          opacity={0.9}
        />
        <ellipse
          cx={-rx * 0.22}
          cy={-ry * 0.42}
          rx={rx * 0.42}
          ry={ry * 0.26}
          fill="#fff4e4"
          opacity={0.16}
        />
        <ellipse
          cx={0}
          cy={ry * 0.78}
          rx={rx * 0.7}
          ry={ry * 0.16}
          fill="#f0c27a"
          opacity={0.28}
        />
      </g>
    </g>
  );
}

function Reflection({ lm }: { lm: Landmark }) {
  if (lm.kind === "egg" || lm.kind === "capitol") return null;
  const box = screenBox(lm);
  const h = Math.min(box.h * 0.42, 120);
  return (
    <rect
      x={box.x}
      y={POSTER.groundY + 36}
      width={box.w}
      height={h}
      fill="#8ea4c4"
      opacity={0.13}
    />
  );
}

function arc(fromId: string, toId: string) {
  const from = albanyPlazaNight.roofs.find((item) => item.id === fromId);
  const to = albanyPlazaNight.roofs.find((item) => item.id === toId);
  if (!from || !to) return "";
  const a = projectToPoster(from.position);
  const b = projectToPoster(to.position);
  const mx = (a.x + b.x) / 2;
  const my = Math.min(a.y, b.y) - 78;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/** Static night poster. No JavaScript, no animation. This is the LCP frame. */
export function HeroPoster() {
  const ordered = [...albanyPlazaNight.landmarks].sort(
    (a, b) => a.position.z - b.position.z,
  );
  return (
    <svg
      className="hero-svg"
      viewBox={`0 0 ${POSTER.w} ${POSTER.h}`}
      role="presentation"
      focusable="false"
    >
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050814" />
          <stop offset="48%" stopColor="#0c1830" />
          <stop offset="78%" stopColor="#16304a" />
          <stop offset="100%" stopColor="#0a1424" />
        </linearGradient>
        <radialGradient id="hero-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7f3e8" stopOpacity="0.95" />
          <stop offset="28%" stopColor="#d5e4f5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d5e4f5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-egg-shade" x1="0.15" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f4eee4" />
          <stop offset="42%" stopColor="#d9d0c2" />
          <stop offset="78%" stopColor="#b3a894" />
          <stop offset="100%" stopColor="#7c7264" />
        </linearGradient>
        <linearGradient id="hero-egg-stem" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#6d6458" />
          <stop offset="58%" stopColor="#cfc4b2" />
          <stop offset="100%" stopColor="#f0d7a4" />
        </linearGradient>
        <radialGradient id="hero-horizon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e0a15a" stopOpacity="0.42" />
          <stop offset="42%" stopColor="#24507a" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#24507a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#102033" />
          <stop offset="100%" stopColor="#060b12" />
        </linearGradient>
      </defs>
      <rect width={POSTER.w} height={POSTER.h} fill="url(#hero-sky)" />
      <circle cx={1188} cy={168} r={92} fill="url(#hero-moon-glow)" />
      <circle cx={1188} cy={168} r={34} fill="#f4f1e4" />
      <circle cx={1176} cy={158} r={28} fill="#e7e0d0" opacity={0.35} />
      {STARS.map((star) => (
        <circle
          key={`${star.x.toFixed(1)}-${star.y.toFixed(1)}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="#f4f7fb"
          opacity={star.o}
        />
      ))}
      <ellipse
        cx={POSTER.w / 2}
        cy={POSTER.groundY - 8}
        rx={860}
        ry={78}
        fill="url(#hero-horizon)"
      />
      <rect
        x={0}
        y={POSTER.groundY + 22}
        width={POSTER.w}
        height={POSTER.h - POSTER.groundY - 22}
        fill="url(#hero-water)"
      />
      <rect
        x={80}
        y={POSTER.groundY - 6}
        width={POSTER.w - 160}
        height={34}
        fill="#121a28"
      />
      {ordered.map((lm) => {
        if (lm.kind === "egg") return <Egg key={lm.id} lm={lm} />;
        if (lm.kind === "capitol") return <Capitol key={lm.id} lm={lm} />;
        if (lm.kind === "corning") {
          return (
            <Tower
              key={lm.id}
              lm={lm}
              cols={3}
              rows={14}
              fill="#162033"
              crown="band"
            />
          );
        }
        if (lm.kind === "smith") {
          return (
            <Tower
              key={lm.id}
              lm={lm}
              cols={3}
              rows={9}
              fill="#1c2940"
              crown="steps"
            />
          );
        }
        return <Tower key={lm.id} lm={lm} cols={3} rows={8} fill="#1a2740" />;
      })}
      <g className="hero-reflect">
        {ordered.map((lm) => (
          <Reflection key={`r-${lm.id}`} lm={lm} />
        ))}
      </g>
      <path
        className="hero-arc"
        pathLength={100}
        d={arc("agency-2-roof", "corning-roof")}
      />
      <path
        className="hero-arc hero-arc-b"
        pathLength={100}
        d={arc("corning-roof", "smith-roof")}
      />
      <path
        className="hero-arc hero-arc-c"
        pathLength={100}
        d={arc("agency-4-roof", "capitol-roof")}
      />
    </svg>
  );
}
