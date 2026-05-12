import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(panel: HTMLElement): HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(
    (el) =>
      el.offsetParent !== null ||
      el.getClientRects().length > 0 ||
      el === document.activeElement
  );
}

export function ModalShell({
  open,
  onClose,
  titleId,
  title,
  children,
  className = ''
}: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const nodes = getFocusable(panel);
      if (nodes.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      if (!active || !panel.contains(active)) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable =
      panelRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:p-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`max-h-[min(90dvh,90vh)] overflow-y-auto w-full max-w-lg rounded-3xl border-4 border-white/90 bg-dark-card shadow-[0_12px_0_0_rgba(0,0,0,0.35)] ${className}`}
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b-4 border-white/15 bg-dark-card/95 px-5 py-4 backdrop-blur-sm">
              <h2
                id={titleId}
                className="font-display font-black text-2xl text-white tracking-tight">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border-2 border-white/40 bg-dark-darker px-3 py-1.5 text-sm font-display font-bold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
