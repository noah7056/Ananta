import type { SectionKind } from '../store/gameStore';

/**
 * Bottom action bar: the Age button is a raised filled circle with
 * a geometrically centered plus mark; the four section buttons
 * are quiet text. Career unlocks at school age.
 */
export function ActionBar({
  nextAge,
  eventOpen,
  workLocked,
  actionsLocked,
  onAge,
  onSection,
}: {
  nextAge: number;
  eventOpen: boolean;
  workLocked: boolean;
  /** nothing to do in Actions yet, so the button greys out */
  actionsLocked: boolean;
  onAge: () => void;
  onSection: (kind: SectionKind) => void;
}) {
  const item =
    'rounded-lg px-2 py-2 text-[13px] font-semibold text-ink-dim transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink-dim';

  return (
    <div className="shrink-0 border-t border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-5 items-center gap-1 px-4 py-2.5 sm:px-6">
        <button
          className={item}
          disabled={eventOpen}
          onClick={() => onSection('social')}
        >
          Circle
        </button>
        <button
          className={item}
          disabled={eventOpen || actionsLocked}
          onClick={() => onSection('actions')}
        >
          Actions
        </button>
        <div className="flex justify-center">
          <button
            onClick={onAge}
            disabled={eventOpen}
            aria-label={`Age up to ${nextAge}`}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-[0_8px_20px_rgba(46,44,39,0.28)] transition-all hover:scale-105 hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect x="9" y="3.5" width="2" height="13" rx="1" fill="currentColor" />
              <rect x="3.5" y="9" width="13" height="2" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
        <button
          className={item}
          disabled={eventOpen}
          onClick={() => onSection('assets')}
        >
          Belongings
        </button>
        <button
          className={item}
          disabled={eventOpen || workLocked}
          onClick={() => onSection('work')}
        >
          Career
        </button>
      </div>
    </div>
  );
}
