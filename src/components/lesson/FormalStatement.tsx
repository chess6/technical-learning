import type { FormalBlock } from "../../lessons/types";
import { ProseWithMath } from "./ProseWithMath";
import { DepthLayerList } from "./DepthLayer";
import "./FormalStatement.css";

const KIND_LABEL: Record<FormalBlock["kind"], string> = {
  definition: "Definition",
  proposition: "Proposition",
  theorem: "Theorem",
  corollary: "Corollary",
  conjecture: "Conjecture",
  lemma: "Lemma",
  axiom: "Axiom",
};

/**
 * A labeled, textbook-style formal block (definition / theorem / …). Reuses the
 * `ProseWithMath` + callout visual grammar. `revealed` justification lives in a
 * <details>; `reference` blocks render muted.
 *
 * `variant="proof"` (used only by a `proof` route block, never by a plain
 * `formal` reference to the same block) additionally renders `block.proof`
 * expanded, as the main line, labeled "Proof." and ending in ∎ — the
 * semantic-page-grammar.md §5.2 proof treatment. A `formal` reference never
 * renders `proof`, so a theorem's proof appears exactly where its `proof`
 * route block places it, never wherever the theorem is merely cited.
 */
export function FormalStatement({
  block,
  variant = "statement",
}: {
  block: FormalBlock;
  variant?: "statement" | "proof";
}) {
  const kindLabel = KIND_LABEL[block.kind];
  const heading = block.label ? `${kindLabel} — ${block.label}` : kindLabel;

  return (
    <section
      className="formal-statement"
      data-kind={block.kind}
      data-visibility={block.visibility}
      data-testid={`formal-${block.id}`}
      aria-label={heading}
    >
      <p className="formal-statement__head">
        <span className="formal-statement__badge">{kindLabel}</span>
        {block.label && (
          <span className="formal-statement__label">{block.label}</span>
        )}
      </p>
      <p className="formal-statement__statement">
        <ProseWithMath text={block.statement} />
      </p>
      <p className="formal-statement__interpretation">
        <span className="formal-statement__interpretation-label">In words.</span>{" "}
        <ProseWithMath text={block.interpretation} />
      </p>
      {variant === "proof" && block.proof && (
        <div className="formal-statement__proof" aria-label="Proof">
          <p className="formal-statement__proof-label">Proof.</p>
          <p className="formal-statement__proof-body">
            <ProseWithMath text={block.proof} />
            <span className="formal-statement__proof-end" aria-hidden="true">
              {" "}
              ∎
            </span>
          </p>
        </div>
      )}
      {block.layers && block.layers.length > 0 && (
        <DepthLayerList layers={block.layers} />
      )}
    </section>
  );
}
