/**
 * Shared quiet theme: warm neutrals, charcoal ink, one deep-sage
 * accent used sparingly for selection and focus. No ornament.
 */
export const MS = {
  panel: 'rounded-xl border border-line bg-white',
  panelSoft: 'rounded-xl border border-line bg-wash',
  label:
    'text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint',
  primaryBtn:
    'rounded-lg bg-ink px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-ink/90 active:bg-black disabled:cursor-not-allowed',
  ghostBtn:
    'rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:border-ink/30 hover:text-ink',
  input:
    'rounded-lg border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-faint/70 outline-none transition-colors focus:border-accent',
  /** selected option (era, place, gender, future menus) */
  pickActive: 'border-accent bg-accent/[0.06] font-medium text-ink',
  /** unselected option */
  pick: 'border-line bg-white text-ink-dim hover:border-ink/25 hover:text-ink',
};
