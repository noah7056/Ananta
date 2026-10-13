import { useEffect, type ReactNode } from 'react';

/**
 * Generic popup shell for the whole app: yearly events, notices,
 * actions, item picks, transient feedback. Centered panel over a
 * dimmed backdrop. Dismissal is explicit (buttons) unless canClose
 * allows clicking off / Escape. There is no × anywhere — cancel
 * actions use a Nevermind button, or no button at all.
 */
export function Modal({
  title,
  eyebrow,
  canClose = true,
  onClose,
  children,
}: {
  title?: string;
  eyebrow?: string;
  canClose?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!canClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canClose, onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Popup'}
    >
      {canClose ? (
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-ink/40"
        />
      ) : (
        <div className="absolute inset-0 bg-ink/40" />
      )}
      <div className="nice-scroll animate-rise relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-line bg-white p-6 shadow-xl">
        {(title || eyebrow) && (
          <div className="mb-1">
            {eyebrow && (
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight text-ink">
                {title}
              </h2>
            )}
          </div>
        )}
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
