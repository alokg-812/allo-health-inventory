import { useEffect, useState } from 'react';
export function useCountdown(target) {
  const targetMs = target ? new Date(target).getTime() : 0;
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((targetMs - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (!targetMs) return;
    setRemaining(Math.max(0, Math.floor((targetMs - Date.now()) / 1000)));
    const id = setInterval(() => {
      const next = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
      setRemaining(next);
      if (next <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { seconds: remaining, label: `${mm}:${ss}`, expired: remaining <= 0 };
}
