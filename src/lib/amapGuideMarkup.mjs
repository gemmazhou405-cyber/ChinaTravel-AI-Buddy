// Tiny markup used by the Amap guide copy: **bold**, *italic*, [label](href) and [[shot:N]] screenshot markers.
const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g;
const SHOT = /\s*\[\[shot:(\d+)\]\]\s*/g;

export function parseInline(text) {
  const tokens = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) tokens.push({ type: 'text', text: text.slice(last, match.index) });
    if (match[1] !== undefined) tokens.push({ type: 'strong', text: match[1] });
    else if (match[2] !== undefined) tokens.push({ type: 'em', text: match[2] });
    else tokens.push({ type: 'link', text: match[3], href: match[4] });
    last = match.index + match[0].length;
  }
  if (last < text.length) tokens.push({ type: 'text', text: text.slice(last) });
  return tokens;
}

// Splits copy at screenshot markers; consecutive markers become one group shown side by side.
export function splitShots(text) {
  const segments = [];
  let last = 0;
  for (const match of text.matchAll(SHOT)) {
    const before = text.slice(last, match.index);
    if (before) segments.push({ type: 'text', text: before });
    const previous = segments[segments.length - 1];
    if (previous?.type === 'shots') previous.ids.push(match[1]);
    else segments.push({ type: 'shots', ids: [match[1]] });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ type: 'text', text: text.slice(last) });
  return segments;
}

export function plainText(text) {
  return parseInline(text.replace(SHOT, ' ').trim()).map(({ text: value }) => value).join('');
}

export function shotIds(content) {
  const texts = content.sections.flatMap((section) => [section, ...(section.subsections || [])])
    .flatMap(({ blocks }) => blocks)
    .flatMap((block) => block.text ? [block.text] : block.items || []);
  return texts.flatMap((text) => [...text.matchAll(SHOT)].map((match) => match[1]));
}
