import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { StoreFinder } from '@/components/stores/StoreFinder';
import { storeRepository } from '@/data/stores';
import { breadcrumbJsonLd } from '@/lib/seo/json-ld';
import { siteInfo } from '@/lib/seo/site-info';
import styles from './botigues.module.css';

export const metadata: Metadata = {
  title: 'Botigues',
  description:
    'Les 21 fleques casamoner a Girona, Banyoles, Torroella, La Bisbal, Palafrugell, Palamós, Platja d’Aro, S’Agaró, Sant Feliu de Guíxols i Blanes. Mapa, horaris i telèfons.',
  alternates: { canonical: '/botigues' },
  openGraph: { url: '/botigues' },
};

export default function StoresPage() {
  const stores = storeRepository.all();
  const groups = storeRepository.byLocality();

  return (
    <div className="container">
      <header className={styles.header}>
        <p className="eyebrow">{stores.length} fleques a Girona i la Costa Brava</p>
        <h1 className="section-title">Botigues</h1>
        <p className="lead">
          Busca la més propera, mira si és oberta ara i clica al mapa per veure&apos;n l&apos;horari i com arribar-hi.
        </p>
      </header>

      <StoreFinder stores={stores} localities={[...groups.keys()]} />

      {/* Índex per població: navegable sense JavaScript i útil per als cercadors (B-11). */}
      <section aria-labelledby="per-poblacio" className={styles.index}>
        <h2 id="per-poblacio">Per població</h2>
        <div className={styles.columns}>
          {[...groups].map(([locality, list]) => (
            <div key={locality}>
              <h3>{locality}</h3>
              <ul>
                {list.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/botigues/${s.slug}`}>{s.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <JsonLd
        data={breadcrumbJsonLd(siteInfo, [
          { name: 'Inici', path: '/' },
          { name: 'Botigues', path: '/botigues' },
        ])}
      />
    </div>
  );
}
