import { abPredictionRevealManifest } from "../manifests/abPredictionReveal";
import { makeAbTreatmentReplicaScene } from "./abSplitReplicaScene";

export const abPredictionRevealReplicaScene = makeAbTreatmentReplicaScene(
  abPredictionRevealManifest,
  false,
);
