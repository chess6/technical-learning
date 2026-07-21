/**
 * Pure Karatsuba helpers for the algorithms lesson.
 * Uses `number` (safe integers); bigint is a future extension.
 */

export interface DigitSplit {
  readonly value: number;
  readonly base: number;
  readonly m: number;
  readonly high: number;
  readonly low: number;
}

export interface FoilRegions {
  readonly ac: number;
  readonly ad: number;
  readonly bc: number;
  readonly bd: number;
}

export interface CarryStep {
  readonly level: number;
  readonly valueBefore: number;
  readonly digitAfter: number;
  readonly carryOut: number;
}

export interface NormalizedCoefficients {
  readonly blocks: readonly number[];
  readonly steps: readonly CarryStep[];
}

export interface KaratsubaStep {
  readonly x: number;
  readonly y: number;
  readonly base: number;
  readonly m: number;
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
  readonly regions: FoilRegions;
  readonly sumProduct: number;
  readonly z2: number;
  readonly z1: number;
  readonly z0: number;
  readonly preCarryTerms: readonly [number, number, number];
  readonly product: number;
  readonly multiplications: 3;
  readonly coefficientOverflow: boolean;
  readonly operandWidthGrowth: boolean;
  readonly normalized: NormalizedCoefficients;
}

export interface TreeNode {
  readonly depth: number;
  readonly branch: 3 | 4;
  readonly children: readonly TreeNode[];
}

export const KARATSUBA_EXPONENT = Math.log2(3);

function assertNonnegativeSafeInteger(n: number, label: string): void {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new RangeError(
      `${label} must be a nonnegative safe integer (got ${String(n)})`,
    );
  }
}

function assertBase(base: number): void {
  if (!Number.isInteger(base) || base < 2) {
    throw new RangeError(`base must be an integer >= 2 (got ${String(base)})`);
  }
}

/**
 * Guard against silent precision loss: two `number` safe integers whose product
 * exceeds `Number.MAX_SAFE_INTEGER` cannot be represented exactly, so returning
 * `x * y` would yield a wrong integer. Detect the overflow up-front (before the
 * multiply) via `y > MAX / x` and throw instead of returning a wrong number.
 * Inputs are assumed already validated as nonnegative safe integers.
 */
function assertProductSafe(x: number, y: number): void {
  if (x !== 0 && y > Number.MAX_SAFE_INTEGER / x) {
    throw new RangeError(
      `product ${x} × ${y} exceeds Number.MAX_SAFE_INTEGER; ` +
        `use bigint for operands this large`,
    );
  }
}

/** Digit length of a nonnegative integer in the given base (0 has length 1). */
export function digitLength(value: number, base: number): number {
  assertNonnegativeSafeInteger(value, "value");
  assertBase(base);
  if (value < base) return 1;
  let n = 0;
  let v = value;
  while (v > 0) {
    v = Math.floor(v / base);
    n += 1;
  }
  return n;
}

export function splitDecimal(
  value: number,
  m: number,
  base = 10,
): DigitSplit {
  assertNonnegativeSafeInteger(value, "value");
  assertBase(base);
  if (!Number.isInteger(m) || m < 0) {
    throw new RangeError(`m must be a nonnegative integer (got ${String(m)})`);
  }
  const power = base ** m;
  return {
    value,
    base,
    m,
    high: Math.floor(value / power),
    low: value % power,
  };
}

export function foilRegions(
  a: number,
  b: number,
  c: number,
  d: number,
): FoilRegions {
  return {
    ac: a * c,
    ad: a * d,
    bc: b * c,
    bd: b * d,
  };
}

export function middleCoefficient(
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  return (a + b) * (c + d) - a * c - b * d;
}

/**
 * Carries among the three reconstructed coefficient slots only.
 * The high block may remain ≥ blockBase (it is not split into a 4th place).
 * Boundary example (blockBase = 10): (35,82,48) → (35,86,8) → (43,6,8).
 */
