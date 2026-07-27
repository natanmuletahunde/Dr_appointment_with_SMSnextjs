/**
 * Accessibility helpers for interactive clinic UI.
 */

export function announce(message: string) {
  if (typeof document === "undefined") return;
  let live = document.getElementById("carepulse-live-region");
  if (!live) {
    live = document.createElement("div");
    live.id = "carepulse-live-region";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.className = "sr-only";
    document.body.appendChild(live);
  }
  live.textContent = "";
  window.setTimeout(() => {
    live!.textContent = message;
  }, 50);
}

export function focusFirstInvalid(container: HTMLElement) {
  const invalid = container.querySelector<HTMLElement>(
    "[aria-invalid='true'], .shad-error"
  );
  invalid?.focus();
}

export function trapFocus(container: HTMLElement, event: KeyboardEvent) {
  if (event.key !== "Tab") return;
  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    last.focus();
    event.preventDefault();
  } else if (!event.shiftKey && document.activeElement === last) {
    first.focus();
    event.preventDefault();
  }
}

export const SR_ONLY_CLASS =
  "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0";
