import { Link, Route, Routes } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--console)] text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 font-mono text-xs font-semibold text-[#34d399]">
              A
            </span>
            <span className="font-display text-[15px] font-semibold tracking-tight">
              Allo Inventory
            </span>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/70">
              Live sync &middot; multi-warehouse
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/checkout/:reservationId" element={<CheckoutPage />} />
        </Routes>
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4">
        <p className="font-mono text-[11px] text-[var(--muted)]">
          Reservation holds are released automatically after expiry &middot; stock counts update in real time
        </p>
      </footer>
    </div>
  );
}
