import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/data/site';
import { storeRepository } from '@/data/stores';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/'), changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/botigues'), changeFrequency: 'monthly', priority: 0.9 },
    ...storeRepository.all().map((s) => ({
      url: absoluteUrl(`/botigues/${s.slug}`),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [absoluteUrl(s.image)],
    })),
  ];
}
