import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import { createReservation } from '../api/reservations';
import { useReservationStore } from '../store/reservationStore';
import ProductCard from '../components/ProductCard';
import ErrorBanner from '../components/ErrorBanner';

const steps = [
  { label: 'Reserve', detail: 'Hold a unit at the warehouse with stock.' },
  { label: 'Hold for 10 min', detail: 'Locked with row-level DB locking — no overselling.' },
  { label: 'Confirm', detail: 'Complete checkout before the hold expires.' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservingId, setReservingId] = useState(null);

  const setReservation = useReservationStore((s) => s.setReservation);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (e) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleReserve = async (inv) => {
    setError(null);
    setReservingId(inv.id);
    try {
      const reservation = await createReservation({ inventoryId: inv.id, quantity: 1 });
      setReservation(reservation);
      navigate(`/checkout/${reservation.id}`);
    } catch (e) {
      if (e.response?.status === 409) {
        setError('Sorry, item just went out of stock.');
      } else {
        setError(e.response?.data?.error || 'Reservation failed.');
      }
      load();
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div>
      <div className="mb-10">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--lock)]">
          Multi-warehouse stock
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Reserve inventory without overselling
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Every reservation locks the row at the database level, so two people
          checking out the last unit at once still get a correct result — no
          negative stock, no double-sold orders.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-start gap-3">
              <span className="font-mono text-xs font-semibold text-[var(--line-strong)]">
                0{i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">{step.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 flex items-end justify-between">
        <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
          Available products
        </h2>
        <button
          onClick={load}
          className="font-mono text-[11px] font-medium uppercase tracking-wide text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          Refresh
        </button>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-[var(--line)] bg-[var(--surface)]"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-10 text-center">
          <p className="text-sm font-medium text-[var(--ink)]">No products yet</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Products will show up here as soon as they're added to inventory.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onReserve={handleReserve}
              reservingId={reservingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
