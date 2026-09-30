import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ paddingBlock: '8rem', display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <p className="eyebrow">Error 404</p>
      <h1 className="section-title">Aquesta pàgina se l&apos;ha menjat algú.</h1>
      <p className="lead">Potser la botiga que buscaves ha canviat d&apos;adreça. Mira-les totes al mapa.</p>
      <Link href="/botigues" className="button">
        Veure les botigues
      </Link>
    </div>
  );
}
