import "./ExplorationToggles.css";

export type ToggleControl = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export type ExplorationTogglesProps = {
  title?: string;
  toggles: readonly ToggleControl[];
};

/** Keyboard-accessible checkbox group for showing/hiding scene layers. */
export function ExplorationToggles({
  title = "Display",
  toggles,
}: ExplorationTogglesProps) {
  return (
    <fieldset className="exploration-toggles">
      <legend className="exploration-toggles__legend">{title}</legend>
      <div className="exploration-toggles__list">
        {toggles.map((toggle) => (
          <label
            key={toggle.id}
            className="exploration-toggles__row"
            htmlFor={toggle.id}
          >
            <input
              id={toggle.id}
              type="checkbox"
              checked={toggle.checked}
              onChange={(event) => toggle.onChange(event.target.checked)}
            />
            <span>{toggle.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
