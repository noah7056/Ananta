import { getEra } from '../data/eras';
import { epitaph } from '../engine/life';
import { useGame } from '../store/gameStore';
import { StatsPanel } from './StatBar';
import { MS } from './theme';

/** End-of-life summary: epitaph, final vitals, remembered moments. */
export function DeathScreen() {
  const character = useGame((s) => s.character);
  const startOver = useGame((s) => s.startOver);
  if (!character) return null;

  const era = getEra(character.eraId);
  const place =
    era.places.find((p) => p.id === character.placeId)?.name ?? 'Unknown';
  const highlights = character.log.filter(
    (l) => l.kind === 'choice' || l.kind === 'birth' || l.kind === 'death',
  );
  const shown = highlights.slice(-6);

  return (
    <div className="flex min-h-full items-center justify-center bg-paper px-4 py-12">
      <div
        className={`${MS.panel} animate-rise w-full max-w-2xl px-7 py-10 text-center sm:px-12`}
      >
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          {character.name}
        </h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          {place} · {era.name}
        </p>
        <p className="mt-1 text-[15px] text-ink-dim">
          Died at {character.age} — {character.causeOfDeath ?? 'old age'}.
        </p>

        <p className="mx-auto mt-6 max-w-md text-xl leading-snug text-ink-dim">
          “{epitaph(character)}”
        </p>

        <div className={`${MS.panelSoft} mb-4 mt-8 p-5 text-left`}>
          <h3 className={`${MS.label} mb-5`}>Final vitals</h3>
          <StatsPanel
            stats={character.stats}
            money={character.money}
            eraId={character.eraId}
          />
        </div>

        <div className={`${MS.panelSoft} mb-8 p-5 text-left`}>
          <h3 className={`${MS.label} mb-2`}>Remembered moments</h3>
          <div className="divide-y divide-line">
            {shown.map((l, i) => (
              <div key={i} className="py-2.5 text-sm leading-relaxed text-ink-dim">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                  Age {l.age} —{' '}
                </span>
                {l.text}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startOver}
          className={`${MS.primaryBtn} w-full px-10 py-3.5 text-base sm:w-auto`}
        >
          Begin a new life
        </button>
      </div>
    </div>
  );
}
