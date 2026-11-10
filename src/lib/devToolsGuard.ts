/**
 * Production Developer Tools & Source Inspection Guard
 * Blocks right-click context menu, DevTools keyboard shortcuts (F12, Ctrl+Shift+I/J/C/K, Ctrl+U/S),
 * neutralizes React DevTools hooks, and activates anti-inspection deterrents in production.
 */

let isGuardInitialized = false;

function isBlockedDevToolsShortcut(e: KeyboardEvent): boolean {
  const key = (e.key || "").toUpperCase();
  const code = e.keyCode || e.which;

  // 1. F12
  if (key === "F12" || code === 123) {
    return true;
  }

  // 2. Shift + F10 or dedicated ContextMenu key
  if (key === "CONTEXTMENU" || code === 93 || (e.shiftKey && (key === "F10" || code === 121))) {
    return true;
  }

  const ctrlOrCmd = e.ctrlKey || e.metaKey;

  // 3. Ctrl+Shift+I / J / C / K / E / M (Windows/Linux) or Cmd+Option+I / J / C / K / E / M / U (macOS)
  if (ctrlOrCmd && (e.shiftKey || e.altKey)) {
    if (
      key === "I" || code === 73 ||
      key === "J" || code === 74 ||
      key === "C" || code === 67 ||
      key === "K" || code === 75 ||
      key === "E" || code === 69 ||
      key === "M" || code === 77 ||
      key === "U" || code === 85
    ) {
      return true;
    }
  }

  // 4. Ctrl+U (View Source) & Ctrl+S (Save Page)
  if (ctrlOrCmd && !e.shiftKey && !e.altKey) {
    if (key === "U" || code === 85 || key === "S" || code === 83) {
      return true;
    }
  }

  return false;
}

export function initDevToolsGuard(): void {
  if (typeof window === "undefined" || isGuardInitialized) return;
  isGuardInitialized = true;

  // 1. Block Right-Click Context Menu
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // 2. Block DevTools & View-Source Keyboard Shortcuts
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isBlockedDevToolsShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  };

  // 3. Prevent dragging images/links to inspect URLs
  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "IMG" || target.tagName === "A")) {
      e.preventDefault();
    }
  };

  window.addEventListener("contextmenu", handleContextMenu, { capture: true });
  document.addEventListener("contextmenu", handleContextMenu, { capture: true });
  window.addEventListener("keydown", handleKeyDown, { capture: true });
  document.addEventListener("keydown", handleKeyDown, { capture: true });
  document.addEventListener("dragstart", handleDragStart, { capture: true });

  // 4. Production-only Console Muting, React DevTools Hook Lock & Debugger Trap
  if (import.meta.env.PROD) {
    try {
      const noop = () => undefined;
      const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook && typeof hook === "object") {
        for (const prop of Object.keys(hook)) {
          try {
            hook[prop] = typeof hook[prop] === "function" ? noop : null;
          } catch {}
        }
      }
    } catch {}

    try {
      const noop = () => undefined;
      console.log = noop;
      console.debug = noop;
      console.info = noop;
      console.table = noop;
      console.dir = noop;
      console.clear();
    } catch {}

    // Anti-debugging interval if someone opens DevTools via browser toolbar menu
    const triggerDebugger = () => {
      try {
        // eslint-disable-next-line no-new-func
        new Function("debugger")();
      } catch {}
    };

    window.setInterval(triggerDebugger, 1000);
  }
}

initDevToolsGuard();
