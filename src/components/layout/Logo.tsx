import styles from './Logo.module.css';

/** Marca: «casa» en negreta i «moner» fi, tots dos de pal sec, com el logotip original. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`${styles.logo} ${className ?? ''}`}>
      <span className={styles.casa}>casa</span>
      <span className={styles.moner}>moner</span>
    </span>
  );
}
