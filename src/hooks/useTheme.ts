import { useCallback, useState } from "react";
import {
  applyTheme,
  readStoredTheme,
  storeTheme,
  type ThemeName,
} from "../platform/theme";

/**
 * The active presentation of the identity, plus a setter that persists it.
 *
 * The initial value is read from storage rather than from the DOM so the hook
 * agrees with the pre-paint script in `index.html` even under React Strict
 * Mode's double render. Applying on change (not in an effect on mount) keeps
 * the first paint free of any attribute rewrite.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => readStoredTheme());

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    applyTheme(next);
    storeTheme(next);
  }, []);

  return { theme, setTheme };
}
