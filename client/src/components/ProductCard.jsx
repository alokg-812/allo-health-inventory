export default function ProductCard({ product, onReserve, reservingId }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-[var(--ink)]">
          {product.name}
        </h3>
        <span className="font-mono text-[11px] text-[var(--muted)]">
          {product.id}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-[var(--line)]">
        {product.inventory.map((inv) => {
          const disabled = inv.available <= 0 || reservingId === inv.id;
          const reservedPct = inv.totalUnits
            ? Math.min(100, (inv.reservedUnits / inv.totalUnits) * 100)
            : 0;
          const availablePct = inv.totalUnits
            ? Math.min(100, (inv.available / inv.totalUnits) * 100)
            : 0;
          const outOfStock = inv.available <= 0;

          return (
            <div key={inv.id} className="grid gap-2.5 py-3.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--ink)]">
                  {inv.warehouse.name}
                </span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    outOfStock ? 'text-[var(--critical)]' : 'text-[var(--available)]'
                  }`}
                >
                  {outOfStock ? 'OUT OF STOCK' : `${inv.available} available`}
                </span>
              </div>

              <div className="stat-bar-track">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${reservedPct}%`, background: 'var(--lock)' }}
                />
                <div
                  className="stat-bar-fill"
                  style={{
                    width: `${availablePct}%`,
                    left: `${reservedPct}%`,
                    background: 'var(--available)',
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[11px] text-[var(--muted)]">
                  {inv.totalUnits} total &middot;{' '}
                  <span className="text-[var(--lock)]">{inv.reservedUnits} held</span>
                </div>

                <button
                  disabled={disabled}
                  onClick={() => onReserve(inv)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--ink)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--ink)]/85 disabled:cursor-not-allowed disabled:bg-[var(--line-strong)] disabled:text-[var(--muted)]"
                >
                  {reservingId === inv.id ? (
                    <>
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      Reserving
                    </>
                  ) : (
                    'Reserve 1'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
