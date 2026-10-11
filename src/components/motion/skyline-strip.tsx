import type { ReactNode } from "react";
import {
  albanyPlazaNight,
  type Landmark,
  POSTER,
  projectToPoster,
} from "@/components/hero/scene/albany-plaza-night";
import { hashUnit } from "@/lib/hero/motion";

const VB_W = 1600;
const VB_H = 220;

type StripBox = {
  id: string;
  kind: Landmark["kind"];
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
};

function posterBox(lm: Landmark) {
  const base = projectToPoster(lm.position);
  const top = projectToPoster({
    x: lm.position.x,
    y: lm.position.y + lm.size.h,
    z: lm.position.z,
  });
  const w = lm.size.w * POSTER.xScale * base.s;
  return {
    id: lm.id,
    kind: lm.kind,
    x: base.x - w / 2,
    y: top.y,
    w,
    h: Math.max(8, base.y - top.y),
    cx: base.x,
  };
}

function buildBoxes(): StripBox[] {
  const raw = albanyPlazaNight.landmarks.map(posterBox);
  const minY = Math.min(...raw.map((box) => box.y));
  const maxY = Math.max(...raw.map((box) => box.y + box.h));
  const span = Math.max(1, maxY - minY);
  const ground = VB_H - 18;
  const scale = (ground - 22) / span;
  return raw.map((box) => ({
    ...box,
    y: 22 + (box.y - minY) * scale,
    h: box.h * scale,
  }));
}

const BOXES = buildBoxes();

function fillFor(kind: Landmark["kind"]): string {
  if (kind === "corning") return "#162033";
  if (kind === "smith") return "#1c2940";
  if (kind === "capitol") return "#2a3548";
  return "#1a2740";
}

function windowNodes(box: StripBox): ReactNode[] | null {
  if (box.kind === "egg" || box.h < 28) return null;
  const cols = box.kind === "capitol" ? 7 : 3;
  const rows = box.kind === "corning" ? 7 : box.kind === "capitol" ? 3 : 4;
  const nodes: ReactNode[] = [];
  const padX = box.w * 0.16;
  const padY = box.h * 0.12;
  const cw = (box.w - padX * 2) / cols;
  const rh = (box.h - padY * 2) / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const n = hashUnit(box.cx + row * 17.2 + col * 9.4 + box.h);
      if (n < 0.42) continue;
      const group = (row + col) % 3;
      const name = group === 0 ? "a" : group === 1 ? "b" : "c";
      nodes.push(
        <rect
          key={`${box.id}-${row}-${col}`}
          className={`band-twinkle band-twinkle-${name}`}
          x={box.x + padX + col * cw + cw * 0.22}
          y={box.y + padY + row * rh + rh * 0.22}
          width={Math.max(1.2, cw * 0.56)}
          height={Math.max(1.2, rh * 0.5)}
          fill={n > 0.72 ? "#7eebff" : "#ffc56b"}
          opacity={0.55 + n * 0.35}
        />,
      );
    }
  }
  return nodes;
}

function arcPath(): string {
  const from = BOXES.find((box) => box.id === "agency-2");
  const to = BOXES.find((box) => box.id === "capitol");
  if (!from || !to) return "";
  const mx = (from.cx + to.cx) / 2;
  const my = Math.min(from.y, to.y) - 28;
  return `M ${from.cx.toFixed(1)} ${from.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${to.cx.toFixed(1)} ${to.y.toFixed(1)}`;
}

const ARC = arcPath();

function Building({ box }: { box: StripBox }) {
  if (box.kind === "egg") {
    const rx = box.w * 0.34;
    const ry = box.h * 0.42;
    const cy = box.y + box.h * 0.48;
    return <ellipse cx={box.cx} cy={cy} rx={rx} ry={ry} fill="#d9d0c2" />;
  }
  if (box.kind === "capitol") {
    const roof = box.h * 0.42;
    return (
      <g>
        <polygon
          points={`${box.x},${box.y + roof} ${box.cx},${box.y} ${box.x + box.w},${box.y + roof}`}
          fill="#1a2230"
        />
        <rect
          x={box.x}
          y={box.y + roof * 0.72}
          width={box.w}
          height={box.h - roof * 0.72}
          fill={fillFor(box.kind)}
        />
      </g>
    );
  }
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={box.w}
        height={box.h}
        fill={fillFor(box.kind)}
        rx={1.2}
      />
      {box.kind === "corning" ? (
        <g>
          <line
            x1={box.cx}
            y1={box.y}
            x2={box.cx}
            y2={box.y - box.h * 0.08}
            stroke="#9aa8b8"
            strokeWidth={1.4}
          />
          <circle
            cx={box.cx}
            cy={box.y - box.h * 0.09}
            r={2.4}
            fill="#ff5a5a"
          />
        </g>
      ) : null}
      {box.kind === "smith" ? (
        <rect
          x={box.x + box.w * 0.28}
          y={box.y - box.h * 0.06}
          width={box.w * 0.44}
          height={box.h * 0.06}
          fill="#31445e"
        />
      ) : null}
    </g>
  );
}

/** Mini Albany plaza silhouette. Same projection as the home poster. */
export function SkylineStrip({
  idPrefix,
  variant,
}: {
  idPrefix: string;
  variant: "band" | "line";
}) {
  const sky = `${idPrefix}-sky`;
  return (
    <svg
      className={variant === "line" ? "footer-skyline-svg" : "page-band-svg"}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax slice"
      role="presentation"
      focusable="false"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#050814" />
          <stop offset="58%" stopColor="#0c1830" />
          <stop offset="100%" stopColor="#081018" />
        </linearGradient>
      </defs>
      {variant === "band" ? (
        <rect width={VB_W} height={VB_H} fill={`url(#${sky})`} />
      ) : null}
      {BOXES.map((box) => (
        <Building key={box.id} box={box} />
      ))}
      {variant === "band"
        ? BOXES.map((box) => <g key={`w-${box.id}`}>{windowNodes(box)}</g>)
        : null}
      <rect x={0} y={VB_H - 18} width={VB_W} height={18} fill="#070b12" />
      {variant === "band" && ARC ? <path className="band-arc" d={ARC} /> : null}
      {variant === "line" ? (
        <rect
          className="footer-skyline-sheen"
          x={0}
          y={0}
          width={VB_W}
          height={VB_H}
          fill="#7ec8e3"
        />
      ) : null}
    </svg>
  );
}