export function normalizeCoefficients(
  z2: number,
  z1: number,
  z0: number,
  blockBase: number,
): NormalizedCoefficients {
  assertBase(blockBase);
  const steps: CarryStep[] = [];
  // Least-significant first: [z0, z1, z2]
  const blocks = [z0, z1, z2];
  // Carry only from the low and middle slots into the next; leave z2 as-is
  // after receiving carries (lesson visualization: three place-value levels).
  for (let level = 0; level < 2; level += 1) {
    const valueBefore = blocks[level]!;
    if (valueBefore < blockBase) continue;
    const digitAfter = valueBefore % blockBase;
    const carryOut = Math.floor(valueBefore / blockBase);
    steps.push({ level, valueBefore, digitAfter, carryOut });
    blocks[level] = digitAfter;
    blocks[level + 1]! += carryOut;
  }
  return { blocks, steps };
}

export function karatsubaStep(
  x: number,
  y: number,
  m: number,
  base = 10,
): KaratsubaStep {
  assertNonnegativeSafeInteger(x, "x");
  assertNonnegativeSafeInteger(y, "y");
  assertBase(base);
  if (!Number.isInteger(m) || m < 1) {
    throw new RangeError(`m must be an integer >= 1 (got ${String(m)})`);
  }
  const xs = splitDecimal(x, m, base);
  const ys = splitDecimal(y, m, base);
  const a = xs.high;
  const b = xs.low;
  const c = ys.high;
  const d = ys.low;
  const regions = foilRegions(a, b, c, d);
  const sumProduct = (a + b) * (c + d);
  const z2 = regions.ac;
  const z0 = regions.bd;
  const z1 = sumProduct - z2 - z0;
  const power = base ** m;
  const product = z2 * power * power + z1 * power + z0;
  const blockLimit = power;
  return {
    x,
    y,
    base,
    m,
    a,
    b,
    c,
    d,
    regions,
    sumProduct,
    z2,
    z1,
    z0,
    preCarryTerms: [z2, z1, z0],
    product,
    multiplications: 3,
    coefficientOverflow: z2 >= blockLimit || z1 >= blockLimit || z0 >= blockLimit,
    operandWidthGrowth: a + b >= blockLimit || c + d >= blockLimit,
    normalized: normalizeCoefficients(z2, z1, z0, blockLimit),
  };
}

/**
 * Recursive Karatsuba multiplication.
 *
 * Contract:
 * - **Domain:** `x`, `y` nonnegative safe integers (`Number.isSafeInteger`);
 *   `base` an integer ≥ 2 (the lesson uses base 10). Anything else throws
 *   `RangeError`.
 * - **Base case:** `x < base || y < base` returns `x * y` directly.
 * - **Split:** width `n = max digit length`, split point `m = floor(n/2)`,
 *   `power = base**m`; `a = floor(x/power)`, `b = x % power` (odd widths keep the
 *   low block `power`-wide — no separate handling), likewise `c`, `d`.
 * - **Recurse & recombine:** `ac`, `bd`, and the wider `(a+b)(c+d)` are each
 *   computed by a recursive call (the sum-product's operand-width growth is
 *   absorbed here, never as a fourth multiply), then
 *   `ac·power² + ((a+b)(c+d) − ac − bd)·power + bd`.
 * - **Error behavior (safe-integer):** if the exact product would exceed
 *   `Number.MAX_SAFE_INTEGER`, throws `RangeError` up-front rather than silently
 *   returning an imprecise integer. Because the top-level product is validated
 *   and every term of the recombination is nonnegative and ≤ that product, and
 *   each recursive sub-product self-validates, the recombination stays exact.
 * - `bigint` is a future extension; this POC uses `number`.
 */
export function karatsubaMultiply(x: number, y: number, base = 10): number {
  assertNonnegativeSafeInteger(x, "x");
  assertNonnegativeSafeInteger(y, "y");
  assertBase(base);
  assertProductSafe(x, y);
  if (x < base || y < base) {
    return x * y;
  }
  const n = Math.max(digitLength(x, base), digitLength(y, base));
  const m = Math.floor(n / 2);
  if (m < 1) {
    return x * y;
  }
  const power = base ** m;
  const a = Math.floor(x / power);
  const b = x % power;
  const c = Math.floor(y / power);
  const d = y % power;
  const ac = karatsubaMultiply(a, c, base);
  const bd = karatsubaMultiply(b, d, base);
  const sumProduct = karatsubaMultiply(a + b, c + d, base);
  const middle = sumProduct - ac - bd;
  return ac * power * power + middle * power + bd;
}

