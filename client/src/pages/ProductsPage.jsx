import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import { createReservation } from '../api/reservations';
import { useReservationStore } from '../store/reservationStore';
import ProductCard from '../components/ProductCard';
import ErrorBanner from '../components/ErrorBanner';

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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Click reserve to hold a unit for 10 minutes.
          </p>
        </div>
        <button
          onClick={load}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          Refresh
        </button>
      </div>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
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
