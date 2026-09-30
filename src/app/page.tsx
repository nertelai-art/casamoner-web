import { JsonLd } from '@/components/JsonLd';
import { Hero, Marquee } from '@/components/sections/Hero';
import {
  BreadsSection,
  CakesSection,
  CateringSection,
  SavorySection,
  SweetsSection,
  WorkshopSection,
} from '@/components/sections/ProductSections';
import { FaqSection, StoresSection } from '@/components/sections/StoresAndFaq';
import { faqs } from '@/data/catalog';
import { storeRepository } from '@/data/stores';
import { faqJsonLd } from '@/lib/seo/json-ld';

export default function HomePage() {
  const stores = storeRepository.all();
  const localities = [...storeRepository.byLocality().keys()];

  return (
    <>
      <Hero storeCount={stores.length} />
      <Marquee />
      <BreadsSection />
      <CakesSection />
      <SweetsSection />
      <SavorySection />
      <CateringSection />
      <WorkshopSection />
      <StoresSection stores={stores} localities={localities} />
      <FaqSection faqs={faqs} />
      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
