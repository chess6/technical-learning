import { useCallback, useState } from "react";

export function useSidebarOpen(defaultOpen = false) {
  const [open, setOpen] = useState(defaultOpen);
  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);
  const toggleSidebar = useCallback(() => setOpen((value) => !value), []);
  return { open, openSidebar, closeSidebar, toggleSidebar };
}
