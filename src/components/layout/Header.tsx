import Link from 'next/link';
import { Logo } from './Logo';
import { NAV_LINKS } from './nav';
import styles from './Header.module.css';

/** Capçalera sense JavaScript: el menú mòbil és un `<details>`. */
export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand} aria-label="casamoner, inici">
          <Logo />
        </Link>

        <nav aria-label="Principal" className={styles.desktopNav}>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/botigues" className={`button ${styles.cta}`}>
          <PinIcon /> Botigues
        </Link>

        <details className={styles.mobileNav}>
          <summary aria-label="Obre el menú">
            <span />
            <span />
          </summary>
          <nav aria-label="Menú mòbil">
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
              <li>
                <Link href="/botigues">Botigues</Link>
              </li>
            </ul>
          </nav>
        </details>
      </div>
    </header>
  );
}

function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
