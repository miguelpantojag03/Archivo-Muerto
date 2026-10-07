// ─── windowCloseGuard ─────────────────────────────────────────────
// Lets a modal with an open, unsaved form register itself here so the
// native window-close handler (see main.jsx) can block an accidental
// quit instead of silently discarding what the user typed.
//
// Plain module-level boolean rather than React context: this is read by
// a Tauri event callback outside the React tree, and NewRelicModal /
// EditRelicModal are always mounted one-at-a-time (Dashboard renders
// them as mutually exclusive conditionals), so there's never more than
// one caller to track.

let dirty = false

export function registerUnsavedChanges(isDirty) {
  dirty = isDirty
}

export function hasUnsavedChanges() {
  return dirty
}
