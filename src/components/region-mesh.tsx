"use client";

import { cn } from "@/lib/utils";

const NODES = [
  { id: "plattsburgh", x: 62, y: 8, r: 2.2, label: "Plattsburgh", k: "edge" },
  { id: "glens", x: 52, y: 18, r: 2.6, label: "Glens Falls", k: "live" },
  { id: "saratoga", x: 50, y: 30, r: 3.1, label: "Saratoga", k: "core" },
  { id: "clifton", x: 48, y: 42, r: 2.8, label: "Clifton Park", k: "core" },
  { id: "amsterdam", x: 22, y: 48, r: 2.4, label: "Amsterdam", k: "live" },
  { id: "schenectady", x: 34, y: 54, r: 3.2, label: "Schenectady", k: "core" },
  { id: "colonie", x: 44, y: 56, r: 2.6, label: "Colonie", k: "core" },
  { id: "albany", x: 50, y: 62, r: 4.2, label: "Albany", k: "hub" },
  { id: "troy", x: 60, y: 52, r: 3.2, label: "Troy", k: "core" },
  { id: "latham", x: 54, y: 50, r: 2.2, label: "Latham", k: "core" },
  { id: "delmar", x: 46, y: 72, r: 2.2, label: "Delmar", k: "core" },
  { id: "eg", x: 60, y: 68, r: 2.2, label: "E. Greenbush", k: "core" },
  { id: "hudson", x: 64, y: 86, r: 2.6, label: "Hudson", k: "live" },
  { id: "catskill", x: 48, y: 90, r: 2.4, label: "Catskill", k: "live" },
] as const;

const LINKS: [string, string][] = [
  ["plattsburgh", "glens"],
  ["glens", "saratoga"],
  ["saratoga", "clifton"],
  ["clifton", "albany"],
  ["clifton", "latham"],
  ["amsterdam", "schenectady"],
  ["schenectady", "colonie"],
  ["colonie", "albany"],
  ["latham", "troy"],
  ["troy", "albany"],
  ["albany", "delmar"],
  ["albany", "eg"],
  ["eg", "hudson"],
  ["delmar", "catskill"],
  ["hudson", "catskill"],
  ["schenectady", "albany"],
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

export function RegionMesh({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("h-full w-full text-primary", className)}
      role="img"
      aria-label="Schematic of the 518 Capital Region network"
    >
      <circle cx="50" cy="62" r="24" className="fill-primary/15" />
      {LINKS.map(([a, b]) => {
        const A = byId[a];
        const B = byId[b];
        if (!A || !B) return null;
        return (
          <line
            key={`${a}-${b}`}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            className="stroke-primary/40"
            strokeWidth="0.55"
          />
        );
      })}
      {NODES.map((n) => (
        <g key={n.id}>
          {n.k === "hub" ? (
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r + 3.8}
              className="mesh-pulse fill-none stroke-primary/60"
              strokeWidth="0.5"
            />
          ) : null}
          <circle
            cx={n.x}
            cy={n.y}
            r={n.r}
            className={
              n.k === "hub"
                ? "fill-primary stroke-primary"
                : n.k === "edge"
                  ? "fill-card stroke-primary/50"
                  : "fill-card stroke-primary"
            }
            strokeWidth="0.55"
          />
          <text
            x={n.x + n.r + 1.8}
            y={n.y + 1.1}
            className="fill-muted-foreground"
            fontSize="3.2"
            fontFamily="ui-monospace, monospace"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
