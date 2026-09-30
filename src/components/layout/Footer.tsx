import Link from 'next/link';
import { site } from '@/data/site';
import { storeRepository } from '@/data/stores';
import { Logo } from './Logo';
import styles from './Footer.module.css';

export function Footer() {
  const stores = storeRepository.all();
  return (
    <footer className={styles.footer} id="contacte">
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <Logo className={styles.logo} />
          <p>
            Fleca i pastisseria de Girona. Farines ecològiques, massa mare i ofici, cada dia des de l&apos;obrador a
            les {stores.length} botigues.
          </p>
        </div>

        <div>
          <h2 className={styles.heading}>Contacte</h2>
          <ul>
            <li>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
            <li>
              <a href={`mailto:${site.cateringEmail}`}>{site.cateringEmail}</a>
            </li>
          </ul>
          <h2 className={styles.heading}>Vols treballar amb nosaltres?</h2>
          <p>
            Envia el teu currículum a <a href={`mailto:${site.jobsEmail}`}>{site.jobsEmail}</a>
          </p>
        </div>

        <div>
          <h2 className={styles.heading}>Botigues</h2>
          <ul className={styles.stores}>
            {stores.map((s) => (
              <li key={s.slug}>
                <Link href={`/botigues/${s.slug}`}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={styles.heading}>Segueix-nos</h2>
          <ul>
            <li>
              <a href={site.social.instagram} rel="noopener">
                Instagram
              </a>
            </li>
            <li>
              <a href={site.social.facebook} rel="noopener">
                Facebook
              </a>
            </li>
            <li>
              <a href={site.social.x} rel="noopener">
                X
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <p>© casamoner</p>
      </div>
    </footer>
  );
}
