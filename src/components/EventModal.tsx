import { useGame } from '../store/gameStore';
import { CRIMES } from '../engine/crime';
import { MS } from './theme';
import { Modal } from './Modal';

/**
 * Event popups. Choice events block time until the player picks;
 * the outcome shows Continue. Notices carry no decision and show
 * Continue straight away. Crime choices run through the crime engine
 * instead of the ordinary effects.
 */
export function EventModal() {
  const activeEvent = useGame((s) => s.activeEvent);
  const choose = useGame((s) => s.choose);
  const commitCrime = useGame((s) => s.commitCrime);
  const dismissEvent = useGame((s) => s.dismissEvent);

  if (!activeEvent) return null;
  const decided = activeEvent.lastResult !== null;
  const isNotice = activeEvent.event.choices.length === 0;
  const crime = CRIMES.find((k) => k.id === activeEvent.event.id);
  const onPick = (choiceId: string) => {
    if (crime && choiceId === 'do-it') commitCrime(crime.id);
    else choose(choiceId);
  };

  return (
    <Modal
      title={activeEvent.event.title}
      eyebrow={activeEvent.event.category}
      canClose={false}
      onClose={() => {}}
    >
      <p className="text-[15px] leading-relaxed text-ink-dim">
        {activeEvent.text}
      </p>
      {!decided && !isNotice ? (
        <div className="mt-5 space-y-2.5">
          {activeEvent.event.choices.map((c) => (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              className={`w-full rounded-lg border px-4 py-3.5 text-left text-[15px] font-medium text-ink transition-colors ${MS.pick}`}
            >
              {c.text}
            </button>
          ))}
        </div>
      ) : decided ? (
        <div className="mt-5">
          <div className="rounded-lg bg-wash px-5 py-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-dim">
              Outcome
            </div>
            <p className="text-[15px] leading-relaxed text-ink">
              {activeEvent.lastResult}
            </p>
          </div>
          <button
            onClick={dismissEvent}
            className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
          >
            Continue
          </button>
        </div>
      ) : (
        <button
          onClick={dismissEvent}
          className={`${MS.primaryBtn} mt-5 w-full py-3 text-base`}
        >
          Continue
        </button>
      )}
    </Modal>
  );
}
