// Names of pages that plain-text copy refers to: clients with a case study,
// plus a few site pages. linkClients() splits a string so any mention can be
// rendered as a link to the page it refers to.
const clients: [string, string][] = [
  ['Gonzalez & Sons Roofing', '/work/gonzalez-and-sons-roofing'],
  ['The Pipe Whisperers', '/work/the-pipe-whisperers'],
  ['Total Auto Repair', '/work/total-auto-repair'],
  ['Wicked Logistics', '/work/wicked-logistics'],
  ['Parcel Management Group', '/work/parcel-management-group'],
  ['Only Fish', '/work/only-fish'],
  ['full guarantee terms', '/legal/guarantee'],
  ['published guarantee terms', '/legal/guarantee'],
];

export type TextPart = { text: string; href?: string };

export function linkClients(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let rest = text;
  while (rest) {
    let hit: { i: number; name: string; href: string } | null = null;
    for (const [name, href] of clients) {
      const i = rest.indexOf(name);
      if (i >= 0 && (!hit || i < hit.i)) hit = { i, name, href };
    }
    if (!hit) {
      parts.push({ text: rest });
      break;
    }
    if (hit.i) parts.push({ text: rest.slice(0, hit.i) });
    parts.push({ text: hit.name, href: hit.href });
    rest = rest.slice(hit.i + hit.name.length);
  }
  return parts;
}
