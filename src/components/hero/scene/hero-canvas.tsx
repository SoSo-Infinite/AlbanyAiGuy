"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { buildCity } from "./city";
import { CityLife } from "./city-life";
import { MascotRider } from "./mascot-rider";
import { getScene } from "./scenes";
import { type CitySim, createSim } from "./sim";
import { createHeroTextures, type HeroTextures } from "./textures";

// r3f 9.8 constructs THREE.Clock during Canvas setup. three r186 warns once
// that Clock is deprecated. The warning fires in a child layout effect, before
// any parent effect can filter it, so the filter has to be in place when this
// chunk evaluates. Other warnings still reach the original console.warn.
const nativeWarn = console.warn.bind(console);
console.warn = (...args: Parameters<typeof console.warn>) => {
  const text = args.map((item) => String(item)).join(" ");
  if (text.includes("THREE.Clock") && text.includes("deprecated")) return;
  nativeWarn(...args);
};

export type HeroCanvasProps = {
  onFirstFrame: () => void;
  onFail: () => void;
};

type BoundaryProps = {
  children: ReactNode;
  onFail: () => void;
};

type BoundaryState = { failed: boolean };

class CanvasErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function SimClock({ sim }: { sim: CitySim }) {
  useFrame((_, delta) => {
    sim.time += Math.min(delta, 0.05);
  });
  return null;
}

const LOOK = new THREE.Vector3(1.2, 6, 0);

function CameraRig() {
  const fine = useRef(false);
  const stage = useRef<HTMLElement | null>(null);
  useEffect(() => {
    stage.current = document.getElementById("home-hero");
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => {
      fine.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const raw = stage.current?.style.getPropertyValue("--hero-scroll") ?? "0";
    const progress = Math.min(1, Math.max(0, Number(raw) || 0));
    const px = fine.current ? state.pointer.x * 0.7 : 0;
    const py = fine.current ? state.pointer.y * 0.28 : 0;
    state.camera.position.set(
      0.2 + Math.sin(t * 0.085) * 0.55 + px,
      7.4 + Math.sin(t * 0.06) * 0.22 + py + progress * 0.9,
      24 + progress * 6.2,
    );
    state.camera.lookAt(LOOK);
  });
  return null;
}

function Skyline({ sim, textures }: { sim: CitySim; textures: HeroTextures }) {
  const city = useMemo(() => buildCity(getScene(), textures), [textures]);
  useEffect(() => () => city.dispose(), [city]);
  useFrame((state, delta) => {
    city.tick(sim, Math.min(delta, 0.05), state.camera);
  });
  return <primitive object={city.group} />;
}

function SceneFog() {
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    const prev = scene.fog;
    scene.fog = new THREE.FogExp2("#102033", 0.032);
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  return null;
}

function LoopGate() {
  const setFrameloop = useThree((state) => state.setFrameloop);
  useEffect(() => {
    const stage = document.getElementById("home-hero");
    if (!stage) return;
    let onScreen = true;
    const sync = () => {
      const hidden = document.visibilityState === "hidden";
      setFrameloop(!hidden && onScreen ? "always" : "never");
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.01 },
    );
    observer.observe(stage);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [setFrameloop]);
  return null;
}

function FirstPaint({ onFirstFrame }: { onFirstFrame: () => void }) {
  const sent = useRef(false);
  useFrame(() => {
    if (sent.current) return;
    sent.current = true;
    onFirstFrame();
  });
  return null;
}

function HeroScene({
  sim,
  textures,
  onFirstFrame,
}: {
  sim: CitySim;
  textures: HeroTextures;
  onFirstFrame: () => void;
}) {
  return (
    <>
      <SimClock sim={sim} />
      <SceneFog />
      <CameraRig />
      <MascotRider sim={sim} textures={textures} />
      <CityLife sim={sim} textures={textures} />
      <Skyline sim={sim} textures={textures} />
      <LoopGate />
      <FirstPaint onFirstFrame={onFirstFrame} />
    </>
  );
}

function CanvasInner({ onFirstFrame, onFail }: HeroCanvasProps) {
  const sim = useMemo(() => createSim(), []);
  const [textures, setTextures] = useState<HeroTextures | null>(null);
  const held = useRef<HeroTextures | null>(null);

  useEffect(() => {
    let cancelled = false;
    createHeroTextures()
      .then((next) => {
        if (cancelled) {
          next.dispose();
          return;
        }
        held.current = next;
        setTextures(next);
      })
      .catch(() => {
        if (!cancelled) onFail();
      });
    return () => {
      cancelled = true;
      held.current?.dispose();
      held.current = null;
    };
  }, [onFail]);

  if (!textures) return null;

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        antialias: true,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{
        fov: 38,
        near: 0.1,
        far: 240,
        position: [0.2, 7.4, 24],
      }}
      style={{ pointerEvents: "inherit" }}
      aria-hidden
      onCreated={({ gl }) => {
        gl.setClearColor("#070b16", 1);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <HeroScene sim={sim} textures={textures} onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}

export default function HeroCanvas(props: HeroCanvasProps) {
  return (
    <CanvasErrorBoundary onFail={props.onFail}>
      <CanvasInner {...props} />
    </CanvasErrorBoundary>
  );
}
