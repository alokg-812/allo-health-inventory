import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { confirmReservation, releaseReservation } from '../api/reservations';
import { useReservationStore } from '../store/reservationStore';
import { useCountdown } from '../hooks/useCountdown';
import ErrorBanner from '../components/ErrorBanner';

const HOLD_SECONDS = 600;

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
      <div className="mx-auto max-w-md rounded-xl border border-[var(--line)] bg-[var(--surface)] p-8 text-center">
        <p className="text-sm text-[var(--muted)]">
          This reservation isn't in your session.
        </p>
        <button
          className="mt-3 font-mono text-xs font-medium text-[var(--ink)] underline underline-offset-4"
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

  const urgency =
    countdown.seconds < 60 ? 'critical' : countdown.seconds < 180 ? 'lock' : 'available';
  const urgencyColor = `var(--${urgency})`;
  const progressPct = Math.min(100, Math.max(0, (countdown.seconds / HOLD_SECONDS) * 100));

  return (
    <div className="mx-auto max-w-md">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[var(--lock)]">
        Held reservation
      </span>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Checkout
      </h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Complete payment before the timer runs out, or the unit goes back
        into stock automatically.
      </p>

      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      <div className="ticket-notch overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
        <div className="px-6 py-6">
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-[var(--muted)]">Reservation ID</dt>
            <dd className="text-right font-mono text-xs text-[var(--ink)]">
              {reservation.id}
            </dd>
            <dt className="text-[var(--muted)]">Quantity</dt>
            <dd className="text-right font-mono text-[var(--ink)]">
              {reservation.quantity}
            </dd>
            <dt className="text-[var(--muted)]">Status</dt>
            <dd className="text-right">
              <span
                className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: 'var(--lock-soft)', color: 'var(--lock)' }}
              >
                {reservation.status}
              </span>
            </dd>
          </dl>
        </div>

        <div className="ticket-perf px-6 py-6">
          <div className="flex flex-col items-center">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--muted)]">
              Time remaining
            </span>
            <span
              className="font-mono text-5xl font-semibold tabular-nums"
              style={{ color: urgencyColor }}
            >
              {countdown.label}
            </span>

            <div className="mt-4 w-full">
              <div className="stat-bar-track">
                <div
                  className="stat-bar-fill"
                  style={{ width: `${progressPct}%`, background: urgencyColor }}
                />
              </div>
            </div>

            {countdown.expired && (
              <span className="mt-3 font-mono text-xs font-medium text-[var(--critical)]">
                This reservation has expired.
              </span>
            )}
          </div>

          <div className="mt-6 flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={busy || countdown.expired}
              className="flex-1 rounded-md bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--ink)]/85 disabled:cursor-not-allowed disabled:bg-[var(--line-strong)] disabled:text-[var(--muted)]"
            >
              Confirm purchase
            </button>
            <button
              onClick={handleCancel}
              disabled={busy}
              className="flex-1 rounded-md border border-[var(--line-strong)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
