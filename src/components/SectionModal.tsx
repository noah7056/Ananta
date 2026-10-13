import { useEffect, useState } from 'react';
import { getEra, moneySymbolOf } from '../data/eras';
import { housesFor, houseById, houseCost } from '../data/houses';
import {
  canInviteHome,
  fairRent,
  houseName,
  isResident,
  propHouseText,
  propTenantLines,
  propValue,
  rentalByUid,
  residenceLabel,
  residentsOf,
} from '../engine/houses';
import { AILMENTS } from '../data/ailments';
import { jobById, workStartAge, degreeById, degreesFor, degreeCost, UNI_NAMES } from '../data/career';
import { formatFunds } from '../engine/life';
import { monthlyWage, schoolName, sectorsFor, jobsInSector } from '../engine/career';
import { StatBar } from './StatBar';
import { memberAge, kinshipRef } from '../engine/family';
import {
  canChooseGender,
  canChooseOrientation,
  canAskOut,
  canFlirtWith,
  canMarry,
  canPropose,
  contactAge,
  contactRef,
  contactStats,
  contactTrade,
  kinGender,
  pronoun,
} from '../engine/contacts';
import {
  actionsFor,
  canAfford,
  maxGift,
  type Interaction,
  type InteractionDef,
} from '../engine/bonds';
import { canMakeLove, childAge, childRef } from '../engine/children';
import type { Classmate, Coworker } from '../engine/classroom';
import {
  askableRelatives,
  canActSocially,
  canSeeDoctor,
  canSeeFamily,
} from '../engine/infancy';
import { availableActivities, effectiveCost, needsParentPayer } from '../engine/activities';import { walkPlacesFor } from '../engine/walks';
import { WALK_DURATIONS } from '../data/walks';
import { salonCost, salonsFor } from '../engine/salon';
import { aislesFor, isOwnedOut, itemById, itemsFor, ownedEdibles, ringsOwned, shopById, shopCost, shopsFor } from '../engine/shopping';
import { licenceCost, canDrive, canGetLicence, ownsVehicle } from '../engine/driving';
import { venuesFor, venueCost } from '../data/weddings';
import { WARS } from '../data/wars';
import { Option } from './Option';
import { latestNews, newsYear } from '../engine/news';
import { GIG_MULTIPLES } from '../data/gigs';
import { gigsFor, GIG_AGE } from '../engine/gigs';
import { ACTIVITIES, BEG_CAP, resolveActivity } from '../data/activities';
import { BOOKS } from '../data/books';
import { availableBooks } from '../engine/books';
import type { BookDef } from '../data/books';

const WALK = ACTIVITIES.find((a) => a.key === 'walk')!;
const LIBRARY = ACTIVITIES.find((a) => a.key === 'library')!;
const SALON = ACTIVITIES.find((a) => a.key === 'salon')!;
const NEWS = ACTIVITIES.find((a) => a.key === 'news')!;
const BEG = ACTIVITIES.find((a) => a.key === 'beg')!;
import type { Character, Child, Contact, FamilyMember } from '../types';
import { useGame, type SectionKind } from '../store/gameStore';
import { MS } from './theme';
import { Modal } from './Modal';

const TITLES: Record<SectionKind, string> = {
  social: 'Circle',
  actions: 'Actions',
  assets: 'Belongings',
  work: 'Career',
};

/**
 * Bottom-bar section popups. Menus and lists close by clicking off;
 * only popups that take action (doctor, and the new-life confirm)
 * end with a Nevermind button.
 */
export function SectionModal({
  kind,
  character,
  onClose,
}: {
  kind: SectionKind;
  character: Character;
  onClose: () => void;
}) {
  const [view, setView] = useState<
    'menu' | 'doctor' | 'class' | 'walk' | 'books' | 'reading' | 'career' | 'gigs' | 'sectors' | 'positions' | 'position' | 'identity' | 'date' | 'crew' | 'salon' | 'news' | 'shops' | 'shop' | 'beg' | 'degrees' | 'uni' | 'licence'
  >('menu');
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopAisle, setShopAisle] = useState<string | null>(null);
  const [readingBook, setReadingBook] = useState<string | null>(null);
  const finishNews = useGame((s) => s.finishNews);
  const closeNews = () => {
    finishNews();
    onClose();
  };
  const [datingId, setDatingId] = useState<string | null>(null);
  const [huntSector, setHuntSector] = useState<string | null>(null);
  const [huntJob, setHuntJob] = useState<string | null>(null);
  const [assetStep, setAssetStep] = useState<'list' | 'item' | 'gift' | 'drive' | 'houses' | 'house' | 'mates' | 'sell' | 'rent'>('list');
  const [assetIdx, setAssetIdx] = useState<number | null>(null);
  const [houseUid, setHouseUid] = useState<string | null>(null);
  const houseProp =
    assetStep === 'house' || assetStep === 'mates' || assetStep === 'sell' || assetStep === 'rent'
      ? (houseUid ?? (character.home ? 'home' : null))
      : null;
  const pendingBook = useGame((s) => s.pendingBook);
  const clearPendingBook = useGame((s) => s.clearPendingBook);
  // a book opened from an event lands on the reader once the popup closes
  useEffect(() => {
    if (pendingBook) {
      setReadingBook(pendingBook);
      setView('reading');
      clearPendingBook();
    }
  }, [pendingBook, clearPendingBook]);
  const pendingChildShop = useGame((s) => s.pendingChildShop);
  const clearPendingChildShop = useGame((s) => s.clearPendingChildShop);
  // a child's ask lands on the right shop and shelf once the popup closes
  useEffect(() => {
    if (pendingChildShop) {
      const item = itemById(pendingChildShop.itemId);
      const shop = item ? shopById(item.shopId) : undefined;
      if (
        item &&
        shop &&
        shop.eras.includes(character.eraId) &&
        (character.children ?? []).some((k) => k.id === pendingChildShop.childId)
      ) {
        setShopId(shop.id);
        setShopAisle(item.aisle ?? null);
        setView('shop');
      }
      clearPendingChildShop();
    }
  }, [pendingChildShop, clearPendingChildShop]);
  const reading = readingBook
    ? (BOOKS.find((b) => b.id === readingBook) ?? null)
    : null;
  const title =
    kind === 'actions' && view === 'walk'
      ? resolveActivity(WALK, character.eraId).text
      : kind === 'actions' && view === 'books'
        ? resolveActivity(LIBRARY, character.eraId).text
          : kind === 'actions' && view === 'salon'
            ? resolveActivity(SALON, character.eraId).text
          : kind === 'actions' && view === 'shops'
            ? 'Shops'
          : kind === 'actions' && view === 'shop' && shopId && shopById(shopId)
            ? shopById(shopId)!.text
          : kind === 'actions' && view === 'news'
            ? resolveActivity(NEWS, character.eraId).text
          : kind === 'actions' && view === 'beg'
            ? resolveActivity(BEG, character.eraId).text
          : kind === 'actions' && view === 'licence'
            ? 'Driving licence'
        : kind === 'actions' && view === 'reading' && reading
          ? reading.title
          : kind === 'actions' && view === 'identity'
            ? 'Identity'
          : kind === 'social' && view === 'date'
            ? 'A date'
          : kind === 'actions' && view === 'doctor' && canSeeDoctor(character)
            ? 'Doctor'
            : kind === 'work' && view === 'gigs'
              ? 'Find a gig'
              : kind === 'work' && (view === 'sectors' || view === 'positions')
                ? 'Look for a job'
              : kind === 'work' && view === 'position' && huntJob && jobById(character.eraId, huntJob)
                ? cap(jobById(character.eraId, huntJob)!.title)
              : kind === 'work' && view === 'crew'
                ? 'Workplace'
              : kind === 'work' && view === 'degrees'
                ? 'Higher study'
              : kind === 'work' && view === 'uni' && character.uniId && degreeById(character.uniId)
                ? degreeById(character.uniId)!.field
              : view === 'class'
                ? 'Class'
                : TITLES[kind];
  // an opened belonging names the popup after itself
  const assetName =
    kind === 'assets' && assetStep !== 'list' && assetIdx !== null
      ? (itemById(character.belongings[assetIdx] ?? '')?.text ?? null)
      : null;
  // an infant has no doctor of their own to visit
  const showDoctor = kind === 'actions' && canSeeDoctor(character);
  const doctorView = showDoctor && view === 'doctor';
  return (
    <Modal title={assetName ?? title} onClose={view === 'news' ? closeNews : onClose}>
      {kind === 'social' && view !== 'date' && (
        <PeopleBody
          character={character}
          onDate={(id) => {
            setDatingId(id);
            setView('date');
          }}
        />
      )}
      {kind === 'actions' && view === 'walk' && (
        <WalkBody character={character} onBack={() => setView('menu')} />
      )}
      {kind === 'actions' && view === 'salon' && (
        <SalonBody character={character} onBack={() => setView('menu')} />
      )}
      {kind === 'actions' && view === 'news' && (
        <NewsBody character={character} onDone={closeNews} />
      )}
      {kind === 'actions' && view === 'books' && (
        <BookBody
          character={character}
          onRead={(id) => {
            setReadingBook(id);
            setView('reading');
          }}
          onBack={() => setView('menu')}
        />
      )}
      {kind === 'actions' && view === 'reading' && reading && (
        <ReadingBody book={reading} onBack={() => setView('menu')} />
      )}
      {kind === 'actions' && view === 'identity' && (
        <IdentityBody character={character} onBack={() => setView('menu')} />
      )}
      {kind === 'social' && view === 'date' && datingId && (
        <DateBody
          character={character}
          contactId={datingId}
          onBack={() => setView('menu')}
        />
      )}
      {kind === 'actions' && view === 'shops' && (
        <ShopListBody
          character={character}
          onPick={(id) => {
            setShopId(id);
            setShopAisle(null);
            setView('shop');
          }}
          onBack={() => setView('menu')}
        />
      )}
      {kind === 'actions' && view === 'shop' && shopId && (
        <ShopBody
          key={shopId}
          character={character}
          shopId={shopId}
          initialAisle={shopAisle}
          onBack={() => setView('shops')}
        />
      )}
      {kind === 'actions' && view === 'beg' && (
        <BegBody character={character} onBack={() => setView('menu')} />
      )}
      {kind === 'actions' && view === 'licence' && (
        <LicenceBody character={character} onBack={() => setView('menu')} />
      )}
      {kind === 'actions' && view !== 'walk' && view !== 'books' && view !== 'reading' && view !== 'identity' && view !== 'salon' && view !== 'news' && view !== 'shops' && view !== 'shop' && view !== 'beg' && view !== 'licence' && !doctorView && (
        <ActionsMenu
          character={character}
          onDoctor={() => setView('doctor')}
          onWalk={() => setView('walk')}
          onLibrary={() => setView('books')}
          onIdentity={() => setView('identity')}
          onSalon={() => setView('salon')}
          onNews={() => setView('news')}
          onShops={() => setView('shops')}
          onBeg={() => setView('beg')}
          onLicence={() => setView('licence')}
        />
      )}
      {doctorView && (
        <DoctorBody character={character} onClose={onClose} />
      )}
      {kind === 'assets' && (
        <AssetsBody
          character={character}
          step={assetStep}
          setStep={setAssetStep}
          selected={assetIdx}
          setSelected={setAssetIdx}
          houseProp={houseProp}
          onHouse={(prop) => {
            setHouseUid(prop);
            setAssetStep('house');
          }}
        />
      )}
      {kind === 'work' && view === 'menu' && (
        <CareerMenu
          character={character}
          onOccupation={() => setView('career')}
          onGigs={() => setView('gigs')}
          onHunt={() => setView('sectors')}
          onDegrees={() => setView('degrees')}
        />
      )}
      {kind === 'work' && view === 'career' && (
        <CareerBody
          character={character}
          onClass={() => setView('class')}
          onCrew={() => setView('crew')}
          onUni={() => setView('uni')}
          onBack={() => setView('menu')}
        />
      )}
      {kind === 'work' && view === 'degrees' && (
        <DegreesBody character={character} onBack={() => setView('menu')} />
      )}
      {kind === 'work' && view === 'uni' && (
        <UniBody character={character} onBack={() => setView('career')} />
      )}
      {kind === 'work' && view === 'class' && (
        <ClassBody character={character} onBack={() => setView('career')} />
      )}
      {kind === 'work' && view === 'crew' && (
        <CrewBody character={character} onBack={() => setView('career')} />
      )}
      {kind === 'work' && view === 'gigs' && (
        <GigBody character={character} onBack={() => setView('menu')} />
      )}
      {kind === 'work' && view === 'sectors' && (
        <SectorsBody
          character={character}
          onPick={(s) => {
            setHuntSector(s);
            setHuntJob(null);
            setView('positions');
          }}
          onBack={() => setView('menu')}
        />
      )}
      {kind === 'work' && view === 'positions' && huntSector && (
        <PositionsBody
          character={character}
          sector={huntSector}
          onOpen={(id) => {
            setHuntJob(id);
            setView('position');
          }}
          onBack={() => setView('sectors')}
        />
      )}
      {kind === 'work' && view === 'position' && huntJob && (
        <PositionBody
          character={character}
          jobId={huntJob}
          onBack={() => setView('positions')}
        />
      )}
    </Modal>
  );
}

