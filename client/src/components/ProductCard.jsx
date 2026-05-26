export default function ProductCard({ product, onReserve, reservingId }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
      <p className="mt-1 text-xs text-slate-500">{product.id}</p>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="pb-2">Warehouse</th>
            <th className="pb-2">Total</th>
            <th className="pb-2">Reserved</th>
            <th className="pb-2">Available</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {product.inventory.map((inv) => {
            const disabled = inv.available <= 0 || reservingId === inv.id;
            return (
              <tr key={inv.id} className="border-t border-slate-100">
                <td className="py-2 text-slate-700">{inv.warehouse.name}</td>
                <td className="py-2 text-slate-700">{inv.totalUnits}</td>
                <td className="py-2 text-slate-700">{inv.reservedUnits}</td>
                <td className="py-2 font-medium text-slate-900">{inv.available}</td>
                <td className="py-2 text-right">
                  <button
                    disabled={disabled}
                    onClick={() => onReserve(inv)}
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {reservingId === inv.id ? 'Reserving…' : 'Reserve 1'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
