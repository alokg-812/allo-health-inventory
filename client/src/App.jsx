import { Link, Route, Routes } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import CheckoutPage from './pages/CheckoutPage';

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Allo Inventory
          </Link>
          <span className="text-xs text-slate-500">Multi-warehouse reservations</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/checkout/:reservationId" element={<CheckoutPage />} />
        </Routes>
      </main>
    </div>
  );
}
