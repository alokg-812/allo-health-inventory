export default function ErrorBanner({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="mb-4 flex items-start justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{error}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-3 text-red-600 hover:text-red-800">
          ×
        </button>
      )}
    </div>
  );
}
