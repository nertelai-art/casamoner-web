'use client';

import { useEffect, useState } from 'react';

/**
 * L'hora actual, només al client i després de muntar (null abans) per no
 * trencar la hidratació. És l'únic lloc on l'app llegeix el rellotge.
 */
export function useNow(refreshMs = 60_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronitzem amb el rellotge, un sistema extern
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);
  return now;
}
