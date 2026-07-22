/**
 * JSON-safe value type — the canonical shape of anything the platform persists.
 *
 * Lives in the platform layer so both the pure grading capabilities
 * (`src/lessons/capabilities.ts`) and the learner-state envelope
 * (`src/platform/learnerState.ts`) share one definition, keeping stored answers
 * provably serializable.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };
