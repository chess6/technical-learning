import { useMemo } from "react";
import { multiplicationCount, recursionTree, type TreeNode } from "../math";
import { KARATSUBA_RECURSIVE } from "../lessons/karatsubaData";
import { karatsubaStep } from "../math";
import "./KaratsubaTreeDiagram.css";

type Props = {
  /** Digit length n (power of 2) for the conceptual cost model. */
  n: number;
  showExampleTrace: boolean;
  onNChange: (n: number) => void;
  onShowExampleTraceChange: (show: boolean) => void;
};

function countLeaves(node: TreeNode): number {
  if (node.children.length === 0) return 1;
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
}

function renderTreeSvg(
  branch: 3 | 4,
  depth: number,
  width: number,
  height: number,
): { paths: string[]; nodes: { x: number; y: number }[]; leaves: number } {
  const tree = recursionTree(branch, depth);
  const nodes: { x: number; y: number; id: string }[] = [];
  const paths: string[] = [];

  function layout(
    node: TreeNode,
    depthLeft: number,
    x0: number,
    x1: number,
    y: number,
    id: string,
  ): void {
    const x = (x0 + x1) / 2;
    nodes.push({ x, y, id });
    if (node.children.length === 0 || depthLeft === 0) return;
    const span = (x1 - x0) / node.children.length;
    node.children.forEach((child, i) => {
      const cx0 = x0 + i * span;
      const cx1 = cx0 + span;
      const cy = y + height / (depth + 1);
      const childId = `${id}-${i}`;
      paths.push(`M ${x} ${y} L ${(cx0 + cx1) / 2} ${cy}`);
      layout(child, depthLeft - 1, cx0, cx1, cy, childId);
    });
  }

  layout(tree, depth, 8, width - 8, 16, "r");
  // Leaf total of the tree that is actually drawn — keeps caption honest.
  return { paths, nodes, leaves: countLeaves(tree) };
}

export function KaratsubaTreeDiagram({
  n,
  showExampleTrace,
  onNChange,
  onShowExampleTraceChange,
}: Props) {
  // Single source of truth: draw the tree at the same depth the captions describe.
  const levels = Math.log2(n);
  const multi3 = multiplicationCount(n, 3);
  const multi4 = multiplicationCount(n, 4);

  const tree3 = useMemo(() => renderTreeSvg(3, levels, 220, 140), [levels]);
  const tree4 = useMemo(() => renderTreeSvg(4, levels, 220, 140), [levels]);

  const recursive = useMemo(
    () =>
      karatsubaStep(KARATSUBA_RECURSIVE.x, KARATSUBA_RECURSIVE.y, KARATSUBA_RECURSIVE.m),
    [],
  );

  return (
    <section className="karatsuba-tree" aria-label="Conceptual recurrence tree">
      <h4 className="karatsuba-tree__title">Conceptual recurrence tree</h4>
      <p className="karatsuba-tree__note">
        Models asymptotic branching — not the literal call tree of a specific product.
      </p>
      <div className="karatsuba-tree__controls">
        <label>
          Digit length n
          <select
            value={n}
            onChange={(e) => onNChange(Number(e.target.value))}
            aria-label="Digit length n"
          >
            {[2, 4, 8].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="karatsuba-tree__check">
          <input
            type="checkbox"
            checked={showExampleTrace}
            onChange={(e) => onShowExampleTraceChange(e.target.checked)}
          />
          Show 1234×5678 example trace
        </label>
      </div>
      <div className="karatsuba-tree__pair">
        <figure className="karatsuba-tree__fig">
          <figcaption>Branch 4 (naive)</figcaption>
          <svg viewBox="0 0 220 140" role="img" aria-label="Branch-4 conceptual tree">
            {tree4.paths.map((d, i) => (
              <path key={i} d={d} className="karatsuba-tree__edge" />
            ))}
            {tree4.nodes.map((node, i) => (
              <circle key={i} cx={node.x} cy={node.y} r={4} className="karatsuba-tree__node" />
            ))}
          </svg>
          <p data-testid="tree-leaves-4">
            Leaves at depth {levels}: {tree4.leaves} (= n² for n={n}; multiplications {multi4})
          </p>
        </figure>
        <figure className="karatsuba-tree__fig">
          <figcaption>Branch 3 (Karatsuba)</figcaption>
          <svg viewBox="0 0 220 140" role="img" aria-label="Branch-3 conceptual tree">
            {tree3.paths.map((d, i) => (
              <path key={i} d={d} className="karatsuba-tree__edge karatsuba-tree__edge--k" />
            ))}
            {tree3.nodes.map((node, i) => (
              <circle
                key={i}
                cx={node.x}
                cy={node.y}
                r={4}
                className="karatsuba-tree__node karatsuba-tree__node--k"
              />
            ))}
          </svg>
          <p data-testid="tree-leaves-3">
            Leaves at depth {levels}: {tree3.leaves} (multiplications {multi3})
          </p>
        </figure>
      </div>
      {showExampleTrace ? (
        <aside className="karatsuba-tree__trace" data-testid="recursive-trace">
          <strong>Example trace (model, not exact balanced tree):</strong>{" "}
          {KARATSUBA_RECURSIVE.x}×{KARATSUBA_RECURSIVE.y} splits as a={recursive.a}, b=
          {recursive.b}, c={recursive.c}, d={recursive.d}. Then ac={recursive.a}×{recursive.c} and
          bd={recursive.b}×{recursive.d} are 2-digit, but the sum-product ({recursive.a}+
          {recursive.b})×({recursive.c}+{recursive.d})={recursive.a + recursive.b}×
          {recursive.c + recursive.d} is wider — the operand-width-growth case. Product{" "}
          {recursive.product.toLocaleString()}.
        </aside>
      ) : null}
    </section>
  );
}
