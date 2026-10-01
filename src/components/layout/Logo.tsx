import { Fragment, type ReactNode } from 'react';
import styles from './Logo.module.css';

/** Marca: «casa» amb serif i «moner» amb pal sec, com el logotip original. */
export function Logo({ className, inline = false }: { className?: string; inline?: boolean }) {
  return (
    <span className={`${styles.logo} ${inline ? styles.inline : ''} ${className ?? ''}`}>
      <span className={styles.casa}>casa</span>
      <span className={styles.moner}>moner</span>
    </span>
  );
}

/** Un text on cada «casamoner» s'escriu amb el logotip, a la mida del text que l'envolta. */
export function Branded({ children }: { children: string }): ReactNode {
  const parts = children.split('casamoner');
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <Logo inline />}
      {part}
    </Fragment>
  ));
}
