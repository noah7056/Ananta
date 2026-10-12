import { useEffect, useRef } from 'react';
import type { LogEntry } from '../types';
import { MS } from './theme';

/**
 * Chronological feed grouped by age: one Age header per year of
 * life, each happening on its own line beneath it. The header carries
 * the calendar year alongside the age.
 */
export function Journal({ log }: { log: LogEntry[] }) {
  const boxRef = useRef<HTMLDivElement>(null);

  // Oldest at top, newest appended at the bottom — stay pinned there.
  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log.length]);

  const groups: { age: number; entries: LogEntry[] }[] = [];
  for (const e of log) {
    const last = groups[groups.length - 1];
    if (last && last.age === e.age) {
      last.entries.push(e);
    } else {
      groups.push({ age: e.age, entries: [e] });
    }
  }

  return (
    <div className={`${MS.panel} flex h-full min-h-0 w-full flex-col overflow-hidden`}>
      <div className="border-b border-line px-5 py-4">
        <h3 className="text-[15px] font-semibold text-ink">Journal</h3>
      </div>
      <div
        ref={boxRef}
        className="nice-scroll min-h-0 flex-1 overflow-y-auto px-5"
      >
        <div className="divide-y divide-line">
          {groups.map((g) => (
            <div key={g.age} className="py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Age {g.age} · {g.entries[0].year}
              </div>
              {g.entries.map((e, j) => (
                <div
                  key={j}
                  className="mt-1 text-sm leading-relaxed text-ink-dim"
                >
                  {e.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
