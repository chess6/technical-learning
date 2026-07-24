import { THEMES, THEME_META, type ThemeName } from "../../platform/theme";
import "./ThemeToggle.css";

type ThemeToggleProps = {
  theme: ThemeName;
  onChange: (theme: ThemeName) => void;
};

/**
 * Chooses which presentation of the identity to read in.
 *
 * A two-button group rather than a single toggle: both presentations are named,
 * so the control says what it will switch *to* instead of leaving the learner to
 * infer it. Each button carries `aria-pressed`, so assistive tech announces the
 * selected presentation, and both stay keyboard-reachable with the global
 * focus-visible ring.
 */
export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div className="theme-toggle" role="group" aria-label="Reading theme">
      {THEMES.map((name) => {
        const meta = THEME_META[name];
        const selected = theme === name;
        return (
          <button
            key={name}
            type="button"
            className="theme-toggle__option"
            data-theme-option={name}
            aria-pressed={selected}
            title={meta.hint}
            onClick={() => onChange(name)}
          >
            <span aria-hidden="true" className="theme-toggle__swatch" />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
