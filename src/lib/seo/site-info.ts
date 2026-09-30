import { site } from '@/data/site';
import type { SiteInfo } from './json-ld';

export const siteInfo: SiteInfo = {
  name: site.name,
  url: site.url,
  description: site.description,
  email: site.email,
  social: site.social,
  logo: '/icon.png',
};
