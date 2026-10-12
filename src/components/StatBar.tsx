import type { Stats } from '../types';
import { getEra } from '../data/eras';
import type { EraId } from '../types';
import { formatFunds } from '../engine/life';

/** Quiet stat rows: charcoal bars on a light track, one ink throughout. */
const STAT_LABELS: { key: keyof Stats }[] = [
  { key: 'health' },
  { key: 'happiness' },
  { key: 'smarts' },
  { key: 'looks' },
  { key: 'energy' },
  { key: 'reputation' },
];

export function StatBar({ label, value }: { label: string; value: number }) {
  const shown = Math.round(value);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          {label}
        </span>
        <span className="text-[15px] font-semibold text-ink tabular-nums">
          {shown}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-ink transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export function StatsPanel({
  stats,
  money,
  eraId,
}: {
  stats: Stats;
  money: number;
  eraId: EraId;
}) {
  const era = getEra(eraId);
  return (
    <div>
      <div className="space-y-4">
        {STAT_LABELS.map(({ key }) => (
          <StatBar
            key={key}
            label={cap(key)}
            value={stats[key]}
          />
        ))}
      </div>
      <div className="mt-4 flex items-baseline justify-between border-t border-line pt-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          Funds
        </span>
        <span className="text-[15px] font-semibold text-ink tabular-nums">
          {formatFunds(money, era.moneySymbol)}
        </span>
      </div>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Compact cell for the bottom vitals strip: label, value, mini bar. */
export function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums text-ink">
          {value}
        </span>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-ink transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

/** Compact funds cell for the bottom vitals strip (no bar). */
export function FundsCell({
  money,
  symbol,
}: {
  money: number;
  symbol: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-dim">
          Funds
        </span>
        <span className="truncate text-sm font-semibold tabular-nums text-ink">
          {formatFunds(money, symbol)}
        </span>
      </div>
      <div className="mt-1 h-1" />
    </div>
  );
}