/**
 * Schoolbook reference multiply. Same safe-integer contract as
 * {@link karatsubaMultiply}: nonnegative safe-integer inputs whose exact product
 * exceeds `Number.MAX_SAFE_INTEGER` throw `RangeError` rather than returning an
 * imprecise integer.
 */
export function naiveMultiply(x: number, y: number): number {
  assertNonnegativeSafeInteger(x, "x");
  assertNonnegativeSafeInteger(y, "y");
  assertProductSafe(x, y);
  return x * y;
}

export function leafCount(branch: number, levels: number): number {
  if (!Number.isInteger(branch) || branch < 1) {
    throw new RangeError(`branch must be an integer >= 1 (got ${String(branch)})`);
  }
  if (!Number.isInteger(levels) || levels < 0) {
    throw new RangeError(`levels must be a nonnegative integer (got ${String(levels)})`);
  }
  return branch ** levels;
}

/** Multiplication leaf count for n a power of 2 under branch-factor recursion. */
export function multiplicationCount(n: number, branch: 3 | 4): number {
  if (!Number.isInteger(n) || n < 1 || (n & (n - 1)) !== 0) {
    throw new RangeError(`n must be a positive power of 2 (got ${String(n)})`);
  }
  const levels = Math.log2(n);
  return leafCount(branch, levels);
}

export function recursionTree(branch: 3 | 4, depth: number): TreeNode {
  if (!Number.isInteger(depth) || depth < 0) {
    throw new RangeError(`depth must be a nonnegative integer (got ${String(depth)})`);
  }
  if (depth === 0) {
    return { depth: 0, branch, children: [] };
  }
  const children: TreeNode[] = [];
  for (let i = 0; i < branch; i += 1) {
    children.push(recursionTree(branch, depth - 1));
  }
  return { depth, branch, children };
}

export function assertMiddleCoefficientIdentity(
  a: number,
  b: number,
  c: number,
  d: number,
): void {
  const left = middleCoefficient(a, b, c, d);
  const right = a * d + b * c;
  if (left !== right) {
    throw new Error(
      `middleCoefficient identity failed: (${a}+${b})(${c}+${d})-ac-bd=${left}, ad+bc=${right}`,
    );
  }
}

export function assertRecombinationEqualsProduct(
  x: number,
  y: number,
  m: number,
  base = 10,
): void {
  const step = karatsubaStep(x, y, m, base);
  if (step.product !== x * y) {
    throw new Error(
      `recombination failed for ${x}×${y}: got ${step.product}, expected ${x * y}`,
    );
  }
}

export function assertThreeProductsMatchNaive(
  x: number,
  y: number,
  base = 10,
): void {
  const k = karatsubaMultiply(x, y, base);
  const n = naiveMultiply(x, y);
  if (k !== n) {
    throw new Error(`karatsubaMultiply(${x},${y})=${k}, naive=${n}`);
  }
}

export function assertBranchLeafCount(n: number): void {
  if (!Number.isInteger(n) || n < 1 || (n & (n - 1)) !== 0) {
    throw new RangeError(`n must be a positive power of 2 (got ${String(n)})`);
  }
  const levels = Math.log2(n);
  const leaves4 = leafCount(4, levels);
  const leaves3 = leafCount(3, levels);
  if (leaves4 !== n * n) {
    throw new Error(`branch-4 leaf count ${leaves4} !== n²=${n * n}`);
  }
  const expected3 = n ** KARATSUBA_EXPONENT;
  if (Math.abs(leaves3 - expected3) > 1e-9 * Math.max(1, expected3)) {
    throw new Error(
      `branch-3 leaf count ${leaves3} !== n^(log2 3)=${expected3}`,
    );
  }
}
