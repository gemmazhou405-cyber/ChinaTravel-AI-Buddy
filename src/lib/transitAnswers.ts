import transitAnswers from '../data/transitAnswers.json';
import transit240Guide from '../data/seoPages/china-240-hour-visa-free-transit-2026.json';

// Helpers for the 240-hour transit answer pages (content: src/data/transitAnswers.json).

export type TransitAnswerSlug = (typeof transitAnswers.pages)[number]['slug'];

export const TRANSIT_ANSWER_SLUGS = transitAnswers.pages.map((page) => page.slug) as TransitAnswerSlug[];

export function isTransitAnswerSlug(value: string): value is TransitAnswerSlug {
  return (TRANSIT_ANSWER_SLUGS as string[]).includes(value);
}

// One row per province or region: [province, ports joined, permitted area] (65 ports across 24 regions).
export function groupedPortRows(): [string, string, string][] {
  const section = transit240Guide.contentSections.find((item) => 'table' in item && item.title.includes('ports'));
  const rows = (section && 'table' in section && section.table ? section.table.rows : []) as string[][];
  const groups = new Map<string, { ports: string[]; area: string }>();
  for (const [province, port, area] of rows) {
    const group = groups.get(province) || { ports: [], area };
    group.ports.push(port);
    groups.set(province, group);
  }
  return [...groups.entries()].map(([province, group]) => [province, group.ports.join('; '), group.area]);
}
