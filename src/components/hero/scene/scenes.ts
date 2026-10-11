import { type AlbanyScene, albanyPlazaNight } from "./albany-plaza-night";

/**
 * Night scenes the hero can show. Phase 2 ships a single plaza view.
 * A later packet can append riverfront, Capitol close-up, or another
 * Albany skyline and cycle `getScene` without restructuring the renderer.
 */
export const SCENES: readonly AlbanyScene[] = [albanyPlazaNight];

export function getScene(id: string = albanyPlazaNight.id): AlbanyScene {
  return SCENES.find((scene) => scene.id === id) ?? SCENES[0];
}
