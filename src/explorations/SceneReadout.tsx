import type { ReactNode } from "react";
import "./SceneReadout.css";

export type ReadoutItem = {
  id: string;
  label: string;
  value: ReactNode;
};

export type SceneReadoutProps = {
  title?: string;
  items: readonly ReadoutItem[];
};

/** Textual equivalents for important visual conclusions. */
export function SceneReadout({ title = "Readout", items }: SceneReadoutProps) {
  return (
    <section className="scene-readout" aria-label={title}>
      <h3 className="scene-readout__title">{title}</h3>
      <dl className="scene-readout__list">
        {items.map((item) => (
          <div key={item.id} className="scene-readout__row">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
