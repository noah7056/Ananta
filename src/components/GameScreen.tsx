import { useState } from 'react';
import { getEra, moneySymbolOf } from '../data/eras';
import { canSeeDoctor } from '../engine/infancy';
import { useGame, STUDY_START_AGE } from '../store/gameStore';
import { StatCell, FundsCell } from './StatBar';
import { Journal } from './Journal';
import { downloadLife } from '../engine/life';
import { EventModal } from './EventModal';
import { SectionModal } from './SectionModal';
import { ActionBar } from './ActionBar';
import { Modal } from './Modal';
import { FeedbackModal } from './FeedbackModal';
import { MS } from './theme';

/**
 * Main game view as a fixed viewport frame: header, journal feed
 * filling the middle, action bar pinned to the bottom, vitals
 * strip under everything. Events arrive as popups over the feed.
 */
export function GameScreen() {
  const character = useGame((s) => s.character);
  const activeEvent = useGame((s) => s.activeEvent);
  const section = useGame((s) => s.section);
  const ageUp = useGame((s) => s.ageUp);
  const openSection = useGame((s) => s.openSection);
  const closeSection = useGame((s) => s.closeSection);
  const startOver = useGame((s) => s.startOver);
  const notice = useGame((s) => s.notice);
  const dismissNotice = useGame((s) => s.dismissNotice);
  const [confirming, setConfirming] = useState(false);

  if (!character) return null;
  const era = getEra(character.eraId);
  const place =
    era.places.find((p) => p.id === character.placeId)?.name ?? 'Unknown';

  // the Actions menu holds the doctor from 6, walks from 4 — before
  // that there is nothing in it to open
  const hasActions = canSeeDoctor(character) || character.age >= 4;

  const vitals: { label: string; value: number }[] = [
    { label: 'Health', value: character.stats.health },
    { label: 'Happiness', value: character.stats.happiness },
    { label: 'Smarts', value: character.stats.smarts },
    { label: 'Looks', value: character.stats.looks },
    { label: 'Energy', value: character.stats.energy ?? 70 },
    { label: 'Reputation', value: character.stats.reputation ?? 50 },
    { label: 'Food', value: character.satiety ?? 80 },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pt-4 sm:px-6">
        <header
          className={`${MS.panel} animate-fade-in flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6`}
        >
          <div className="min-w-[200px] flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              {character.name}
            </h1>
            <div className="mt-1 text-[13px] text-ink-dim">
              Age {character.age} · {character.gender} · {place}
            </div>
          </div>
          <button onClick={() => downloadLife(character)} className={MS.ghostBtn}>
            Export
          </button>
          <button onClick={() => setConfirming(true)} className={MS.ghostBtn}>
            New life
          </button>
        </header>
      </div>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 px-4 py-3 sm:px-6">
        <Journal log={character.log} />
      </main>

      <ActionBar
        nextAge={character.age + 1}
        eventOpen={activeEvent !== null}
        workLocked={
          character.age < STUDY_START_AGE &&
          character.schoolId === null &&
          character.jobId === null
        }
        actionsLocked={!hasActions}
        onAge={ageUp}
        onSection={openSection}
      />

      <footer className="shrink-0 border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-2 px-4 py-2.5 sm:grid-cols-8 sm:px-6">
          {vitals.map((v) => (
            <StatCell key={v.label} label={v.label} value={v.value} />
          ))}
          <FundsCell money={character.money} symbol={moneySymbolOf(character)} />
        </div>
      </footer>

      {activeEvent && <EventModal />}
      {section && (
        <SectionModal
          kind={section}
          character={character}
          onClose={closeSection}
        />
      )}
      {notice !== null && (
        <FeedbackModal
          title={notice.title}
          eyebrow={notice.eyebrow}
          text={notice.text}
          onClose={dismissNotice}
        />
      )}
      {confirming && (
        <Modal title="New life" onClose={() => setConfirming(false)}>
          <p className="text-[15px] text-ink-dim">
            End this life and begin another?
          </p>
          <div className="mt-5 space-y-2.5">
            <button
              onClick={startOver}
              className={`${MS.primaryBtn} w-full py-2.5 text-[15px]`}
            >
              End life
            </button>
            <button
              onClick={() => setConfirming(false)}
              className={`${MS.ghostBtn} w-full py-2.5`}
            >
              Nevermind
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
