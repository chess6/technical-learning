/**
 * Shared Karatsuba lesson examples. Guided scene, explorer, and exercises
 * reference these ids — never duplicate the numeric constants elsewhere.
 */

export interface KaratsubaExample {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  /** Split block size in digits for the top-level karatsubaStep call. */
  readonly m: number;
}

export const KARATSUBA_CLEAN: KaratsubaExample = {
  id: "karatsuba-clean",
  label: "12 × 13 (clean)",
  x: 12,
  y: 13,
  m: 1,
};

export const KARATSUBA_BOUNDARY: KaratsubaExample = {
  id: "karatsuba-boundary",
  label: "78 × 56 (carry & width)",
  x: 78,
  y: 56,
  m: 1,
};

/** Tree-panel example trace only — not an A,B,C,D digit-control preset. */
export const KARATSUBA_RECURSIVE: KaratsubaExample = {
  id: "karatsuba-recursive",
  label: "1234 × 5678 (recursive trace)",
  x: 1234,
  y: 5678,
  m: 2,
};

/** Full catalog (includes the recursive trace). */
export const KARATSUBA_PRESETS: readonly KaratsubaExample[] = [
  KARATSUBA_CLEAN,
  KARATSUBA_BOUNDARY,
  KARATSUBA_RECURSIVE,
];

/** Arithmetic explorer digit-control presets only (representable as 0–9 digits). */
export const KARATSUBA_ARITHMETIC_PRESETS: readonly KaratsubaExample[] = [
  KARATSUBA_CLEAN,
  KARATSUBA_BOUNDARY,
];

const byId = new Map(KARATSUBA_PRESETS.map((example) => [example.id, example]));

export function getKaratsubaExample(id: string): KaratsubaExample | undefined {
  return byId.get(id);
}

export function requireKaratsubaExample(id: string): KaratsubaExample {
  const example = byId.get(id);
  if (!example) {
    throw new Error(`Unknown Karatsuba example id: "${id}"`);
  }
  return example;
}
