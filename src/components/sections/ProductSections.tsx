import Image from 'next/image';
import { breadLabels, cakes, savories, sweets } from '@/data/catalog';
import { site } from '@/data/site';
import { BakeryScene } from '@/components/scenes/bakery/BakeryScene';
import { CakeWalkScene } from '@/components/scenes/cake-walk/CakeWalkScene';
import { PanettoneScene } from '@/components/scenes/panettone/PanettoneScene';
import styles from './sections.module.css';

function SectionHeader({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead: string }) {
  return (
    <header className={`container ${styles.header} reveal`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`} className="section-title">
        {title}
      </h2>
      <p className="lead">{lead}</p>
    </header>
  );
}

export function BreadsSection() {
  return (
    <section id="pans" aria-labelledby="pans-title" className={styles.section}>
      <SectionHeader
        id="pans"
        eyebrow="Pa ecològic de massa mare"
        title="Pans"
        lead="Farines ecològiques lliures de pesticides i glifosat, massa mare, aigua purificada i vivificada i sal marina sense refinar."
      />
      <BakeryScene />
      <div className={`container ${styles.labels}`}>
        {breadLabels.map((label) => (
          <article key={label.name} className={`${styles.label} reveal`} data-variant={label.label}>
            <div className={styles.labelImage}>
              <Image src={label.image} alt={label.imageAlt} fill sizes="(max-width: 800px) 100vw, 40vw" />
            </div>
            <div className={styles.labelBody}>
              <p className={styles.tag}>Etiqueta {label.label}</p>
              <h3>{label.name}</h3>
              <p>{label.description}</p>
              <ul className={styles.breadList}>
                {label.breads.map((b) => (
                  <li key={b.name}>
                    <details>
                      <summary>
                        <Image src={b.image} alt="" width={96} height={96} sizes="56px" className={styles.breadThumb} />
                        <span>{b.name}</span>
                      </summary>
                      <p>{b.ingredients.join(' · ')}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CakesSection() {
  return (
    <section id="pastissos" aria-labelledby="pastissos-title" className={styles.section}>
      <SectionHeader
        id="pastissos"
        eyebrow="Per a qualsevol celebració"
        title="Pastissos"
        lead="Personalitza el teu pastís encarregant-lo a qualsevol de les nostres botigues."
      />
      <CakeWalkScene />
      <div className="container">
        <ul className={styles.gallery}>
          {cakes.map((c) => (
            <li key={c.name} className="reveal">
              <figure>
                <div className={styles.galleryImage}>
                  <Image src={c.image} alt={`Pastís ${c.name}`} fill sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw" />
                </div>
                <figcaption>{c.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SweetsSection() {
  return (
    <section id="dolcos" aria-labelledby="dolcos-title" className={styles.section}>
      <SectionHeader
        id="dolcos"
        eyebrow="Bolleria fresca cada dia"
        title="Dolços"
        lead="Magdalenes ecològiques amb farina de kamut o d'espelta, minixuixos, galetes eco i, per Nadal, panettone. De l'obrador a les botigues, cada dia."
      />
      <PanettoneScene />
      <div className={styles.carouselWrap}>
        <ul className={styles.carousel} aria-label="Els nostres dolços">
          {sweets.map((s) => (
            <li key={s.name}>
              <figure>
                <div className={styles.carouselImage}>
                  <Image src={s.image} alt={s.name} fill sizes="(max-width: 700px) 78vw, 380px" />
                </div>
                <figcaption>{s.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SavorySection() {
  return (
    <section id="salats" aria-labelledby="salats-title" className={styles.section}>
      <SectionHeader
        id="salats"
        eyebrow="Per encàrrec"
        title="Salats"
        lead="Fem quiches i coques de recapte per encàrrec. La base de totes les quiches és de farina de kamut integral ecològica."
      />
      <div className="container">
        <ul className={styles.savory}>
          {savories.map((s) => (
            <li key={s.name} className="reveal">
              <div className={styles.savoryImage}>
                <Image src={s.image} alt={s.name} fill sizes="(max-width: 600px) 50vw, 20vw" />
              </div>
              <p>{s.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CateringSection() {
  return (
    <section id="catering" aria-labelledby="catering-title" className={`${styles.section} ${styles.catering}`}>
      <div className={`container ${styles.cateringGrid}`}>
        <div className={`${styles.cateringImage} reveal`}>
          <Image
            src="/images/general/hero-aniversari.jpg"
            alt="Festa d'aniversari amb pastís i dolços de casamoner"
            fill
            sizes="(max-width: 800px) 100vw, 45vw"
          />
        </div>
        <div className={`${styles.cateringBody} reveal`}>
          <p className="eyebrow">Particulars, empreses i celebracions</p>
          <h2 id="catering-title" className="section-title">
            Càtering
          </h2>
          <p className="lead">
            A casamoner oferim un servei de càtering tant per a particulars com per a empreses i celebracions.
          </p>
          <div className={styles.cateringActions}>
            <a className="button" href={`mailto:${site.cateringEmail}`}>
              Demana pressupost
            </a>
            <a className="button button--ghost" href={site.cateringCatalog} target="_blank" rel="noopener">
              Descarrega el catàleg (PDF)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WorkshopSection() {
  const values = [
    { title: 'Farines ecològiques', text: 'Lliures de pesticides i glifosat. Kamut, espelta, fajol, sègol i farines de la terra.' },
    { title: 'Massa mare', text: 'Tots els nostres pans, dels de l’Etiqueta Negra als de l’Etiqueta Blanca, porten massa mare.' },
    { title: 'Aigua i sal', text: 'Aigua purificada i vivificada i sal marina sense refinar.' },
    { title: 'Cada dia', text: "De l'obrador a les botigues, bolleria fresca cada dia." },
  ];
  return (
    <section id="obrador" aria-labelledby="obrador-title" className={styles.section}>
      <div className={styles.workshop}>
        <Image
          src="/images/general/obrador-portada.jpg"
          alt="Mans pastant massa a l'obrador de casamoner"
          fill
          sizes="100vw"
          className={styles.workshopImage}
        />
        <div className={`container ${styles.workshopBody}`}>
          <p className="eyebrow">L&apos;obrador</p>
          <h2 id="obrador-title" className="section-title">
            De l&apos;obrador a les botigues.
          </h2>
        </div>
      </div>
      <ul className={`container ${styles.values}`}>
        {values.map((v) => (
          <li key={v.title} className="reveal">
            <h3>{v.title}</h3>
            <p>{v.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
