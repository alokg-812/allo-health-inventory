export default function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="mb-6 flex items-start justify-between gap-3 rounded-lg border border-[var(--critical)]/20 bg-[var(--critical-soft)] px-4 py-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[var(--critical)] font-mono text-[10px] font-bold text-white">
          !
        </span>
        <span className="text-sm text-[var(--critical)]">{error}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="flex-shrink-0 rounded-md px-1.5 text-lg leading-none text-[var(--critical)]/60 transition hover:text-[var(--critical)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--critical)]/40"
        >
          &times;
        </button>
      )}
    </div>
  );
}
