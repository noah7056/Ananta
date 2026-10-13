import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ERAS, matchesPlace, moneySymbolOf, placesOf } from '../data/eras';
import { GENDERS, identityGender, randomName } from '../data/names';
import type { Era, EraId, StatKey } from '../types';
import { useGame, rollStartingMoney, rollStartingStats } from '../store/gameStore';
import { formatFunds } from '../engine/life';
import { MS } from './theme';
import { Option } from './Option';

const VITAL_KEYS: StatKey[] = ['health', 'happiness', 'smarts', 'looks', 'energy', 'reputation'];
const VITAL_MIN = 5;
const VITAL_MAX = 95;
const FUNDS_MIN = 0;
const FUNDS_MAX = 10000;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(v)));

function approximateEra(year: number) {
  let best = ERAS[0];
  let minDiff = Math.abs(year - ERAS[0].startYear);
  for (const e of ERAS) {
    const diff = Math.abs(year - e.startYear);
    if (diff < minDiff) {
      minDiff = diff;
      best = e;
    }
  }
  return best;
}

interface SliderRowProps {
  label: string;
  value: number;
  display: ReactNode;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

/**
 * Every place that existed in this period: pick a country, then a
 * city within it, narrowed by the search box. Search ignores accents
 * and case, and matches city or country.
 */
function BirthplacePicker({
  era,
  placeId,
  onSelect,
}: {
  era: Era;
  placeId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const places = placesOf(era.id);
  const countries = useMemo(() => {
    const out: string[] = [];
    for (const p of places) {
      if (!out.includes(p.country)) out.push(p.country);
    }
    return out;
  }, [era.id]);
  const current = places.find((p) => p.id === placeId) ?? places[0];
  const [country, setCountry] = useState(current?.country ?? countries[0] ?? '');
  // era switches and random picks land somewhere else: follow them
  useEffect(() => {
    const found = places.find((p) => p.id === placeId);
    if (found && found.country !== country) setCountry(found.country);
  }, [placeId, era.id]);
  const pickCountry = (next: string) => {
    setCountry(next);
    setQuery('');
    const first = places.find((p) => p.country === next);
    if (first) onSelect(first.id);
  };
  const matches = useMemo(
    () =>
      places
        .filter((p) => p.country === country)
        .filter((p) => matchesPlace(p, query)),
    [era.id, country, query],
  );

  return (
    <div className="mb-10">
      <select
        aria-label="Country"
        value={country}
        onChange={(e) => pickCountry(e.target.value)}
        className={`${MS.input} w-full`}
      >
        {countries.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        aria-label="Search birthplace"
        className={`${MS.input} mt-2 w-full`}
      />
      <select
        aria-label="City"
        value={matches.some((p) => p.id === placeId) ? placeId : ''}
        onChange={(e) => onSelect(e.target.value)}
        className={`${MS.input} mt-2 w-full`}
      >
        {matches.length === 0 ? (
          <option value="">No match</option>
        ) : (
          matches.map((p) => (
            <option key={p.id} value={p.id}>
              {p.city ?? p.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

/** Label + value + full-width slider. */
function SliderRow({ label, value, display, min, max, step, onChange }: SliderRowProps) {
  return (
    <div className="py-1.5">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          {label}
        </span>
        <span className="text-[15px] font-semibold tabular-nums text-ink">
          {display}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

/**
 * Character creation: birth year (approximating era) → birthplace → identity → stats.
 * The generated name fits the era and birthplace and refreshes when
 * either changes (until the player edits it by hand).
 */
export function StartScreen() {
  const newLife = useGame((s) => s.newLife);

  const [birthYear, setBirthYear] = useState<number>(100);
  const [eraId, setEraId] = useState<EraId>('ancient-world');
  const [placeId, setPlaceId] = useState('roman-rome');
  const [gender, setGender] = useState<string>('Female');
  const [name, setName] = useState(() =>
    randomName('ancient-world', 'roman-rome', Math.random, 'female'),
  );
  const [nameDirty, setNameDirty] = useState(false);
  const [stats, setStats] = useState(rollStartingStats);
  const [money, setMoney] = useState(() => rollStartingMoney(ERAS[0].moneyScale));
  const [showStats, setShowStats] = useState(false);
  const [editingFunds, setEditingFunds] = useState(false);
  const [fundsDraft, setFundsDraft] = useState('');

  const era = useMemo(() => ERAS.find((e) => e.id === eraId)!, [eraId]);
  const moneyStep = 5 * era.moneyScale;

  const onYearChange = (year: number) => {
    const clampedYear = clamp(year, -800, 2026);
    setBirthYear(clampedYear);
    const approx = approximateEra(clampedYear);
    if (approx.id !== eraId) {
      setEraId(approx.id);
      const nextPlace = approx.places[0]?.id ?? '';
      setPlaceId(nextPlace);
      if (!nameDirty) {
        setName(randomName(approx.id, nextPlace, Math.random, identityGender(gender)));
      }
      setMoney(rollStartingMoney(approx.moneyScale));
    }
  };

  const selectPlace = (id: string) => {
    setPlaceId(id);
    if (!nameDirty) {
      setName(randomName(eraId, id, Math.random, identityGender(gender)));
    }
  };

  const randomizeAll = () => {
    const era = ERAS[Math.floor(Math.random() * ERAS.length)];
    setBirthYear(era.startYear);
    setEraId(era.id);
    const p = era.places[Math.floor(Math.random() * era.places.length)]?.id ?? '';
    setPlaceId(p);
    const ng = GENDERS[Math.floor(Math.random() * GENDERS.length)];
    setGender(ng);
    setName(randomName(era.id, p, Math.random, identityGender(ng)));
    setNameDirty(false);
    setStats(rollStartingStats());
    setMoney(rollStartingMoney(era.moneyScale));
    setEditingFunds(false);
  };

  const begin = () => {
    // Guarded: a valid place even if era data changes.
    const place = era.places.find((p) => p.id === placeId) ?? era.places[0];
    newLife({
      name,
      gender,
      eraId,
      birthYear,
      placeId: place?.id ?? '',
      stats,
      money,
    });
  };

  const commitFundsDraft = () => {
    const parsed = Number(fundsDraft);
    if (Number.isFinite(parsed)) setMoney(clamp(parsed, FUNDS_MIN, FUNDS_MAX));
    setEditingFunds(false);
  };

  const first = name.trim().split(' ')[0] || '…';

  return (
    <div className="min-h-full bg-paper">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Ananta
          </h1>
        </div>

        <h2 className={`${MS.label} mb-3`}>Birth Year</h2>
        <div className={`${MS.panel} mb-10 p-5 sm:p-6`}>
          <div className="flex items-center gap-4">
            <input
              type="range"
              aria-label="Birth year slider"
              min={-800}
              max={2026}
              step={1}
              value={birthYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              aria-label="Specific birth year"
              min={-800}
              max={2026}
              value={birthYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className={`${MS.input} w-28 text-center text-base font-semibold tabular-nums`}
            />
          </div>
          <div className="mt-2 text-[13px] text-ink-dim">Era: {era.name}</div>
        </div>

        <h2 className={`${MS.label} mb-3`}>Birthplace</h2>
        <BirthplacePicker
          era={era}
          placeId={placeId}
          onSelect={selectPlace}
        />

        <h2 className={`${MS.label} mb-3`}>Identity</h2>
        <div className={`${MS.panel} mb-10 p-5 sm:p-6`}>
          <div className="mb-4 flex flex-col gap-2.5 sm:flex-row">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameDirty(true);
              }}
              placeholder="Your name"
              maxLength={40}
              aria-label="Your name"
              className={`${MS.input} flex-1 text-lg`}
            />
            <button
              onClick={() => {
                setName(
                  randomName(eraId, placeId, Math.random, identityGender(gender)),
                );
                setNameDirty(false);
              }}
              className={MS.ghostBtn}
            >
              Random
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <Option
                key={g}
                active={gender === g}
                onClick={() => {
                  setGender(g);
                  if (!nameDirty) {
                    setName(
                      randomName(eraId, placeId, Math.random, identityGender(g)),
                    );
                  }
                }}
                title={g}
                titleClassName="text-sm"
                className="rounded-lg px-4 py-2"
              />
            ))}
          </div>
        </div>

        <div className="mb-3 flex items-baseline justify-between">
          <h2 className={MS.label}>Stats</h2>
          <button
            onClick={() => setShowStats((v) => !v)}
            aria-expanded={showStats}
            className="text-sm text-ink-faint transition-colors hover:text-ink-dim"
          >
            {showStats ? 'Hide' : 'Show'}
          </button>
        </div>
        {showStats && (
          <div className={`${MS.panel} mb-12 px-5 py-3 sm:px-6`}>
            {VITAL_KEYS.map((key) => (
              <SliderRow
                key={key}
                label={cap(key)}
                value={stats[key]}
                display={String(stats[key])}
                min={VITAL_MIN}
                max={VITAL_MAX}
                step={1}
                onChange={(v) =>
                  setStats((s) => ({ ...s, [key]: clamp(v, VITAL_MIN, VITAL_MAX) }))
                }
              />
            ))}
            <SliderRow
              label="Funds"
              value={money}
              display={
                editingFunds ? (
                  <FundsInput
                    draft={fundsDraft}
                    onDraft={setFundsDraft}
                    onCommit={commitFundsDraft}
                    onCancel={() => setEditingFunds(false)}
                  />
                ) : (
                  <span
                    onDoubleClick={() => {
                      setFundsDraft(String(money));
                      setEditingFunds(true);
                    }}
                  >
                    {formatFunds(money, moneySymbolOf({ eraId, placeId }))}
                  </span>
                )
              }
              min={FUNDS_MIN}
              max={FUNDS_MAX}
              step={moneyStep}
              onChange={(v) => setMoney(clamp(v, FUNDS_MIN, FUNDS_MAX))}
            />
          </div>
        )}
        {!showStats && <div className="mb-12" />}

        <div className="text-center">
          <button
            onClick={begin}
            className={`${MS.primaryBtn} w-full px-10 py-3.5 text-base sm:w-auto`}
          >
            Begin as {first}
          </button>
          <div>
            <button
              onClick={randomizeAll}
              className="mt-4 text-sm text-ink-faint transition-colors hover:text-ink-dim"
            >
              Randomize everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Plain numeric input shown while typing a funds amount. */
function FundsInput({
  draft,
  onDraft,
  onCommit,
  onCancel,
}: {
  draft: string;
  onDraft: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <input
      autoFocus
      type="number"
      aria-label="Funds amount"
      value={draft}
      onChange={(e) => onDraft(e.target.value)}
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onCommit();
        if (e.key === 'Escape') onCancel();
      }}
      className="w-24 rounded-md border border-accent bg-white px-2 py-0.5 text-right text-[15px] font-semibold tabular-nums text-ink outline-none"
    />
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
