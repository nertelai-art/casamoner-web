import Image from 'next/image';
import { breads, cakes, savories, sweets } from '@/data/catalog';
import { site } from '@/data/site';
import { CitrusScene } from '@/components/scenes/citrus/CitrusScene';
import { OldFilmScene } from '@/components/scenes/old-film/OldFilmScene';
import { OvenScene } from '@/components/scenes/oven/OvenScene';
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
        lead="Farines ecològiques lliures de pesticides i glifosat, aigua purificada i vivificada i sal marina sense refinar. I sobretot, temps."
      />
      <OvenScene />
      <div className={`container ${styles.breads}`}>
        {breads.map((b, i) => (
          <article key={b.name} className={`${styles.bread} reveal`} data-variant={i === 0 ? 'dark' : 'light'}>
            <div className={styles.breadImage}>
              <Image src={b.image} alt={b.name} fill sizes="(max-width: 800px) 100vw, 50vw" />
            </div>
            <div className={styles.breadBody}>
              <p className={styles.label}>{i === 0 ? 'Etiqueta negra' : 'Etiqueta blanca'}</p>
              <h3>{b.name}</h3>
              <p>{b.description}</p>
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
      <OldFilmScene />
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
        lead="Magdalenes de kamut o espelta, croissants de mantega, minixuixos i galetes ecològiques. De l'obrador a les botigues cada matí."
      />
      <CitrusScene />
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
            Esmorzars de feina, aniversaris, casaments o una reunió a casa: us ho portem tot, del pa al pastís.
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
    { title: 'Farines ecològiques', text: 'Lliures de pesticides i glifosat. Kamut, espelta i blats de la terra.' },
    { title: 'Massa mare', text: 'Fermentacions llargues que donen aroma, crosta i un pa que dura.' },
    { title: 'Aigua i sal', text: 'Aigua purificada i vivificada i sal marina sense refinar.' },
    { title: 'Cada dia', text: "Tot surt del nostre obrador cap a les botigues, cada matí." },
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
            Tot comença amb unes mans i farina.
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
