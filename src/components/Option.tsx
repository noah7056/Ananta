import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { MS } from './theme';

interface OptionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** selected state — accent border + wash, full-ink text */
  active: boolean;
  title: string;
  /** small second line, e.g. years */
  meta?: ReactNode;
  /** tiny footer row under a hairline, e.g. extra stat info */
  footer?: ReactNode;
  titleClassName?: string;
}

/**
 * The single selectable-row primitive for the whole app: creation
 * screens today, action/relationship menus next. Shape comes from
 * `className`; selected language is always identical.
 */
export function Option({
  active,
  title,
  meta,
  footer,
  titleClassName = 'text-[15px]',
  className = '',
  ...rest
}: OptionProps) {
  return (
    <button
      aria-pressed={active}
      className={`border text-left transition-colors ${
        active ? MS.pickActive : MS.pick
      } ${className}`}
      {...rest}
    >
      <div className={`font-semibold ${titleClassName}`}>{title}</div>
      {meta && (
        <div className="mt-0.5 text-[13px] text-ink-faint">{meta}</div>
      )}
      {footer && (
        <div className="mt-2 border-t border-line pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-faint">
          {footer}
        </div>
      )}
    </button>
  );
}
