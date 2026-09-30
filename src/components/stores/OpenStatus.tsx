'use client';

import type { StoreStatus } from '@/domain/opening-hours';
import { describeStatus } from '@/domain/opening-hours';
import type { OpeningHours } from '@/domain/store';
import { useNow } from '@/lib/hooks/useNow';
import styles from './OpenStatus.module.css';

export function StatusBadge({ status }: { status: StoreStatus | null }) {
  if (!status) return <span className={styles.badge} data-state="unknown" aria-hidden="true" />;
  return (
    <span className={styles.badge} data-state={status.open ? 'open' : 'closed'}>
      <span className={styles.dot} aria-hidden="true" />
      {status.label}
    </span>
  );
}

export function OpenStatus({ hours }: { hours: OpeningHours }) {
  const now = useNow();
  return <StatusBadge status={now ? describeStatus(hours, now) : null} />;
}
