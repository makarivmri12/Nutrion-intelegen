import { useEffect } from "react";

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when user is actively typing in a text field, textarea or select
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        // Allow escape to blur input fields
        if (e.key === "Escape") {
          (activeEl as HTMLElement).blur();
        }
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrl || e.ctrlKey || e.metaKey;
        const shiftMatch = !shortcut.shift || e.shiftKey;
        const altMatch = !shortcut.alt || e.altKey;

        // Strict validation: if shortcut requires ctrl, it must be pressed, if not required, it shouldn't affect match
        const exactCtrl = !!shortcut.ctrl === (e.ctrlKey || e.metaKey);
        const exactShift = !!shortcut.shift === e.shiftKey;
        const exactAlt = !!shortcut.alt === e.altKey;

        if (keyMatch && exactCtrl && exactShift && exactAlt) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};
