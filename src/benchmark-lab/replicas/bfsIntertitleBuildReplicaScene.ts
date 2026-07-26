import { bfsIntertitleBuildManifest } from "../manifests/bfsIntertitleBuild";
import { makeBfsTreatmentReplicaScene } from "./bfsFrontierReplicaScene";

export const bfsIntertitleBuildReplicaScene = makeBfsTreatmentReplicaScene(
  bfsIntertitleBuildManifest,
  "empty",
);
