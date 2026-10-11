"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { createCityBuild } from "./city";
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

const HOME = {
  x: 3.1,
  y: 1.8,
  z: 32,
  lx: 1.8,
  ly: 4.0,
  lz: -1,
};

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
    const px = fine.current ? state.pointer.x * 0.45 : 0;
    const py = fine.current ? state.pointer.y * 0.16 : 0;
    state.camera.position.set(
      HOME.x + Math.sin(t * 0.07) * 0.28 + px,
      HOME.y + Math.sin(t * 0.05) * 0.08 + py + progress * 0.4,
      HOME.z + progress * 3.2,
    );
    state.camera.lookAt(HOME.lx + px * 0.1, HOME.ly, HOME.lz);
  });
  return null;
}

function Skyline({
  sim,
  textures,
  onBuilt,
  onFail,
}: {
  sim: CitySim;
  textures: HeroTextures;
  onBuilt: () => void;
  onFail: () => void;
}) {
  const city = useMemo(() => createCityBuild(getScene(), textures), [textures]);
  const built = useRef(false);
  useEffect(() => {
    let dead = false;
    let raf = 0;
    const run = () => {
      if (dead) return;
      let done = false;
      try {
        done = city.advance();
      } catch {
        if (!dead) onFail();
        return;
      }
      if (done) {
        if (!built.current) {
          built.current = true;
          onBuilt();
        }
        return;
      }
      raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      city.dispose();
    };
  }, [city, onBuilt, onFail]);
  useFrame((state, delta) => {
    if (!built.current) return;
    city.tick(sim, Math.min(delta, 0.05), state.camera);
  });
  return <primitive object={city.group} />;
}

function SceneFog() {
  const scene = useThree((state) => state.scene);
  useEffect(() => {
    const prev = scene.fog;
    scene.fog = new THREE.FogExp2("#16304c", 0.016);
    return () => {
      scene.fog = prev;
    };
  }, [scene]);
  return null;
}

function LoopGate({ live }: { live: boolean }) {
  const setFrameloop = useThree((state) => state.setFrameloop);
  useEffect(() => {
    const stage = document.getElementById("home-hero");
    if (!stage || !live) {
      setFrameloop("never");
      return;
    }
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
  }, [setFrameloop, live]);
  return null;
}

function FirstPaint({
  live,
  onFirstFrame,
}: {
  live: boolean;
  onFirstFrame: () => void;
}) {
  const sent = useRef(false);
  useFrame(() => {
    if (!live || sent.current) return;
    sent.current = true;
    onFirstFrame();
  });
  return null;
}

function CompileGate({
  built,
  onLive,
}: {
  built: boolean;
  onLive: () => void;
}) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  useEffect(() => {
    if (!built) return;
    let dead = false;
    const cap = window.setTimeout(() => {
      if (!dead) onLive();
    }, 2800);
    const parallel = gl
      .getContext()
      .getExtension("KHR_parallel_shader_compile");
    if (parallel) {
      gl.compileAsync(scene, camera)
        .then(() => {
          if (!dead) onLive();
        })
        .catch(() => {
          if (!dead) onLive();
        });
    } else {
      gl.compile(scene, camera);
      if (!dead) onLive();
    }
    return () => {
      dead = true;
      window.clearTimeout(cap);
    };
  }, [built, gl, scene, camera, onLive]);
  return null;
}

function HeroScene({
  sim,
  textures,
  onFirstFrame,
  onFail,
}: {
  sim: CitySim;
  textures: HeroTextures;
  onFirstFrame: () => void;
  onFail: () => void;
}) {
  const [built, setBuilt] = useState(false);
  const [live, setLive] = useState(false);
  const onBuilt = useCallback(() => setBuilt(true), []);
  const onLive = useCallback(() => setLive(true), []);
  return (
    <>
      <SimClock sim={sim} />
      <SceneFog />
      <CameraRig />
      <MascotRider sim={sim} textures={textures} />
      <CityLife sim={sim} textures={textures} />
      <Skyline
        sim={sim}
        textures={textures}
        onBuilt={onBuilt}
        onFail={onFail}
      />
      <CompileGate built={built} onLive={onLive} />
      <LoopGate live={live} />
      <FirstPaint live={live} onFirstFrame={onFirstFrame} />
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
      frameloop="never"
      gl={{
        antialias: true,
        alpha: false,
        stencil: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      camera={{
        fov: 40,
        near: 0.1,
        far: 280,
        position: [HOME.x, HOME.y, HOME.z],
      }}
      style={{ pointerEvents: "inherit" }}
      aria-hidden
      onCreated={({ gl, camera }) => {
        camera.lookAt(HOME.lx, HOME.ly, HOME.lz);
        gl.setClearColor("#070b16", 1);
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <HeroScene
        sim={sim}
        textures={textures}
        onFirstFrame={onFirstFrame}
        onFail={onFail}
      />
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