/**
 * Career: the menu. What you are doing now, and — from high school
 * on — a way to ask for gig work.
 */
function CareerMenu({
  character,
  onOccupation,
  onGigs,
  onHunt,
  onDegrees,
}: {
  character: Character;
  onOccupation: () => void;
  onGigs: () => void;
  onHunt: () => void;
  onDegrees: () => void;
}) {
  const school = schoolName(character);
  const job = character.jobId ? jobById(character.eraId, character.jobId) : null;
  const graduated =
    school === null && character.age >= workStartAge(character.eraId);
  const degree = character.uniId ? degreeById(character.uniId) : null;
  const service = character.serving
    ? (WARS.find((w) => w.id === character.serving)?.name ?? 'At war')
    : character.sentence
    ? 'Imprisoned'
    : null;
  return (
    <div>
      <div className={`${MS.label} mb-2`}>Current occupation</div>
      <button
        onClick={character.sentence ? () => {} : onOccupation}
        className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
      >
        {school ?? job?.title ?? service ?? 'Nothing yet'}
      </button>
      {degree ? (
        <button
          onClick={onOccupation}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          {degree.field}
        </button>
      ) : (
        graduated && !character.serving && !character.sentence && (
          <button
            onClick={onDegrees}
            className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
          >
            Higher study
          </button>
        )
      )}
      {character.age >= GIG_AGE && !character.serving && !character.sentence && (
        <button
          onClick={onGigs}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Find a gig
        </button>
      )}
      {graduated && !character.serving && !character.sentence && (
        <button
          onClick={onHunt}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Look for a job
        </button>
      )}
    </div>
  );
}

/**
 * Gig work: pick the job, name the pay, and see if it comes through.
 * Asking over the fair rate makes it likelier you hear nothing back.
 */
function GigBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const takeGig = useGame((s) => s.takeGig);
  const gigs = gigsFor(character);
  const [gigId, setGigId] = useState(gigs[0]?.id ?? '');
  const [mult, setMult] = useState('1');
  const symbol = moneySymbolOf(character);
  const scale = getEra(character.eraId).moneyScale;

  if (gigs.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  const gig = gigs.find((g) => g.id === gigId) ?? gigs[0];
  return (
    <div>
      <div className={`${MS.label} mb-2`}>Gig</div>
      <select
        aria-label="Which gig to ask for"
        value={gig.id}
        onChange={(e) => setGigId(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {gigs.map((g) => (
          <option key={g.id} value={g.id}>
            {g.text}
          </option>
        ))}
      </select>
      <div className={`${MS.label} mb-2 mt-4`}>Pay</div>
      <select
        aria-label="How much pay to ask for"
        value={mult}
        onChange={(e) => setMult(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {GIG_MULTIPLES.map((m) => (
          <option key={m} value={String(m)}>
            {formatFunds(Math.round(gig.base * m * scale), symbol)}
          </option>
        ))}
      </select>
      <button
        onClick={() => takeGig(gig.id, Number(mult))}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Send
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * Higher study: pick the degree, pay it yourself or ask at home.
 * Tuition asked twice is a long shot.
 */
function DegreesBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const enrolUni = useGame((s) => s.enrolUni);
  const askForTuition = useGame((s) => s.askForTuition);
  const degrees = degreesFor(character.eraId, character.age);
  const [degreeId, setDegreeId] = useState(degrees[0]?.id ?? '');
  const kin = askableRelatives(character);
  const [memberId, setMemberId] = useState(kin[0]?.id ?? '');
  const symbol = moneySymbolOf(character);

  if (degrees.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  const degree = degrees.find((d) => d.id === degreeId) ?? degrees[0];
  const cost = degreeCost(degree, character.eraId);
  const parent = kin.find((m) => m.id === memberId) ?? kin[0];
  return (
    <div>
      <div className={`${MS.label} mb-2`}>Degree</div>
      <select
        aria-label="Which degree to read"
        value={degree.id}
        onChange={(e) => setDegreeId(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {degrees.map((d) => (
          <option key={d.id} value={d.id}>
            {d.field} · {d.years} years · {formatFunds(degreeCost(d, character.eraId), symbol)}
          </option>
        ))}
      </select>
      <button
        disabled={character.money < cost}
        onClick={() => enrolUni(degree.id)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Enrol · {formatFunds(cost, symbol)}
      </button>
      {parent && (
        <div className="mt-4">
          <div className={`${MS.label} mb-2`}>Ask to pay</div>
          <select
            aria-label="Who to ask for tuition"
            value={parent.id}
            onChange={(e) => setMemberId(e.target.value)}
            className={`${MS.input} w-full py-2.5 text-[15px]`}
          >
            {kin.map((m) => (
              <option key={m.id} value={m.id}>
                {cap(kinshipRef(m, character.family))}
              </option>
            ))}
          </select>
          <button
            onClick={() => askForTuition(parent.id, degree.id)}
            className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
          >
            Ask
          </button>
        </div>
      )}
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The course: the tutor and the fellow readers. Same company rules
 * as a class, held until graduation or leaving.
 */
function UniBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const mates = useGame((s) => s.uniMates());
  const interactUniMate = useGame((s) => s.interactUniMate);
  const befriendUniMate = useGame((s) => s.befriendUniMate);
  const symbol = moneySymbolOf(character);
  const moneyScale = getEra(character.eraId).moneyScale;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = mates.find((m) => m.id === openId) ?? null;

  if (open) {
    const befriended = character.contacts.some((m) => m.id === open.id);
    return (
      <div>
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <span className="text-[15px] font-semibold text-ink">{open.name}</span>
          <span className="text-[13px] text-ink-dim">
            {open.isTeacher ? 'Tutor' : `Age ${character.age}`}
            {sexMark(open.gender) && <> · {sexMark(open.gender)}</>}
          </span>
        </div>
        <div className="mt-4">
          <StatBar label={open.isTeacher ? 'Regard' : 'Friendship'} value={open.bond} />
        </div>
        <div className="mt-4 space-y-2">
          {actionsFor('friend', socialOpts(character))
            .filter(({ key }) => key !== 'money')
            .map(({ key, def }) => (
              <ActionButton
                key={key}
                def={def}
                money={character.money}
                moneyScale={moneyScale}
                symbol={symbol}
                gender={open.gender}
                onClick={() => onInteract(key)}
              />
            ))}
        {!befriended && !character.serving && (
          <button
            onClick={onBefriend}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Be friends
          </button>
        )}
        </div>
        <button onClick={() => setOpenId(null)} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
          Nevermind
        </button>
      </div>
    );
  }

  const tutor = mates.find((m) => m.isTeacher);
  const readers = mates.filter((m) => !m.isTeacher);

  return (
    <div>
      {tutor && (
        <>
          <div className={MS.label}>Tutor</div>
          <div className="mt-1 divide-y divide-line">
            <button onClick={() => setOpenId(tutor.id)} className="block w-full py-2.5 text-left">
              <div className="text-sm font-semibold text-ink">
                {tutor.name}
                {character.contacts.some((m) => m.id === tutor.id) && (
                  <span className="font-normal text-ink-dim"> (friends)</span>
                )}
              </div>
              <div className="mt-0.5 text-[13px] text-ink-dim">
                Tutor{sexMark(tutor.gender) && <> · {sexMark(tutor.gender)}</>} · {tutor.status}
              </div>
              <BondStrip value={tutor.bond} />
            </button>
          </div>
        </>
      )}
      <div className={`${MS.label} mt-4`}>Readers</div>
      <div className="mt-1 divide-y divide-line">
        {readers.map((m) => (
          <button key={m.id} onClick={() => setOpenId(m.id)} className="block w-full py-2.5 text-left">
            <div className="text-sm font-semibold text-ink">
              {m.name}
              {character.contacts.some((x) => x.id === m.id) && (
                <span className="font-normal text-ink-dim"> (friends)</span>
              )}
            </div>
            <div className="mt-0.5 text-[13px] text-ink-dim">
              Age {character.age}
              {sexMark(m.gender) && <> · {sexMark(m.gender)}</>} · {m.status}
            </div>
            <BondStrip value={m.bond} />
          </button>
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-3 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );

  function onInteract(key: Interaction) {
    if (open) interactUniMate(open.id, key);
  }
  function onBefriend() {
    if (open) befriendUniMate(open.id);
  }
}

/**
 * The job hunt: which line of work. Only sectors with something you
 * are old and sharp enough to hold are shown.
 */
function SectorsBody({
  character,
  onPick,
  onBack,
}: {
  character: Character;
  onPick: (sector: string) => void;
  onBack: () => void;
}) {
  const sectors = sectorsFor(character.eraId).filter(
    (s) =>
      jobsInSector(
        character.eraId,
        s,
        character.age,
        character.stats.smarts,
        character.degrees ?? [],
      ).length > 0,
  );

  if (sectors.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {sectors.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            {s}
          </button>
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The posts on offer in one sector, with the pay and the hours.
 * Pick one to look it over; asking comes after.
 */
function PositionsBody({
  character,
  sector,
  onOpen,
  onBack,
}: {
  character: Character;
  sector: string;
  onOpen: (jobId: string) => void;
  onBack: () => void;
}) {
  const jobs = jobsInSector(
    character.eraId,
    sector,
    character.age,
    character.stats.smarts,
    character.degrees ?? [],
  );
  const symbol = moneySymbolOf(character);
  const scale = getEra(character.eraId).moneyScale;

  if (jobs.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {jobs.map((j) => (
          <button
            key={j.id}
            onClick={() => onOpen(j.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            {j.title} ·{' '}
            {formatFunds(Math.max(1, Math.round((j.wage * scale) / 12)), symbol)}/mo ·{' '}
            {j.hours}h/wk
          </button>
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * One post: what it pays, what it takes, and whether they will see
 * you. Posts on wheels ask for your own transport first.
 */
function PositionBody({
  character,
  jobId,
  onBack,
}: {
  character: Character;
  jobId: string;
  onBack: () => void;
}) {
  const requestInterview = useGame((s) => s.requestInterview);
  const job = jobById(character.eraId, jobId);
  const symbol = moneySymbolOf(character);
  const scale = getEra(character.eraId).moneyScale;

  if (!job) {
    return (
      <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
        Nevermind
      </button>
    );
  }

  const degree = job.requiresDegree ? degreeById(job.requiresDegree) : null;
  const rides = !job.requiresVehicle || ownsVehicle(character);
  const rows: [string, string][] = [
    ['Position', job.position],
    ['Earns', `${formatFunds(Math.max(1, Math.round((job.wage * scale) / 12)), symbol)} / month`],
    ['Hours', `${job.hours} / week`],
    ['Age', `${job.minAge}`],
    ['Smarts', `${job.smartsRequired}`],
  ];
  if (degree) rows.push(['Degree', degree.field]);
  rows.push(['Transport', rides ? 'Own transport' : 'Own transport · wanting']);

  return (
    <div>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-baseline justify-between border-b border-line py-2.5"
        >
          <span className={MS.label}>{label}</span>
          <span className="text-[15px] font-semibold tabular-nums text-ink">
            {value}
          </span>
        </div>
      ))}
      <button
        disabled={!rides}
        onClick={() => requestInterview(job.id)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Ask for an interview
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * An evening out: where to, and how grand. Longer costs more and
 * lands harder; a bad patch of it and they may not feel like going.
 */
function DateBody({
  character,
  contactId,
  onBack,
}: {
  character: Character;
  contactId: string;
  onBack: () => void;
}) {
  const takeDate = useGame((s) => s.takeDate);
  const places = walkPlacesFor(character);
  const [duration, setDuration] = useState(WALK_DURATIONS[1].id);
  const [place, setPlace] = useState(places[0]?.id ?? '');

  if (places.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nowhere yet
      </div>
    );
  }

  return (
    <div>
      <div className={`${MS.label} mb-2`}>Where</div>
      <select
        aria-label="Where the evening goes"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.text}
          </option>
        ))}
      </select>
      <div className={`${MS.label} mb-2 mt-4`}>How long</div>
      <select
        aria-label="How grand the evening is"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {WALK_DURATIONS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.text}
          </option>
        ))}
      </select>
      <button
        onClick={() => takeDate(contactId, duration, place)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Go
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * Career: what you're doing now (school or job) plus the options
 * available in it, over a bar showing how well you're doing.
 */
function CareerBody({
  character,
  onClass,
  onCrew,
  onUni,
  onBack,
}: {
  character: Character;
  onClass: () => void;
  onCrew: () => void;
  onUni: () => void;
  onBack: () => void;
}) {
  const study = useGame((s) => s.study);
  const studyUni = useGame((s) => s.studyUni);
  const quitUni = useGame((s) => s.quitUni);
  const workHarder = useGame((s) => s.workHarder);
  const quitJob = useGame((s) => s.quitJob);
  const school = schoolName(character);
  const job = character.jobId ? jobById(character.eraId, character.jobId) : null;
  const degree = character.uniId ? degreeById(character.uniId) : null;
  const service = character.serving
    ? (WARS.find((w) => w.id === character.serving)?.name ?? 'At war')
    : null;
  const standing = school || degree ? 'Studies' : job ? 'Work' : 'Career';
  const symbol = moneySymbolOf(character);
  const monthly = monthlyWage(character, getEra(character.eraId).moneyScale);

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>Doing</span>
        <span className="text-[15px] font-semibold text-ink">
          {school ?? job?.sector ?? degree?.field ?? service ?? 'Nothing yet'}
        </span>
      </div>
      {job && (
        <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
          <span className={MS.label}>Position</span>
          <span className="text-[15px] font-semibold text-ink">
            {job.title}
          </span>
        </div>
      )}
      <div className="mt-4">
        <StatBar label={standing} value={character.performance} />
      </div>
      {job && (
        <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
          <span className={MS.label}>Earns</span>
          <span className="text-[15px] font-semibold tabular-nums text-ink">
            {formatFunds(monthly, symbol)} / month
          </span>
        </div>
      )}
      {job && (
        <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
          <span className={MS.label}>Hours</span>
          <span className="text-[15px] font-semibold tabular-nums text-ink">
            {job.hours} / week
          </span>
        </div>
      )}
      <div className="mt-4 space-y-2">
        {school && (
          <button
            onClick={() => study()}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Study more
          </button>
        )}
        {school && (
          <button
            onClick={onClass}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Class
          </button>
        )}
        {degree && job && <div className={MS.label}>Studies</div>}
        {degree && (
          <button
            onClick={() => studyUni()}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Study more
          </button>
        )}
        {degree && (
          <button
            onClick={onUni}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Course mates
          </button>
        )}
        {degree && (
          <button
            onClick={() => quitUni()}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Leave
          </button>
        )}
        {degree && job && <div className={`${MS.label} mt-4`}>Work</div>}
        {job && (
          <button
            onClick={() => workHarder()}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Work more
          </button>
        )}
        {job && (
          <button
            onClick={onCrew}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Workplace
          </button>
        )}
        {job && (
          <button
            onClick={() => quitJob()}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Quit your job
          </button>
        )}
        {service && (
          <button
            onClick={onCrew}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Unit
          </button>
        )}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * Your class: the teacher and the other pupils. Everyone here can be
 * spent on or spoken to; the ones who take to you move out into the
 * Circle for good.
 */
function ClassBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const classmates = useGame((s) => s.classmates());
  const interactClassmate = useGame((s) => s.interactClassmate);
  const befriendClassmate = useGame((s) => s.befriendClassmate);
  const symbol = moneySymbolOf(character);
  const moneyScale = getEra(character.eraId).moneyScale;
  const [openId, setOpenId] = useState<string | null>(null);
  const open = classmates.find((m) => m.id === openId) ?? null;

  if (open) {
    return (
      <ClassmateBody
        character={character}
        pupil={open}
        symbol={symbol}
        moneyScale={moneyScale}
        onInteract={(action) => interactClassmate(open.id, action)}
        onBefriend={() => befriendClassmate(open.id)}
        onBack={() => setOpenId(null)}
      />
    );
  }

  const teacher = classmates.find((m) => m.isTeacher);
  const pupils = classmates.filter((m) => !m.isTeacher);

  return (
    <div>
      {teacher && (
        <>
          <div className={MS.label}>Teacher</div>
          <div className="mt-1 divide-y divide-line">
            <ClassmateRow
              character={character}
              pupil={teacher}
              onClick={() => setOpenId(teacher.id)}
            />
          </div>
        </>
      )}
      <div className={`${MS.label} mt-4`}>Students</div>
      <div className="mt-1 divide-y divide-line">
        {pupils.map((m) => (
          <ClassmateRow
            key={m.id}
            character={character}
            pupil={m}
            onClick={() => setOpenId(m.id)}
          />
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-3 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

function ClassmateRow({
  character,
  pupil,
  onClick,
}: {
  character: Character;
  pupil: Classmate;
  onClick: () => void;
}) {
  const befriended = character.contacts.some((m) => m.id === pupil.id);
  return (
    <button onClick={onClick} className="block w-full py-2.5 text-left">
      <div className="text-sm font-semibold text-ink">
        {pupil.name}
        {befriended && <span className="font-normal text-ink-dim"> (friends)</span>}
      </div>
      <div className="mt-0.5 text-[13px] text-ink-dim">
        {pupil.isTeacher ? 'Teacher' : `Age ${character.age}`}
        {sexMark(pupil.gender) && <> · {sexMark(pupil.gender)}</>} · {pupil.status}
      </div>
      <BondStrip value={pupil.bond} />
    </button>
  );
}

function ClassmateBody({
  character,
  pupil,
  symbol,
  moneyScale,
  onInteract,
  onBefriend,
  onBack,
}: {
  character: Character;
  pupil: Classmate;
  symbol: string;
  moneyScale: number;
  onInteract: (action: Interaction) => void;
  onBefriend: () => void;
  onBack: () => void;
}) {
  const befriended = character.contacts.some((m) => m.id === pupil.id);
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className="text-[15px] font-semibold text-ink">{pupil.name}</span>
        <span className="text-[13px] text-ink-dim">
          {pupil.isTeacher ? 'Teacher' : `Age ${character.age}`}
          {sexMark(pupil.gender) && <> · {sexMark(pupil.gender)}</>}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>{pupil.isTeacher ? 'Teaches' : 'Sits with'}</span>
        <span className="text-[15px] font-semibold text-ink">
          {pupil.isTeacher ? 'your class' : 'you'}
        </span>
      </div>
      <div className="mt-4">
        <StatBar label={pupil.isTeacher ? 'Regard' : 'Friendship'} value={pupil.bond} />
      </div>
      <div className="mt-4 space-y-2">
        {actionsFor('friend', socialOpts(character))
          .filter(({ key }) => key !== 'money')
          .map(({ key, def }) => (
            <ActionButton
              key={key}
              def={def}
              money={character.money}
              moneyScale={moneyScale}
              symbol={symbol}
              gender={pupil.gender}
              onClick={() => onInteract(key)}
            />
          ))}
        {!befriended && (
          <button
            onClick={onBefriend}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Be friends
          </button>
        )}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * Your workplace: the boss and the people beside you. Everyone here
 * can be spent on or spoken to; the ones who take to you move out
 * into the Circle for good.
 */
function CrewBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const interactCrew = useGame((s) => s.interactCrew);
  const befriendCrew = useGame((s) => s.befriendCrew);
  const symbol = moneySymbolOf(character);
  const moneyScale = getEra(character.eraId).moneyScale;
  const [openId, setOpenId] = useState<string | null>(null);
  const crew = useGame((s) => s.coworkers());
  const open = crew.find((m) => m.id === openId) ?? null;

  if (open) {
    return (
      <CrewPersonBody
        character={character}
        person={open}
        symbol={symbol}
        moneyScale={moneyScale}
        onInteract={(action) => interactCrew(open.id, action)}
        onBefriend={() => befriendCrew(open.id)}
        onBack={() => setOpenId(null)}
      />
    );
  }

  const boss = crew.find((m) => m.isBoss);
  const hands = crew.filter((m) => !m.isBoss);
  const atWar = !!character.serving;

  return (
    <div>
      {boss && (
        <>
          <div className={MS.label}>{atWar ? 'Command' : 'Boss'}</div>
          <div className="mt-1 divide-y divide-line">
            <CrewRow
              character={character}
              person={boss}
              onClick={() => setOpenId(boss.id)}
            />
          </div>
        </>
      )}
      <div className={`${MS.label} mt-4`}>{atWar ? 'Unit' : 'Coworkers'}</div>
      <div className="mt-1 divide-y divide-line">
        {hands.map((m) => (
          <CrewRow
            key={m.id}
            character={character}
            person={m}
            onClick={() => setOpenId(m.id)}
          />
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-3 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

function CrewRow({
  character,
  person,
  onClick,
}: {
  character: Character;
  person: Coworker;
  onClick: () => void;
}) {
  const befriended = character.contacts.some((m) => m.id === person.id);
  return (
    <button onClick={onClick} className="block w-full py-2.5 text-left">
      <div className="text-sm font-semibold text-ink">
        {person.name}
        {befriended && <span className="font-normal text-ink-dim"> (friends)</span>}
      </div>
      <div className="mt-0.5 text-[13px] text-ink-dim">
        {person.isBoss ? 'Boss' : person.role}
        {sexMark(person.gender) && <> · {sexMark(person.gender)}</>}
      </div>
      <BondStrip value={person.bond} />
    </button>
  );
}

function CrewPersonBody({
  character,
  person,
  symbol,
  moneyScale,
  onInteract,
  onBefriend,
  onBack,
}: {
  character: Character;
  person: Coworker;
  symbol: string;
  moneyScale: number;
  onInteract: (action: Interaction) => void;
  onBefriend: () => void;
  onBack: () => void;
}) {
  const askRaise = useGame((s) => s.askRaise);
  const askPromotion = useGame((s) => s.askPromotion);
  const befriended = character.contacts.some((m) => m.id === person.id);
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className="text-[15px] font-semibold text-ink">{person.name}</span>
        <span className="text-[13px] text-ink-dim">
          {person.isBoss ? 'Boss' : person.role}
          {sexMark(person.gender) && <> · {sexMark(person.gender)}</>}
        </span>
      </div>
      <div className="mt-4">
        <StatBar label={person.isBoss ? 'Regard' : 'Friendship'} value={person.bond} />
      </div>
      <div className="mt-4 space-y-2">
        {actionsFor('friend', socialOpts(character))
          .filter(({ key }) => key !== 'money')
          .map(({ key, def }) => (
            <ActionButton
              key={key}
              def={def}
              money={character.money}
              moneyScale={moneyScale}
              symbol={symbol}
              gender={person.gender}
              onClick={() => onInteract(key)}
            />
          ))}
        {!befriended && (
          <button
            onClick={onBefriend}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Be friends
          </button>
        )}
        {person.isBoss && !character.serving && (
          <button
            onClick={() => askRaise()}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Ask for a raise
          </button>
        )}
        {person.isBoss && !character.serving && (
          <button
            onClick={() => askPromotion()}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Ask for a promotion
          </button>
        )}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The Circle: family, then friends, then lovers, then pets. Selecting
 * someone opens their detail view with a bond bar and what you can do
 * about it.
 */
type OpenTarget = { kind: 'contact' | 'family' | 'child'; id: string } | null;

function PeopleBody({
  character,
  onDate,
}: {
  character: Character;
  onDate: (id: string) => void;
}) {
  const [open, setOpen] = useState<OpenTarget>(null);
  const contact =
    open?.kind === 'contact'
      ? (character.contacts.find((m) => m.id === open.id) ?? null)
      : null;
  const member =
    open?.kind === 'family'
      ? (character.family.find((m) => m.id === open.id) ?? null)
      : null;
  const child =
    open?.kind === 'child'
      ? ((character.children ?? []).find((k) => k.id === open.id) ?? null)
      : null;

  if (contact) {
    return (
      <ContactBody
        character={character}
        contact={contact}
        onBack={() => setOpen(null)}
        onDate={onDate}
      />
    );
  }
  if (member) {
    return (
      <FamilyBody
        character={character}
        member={member}
        onBack={() => setOpen(null)}
      />
    );
  }
  if (child) {
    return (
      <ChildBody
        character={character}
        child={child}
        onBack={() => setOpen(null)}
      />
    );
  }

  const friends = character.contacts.filter((m) => m.kind === 'friend');
  const lovers = character.contacts.filter((m) => m.kind === 'partner');
  const pets = character.contacts.filter((m) => m.kind === 'pet');
  const children = character.children ?? [];

  return (
    <div>
      {(character.family.length > 0 || children.length > 0) && (
        <>
          <div className={MS.label}>Family</div>
          <div className="mt-1 divide-y divide-line">
            {character.family.map((m) => {
              const reachable = canSeeFamily(character);
              return (
                <button
                  key={m.id}
                  disabled={!reachable}
                  onClick={() => setOpen({ kind: 'family', id: m.id })}
                  className="block w-full py-2.5 text-left disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <div className="text-sm font-semibold text-ink">
                    {cap(kinshipRef(m, character.family))}
                  </div>
                  <div className="mt-0.5 text-[13px] text-ink-dim">
                    Age {memberAge(m, character.age)} · {m.status}
                  </div>
                  {reachable && <BondStrip value={m.bond} />}
                </button>
              );
            })}
            {children.map((k) => (
              <button
                key={k.id}
                onClick={() => setOpen({ kind: 'child', id: k.id })}
                className="block w-full py-2.5 text-left"
              >
                <div className="text-sm font-semibold text-ink">
                  {cap(childRef(k))} {k.lastName}
                </div>
                <div className="mt-0.5 text-[13px] text-ink-dim">
                  Age {childAge(k, character.age)}
                </div>
                <BondStrip value={k.bond} />
              </button>
            ))}
          </div>
        </>
      )}

      {friends.length > 0 && (
        <>
          <div className={`${MS.label} mt-4`}>Friends</div>
          <div className="mt-1 divide-y divide-line">
            {friends.map((p) => (
              <ContactRow
                key={p.id}
                character={character}
                contact={p}
                onClick={() => setOpen({ kind: 'contact', id: p.id })}
              />
            ))}
          </div>
        </>
      )}

      {lovers.length > 0 && (
        <>
          <div className={`${MS.label} mt-4`}>Lovers</div>
          <div className="mt-1 divide-y divide-line">
            {lovers.map((p) => (
              <ContactRow
                key={p.id}
                character={character}
                contact={p}
                onClick={() => setOpen({ kind: 'contact', id: p.id })}
              />
            ))}
          </div>
        </>
      )}

      {pets.length > 0 && (
        <>
          <div className={`${MS.label} mt-4`}>Pets</div>
          <div className="mt-1 divide-y divide-line">
            {pets.map((p) => (
              <ContactRow
                key={p.id}
                character={character}
                contact={p}
                onClick={() => setOpen({ kind: 'contact', id: p.id })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** One of your children: closeness, an afternoon, and their name. */
function ChildBody({
  character,
  child,
  onBack,
}: {
  character: Character;
  child: Child;
  onBack: () => void;
}) {
  const interactChild = useGame((s) => s.interactChild);
  const nameChild = useGame((s) => s.nameChild);
  const [naming, setNaming] = useState(false);

  if (naming) {
    return (
      <ChildNameBlock
        child={child}
        onName={(first, last) => nameChild(child.id, first, last)}
        onBack={() => setNaming(false)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className="text-[15px] font-semibold text-ink">
          {cap(childRef(child))} {child.lastName}
        </span>
        <span className="text-[13px] text-ink-dim">
          Age {childAge(child, character.age)}
        </span>
      </div>
      <div className="mt-4">
        <StatBar label="Closeness" value={child.bond} />
      </div>
      <div className="mt-4 space-y-2">
        {canActSocially(character) && (
          <button
            onClick={() => interactChild(child.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Spend time together
          </button>
        )}
        <button
          onClick={() => setNaming(true)}
          className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
        >
          Name them
        </button>
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** Giving a child the name they will carry. */
function ChildNameBlock({
  child,
  onName,
  onBack,
}: {
  child: Child;
  onName: (first: string, last: string) => void;
  onBack: () => void;
}) {
  const [first, setFirst] = useState(child.firstName);
  const [last, setLast] = useState(child.lastName);
  return (
    <div>
      <div className="border-b border-line pb-3 text-[15px] font-semibold text-ink">
        Name them
      </div>
      <input
        type="text"
        aria-label="First name for your child"
        value={first}
        maxLength={24}
        placeholder="First name"
        onChange={(e) => setFirst(e.target.value)}
        className={`${MS.input} mt-4 w-full`}
      />
      <input
        type="text"
        aria-label="Last name for your child"
        value={last}
        maxLength={24}
        placeholder="Last name"
        onChange={(e) => setLast(e.target.value)}
        className={`${MS.input} mt-2.5 w-full`}
      />
      <div className="mt-4 space-y-2">
        <button
          disabled={!first.trim() && !last.trim()}
          onClick={() => onName(first, last)}
          className={`${MS.primaryBtn} w-full py-2.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Name them
        </button>
        <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
          Nevermind
        </button>
      </div>
    </div>
  );
}

/** One relative and what you can do with them. */
function FamilyBody({
  character,
  member,
  onBack,
}: {
  character: Character;
  member: FamilyMember;
  onBack: () => void;
}) {
  const interactFamily = useGame((s) => s.interactFamily);
  const giftMoneyFamily = useGame((s) => s.giftMoneyFamily);
  const inviteHome = useGame((s) => s.inviteHome);
  const askForMoney = useGame((s) => s.askForMoney);
  const askable = askableRelatives(character).map((m) => m.id);
  const symbol = moneySymbolOf(character);
  const ref = cap(kinshipRef(member, character.family));
  const kin = kinGender(member);
  const [paying, setPaying] = useState(false);

  if (paying) {
    return (
      <GiftBlock
        character={character}
        gender={kin.gender}
        onGive={(amount) => giftMoneyFamily(member.id, amount)}
        onBack={() => setPaying(false)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className="text-[15px] font-semibold text-ink">{ref}</span>
        <span className="text-[13px] text-ink-dim">
          Age {memberAge(member, character.age)}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>Does</span>
        <span className="text-[15px] font-semibold text-ink">
          {member.status}
        </span>
      </div>
      <div className="mt-4">
        <StatBar label="Closeness" value={member.bond} />
      </div>
      <div className="mt-4 space-y-2">
        {actionsFor('friend', socialOpts(character)).map(({ key, def }) =>
          key === 'money' ? (
            <ActionButton
              key={key}
              def={def}
              money={character.money}
              moneyScale={getEra(character.eraId).moneyScale}
              symbol={symbol}
              gender={kin.gender}
              onClick={() => setPaying(true)}
            />
          ) : (
            <ActionButton
              key={key}
              def={def}
              money={character.money}
              moneyScale={getEra(character.eraId).moneyScale}
              symbol={symbol}
              gender={kin.gender}
              onClick={() => interactFamily(member.id, key)}
            />
          ),
        )}
        {askable.includes(member.id) && canActSocially(character) && (
          <button
            onClick={() => askForMoney(member.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Ask for pocket money
          </button>
        )}
        {memberAge(member, character.age) >= 16 &&
          canInviteHome(character, member, false) && (
            <button
              onClick={() => inviteHome('family', member.id)}
              className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
            >
              Ask to move in
            </button>
          )}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** Infants may only spend time; money and words come at 6. */
function socialOpts(character: Character): {
  canAct: boolean;
  canGiveMoney: boolean;
} {
  return {
    canAct: canActSocially(character),
    canGiveMoney: canActSocially(character) && character.money > 0,
  };
}

/** How much you can hand over, chosen on a slider. */
function GiftBlock({
  character,
  gender,
  onGive,
  onBack,
}: {
  character: Character;
  gender: string;
  onGive: (amount: number) => void;
  onBack: () => void;
}) {
  const symbol = moneySymbolOf(character);
  const max = maxGift(character.money, getEra(character.eraId).moneyScale);
  const step = Math.max(1, getEra(character.eraId).moneyScale);
  const [amount, setAmount] = useState(Math.min(max, step));
  const shown = Math.min(amount, max);
  const him =
    gender === 'Male' || gender === 'Female' ? pronoun(gender, 'obj') : 'them';

  if (max <= 0) return null;
  return (
    <div>
      <div className={`flex items-baseline justify-between border-b border-line pb-3`}>
        <span className="text-[15px] font-semibold text-ink">Give {him} money</span>
        <span className="text-[15px] font-semibold tabular-nums text-ink">
          {formatFunds(shown, symbol)}
        </span>
      </div>
      <input
        type="range"
        aria-label="Amount to give"
        min={step}
        max={max}
        step={step}
        value={Math.min(shown, max)}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-4 w-full"
      />
      <div className="mt-4 space-y-2">
        <button
          onClick={() => onGive(shown)}
          className={`${MS.primaryBtn} w-full py-2.5 text-[15px]`}
        >
          Give {formatFunds(shown, symbol)}
        </button>
        <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
          Nevermind
        </button>
      </div>
    </div>
  );
}

/** Naming an animal yourself. */
function NameBlock({
  current,
  onName,
  onBack,
}: {
  current: string | null;
  onName: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(current ?? '');
  return (
    <div>
      <div className="border-b border-line pb-3 text-[15px] font-semibold text-ink">
        Name it
      </div>
      <input
        type="text"
        aria-label="Name for your animal"
        value={name}
        maxLength={24}
        placeholder="A name"
        onChange={(e) => setName(e.target.value)}
        className={`${MS.input} mt-4 w-full`}
      />
      <div className="mt-4 space-y-2">
        <button
          disabled={!name.trim()}
          onClick={() => onName(name)}
          className={`${MS.primaryBtn} w-full py-2.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Name it
        </button>
        <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
          Nevermind
        </button>
      </div>
    </div>
  );
}

/** Look them over before asking: who they are and what they are like. */
function AskBlock({
  contact,
  onAsk,
  onBack,
}: {
  contact: Contact;
  onAsk: () => void;
  onBack: () => void;
}) {
  const stats = contactStats(contact);
  const rows: [string, string][] = [
    ['Orientation', cap(contact.orientation ?? 'straight')],
    ['Gender', contact.gender],
    ['Health', String(stats.health)],
    ['Happiness', String(stats.happiness)],
    ['Smarts', String(stats.smarts)],
    ['Looks', String(stats.looks)],
    ['Reputation', String(stats.reputation)],
  ];
  return (
    <div>
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex items-baseline justify-between border-b border-line py-2.5"
        >
          <span className={MS.label}>{label}</span>
          <span className="text-[15px] font-semibold tabular-nums text-ink">
            {value}
          </span>
        </div>
      ))}
      <div className="mt-4 space-y-2">
        <button
          onClick={onAsk}
          className={`${MS.primaryBtn} w-full py-2.5 text-[15px]`}
        >
          Ask out
        </button>
        <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
          Nevermind
        </button>
      </div>
    </div>
  );
}

/**
 * The proposal: which ring from your own, and where to kneel.
 * No rings means no question.
 */
function ProposeBody({
  character,
  contactId,
  onBack,
}: {
  character: Character;
  contactId: string;
  onBack: () => void;
}) {
  const propose = useGame((s) => s.propose);
  const rings = ringsOwned(character);
  const places = walkPlacesFor(character);
  const [ringId, setRingId] = useState(rings[0]?.item.id ?? '');
  const [placeId, setPlaceId] = useState(places[0]?.id ?? '');

  if (rings.length === 0 || places.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  const current = rings.find((e) => e.item.id === ringId) ?? rings[0];
  return (
    <div>
      <div className={`${MS.label} mb-2`}>Ring</div>
      <select
        aria-label="Which ring to give"
        value={current.item.id}
        onChange={(e) => setRingId(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {rings.map(({ item, count }) => (
          <option key={item.id} value={item.id}>
            {item.text} · {count}
          </option>
        ))}
      </select>
      <div className={`${MS.label} mb-2 mt-4`}>Where</div>
      <select
        aria-label="Where to propose"
        value={placeId}
        onChange={(e) => setPlaceId(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.text}
          </option>
        ))}
      </select>
      <button
        onClick={() => propose(contactId, current.item.id, placeId)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Propose
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The wedding: where, and what it costs. The rite is always free.
 */
function MarryBody({
  character,
  contactId,
  onBack,
}: {
  character: Character;
  contactId: string;
  onBack: () => void;
}) {
  const marry = useGame((s) => s.marry);
  const venues = venuesFor(character);
  const [venueId, setVenueId] = useState(venues[0]?.id ?? '');
  const symbol = moneySymbolOf(character);

  if (venues.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  const current = venues.find((v) => v.id === venueId) ?? venues[0];
  const price = venueCost(current, character);
  return (
    <div>
      <div className={`${MS.label} mb-2`}>Where</div>
      <select
        aria-label="Where to marry"
        value={current.id}
        onChange={(e) => setVenueId(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {venues.map((v) => {
          const cost = venueCost(v, character);
          return (
            <option key={v.id} value={v.id}>
              {v.text} · {cost === 0 ? 'Free' : formatFunds(cost, symbol)}
            </option>
          );
        })}
      </select>
      <button
        disabled={price > character.money}
        onClick={() => marry(contactId, current.id)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Marry{price > 0 && <> · {formatFunds(price, symbol)}</>}
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** One interaction button, priced where it costs something. */
function ActionButton({
  def,
  money,
  moneyScale,
  symbol,
  gender,
  onClick,
}: {
  def: InteractionDef;
  money: number;
  moneyScale: number;
  symbol: string;
  gender: string;
  onClick: () => void;
}) {
  const affordable = canAfford(def, money, moneyScale);
  const him =
    gender === 'Male' || gender === 'Female' ? pronoun(gender, 'obj') : null;
  const text = him ? def.text.replaceAll('them', him) : def.text;
  return (
    <button
      disabled={!affordable}
      onClick={onClick}
      className={`${MS.ghostBtn} w-full py-2.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {text}
      {def.cost < 0 && (
        <span className="text-ink-faint">
          {' '}
          · {formatFunds(Math.abs(def.cost) * moneyScale, symbol)}
        </span>
      )}
    </button>
  );
}

function ContactRow({
  character,
  contact,
  onClick,
}: {
  character: Character;
  contact: Contact;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="block w-full py-2.5 text-left">
      <div className="text-sm font-semibold text-ink">
        {cap(contactRef(contact))}
      </div>
      <div className="mt-0.5 text-[13px] text-ink-dim">
        Age {contactAge(contact, character.age)}
        {sexMark(contact.gender) && <> · {sexMark(contact.gender)}</>} ·{' '}
        {contactTrade(contact, character.age, character.eraId)}
      </div>
      <BondStrip value={contact.bond} />
    </button>
  );
}

/** A bare preview of the bond: no number, just the shape of it. */
function BondStrip({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ink/10">
      <div
        className="h-full rounded-full bg-ink transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** One person (or animal) and everything you can do about them. */
function ContactBody({
  character,
  contact,
  onBack,
  onDate,
}: {
  character: Character;
  contact: Contact;
  onBack: () => void;
  onDate: (id: string) => void;
}) {
  const interact = useGame((s) => s.interact);
  const giftMoney = useGame((s) => s.giftMoney);
  const namePet = useGame((s) => s.namePet);
  const flirt = useGame((s) => s.flirt);
  const makeLove = useGame((s) => s.makeLove);
  const askOut = useGame((s) => s.askOut);
  const inviteHome = useGame((s) => s.inviteHome);
  const breakUp = useGame((s) => s.breakUp);
  const symbol = moneySymbolOf(character);
  const ref = cap(contactRef(contact));
  const bondLabel = contact.kind === 'pet' ? 'Bond' : 'Closeness';
  const [step, setStep] = useState<'main' | 'gift' | 'name' | 'ask' | 'propose' | 'marry'>('main');

  if (step === 'gift') {
    return (
      <GiftBlock
        character={character}
        gender={contact.gender}
        onGive={(amount) => giftMoney(contact.id, amount)}
        onBack={() => setStep('main')}
      />
    );
  }
  if (step === 'name') {
    return (
      <NameBlock
        current={contact.petName}
        onName={(name) => namePet(contact.id, name)}
        onBack={() => setStep('main')}
      />
    );
  }
  if (step === 'ask') {
    return (
      <AskBlock
        contact={contact}
        onAsk={() => askOut(contact.id)}
        onBack={() => setStep('main')}
      />
    );
  }
  if (step === 'propose') {
    return (
      <ProposeBody
        character={character}
        contactId={contact.id}
        onBack={() => setStep('main')}
      />
    );
  }
  if (step === 'marry') {
    return (
      <MarryBody
        character={character}
        contactId={contact.id}
        onBack={() => setStep('main')}
      />
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className="text-[15px] font-semibold text-ink">{ref}</span>
        <span className="text-[13px] text-ink-dim">
          Age {contactAge(contact, character.age)}
          {contact.kind !== 'pet' && sexMark(contact.gender) && <> · {sexMark(contact.gender)}</>}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>{contact.kind === 'pet' ? 'Kept' : 'Works'}</span>
        <span className="text-[15px] font-semibold text-ink">
          {contactTrade(contact, character.age, character.eraId)}
        </span>
      </div>
      <div className="mt-4">
        <StatBar label={bondLabel} value={contact.bond} />
      </div>
      <div className="mt-4 space-y-2">
        {actionsFor(contact.kind, socialOpts(character)).map(({ key, def }) => (
          <ActionButton
            key={key}
            def={def}
            money={character.money}
            moneyScale={getEra(character.eraId).moneyScale}
            symbol={symbol}
            gender={contact.gender}
            onClick={() =>
              key === 'money' ? setStep('gift') : interact(contact.id, key)
            }
          />
        ))}
        {contact.kind === 'pet' && (
          <button
            onClick={() => setStep('name')}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            {contact.petName ? 'Rename it' : 'Name it'}
          </button>
        )}
        {canFlirtWith(character, contact) && (
          <button
            onClick={() => flirt(contact.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Flirt
          </button>
        )}
        {canAskOut(character, contact) && (
          <button
            onClick={() => setStep('ask')}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Ask out
          </button>
        )}
        {contact.kind !== 'pet' && canInviteHome(character, contact, true) && (
          <button
            onClick={() => inviteHome('contact', contact.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Ask to move in
          </button>
        )}
        {canPropose(character, contact) && (
          <button
            onClick={() => setStep('propose')}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Propose
          </button>
        )}
        {canMarry(character, contact) && (
          <button
            onClick={() => setStep('marry')}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Marry
          </button>
        )}
        {contact.kind === 'partner' && canFlirtWith(character, contact) && (
          <button
            onClick={() => onDate(contact.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Take out
          </button>
        )}
        {contact.kind === 'partner' && canMakeLove(character, contact) && (
          <button
            onClick={() => makeLove(contact.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Make love
          </button>
        )}
        {contact.kind === 'partner' && (
          <button
            onClick={() => breakUp(contact.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            {contact.married ? 'Divorce' : 'Break up'}
          </button>
        )}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** Mind and body: whatever your age and your period allow. */
function ActionsMenu({
  character,
  onDoctor,
  onWalk,
  onLibrary,
  onIdentity,
  onSalon,
  onNews,
  onShops,
  onBeg,
  onLicence,
}: {
  character: Character;
  onDoctor: () => void;
  onWalk: () => void;
  onLibrary: () => void;
  onIdentity: () => void;
  onSalon: () => void;
  onNews: () => void;
  onShops: () => void;
  onBeg: () => void;
  onLicence: () => void;
}) {
  const takeActivity = useGame((s) => s.takeActivity);
  const available = availableActivities(character);
  const reachable =
    canSeeDoctor(character) ||
    available.length > 0 ||
    canChooseOrientation(character);

  if (!reachable) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  const groups: { label: string; rows: typeof available }[] = [
    { label: 'Mind', rows: available.filter((a) => a.def.group === 'mind') },
    { label: 'Body', rows: available.filter((a) => a.def.group === 'body') },
  ];

  return (
    <div>
      {reachable && (
        <button
          onClick={onDoctor}
          className={`${MS.ghostBtn} mb-4 w-full py-2.5 text-[15px]`}
        >
          Visit a doctor
        </button>
      )}
      {canActSocially(character) && !character.serving && !character.sentence && (
        <button
          onClick={onShops}
          className={`${MS.ghostBtn} mb-4 w-full py-2.5 text-[15px]`}
        >
          Go shopping
        </button>
      )}
      {canGetLicence(character) && !character.serving && !character.sentence && (
        <button
          onClick={onLicence}
          className={`${MS.ghostBtn} mb-4 w-full py-2.5 text-[15px]`}
        >
          Driving licence
        </button>
      )}
      {canChooseOrientation(character) && !character.serving && !character.sentence && (
        <button
          onClick={onIdentity}
          className={`${MS.ghostBtn} mb-4 w-full py-2.5 text-[15px]`}
        >
          Identity
        </button>
      )}
      {groups.map(
        (g) =>
          g.rows.length > 0 && (
            <div key={g.label} className="mb-4 last:mb-0">
              <div className={`${MS.label} mb-2`}>{g.label}</div>
              <div className="space-y-2">
                {g.rows.map(({ key, def }) => {
                  const def1 = def;
                  const price = effectiveCost(def1, character);
                  const payable = needsParentPayer(def1, character) || price <= character.money;
                  const progress = character.skillProgress[key];
                  const discovered = progress !== undefined;
                  return (
                    <div key={key}>
                      <button
                        disabled={!payable}
                        onClick={() =>
                          key === 'walk'
                            ? onWalk()
                            : key === 'library'
                              ? onLibrary()
                              : key === 'salon'
                                ? onSalon()
                                : key === 'news'
                                  ? onNews()
                                  : key === 'beg'
                                    ? onBeg()
                                    : takeActivity(key)
                        }
                        className={`${MS.ghostBtn} w-full py-2.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        {def1.text}
                        {price > 0 && (
                          <span className="text-ink-faint">
                            {' '}
                            · {formatFunds(price, moneySymbolOf(character))}
                          </span>
                        )}
                      </button>
                      {discovered && (
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
                            <div
                              className="h-full rounded-full bg-ink transition-all duration-500"
                              style={{ width: `${Math.min(100, progress)}%` }}
                            />
                          </div>
                          <span className="text-[11px] tabular-nums text-ink-faint">
                            {Math.floor(progress)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ),
      )}
    </div>
  );
}

/**
 * A walk: pick how long and where. A longer walk is worth more and
 * tires the habit out faster; livelier places see more of the world.
 */
function WalkBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const takeWalk = useGame((s) => s.takeWalk);
  const places = walkPlacesFor(character);
  const [duration, setDuration] = useState(WALK_DURATIONS[1].id);
  const [place, setPlace] = useState(places[0]?.id ?? '');

  if (places.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nowhere yet
      </div>
    );
  }

  return (
    <div>
      <div className={`${MS.label} mb-2`}>Length</div>
      <select
        aria-label="How long the walk is"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {WALK_DURATIONS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.text}
          </option>
        ))}
      </select>
      <div className={`${MS.label} mb-2 mt-4`}>Where</div>
      <select
        aria-label="Where the walk goes"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.text}
          </option>
        ))}
      </select>
      <button
        onClick={() => takeWalk(duration, place)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Go
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The chairs: pick the treatment, priced alongside. What is on offer
 * depends on the period — no tanning beds before their time.
 */
function SalonBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const takeSalon = useGame((s) => s.takeSalon);
  const services = salonsFor(character);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const symbol = moneySymbolOf(character);
  const service = services.find((s) => s.id === serviceId) ?? services[0];

  if (!service) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  const price = salonCost(service, character);
  return (
    <div>
      <div className={`${MS.label} mb-2`}>Treatment</div>
      <select
        aria-label="Which treatment to book"
        value={service.id}
        onChange={(e) => setServiceId(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {services.map((s) => (
          <option key={s.id} value={s.id}>
            {s.text} · {formatFunds(salonCost(s, character), symbol)}
          </option>
        ))}
      </select>
      <button
        disabled={price > character.money}
        onClick={() => takeSalon(service.id)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Book · {formatFunds(price, symbol)}
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The shops: one row per shop open in this period. Fewer early,
 * more later — a Roman has three, a modern has six.
 */
function ShopListBody({
  character,
  onPick,
  onBack,
}: {
  character: Character;
  onPick: (shopId: string) => void;
  onBack: () => void;
}) {
  const shops = shopsFor(character);

  if (shops.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {shops.map((s) => (
          <Option
            key={s.id}
            active={false}
            title={s.text}
            onClick={() => onPick(s.id)}
            className="w-full rounded-lg px-4 py-2.5 text-center [&>div]:text-center"
          />
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * One shop. Shops without aisles list everything; aisled shops
 * switch lists from the dropdown at the top. Picking a row selects
 * it; Buy takes it home.
 */
function ShopBody({
  character,
  shopId,
  initialAisle,
  onBack,
}: {
  character: Character;
  shopId: string;
  initialAisle?: string | null;
  onBack: () => void;
}) {
  const takeShop = useGame((s) => s.takeShop);
  const askForShop = useGame((s) => s.askForShop);
  const shop = shopById(shopId);
  const symbol = moneySymbolOf(character);
  const aisles = aislesFor(character, shopId);
  const [aisle, setAisle] = useState(initialAisle ?? aisles[0] ?? '');
  const [selected, setSelected] = useState<string | null>(null);
  const kin = askableRelatives(character);
  const [memberId, setMemberId] = useState(kin[0]?.id ?? '');
  if (!shop) {
    return (
      <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
        Nevermind
      </button>
    );
  }
  const currentAisle = shop.aisles ? (aisles.includes(aisle) ? aisle : (aisles[0] ?? '')) : undefined;
  const items = itemsFor(character, shopId, currentAisle);
  const current = items.find((i) => i.id === selected) ?? null;
  const parent = kin.find((m) => m.id === memberId) ?? kin[0];

  return (
    <div>
      {shop.aisles && aisles.length > 0 && (
        <>
          <div className={`${MS.label} mb-2`}>Aisle</div>
          <select
            aria-label="Which aisle to browse"
            value={currentAisle}
            onChange={(e) => {
              setAisle(e.target.value);
              setSelected(null);
            }}
            className={`${MS.input} w-full py-2.5 text-[15px]`}
          >
            {aisles.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </>
      )}
      {items.length === 0 ? (
        <div className={`${MS.ghostBtn} mt-2.5 w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
          Nothing yet
        </div>
      ) : (
        <div className={`${shop.aisles ? 'mt-4' : ''} max-h-64 space-y-2 overflow-y-auto`}>
          {items.map((i) => {
            const price = shopCost(i, character);
            const ownedOut = isOwnedOut(i, character);
            return (
              <Option
                key={i.id}
                active={current?.id === i.id}
                title={i.text}
                meta={formatFunds(price, symbol)}
                onClick={() => setSelected(i.id)}
                disabled={ownedOut}
                className="w-full rounded-lg px-4 py-2.5 text-center disabled:cursor-not-allowed disabled:opacity-40 [&>div]:text-center"
              />
            );
          })}
        </div>
      )}
      {current && (
        <button
          disabled={character.money < shopCost(current, character) || isOwnedOut(current, character)}
          onClick={() => takeShop(current.id)}
          className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Buy · {formatFunds(shopCost(current, character), symbol)}
        </button>
      )}
      {current && parent && !isOwnedOut(current, character) && (
        <div className="mt-4">
          <div className={`${MS.label} mb-2`}>Ask to pay</div>
          <select
            aria-label="Who to ask to buy it"
            value={parent.id}
            onChange={(e) => setMemberId(e.target.value)}
            className={`${MS.input} w-full py-2.5 text-[15px]`}
          >
            {kin.map((m) => (
              <option key={m.id} value={m.id}>
                {cap(kinshipRef(m, character.family))}
              </option>
            ))}
          </select>
          <button
            onClick={() => askForShop(current.id, parent.id)}
            className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
          >
            Ask
          </button>
        </div>
      )}
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * Eating properly: pick an owned food, most filling first. Empty
 * shelves mean no dinner — the button never appears.
 */
/**
 * Begging: pick food or money, low odds per try. Spent years hear
 * that no one stops any more.
 */
function BegBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const takeBeg = useGame((s) => s.takeBeg);
  const [kind, setKind] = useState<'food' | 'money'>('food');
  const spent = (character.begsThisYear ?? 0) >= BEG_CAP;

  return (
    <div>
      <div className={`${MS.label} mb-2`}>Beg for</div>
      <select
        aria-label="What to beg for"
        value={kind}
        onChange={(e) => setKind(e.target.value as 'food' | 'money')}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        <option value="food">Food</option>
        <option value="money">Money</option>
      </select>
      <button
        disabled={spent}
        onClick={() => takeBeg(kind)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Beg
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The licence: old enough and rich enough, and it is yours.
 */
function LicenceBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const getLicence = useGame((s) => s.getLicence);
  const askForLicence = useGame((s) => s.askForLicence);
  const symbol = moneySymbolOf(character);
  const cost = licenceCost(character);
  const kin = askableRelatives(character);
  const [memberId, setMemberId] = useState(kin[0]?.id ?? '');
  const parent = kin.find((m) => m.id === memberId) ?? kin[0];

  return (
    <div>
      <button
        disabled={character.money < cost}
        onClick={() => getLicence()}
        className={`${MS.primaryBtn} w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Get · {formatFunds(cost, symbol)}
      </button>
      {parent && (
        <div className="mt-4">
          <div className={`${MS.label} mb-2`}>Ask to pay</div>
          <select
            aria-label="Who to ask for the licence"
            value={parent.id}
            onChange={(e) => setMemberId(e.target.value)}
            className={`${MS.input} w-full py-2.5 text-[15px]`}
          >
            {kin.map((m) => (
              <option key={m.id} value={m.id}>
                {cap(kinshipRef(m, character.family))}
              </option>
            ))}
          </select>
          <button
            onClick={() => askForLicence(parent.id)}
            className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
          >
            Ask
          </button>
        </div>
      )}
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * A drive: how long, where, and with whom. Alone is an option;
 * company brings you closer.
 */
function DriveBody({
  character,
  index,
  onBack,
}: {
  character: Character;
  index: number;
  onBack: () => void;
}) {
  const takeDrive = useGame((s) => s.takeDrive);
  const places = walkPlacesFor(character);
  const [duration, setDuration] = useState(WALK_DURATIONS[1].id);
  const [place, setPlace] = useState(places[0]?.id ?? '');
  const [companion, setCompanion] = useState('alone');
  const people: { value: string; label: string }[] = [
    { value: 'alone', label: 'Alone' },
    ...character.family.map((m) => ({
      value: `family:${m.id}`,
      label: cap(kinshipRef(m, character.family)),
    })),
    ...character.contacts
      .filter((m) => m.kind !== 'pet')
      .map((m) => ({ value: `contact:${m.id}`, label: cap(contactRef(m)) })),
  ];

  if (places.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nowhere yet
      </div>
    );
  }

  return (
    <div>
      <div className={`${MS.label} mb-2`}>How long</div>
      <select
        aria-label="How long the drive is"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {WALK_DURATIONS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.text}
          </option>
        ))}
      </select>
      <div className={`${MS.label} mb-2 mt-4`}>Where</div>
      <select
        aria-label="Where the drive goes"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {places.map((p) => (
          <option key={p.id} value={p.id}>
            {p.text}
          </option>
        ))}
      </select>
      <div className={`${MS.label} mb-2 mt-4`}>With whom</div>
      <select
        aria-label="Who comes along"
        value={companion}
        onChange={(e) => setCompanion(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {people.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => takeDrive(index, duration, place, companion)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Go
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The front page: the latest year with anything in it, and everything
 * in it. Closing it counts as reading it.
 */
function NewsBody({
  character,
  onDone,
}: {
  character: Character;
  onDone: () => void;
}) {
  const news = latestNews(character);

  if (!news) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  return (
    <div>
      <div className={`${MS.label} mb-2`}>{newsYear(news.year)}</div>
      <div className="space-y-3">
        {news.items.map((h, i) => (
          <div key={`${h.y}-${i}`}>
            <div className="text-sm font-semibold text-ink">{h.t}</div>
            <div className="mt-0.5 text-[13px] leading-relaxed text-ink-dim">
              {h.d}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onDone}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Done
      </button>
    </div>
  );
}

/**
 * The shelf: a few of the books this reader could pick up, different
 * every time you look. Pick one to start reading it.
 */
function BookBody({
  character,
  onRead,
  onBack,
}: {
  character: Character;
  onRead: (bookId: string) => void;
  onBack: () => void;
}) {
  // drawn once per opening, so the shelf refreshes on every visit
  const [books] = useState(() => availableBooks(character));
  const [bookId, setBookId] = useState(books[0]?.id ?? '');

  if (books.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  return (
    <div>
      <div className={`${MS.label} mb-2`}>Book</div>
      <select
        aria-label="Which book to read"
        value={bookId}
        onChange={(e) => setBookId(e.target.value)}
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        {books.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title} · {b.genre}, {b.pages} pages
          </option>
        ))}
      </select>
      <button
        onClick={() => onRead(bookId)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Read
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** Reading it: a page at a time, until there are no more pages. */
function ReadingBody({
  book,
  onBack,
}: {
  book: BookDef;
  onBack: () => void;
}) {
  const finishBook = useGame((s) => s.finishBook);
  const [page, setPage] = useState(1);
  const last = page >= book.pages;

  return (
    <div>
      <PageGraphic page={page} />
      <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
        <span className="text-[13px] text-ink-dim">{book.genre}</span>
        <span className="text-[13px] tabular-nums text-ink-dim">
          Page {Math.min(page, book.pages)} of {book.pages}
        </span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-ink transition-all duration-300"
          style={{ width: `${(Math.min(page, book.pages) / book.pages) * 100}%` }}
        />
      </div>
      {!last ? (
        <button
          onClick={() => setPage((p) => p + 1)}
          className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
        >
          Turn the page
        </button>
      ) : (
        <button
          onClick={() => finishBook(book.id)}
          className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
        >
          Finish
        </button>
      )}
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * What the open book looks like: two pages with lines of print on
 * them, a different arrangement every page. Seeded by the page number
 * so it never flickers mid-read.
 */
function PageGraphic({ page }: { page: number }) {
  const left = linesFor(page * 2);
  const right = linesFor(page * 2 + 1);
  return (
    <div className="flex gap-3 rounded-lg border border-line bg-wash px-5 py-4">
      <div className="flex-1">
        <div className="mb-3 h-2 w-3/4 rounded-full bg-ink/70" />
        {left.map((w, i) => (
          <div
            key={i}
            className="mb-2 h-1.5 rounded-full bg-ink/25 last:mb-0"
            style={{ width: `${w * 100}%` }}
          />
        ))}
      </div>
      <div className="w-px bg-ink/15" />
      <div className="flex-1">
        {right.map((w, i) => (
          <div
            key={i}
            className="mb-2 h-1.5 rounded-full bg-ink/25 last:mb-0"
            style={{ width: `${w * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Nine print-line widths from a seed, each between two-fifths and full. */
function linesFor(seed: number): number[] {
  let s = (seed * 2654435761) % 4294967296;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  return Array.from({ length: 9 }, () => 0.4 + rnd() * 0.55);
}

/**
 * Who you are: what you go for, and — once industry arrives — what
 * you are. Both take hold the moment you pick them.
 */
function IdentityBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const setOrientation = useGame((s) => s.setOrientation);
  const setGender = useGame((s) => s.setGender);
  return (
    <div>
      <div className={`${MS.label} mb-2`}>Attracted to</div>
      <select
        aria-label="Who you are drawn to"
        value={character.orientation ?? 'straight'}
        onChange={(e) =>
          setOrientation(e.target.value as 'straight' | 'gay' | 'bisexual')
        }
        className={`${MS.input} w-full py-2.5 text-[15px]`}
      >
        <option value="straight">The opposite sex</option>
        <option value="gay">Your own sex</option>
        <option value="bisexual">Both</option>
      </select>
      {canChooseGender(character) && (
        <>
          <div className={`${MS.label} mb-2 mt-4`}>You are</div>
          <select
            aria-label="What you are"
            value={character.gender}
            onChange={(e) => setGender(e.target.value)}
            className={`${MS.input} w-full py-2.5 text-[15px]`}
          >
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </>
      )}
      <button onClick={onBack} className={`${MS.ghostBtn} mt-4 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

export function DoctorBody({
  character,
  onClose,
}: {
  character: Character;
  onClose: () => void;
}) {
  const cureAilment = useGame((s) => s.cureAilment);
  const checkup = useGame((s) => s.checkup);
  const [selected, setSelected] = useState<string | null>(null);
  const symbol = moneySymbolOf(character);
  const fee = 2 * getEra(character.eraId).moneyScale;

  const ids = character.ailments
    .filter(
      (a) =>
        a.ownerId === null &&
        a.known &&
        AILMENTS[a.ailmentId] &&
        !AILMENTS[a.ailmentId].incurable,
    )
    .map((a) => a.ailmentId);
  const current = selected && ids.includes(selected) ? selected : (ids[0] ?? null);
  const currentCost =
    current !== null ? AILMENTS[current].cureCost * getEra(character.eraId).moneyScale : 0;

  return (
    <div>
      <p className="text-sm leading-relaxed text-ink-dim">
        You’re visiting the doctor.
      </p>
      <div className="mt-4">
        <button
          disabled={character.money < fee}
          onClick={() => checkup()}
          className={`${MS.primaryBtn} w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Checkup · {formatFunds(fee, symbol)}
        </button>
      {ids.length === 1 && current !== null && (
        <button
          disabled={character.money < currentCost}
          onClick={() => cureAilment(current)}
          className={`${MS.primaryBtn} mt-2.5 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Cure {AILMENTS[current].name} · {formatFunds(currentCost, symbol)}
        </button>
      )}
      {ids.length > 1 && current !== null && (
        <div className="mt-2.5">
          <div className={`${MS.label} mb-2`}>Cure</div>
          <select
            aria-label="Illness to cure"
            value={current}
            onChange={(e) => setSelected(e.target.value)}
            className={`${MS.input} w-full py-2.5 text-[15px]`}
          >
            {ids.map((id) => (
              <option key={id} value={id}>
                {AILMENTS[id].name}
              </option>
            ))}
          </select>
          <button
            disabled={character.money < currentCost}
            onClick={() => cureAilment(current)}
            className={`${MS.primaryBtn} mt-2.5 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Cure · {formatFunds(currentCost, symbol)}
          </button>
        </div>
      )}
      {(character.children ?? [])
        .filter((k) =>
          character.ailments.some(
            (a) =>
              a.ownerId === k.id &&
              a.known &&
              AILMENTS[a.ailmentId] &&
              !AILMENTS[a.ailmentId].incurable,
          ),
        )
        .map((k) => (
          <ChildCureBlock key={k.id} character={character} childId={k.id} name={k.firstName} />
        ))}
      <button
        onClick={onClose}
        className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}
      >
        Nevermind
      </button>
      </div>
    </div>
  );
}

/** Curing one sick child: same fees, their name on the buttons. */
function ChildCureBlock({
  character,
  childId,
  name,
}: {
  character: Character;
  childId: string;
  name: string;
}) {
  const cureAilment = useGame((s) => s.cureAilment);
  const [selected, setSelected] = useState<string | null>(null);
  const symbol = moneySymbolOf(character);
  const ids = character.ailments
    .filter(
      (a) =>
        a.ownerId === childId &&
        a.known &&
        AILMENTS[a.ailmentId] &&
        !AILMENTS[a.ailmentId].incurable,
    )
    .map((a) => a.ailmentId);
  const current = selected && ids.includes(selected) ? selected : (ids[0] ?? null);
  if (current === null) return null;
  const cost = AILMENTS[current].cureCost * getEra(character.eraId).moneyScale;
  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className={`${MS.label} mb-2`}>{name} — {ids.map((id) => AILMENTS[id].name).join(', ')}</div>
      {ids.length > 1 && (
        <select
          aria-label={`Illness of ${name} to cure`}
          value={current}
          onChange={(e) => setSelected(e.target.value)}
          className={`${MS.input} mb-2.5 w-full py-2.5 text-[15px]`}
        >
          {ids.map((id) => (
            <option key={id} value={id}>
              {AILMENTS[id].name}
            </option>
          ))}
        </select>
      )}
      <button
        disabled={character.money < cost}
        onClick={() => cureAilment(current, childId)}
        className={`${MS.primaryBtn} w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
      >
        Cure {ids.length === 1 ? AILMENTS[current].name : ''} · {formatFunds(cost, symbol)}
      </button>
    </div>
  );
}

/**
 * Where you live: your own roof and who shares it, or family and
 * lodgings while you own nothing. The market opens from here, once
 * you are grown.
 */
function HomeBlock({
  character,
  onMarket,
  onHouse,
}: {
  character: Character;
  onMarket: () => void;
  onHouse: (prop: string) => void;
}) {
  const takeInPet = useGame((s) => s.takeInPet);
  const inviteFamily = useGame((s) => s.inviteFamily);
  const moveIn = useGame((s) => s.moveIn);
  const owned = houseName(character);
  const movedIn = character.home?.movedIn ?? false;
  const residents = residentsOf(character);
  const petsOut = character.contacts.filter(
    (p) => p.kind === 'pet' && !isResident(character, 'pet', p.id),
  );
  const parentsOut = character.family.some(
    (m) =>
      (m.relation === 'mother' || m.relation === 'father') &&
      !isResident(character, 'family', m.id),
  );
  const siblingsOut = character.family.some(
    (m) =>
      (m.relation === 'brother' || m.relation === 'sister') &&
      memberAge(m, character.age) >= 16 &&
      !isResident(character, 'family', m.id),
  );
  const familyOut = character.family.some(
    (m) => !isResident(character, 'family', m.id),
  );
  return (
    <div className="mb-4">
      <div className={MS.label}>Home</div>
      <div className="mt-1 text-[15px] font-semibold text-ink">
        {movedIn && owned ? owned : residenceLabel(character)}
      </div>
      {owned && !movedIn && (
        <div className="mt-0.5 text-[13px] text-ink-dim">
          You own {owned.charAt(0).toLowerCase() + owned.slice(1)}.
        </div>
      )}
      {residents.length > 0 && (
        <div className="mt-1 divide-y divide-line">
          {residents.map((r) => (
            <div key={`${r.scope}:${r.id}`} className="py-2 text-left">
              <div className="text-sm font-semibold text-ink">{cap(r.label)}</div>
              <div className="mt-0.5 text-[13px] text-ink-dim">{r.sub}</div>
            </div>
          ))}
        </div>
      )}
      {character.age >= 18 && (
        <button
          onClick={onMarket}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Look for a house
        </button>
      )}
      {owned && (
        <button
          onClick={() => onHouse('home')}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          House
        </button>
      )}
      {owned && !movedIn && (
        <button
          onClick={() => moveIn('home')}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Move in
        </button>
      )}
      {(character.rentals ?? []).length > 0 && (
        <>
          <div className={`${MS.label} mt-4`}>Properties</div>
          <div className="mt-1 divide-y divide-line">
            {(character.rentals ?? []).map((r) => (
              <button
                key={r.uid}
                onClick={() => onHouse(r.uid)}
                className="block w-full py-2.5 text-left"
              >
                <div className="text-sm font-semibold text-ink">
                  {propHouseText(character, r.uid) ?? 'A house'}
                </div>
                <div className="mt-0.5 text-[13px] text-ink-dim">
                  {r.tenants.length > 0
                    ? `Let${r.forRent ? ' · open' : ''}`
                    : r.forRent
                      ? 'Open for rent'
                      : 'Standing empty'}
                  {r.taxOwed > 0 && ' · tax due'}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      {movedIn && parentsOut && (
        <button
          onClick={() => inviteFamily('parents')}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Ask your parents
        </button>
      )}
      {movedIn && siblingsOut && (
        <button
          onClick={() => inviteFamily('siblings')}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Ask your siblings
        </button>
      )}
      {movedIn && familyOut && (
        <button
          onClick={() => inviteFamily('all')}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Ask the whole family
        </button>
      )}
      {movedIn &&
        petsOut.map((p) => (
          <button
            key={p.id}
            onClick={() => takeInPet(p.id)}
            className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
          >
            Take in {p.petName ?? p.name}
          </button>
        ))}
    </div>
  );
}

/** The market: every rung on offer in this period, cheap first. */
function HouseMarketBody({
  character,
  onBack,
}: {
  character: Character;
  onBack: () => void;
}) {
  const buyHome = useGame((s) => s.buyHome);
  const houses = housesFor(character.eraId);
  const symbol = moneySymbolOf(character);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = houses.find((h) => h.id === openId) ?? null;

  if (open) {
    const price = houseCost(open, character.eraId);
    return (
      <div>
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <span className="text-[15px] font-semibold text-ink">{open.text}</span>
          <span className="text-[15px] font-semibold tabular-nums text-ink">
            {formatFunds(price, symbol)}
          </span>
        </div>
        <button
          disabled={character.money < price}
          onClick={() => buyHome(open.id)}
          className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Buy
        </button>
        <button onClick={() => setOpenId(null)} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
          Nevermind
        </button>
      </div>
    );
  }

  if (houses.length === 0) {
    return (
      <div className={`${MS.ghostBtn} w-full cursor-not-allowed py-2.5 text-center text-[15px] opacity-40`}>
        Nothing yet
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {houses.map((h) => (
          <button
            key={h.id}
            onClick={() => setOpenId(h.id)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            {h.text} · {formatFunds(houseCost(h, character.eraId), symbol)}
          </button>
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/**
 * The house itself: what it is worth, what it owes, who is under
 * its roof, and what can be done with it.
 */
function HouseBody({
  character,
  prop,
  onResidents,
  onSell,
  onRent,
  onBack,
}: {
  character: Character;
  prop: string;
  onResidents: () => void;
  onSell: () => void;
  onRent: () => void;
  onBack: () => void;
}) {
  const moveIn = useGame((s) => s.moveIn);
  const moveOut = useGame((s) => s.moveOut);
  const payTax = useGame((s) => s.payTax);
  const kickOut = useGame((s) => s.kickOut);
  const name = propHouseText(character, prop);
  const value = propValue(character, prop);
  const lived = prop === 'home' && !!character.home?.movedIn;
  const owed =
    prop === 'home'
      ? (character.home?.taxOwed ?? 0)
      : (rentalByUid(character, prop)?.taxOwed ?? 0);
  const tenants = propTenantLines(character, prop);
  if (!name || value <= 0) {
    return (
      <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
        Nevermind
      </button>
    );
  }
  const symbol = moneySymbolOf(character);
  const residents = prop === 'home' ? residentsOf(character) : [];
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>Worth</span>
        <span className="text-[15px] font-semibold tabular-nums text-ink">
          {formatFunds(value, symbol)}
        </span>
      </div>
      <div className="mt-3 flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>Tax</span>
        <span className="text-[15px] font-semibold tabular-nums text-ink">
          {owed > 0 ? `Due ${formatFunds(owed, symbol)}` : 'Paid'}
        </span>
      </div>
      {tenants.length > 0 && (
        <>
          <div className={`${MS.label} mt-4`}>Tenants</div>
          <div className="mt-1 divide-y divide-line">
            {tenants.map((t) => (
              <div key={t.id} className="py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{cap(t.name)}</div>
                    <div className="mt-0.5 text-[13px] text-ink-dim">{t.sub}</div>
                  </div>
                  {!t.married && (
                    <button
                      onClick={() => kickOut(prop, t.id)}
                      className={`${MS.ghostBtn} shrink-0 px-4 py-2.5 text-[15px]`}
                    >
                      Kick out
                    </button>
                  )}
                </div>
                <BondStrip value={t.bond} />
              </div>
            ))}
          </div>
        </>
      )}
      <div className="mt-4 space-y-2">
        {owed > 0 && (
          <button
            onClick={() => payTax(prop)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Pay the tax
          </button>
        )}
        <button
          onClick={onResidents}
          className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
        >
          Residents{residents.length > 0 ? ` (${residents.length})` : ''}
        </button>
        {prop === 'home' &&
          (lived ? (
            <button
              onClick={() => moveOut()}
              className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
            >
              Move out
            </button>
          ) : (
            <button
              onClick={() => moveIn(prop)}
              className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
            >
              Move in
            </button>
          ))}
        {prop !== 'home' && !character.home?.movedIn && (
          <button
            onClick={() => moveIn(prop)}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
          >
            Move in
          </button>
        )}
        <button
          onClick={onSell}
          className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
        >
          Sell
        </button>
        <button
          onClick={onRent}
          className={`${MS.ghostBtn} w-full py-2.5 text-[15px]`}
        >
          Rent
        </button>
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** Everyone under your roof, closeness and all, like a class list. */
function MatesBody({
  character,
  prop,
  onBack,
}: {
  character: Character;
  prop: string;
  onBack: () => void;
}) {
  const residents = prop === 'home' ? residentsOf(character) : [];
  const tenants = prop === 'home' ? [] : propTenantLines(character, prop);
  const bondOf = (scope: string, id: string): number => {
    if (scope === 'family') {
      return character.family.find((m) => m.id === id)?.bond ?? 0;
    }
    return character.contacts.find((m) => m.id === id)?.bond ?? 0;
  };
  return (
    <div>
      <div className={`${MS.label}`}>Residents</div>
      <div className="mt-1 divide-y divide-line">
        {residents.map((r) => (
          <div key={`${r.scope}:${r.id}`} className="py-2.5 text-left">
            <div className="text-sm font-semibold text-ink">{cap(r.label)}</div>
            <div className="mt-0.5 text-[13px] text-ink-dim">{r.sub}</div>
            <BondStrip value={bondOf(r.scope, r.id)} />
          </div>
        ))}
        {tenants.map((t) => (
          <div key={t.id} className="py-2.5 text-left">
            <div className="text-sm font-semibold text-ink">{cap(t.name)}</div>
            <div className="mt-0.5 text-[13px] text-ink-dim">{t.sub}</div>
            <BondStrip value={t.bond} />
          </div>
        ))}
      </div>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-3 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** Naming the price: under value they crowd in, over it they walk. */
function SellBody({
  character,
  prop,
  onBack,
}: {
  character: Character;
  prop: string;
  onBack: () => void;
}) {
  const sellHome = useGame((s) => s.sellHome);
  const value = propValue(character, prop);
  const symbol = moneySymbolOf(character);
  const [pct, setPct] = useState(100);
  if (value <= 0) {
    return (
      <button onClick={onBack} className={`${MS.ghostBtn} w-full py-2.5`}>
        Nevermind
      </button>
    );
  }
  const price = Math.max(1, Math.round((value * pct) / 100));
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>Asking</span>
        <span className="text-[15px] font-semibold tabular-nums text-ink">
          {formatFunds(price, symbol)} · {pct}%
        </span>
      </div>
      <input
        type="range"
        aria-label="Asking price"
        min={50}
        max={150}
        step={5}
        value={pct}
        onChange={(e) => setPct(Number(e.target.value))}
        className="mt-4 w-full"
      />
      <button
        onClick={() => sellHome(prop, price)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Sell
      </button>
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

/** Letting the rooms: name the yearly rent, then find who pays it. */
function RentBody({
  character,
  prop,
  onBack,
}: {
  character: Character;
  prop: string;
  onBack: () => void;
}) {
  const findTenant = useGame((s) => s.findTenant);
  const openRent = useGame((s) => s.openRent);
  const closeRent = useGame((s) => s.closeRent);
  const setRentPrice = useGame((s) => s.setRentPrice);
  const symbol = moneySymbolOf(character);
  const scale = getEra(character.eraId).moneyScale;
  const fair = fairRent(character, prop);
  const listed =
    prop === 'home'
      ? (character.home?.forRent ?? false)
      : (rentalByUid(character, prop)?.forRent ?? false);
  const tenants = propTenantLines(character, prop);
  const [price, setPrice] = useState(Math.max(1, fair));
  const [draft, setDraft] = useState(String(Math.max(1, fair)));
  const commitDraft = () => {
    const parsed = Number(draft);
    if (Number.isFinite(parsed)) {
      const next = Math.max(1, Math.floor(parsed));
      setPrice(next);
      setDraft(String(next));
    } else {
      setDraft(String(price));
    }
  };
  const pick = (v: number) => {
    const next = Math.max(1, Math.floor(v));
    setPrice(next);
    setDraft(String(next));
  };
  return (
    <div>
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <span className={MS.label}>Usually</span>
        <span className="text-[15px] font-semibold tabular-nums text-ink">
          {formatFunds(fair, symbol)}/yr
        </span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <input
          type="range"
          aria-label="Yearly rent"
          min={1}
          max={Math.max(2, fair * 3)}
          step={Math.max(1, scale)}
          value={Math.min(price, Math.max(2, fair * 3))}
          onChange={(e) => pick(Number(e.target.value))}
          className="flex-1"
        />
        <input
          type="number"
          aria-label="Yearly rent amount"
          min={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft();
          }}
          className={`${MS.input} w-28 py-2.5 text-center text-[15px] font-semibold tabular-nums`}
        />
      </div>
      <button
        onClick={() => findTenant(price, prop)}
        className={`${MS.primaryBtn} mt-4 w-full py-3 text-base`}
      >
        Find a tenant
      </button>
      {tenants.length > 0 && (
        <button
          onClick={() => setRentPrice(prop, price)}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Change the rent
        </button>
      )}
      {listed ? (
        <button
          onClick={() => closeRent(prop)}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Close the listing
        </button>
      ) : (
        <button
          onClick={() => openRent(price, prop)}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
        >
          Leave open for rent
        </button>
      )}
      <button onClick={onBack} className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}>
        Nevermind
      </button>
    </div>
  );
}

function AssetsBody({  character,
  step,
  setStep,
  selected,
  setSelected,
  houseProp,
  onHouse,
}: {
  character: Character;
  step: 'list' | 'item' | 'gift' | 'drive' | 'houses' | 'house' | 'mates' | 'sell' | 'rent';
  setStep: (step: 'list' | 'item' | 'gift' | 'drive' | 'houses' | 'house' | 'mates' | 'sell' | 'rent') => void;
  selected: number | null;
  setSelected: (idx: number | null) => void;
  houseProp: string | null;
  onHouse: (prop: string) => void;
}) {
  const symbol = moneySymbolOf(character);
  const discardItem = useGame((s) => s.discardItem);
  const giftItem = useGame((s) => s.giftItem);
  const eatItem = useGame((s) => s.eatItem);
  const takeDrive = useGame((s) => s.takeDrive);
  const belongings = character.belongings ?? [];
  const people: { scope: 'family' | 'contact'; id: string; label: string }[] = [
    ...character.family.map((m) => ({
      scope: 'family' as const,
      id: m.id,
      label: kinshipRef(m, character.family),
    })),
    ...character.contacts
      .filter((m) => m.kind !== 'pet')
      .map((m) => ({
        scope: 'contact' as const,
        id: m.id,
        label: contactRef(m),
      })),
  ];
  const [recipient, setRecipient] = useState('');
  const current = selected !== null ? (belongings[selected] ?? null) : null;
  const currentItem = current ? itemById(current) : undefined;
  const target = recipient || (people[0] ? `${people[0].scope}:${people[0].id}` : '');

  if (step === 'gift' && selected !== null && currentItem) {
    return (
      <div>
        <select
          aria-label="Who to give it to"
          value={target}
          onChange={(e) => setRecipient(e.target.value)}
          className={`${MS.input} w-full py-2.5 text-[15px]`}
        >
          {people.map((p) => (
            <option key={`${p.scope}:${p.id}`} value={`${p.scope}:${p.id}`}>
              {cap(p.label)}
            </option>
          ))}
        </select>
        <button
          disabled={!target}
          onClick={() => {
            const cut = target.indexOf(':');
            const scope = target.slice(0, cut) as 'family' | 'contact';
            const pid = target.slice(cut + 1);
            if (pid) giftItem(selected, scope, pid);
            setSelected(null);
            setStep('list');
          }}
          className={`${MS.primaryBtn} mt-4 w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-40`}
        >
          Give
        </button>
        <button
          onClick={() => setStep('item')}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}
        >
          Nevermind
        </button>
      </div>
    );
  }

  if (step === 'drive' && selected !== null && currentItem) {
    return (
      <DriveBody
        character={character}
        index={selected}
        onBack={() => setStep('item')}
      />
    );
  }

  if (step === 'houses') {
    return <HouseMarketBody character={character} onBack={() => setStep('list')} />;
  }

  if (step === 'house' && houseProp !== null) {
    return (
      <HouseBody
        character={character}
        prop={houseProp}
        onResidents={() => setStep('mates')}
        onSell={() => setStep('sell')}
        onRent={() => setStep('rent')}
        onBack={() => setStep('list')}
      />
    );
  }

  if (step === 'mates' && houseProp !== null) {
    return <MatesBody character={character} prop={houseProp} onBack={() => setStep('house')} />;
  }

  if (step === 'sell' && houseProp !== null) {
    return <SellBody character={character} prop={houseProp} onBack={() => setStep('house')} />;
  }

  if (step === 'rent' && houseProp !== null) {
    return <RentBody character={character} prop={houseProp} onBack={() => setStep('house')} />;
  }

  if (step === 'item' && selected !== null && currentItem) {
    return (
      <div>
        {currentItem.sates && (
          <button
            onClick={() => {
              eatItem(selected);
              setSelected(null);
              setStep('list');
            }}
            className={`${MS.primaryBtn} w-full py-3 text-base`}
          >
            Eat
          </button>
        )}
        {currentItem.vehicle && (
          <button
            onClick={() => {
              if (!canDrive(character)) {
                takeDrive(selected, 'proper', 'streets', 'alone');
              } else {
                setStep('drive');
              }
            }}
            className={`${MS.ghostBtn} w-full py-2.5 text-[15px] ${currentItem.sates ? 'mt-2.5' : ''}`}
          >
            Drive
          </button>
        )}
        <button
          onClick={() => {
            discardItem(selected);
            setSelected(null);
            setStep('list');
          }}
          className={`${MS.ghostBtn} w-full py-2.5 text-[15px] ${currentItem.sates || currentItem.vehicle ? 'mt-2.5' : ''}`}
        >
          Throw away
        </button>
        {people.length > 0 && (
          <button
            onClick={() => setStep('gift')}
            className={`${MS.ghostBtn} mt-2.5 w-full py-2.5 text-[15px]`}
          >
            Give
          </button>
        )}
        <button
          onClick={() => {
            setSelected(null);
            setStep('list');
          }}
          className={`${MS.ghostBtn} mt-2.5 w-full py-2.5`}
        >
          Nevermind
        </button>
      </div>
    );
  }

  return (
    <div>
      <HomeBlock
        character={character}
        onMarket={() => setStep('houses')}
        onHouse={onHouse}
      />
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          Funds
        </span>
        <span className="text-[15px] font-semibold tabular-nums text-ink">
          {formatFunds(character.money, symbol)}
        </span>
      </div>
      {belongings.length > 0 && (
        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {belongings.map((id, idx) => (
            <Option
              key={`${id}-${idx}`}
              active={false}
              title={itemById(id)?.text ?? id}
              onClick={() => {
                setSelected(idx);
                setStep('item');
              }}
              className="w-full rounded-lg px-4 py-2.5 text-center [&>div]:text-center"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** M or F for a Male/Female gender, nothing otherwise. */
function sexMark(gender: string): string | null {
  if (gender === 'Male') return 'M';
  if (gender === 'Female') return 'F';
  return null;
}
