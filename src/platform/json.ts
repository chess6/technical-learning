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

/** A JSON object specifically (the object arm of `JsonValue`). */
export type JsonObject = { readonly [key: string]: JsonValue };

/**
 * Runtime guard that a value is a genuine JSON-safe value: only string, number
 * (finite), boolean, null, arrays, and plain objects thereof. Rejects functions,
 * class instances, `Date`, `undefined`, `NaN`/`Infinity`, and symbol keys — the
 * things a `Record<string, unknown>` would silently permit. Used at trust
 * boundaries (persisted answers, migration input) so casts are validated.
 */
export function isJsonValue(value: unknown): value is JsonValue {
  switch (typeof value) {
    case "string":
    case "boolean":
      return true;
    case "number":
      return Number.isFinite(value);
    case "object": {
      if (value === null) return true;
      if (Array.isArray(value)) return value.every(isJsonValue);
      // Plain objects only (no class instances such as Date/Map/etc.).
      const proto = Object.getPrototypeOf(value);
      if (proto !== Object.prototype && proto !== null) return false;
      return Object.values(value as Record<string, unknown>).every(isJsonValue);
    }
    default:
      // undefined, function, symbol, bigint
      return false;
  }
}
