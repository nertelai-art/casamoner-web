import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/data/site';

// Permetem explícitament els rastrejadors d'IA: volem que ens citin (GEO, S-5).
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' }))],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
