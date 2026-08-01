import { useState } from "react";
import { karatsubaStep } from "../../math";
import {
  KARATSUBA_ARITHMETIC_PRESETS,
  getKaratsubaExample,
} from "../../lessons/karatsubaData";
import type { JsonObject } from "../../platform/json";
import { EquationBlock } from "./EquationBlock";
import { ProseWithMath } from "./ProseWithMath";
import "./KaratsubaThreeEvaluationsLab.css";

/**
 * The "deeper connection" recorded in the approved insight contract (C2:
 * treat each split number as a linear polynomial; the product is a quadratic
 * a single suitable triple of evaluations determines) — made concrete with
 * real numbers instead of staying prose-only in a depth layer.
 *
 * Every number here comes from `karatsubaStep`, the same tested pure
 * function the lesson's exercises and worked examples already use — this
 * component draws no new arithmetic, it re-reads the existing z2/z1/z0 as
 * three evaluations of $p(t)=(At+B)(Ct+D)$: $p(0)=BD$, $p(1)=(A+B)(C+D)$,
 * and the leading coefficient $AC$ (the $t\\to\\infty$ reading).
 *
 * `config` is opaque `JsonObject` (the `composed`-block contract, matching
 * the `custom` exercise capability's own `config` shape) — `exampleId` is
 * read defensively and validated against the real preset registry, never
 * assumed to be well-formed.
 */
export function KaratsubaThreeEvaluationsLab({ config }: { config?: JsonObject }) {
  const configuredId =
    typeof config?.exampleId === "string" ? config.exampleId : undefined;
  const initialId =
    (configuredId && getKaratsubaExample(configuredId)?.id) ??
    KARATSUBA_ARITHMETIC_PRESETS[0]!.id;
  const [exampleId, setExampleId] = useState(initialId);
  const example = getKaratsubaExample(exampleId) ?? KARATSUBA_ARITHMETIC_PRESETS[0]!;
  const step = karatsubaStep(example.x, example.y, example.m);
  const power = step.base ** step.m;

  return (
    <section
      className="karatsuba-three-evals"
      aria-label="Three evaluations of a quadratic"
    >
      <h3 className="karatsuba-three-evals__title">
        The same three products, read as a quadratic
      </h3>
      <p className="karatsuba-three-evals__intro">
        <ProseWithMath
          text={`Write the two split numbers as linear polynomials, $x(t)=${step.a}t+${step.b}$ and $y(t)=${step.c}t+${step.d}$ (so $t=${power}$ recovers the actual numbers). Their product $p(t)=x(t)y(t)$ is a quadratic in $t$ — three coefficients, pinned down by three evaluations.`}
        />
      </p>

      <label className="karatsuba-three-evals__picker">
        Example
        <select
          value={exampleId}
          onChange={(e) => setExampleId(e.target.value)}
          aria-label="Example for the three-evaluations lab"
        >
          {KARATSUBA_ARITHMETIC_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </label>

      <table className="karatsuba-three-evals__table">
        <caption className="karatsuba-three-evals__caption">
          <ProseWithMath
            text={`Three evaluations of $p(t)=(${step.a}t+${step.b})(${step.c}t+${step.d})$`}
          />
        </caption>
        <thead>
          <tr>
            <th scope="col">Evaluation</th>
            <th scope="col">Reads off</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr data-testid="eval-t0">
            <td>
              <ProseWithMath text="$p(0)=BD$" />
            </td>
            <td>
              <ProseWithMath text="the constant term $z_0$" />
            </td>
            <td>
              {step.b}×{step.d} = {step.z0}
            </td>
          </tr>
          <tr data-testid="eval-t1">
            <td>
              <ProseWithMath text="$p(1)=(A+B)(C+D)$" />
            </td>
            <td>all three coefficients summed</td>
            <td>
              ({step.a}+{step.b})×({step.c}+{step.d}) = {step.sumProduct}
            </td>
          </tr>
          <tr data-testid="eval-leading">
            <td>
              <ProseWithMath text="leading coefficient ($t\to\infty$)" />
            </td>
            <td>
              <ProseWithMath text="the quadratic term $z_2$" />
            </td>
            <td>
              {step.a}×{step.c} = {step.z2}
            </td>
          </tr>
        </tbody>
      </table>

      <p className="karatsuba-three-evals__reconstruct" data-testid="eval-reconstruct">
        <ProseWithMath
          text={`Interpolating recovers the missing middle coefficient: $z_1=p(1)-p(0)-z_2=${step.sumProduct}-${step.z0}-${step.z2}=${step.z1}$ — the same $z_1$ the worked example computes by subtracting known corners. Three evaluations, three multiplications; a fourth point would land back on this same parabola.`}
        />
      </p>
      <EquationBlock
        tex={`${power * power}\\,z_2+${power}\\,z_1+z_0 = ${step.product}`}
        ariaLabel="Reassembled product from the three evaluations"
      />
    </section>
  );
}
