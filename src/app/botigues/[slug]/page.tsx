import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { MapView } from '@/components/map/MapView';
import { OpenStatus } from '@/components/stores/OpenStatus';
import { storeRepository } from '@/data/stores';
import { nearest } from '@/domain/geo';
import { groupHours } from '@/domain/opening-hours';
import { bakeryJsonLd, breadcrumbJsonLd, toE164 } from '@/lib/seo/json-ld';
import { siteInfo } from '@/lib/seo/site-info';
import styles from './botiga.module.css';

type Params = Promise<{ slug: string }>;

// Totes les fitxes es generen en compilar; un slug desconegut és 404 (B-9).
export const dynamicParams = false;

export function generateStaticParams() {
  return storeRepository.all().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const store = storeRepository.bySlug((await params).slug);
  if (!store) return {};
  const path = `/botigues/${store.slug}`;
  const hours = groupHours(store.hours)
    .map((r) => `${r.days} ${r.hours}`)
    .join(', ');
  return {
    title:
      store.name === store.address.locality
        ? `Fleca a ${store.address.locality}`
        : `${store.name} · Fleca a ${store.address.locality}`,
    description: `casamoner ${store.name}: ${store.address.street}, ${store.address.locality}. ${hours}. Pa de massa mare i farines ecològiques.`,
    alternates: { canonical: path },
    openGraph: { url: path, images: [{ url: store.image, alt: `Botiga casamoner ${store.name}` }] },
  };
}

export default async function StorePage({ params }: { params: Params }) {
  const store = storeRepository.bySlug((await params).slug);
  if (!store) notFound();

  const address = `${store.address.street}, ${store.address.postalCode} ${store.address.locality}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${store.coords.lat},${store.coords.lng}`;
  const nearby = nearest(storeRepository.all(), store, 3);

  return (
    <article>
      <div className={styles.hero}>
        <Image src={store.image} alt={`Botiga casamoner ${store.name}`} fill priority sizes="100vw" className={styles.heroImage} />
        <div className={`container ${styles.heroBody}`}>
          <nav aria-label="Fil d'Ariadna" className={styles.breadcrumb}>
            <Link href="/">Inici</Link> / <Link href="/botigues">Botigues</Link> / <span aria-current="page">{store.name}</span>
          </nav>
          <h1 className={styles.title}>
            <span className={styles.brand}>casamoner</span> {store.name}
          </h1>
          {store.subtitle && <p className={styles.subtitle}>{store.subtitle}</p>}
          {store.ametllerOrigen && <p className={styles.tag}>Dins d&apos;Ametller Origen</p>}
        </div>
      </div>

      <div className={`container ${styles.grid}`}>
        <section aria-labelledby="info" className={styles.info}>
          <h2 id="info" className="visually-hidden">
            Informació de la botiga
          </h2>
          <OpenStatus hours={store.hours} />

          <dl className={styles.facts}>
            <div>
              <dt>Adreça</dt>
              <dd>
                <address>{address}</address>
              </dd>
            </div>
            {store.phone && (
              <div>
                <dt>Telèfon</dt>
                <dd>
                  <a href={`tel:${toE164(store.phone)}`}>{store.phone}</a>
                </dd>
              </div>
            )}
          </dl>

          <h3 className={styles.hoursTitle}>Horari</h3>
          <table className={styles.hours}>
            <tbody>
              {groupHours(store.hours).map((row) => (
                <tr key={row.days}>
                  <th scope="row">{row.days}</th>
                  <td>{row.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.note}>Els festius, horari de diumenge.</p>

          <div className={styles.actions}>
            <a className="button" href={directions} target="_blank" rel="noopener">
              Com arribar-hi
            </a>
            {store.phone && (
              <a className="button button--ghost" href={`tel:${toE164(store.phone)}`}>
                Truca
              </a>
            )}
          </div>
        </section>

        <MapView
          className={styles.map}
          label={`Mapa de casamoner ${store.name}`}
          markers={[
            {
              id: store.slug,
              lat: store.coords.lat,
              lng: store.coords.lng,
              title: `casamoner ${store.name}`,
              subtitle: address,
              href: directions,
            },
          ]}
          center={store.coords}
          zoom={16}
        />
      </div>

      <section aria-labelledby="properes" className={`container ${styles.nearby}`}>
        <h2 id="properes">Botigues properes</h2>
        <ul>
          {nearby.map(({ item, km }) => (
            <li key={item.slug}>
              <Link href={`/botigues/${item.slug}`} className={styles.nearbyCard}>
                <Image src={item.image} alt="" width={400} height={260} sizes="(max-width: 700px) 100vw, 33vw" />
                <span className={styles.nearbyName}>{item.name}</span>
                <span className={styles.nearbyMeta}>
                  {item.address.locality} · a {km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd data={bakeryJsonLd(store, siteInfo)} />
      <JsonLd
        data={breadcrumbJsonLd(siteInfo, [
          { name: 'Inici', path: '/' },
          { name: 'Botigues', path: '/botigues' },
          { name: store.name, path: `/botigues/${store.slug}` },
        ])}
      />
    </article>
  );
}
