/**
 * Presentation helpers for eigen derivation values.
 * All numbers come from src/math; this module only formats for KaTeX/prose.
 */
import type {
  CharacteristicPolynomial2x2,
  Matrix2x2,
  Subspace2D,
  Vector2,
} from "../math";

function fmt(n: number, digits = 4): string {
  if (Math.abs(n) < 1e-10) return "0";
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) < 1e-8) return String(rounded);
  return n.toFixed(digits).replace(/\.?0+$/, "");
}

export function formatMatrixTeX(m: Matrix2x2): string {
  return `\\begin{bmatrix} ${fmt(m[0][0])} & ${fmt(m[0][1])} \\\\ ${fmt(m[1][0])} & ${fmt(m[1][1])} \\end{bmatrix}`;
}

export function formatVectorTeX(v: Vector2): string {
  return `\\begin{bmatrix} ${fmt(v[0])} \\\\ ${fmt(v[1])} \\end{bmatrix}`;
}

export function formatCharPolyTeX(poly: CharacteristicPolynomial2x2): string {
  const { a, b, c } = poly.coefficients;
  const bTerm =
    b === 0 ? "" : b === -1 ? "-\\lambda" : b === 1 ? "+\\lambda" : `${b > 0 ? "+" : ""}${fmt(b)}\\lambda`;
  const cTerm =
    c === 0 ? "" : c > 0 ? `+${fmt(c)}` : fmt(c);
  const aTerm = a === 1 ? "\\lambda^2" : `${fmt(a)}\\lambda^2`;
  return `${aTerm}${bTerm}${cTerm}`;
}

export function formatSubspaceTeX(space: Subspace2D): string {
  switch (space.kind) {
    case "zero":
      return "\\{\\mathbf{0}\\}";
    case "line":
      return `\\operatorname{span}\\!\\left\\{${formatVectorTeX(space.basis)}\\right\\}`;
    case "plane":
      return "\\mathbb{R}^2";
  }
}

export function formatLambdaList(lambdas: readonly number[]): string {
  if (lambdas.length === 0) return "\\text{(none real)}";
  return lambdas.map((lambda) => `\\lambda=${fmt(lambda)}`).join(",\\;");
}
