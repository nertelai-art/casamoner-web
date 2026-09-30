import Link from 'next/link';
import type { Faq } from '@/data/catalog';
import type { Store } from '@/domain/store';
import { StoreFinder } from '@/components/stores/StoreFinder';
import styles from './StoresAndFaq.module.css';

export function StoresSection({ stores, localities }: { stores: readonly Store[]; localities: readonly string[] }) {
  return (
    <section id="botigues" aria-labelledby="botigues-title" className={styles.section}>
      <div className="container">
        <header className={styles.header}>
          <div>
            <p className="eyebrow">{stores.length} fleques</p>
            <h2 id="botigues-title" className="section-title">
              Troba la teva fleca
            </h2>
          </div>
          <Link href="/botigues" className="button button--ghost">
            Totes les botigues
          </Link>
        </header>
        <StoreFinder stores={stores} localities={localities} />
      </div>
    </section>
  );
}

export function FaqSection({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <section id="preguntes" aria-labelledby="preguntes-title" className={styles.section}>
      <div className={`container ${styles.faq}`}>
        <div>
          <p className="eyebrow">Preguntes freqüents</p>
          <h2 id="preguntes-title" className="section-title">
            El que ens pregunteu
          </h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((f) => (
            <details key={f.question} className={styles.item}>
              <summary>{f.question}</summary>
              <p>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
