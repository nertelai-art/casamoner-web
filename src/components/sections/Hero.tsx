import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { Logo } from '@/components/layout/Logo';
import styles from './Hero.module.css';

const HEADLINE = ['Avui', 'et', 'mereixes', 'un'];

export function Hero({ storeCount }: { storeCount: number }) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Image
        src="/images/general/hero-aparador-pans.jpg"
        alt="Aparador d'una fleca casamoner ple de pans i bolleria"
        fill
        priority
        sizes="100vw"
        className={styles.image}
      />
      <div className={styles.scrim} />
      <div className={`container ${styles.content}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>Fleca i pastisseria ecològica · Girona</p>
        <h1 id="hero-title" className={styles.title}>
          {HEADLINE.map((word, i) => (
            <Fragment key={i}>
              <span className={styles.word} style={{ animationDelay: `${120 + i * 90}ms` }}>
                {word}
              </span>{' '}
            </Fragment>
          ))}
          <span className={styles.word} style={{ animationDelay: `${120 + HEADLINE.length * 90}ms` }}>
            <Logo className={styles.brand} />.
          </span>
        </h1>
        <p className={styles.lead}>
          Pa de massa mare, bolleria fresca i cafè, fets amb farines ecològiques lliures de pesticides i glifosat. Tens{' '}
          {storeCount} fleques entre Girona i la Costa Brava: n’hi ha una a prop teu.
        </p>
        <div className={styles.actions}>
          <Link href="/botigues" className="button">
            Troba la teva fleca
          </Link>
          <a href="#pastissos" className={`button button--ghost ${styles.ghost}`}>
            Encarrega un pastís
          </a>
        </div>
      </div>
      <a href="#pans" className={styles.scrollHint} aria-label="Baixa per descobrir el nostre pa">
        <span />
      </a>
    </section>
  );
}

export function Marquee() {
  const items = [
    'Massa mare',
    'Farines ecològiques',
    'Lliures de glifosat',
    'Sal marina sense refinar',
    'Aigua purificada i vivificada',
    "De l'obrador a la botiga, cada dia",
  ];
  const row = (hidden: boolean) => (
    <ul className={styles.marqueeRow} aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
  return (
    <div className={styles.marquee}>
      {row(false)}
      {row(true)}
    </div>
  );
}
