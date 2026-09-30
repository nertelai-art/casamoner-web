import styles from './Logo.module.css';

/** Marca: «casa» amb serif i «moner» amb pal sec, com el logotip original. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`${styles.logo} ${className ?? ''}`}>
      <span className={styles.casa}>casa</span>
      <span className={styles.moner}>moner</span>
    </span>
  );
}
