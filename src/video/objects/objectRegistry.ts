/**
 * ObjectRegistry — §11 continuity: same logical id keeps visualIdentity across scenes.
 * Simple in-memory map; renderer receives full video registry via spec.registry.
 */
import type { SemanticObject, ObjectRegistry } from "../schema/semanticSceneSpec";

const registry: ObjectRegistry = {};

export function registerObject(obj: SemanticObject, sceneIndex: number): void {
  if (!registry[obj.id]) {
    registry[obj.id] = { type: obj.type, visualIdentity: obj.visualIdentity ?? `${obj.type.toLowerCase()}-01`, lastSeenScene: sceneIndex };
  } else {
    registry[obj.id].lastSeenScene = sceneIndex;
  }
}

export function getVisualIdentity(id: string): string | undefined {
  return registry[id]?.visualIdentity;
}

export function snapshot(): ObjectRegistry { return { ...registry }; }

export function hydrate(input?: ObjectRegistry): void {
  if (!input) return;
  Object.assign(registry, input);
}

export function clear(): void { Object.keys(registry).forEach(k => delete registry[k]); }
