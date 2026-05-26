import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { confirmReservation, releaseReservation } from '../api/reservations';
import { useReservationStore } from '../store/reservationStore';
import { useCountdown } from '../hooks/useCountdown';
import ErrorBanner from '../components/ErrorBanner';

export default function CheckoutPage() {
  const { reservationId } = useParams();
  const navigate = useNavigate();

  const reservation = useReservationStore((s) => s.reservation);
  const clear = useReservationStore((s) => s.clear);

  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const countdown = useCountdown(reservation?.expiresAt);
  if (!reservation || reservation.id !== reservationId) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Reservation not found in this session.{' '}
        <button
          className="text-slate-900 underline"
          onClick={() => navigate('/')}
        >
          Back to products
        </button>
      </div>
    );
  }

  const handleConfirm = async () => {
    setError(null);
    setBusy(true);
    try {
      await confirmReservation(reservation.id);
      clear();
      navigate('/');
    } catch (e) {
      if (e.response?.status === 410) setError('Reservation expired.');
      else setError(e.response?.data?.error || 'Confirm failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setError(null);
    setBusy(true);
    try {
      await releaseReservation(reservation.id);
    } catch {
      // to be ignored
    }
    clear();
    setBusy(false);
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your reservation is held for 10 minutes. Complete payment before the
        timer runs out.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <ErrorBanner error={error} onDismiss={() => setError(null)} />

        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-slate-500">Reservation ID</dt>
          <dd className="text-right font-mono text-xs text-slate-700">
            {reservation.id}
          </dd>
          <dt className="text-slate-500">Quantity</dt>
          <dd className="text-right text-slate-900">{reservation.quantity}</dd>
          <dt className="text-slate-500">Status</dt>
          <dd className="text-right text-slate-900">{reservation.status}</dd>
        </dl>

        <div className="mt-6 flex flex-col items-center">
          <span className="text-xs uppercase tracking-wide text-slate-500">
            Time remaining
          </span>
          <span
            className={`mt-1 font-mono text-4xl ${
              countdown.seconds < 60 ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {countdown.label}
          </span>
          {countdown.expired && (
            <span className="mt-2 text-xs text-red-600">
              This reservation has expired.
            </span>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={busy || countdown.expired}
            className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Confirm purchase
          </button>
          <button
            onClick={handleCancel}
            disabled={busy}
            className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
