import type { DepthLayer as DepthLayerData } from "../../lessons/types";
import { ProseWithMath } from "./ProseWithMath";
import "./DepthLayer.css";

const KIND_LABEL: Record<DepthLayerData["kind"], string> = {
  why: "Why do we care?",
  trap: "Common trap",
  "math-note": "Mathematical note",
  history: "Historical note",
  "looking-ahead": "Looking ahead",
  connection: "Connection",
  recap: "Intuition recap",
};

type DepthLayerProps = {
  layer: DepthLayerData;
};

/** Optional expandable depth — main line must stand alone without opening any. */
export function DepthLayer({ layer }: DepthLayerProps) {
  return (
    <details className="depth-layer" data-kind={layer.kind}>
      <summary className="depth-layer__summary">
        <span className="depth-layer__kind">{KIND_LABEL[layer.kind]}</span>
        {/*
          Titles are KaTeX-in-prose, exactly like section titles, formal-block
          labels and the body below. Rendering them as plain text printed the
          delimiters literally — "$P$ and $D$ are not unique" — across nine
          lessons. The content validator already feeds every `$...$` fragment in
          a layer title to KaTeX, so the data was always authored as math; only
          this one span failed to render it.
        */}
        <span className="depth-layer__title">
          <ProseWithMath text={layer.title} />
        </span>
      </summary>
      <div className="depth-layer__body">
        <ProseWithMath text={layer.body} />
      </div>
    </details>
  );
}

type DepthLayerListProps = {
  layers?: DepthLayerData[];
};

export function DepthLayerList({ layers }: DepthLayerListProps) {
  if (!layers || layers.length === 0) return null;
  return (
    <div className="depth-layer-list">
      {layers.map((layer) => (
        <DepthLayer key={`${layer.kind}-${layer.title}`} layer={layer} />
      ))}
    </div>
  );
}
