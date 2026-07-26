import { CONTINUOUS_SPACE_BEAT_CONTRACTS } from "./continuousSpaceBeatSpecs";
import { MATRIX_TRANSFORMATION_BEAT_CONTRACT } from "./matrixTransformationBeatSpec";
import type { SceneBeatContract } from "./beatSpec";

export const AUTHORING_BEAT_CONTRACTS = {
  ...CONTINUOUS_SPACE_BEAT_CONTRACTS,
  "matrix-transformations": MATRIX_TRANSFORMATION_BEAT_CONTRACT,
} as const satisfies Record<string, SceneBeatContract>;

export type AuthoringContractSceneId = keyof typeof AUTHORING_BEAT_CONTRACTS;

export function authoringBeatContract(sceneId: string): SceneBeatContract {
  const contract =
    AUTHORING_BEAT_CONTRACTS[sceneId as AuthoringContractSceneId];
  if (!contract) {
    throw new Error(`Scene "${sceneId}" has no BeatSpec authoring contract.`);
  }
  return contract;
}
