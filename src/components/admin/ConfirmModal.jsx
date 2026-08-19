import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title = "Löschen bestätigen",
  message,
  confirmLabel = "Löschen",
  cancelLabel = "Abbrechen",
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-obsidian/80 px-6 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md border border-white/10 bg-secondary p-6 shadow-2xl md:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-6 h-px w-10 bg-gold" />
        <h2 id="confirm-modal-title" className="font-display text-2xl text-ivory">
          {title}
        </h2>
        {message && <p className="mt-3 text-sm leading-relaxed text-lunar">{message}</p>}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="h-11 border border-white/10 px-5 text-xs tracking-[0.2em] uppercase text-lunar transition-colors hover:border-white/30 hover:text-ivory disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="h-11 bg-gold px-5 text-xs tracking-[0.2em] uppercase text-obsidian transition-colors hover:bg-gold-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Wird gelöscht …" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
