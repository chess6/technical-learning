import "./ParameterControls.css";

export type SliderControl = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

export type ParameterControlsProps = {
  title?: string;
  controls: readonly SliderControl[];
};

/** Keyboard-accessible external parameter controls for Mafs explorations. */
export function ParameterControls({
  title = "Parameters",
  controls,
}: ParameterControlsProps) {
  return (
    <fieldset className="parameter-controls">
      <legend className="parameter-controls__legend">{title}</legend>
      <div className="parameter-controls__list">
        {controls.map((control) => (
          <label key={control.id} className="parameter-controls__row" htmlFor={control.id}>
            <span className="parameter-controls__label">
              {control.label}
              <span className="parameter-controls__value" aria-hidden="true">
                {formatNumber(control.value)}
              </span>
            </span>
            <input
              id={control.id}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step ?? 0.05}
              value={control.value}
              onChange={(event) => control.onChange(Number(event.target.value))}
              aria-valuetext={`${control.label} ${formatNumber(control.value)}`}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}
