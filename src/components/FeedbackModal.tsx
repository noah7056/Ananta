import { Modal } from './Modal';

/**
 * Transient result popup (checkup findings, cures, and similar to
 * come). No buttons inside — clicking off closes it.
 */
export function FeedbackModal({
  title,
  eyebrow,
  text,
  onClose,
}: {
  title?: string;
  eyebrow?: string;
  text: string;
  onClose: () => void;
}) {
  return (
    <Modal title={title} eyebrow={eyebrow} onClose={onClose}>
      <p className="text-[15px] leading-relaxed text-ink-dim">{text}</p>
    </Modal>
  );
}
