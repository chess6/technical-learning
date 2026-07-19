import "./PresetPicker.css";

export type PresetOption = {
  id: string;
  label: string;
  onSelect: () => void;
};

export type PresetPickerProps = {
  label: string;
  presets: readonly PresetOption[];
  activeId?: string;
};

/** A labelled group of preset buttons for jumping to canonical examples. */
export function PresetPicker({ label, presets, activeId }: PresetPickerProps) {
  return (
    <div
      className="preset-picker"
      role="group"
      aria-label={label}
    >
      <span className="preset-picker__label">{label}</span>
      <div className="preset-picker__buttons">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="btn btn--ghost preset-picker__button"
            data-active={activeId === preset.id || undefined}
            aria-pressed={activeId ? activeId === preset.id : undefined}
            onClick={preset.onSelect}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
