/**
 * KarmaV2Scene — explicit V2 rendering path (§8)
 * KarmaVideo: V1 → KarmaGraphScene, V2 → KarmaV2Scene (based on schemaVersion)
 * Handles semantic objects, TRAVEL animation, FOLLOW camera, object continuity.
 */
import React from "react";
import { SemanticScene } from "./SemanticScene";
import { FirstVerticalSliceScene } from "./FirstVerticalSliceScene";
import type { SemanticSceneSpec } from "../schema/semanticSceneSpec";

export const KarmaV2Scene: React.FC<{ spec: SemanticSceneSpec }> = ({ spec }) => {
  const intent = (spec as any).visualIntent ?? (spec as any).intent;
  const sceneId = (spec as any).sceneId ?? "";
  // Quality-corrected first vertical slice: Mobile App → Payment Request → API Gateway
  if (intent === "REQUEST_FLOW" || intent === "REQUEST_INITIATION" || sceneId === "payment-request" || sceneId === "mobile-app-payment") {
    return <FirstVerticalSliceScene />;
  }
  return <SemanticScene spec={spec} />;
};
