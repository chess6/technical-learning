import { bfsPseudocodeWriteinManifest } from "../manifests/bfsPseudocodeWritein";
import { makeBfsTreatmentReplicaScene } from "./bfsFrontierReplicaScene";

export const bfsPseudocodeWriteinReplicaScene = makeBfsTreatmentReplicaScene(
  bfsPseudocodeWriteinManifest,
  "graph",
);
