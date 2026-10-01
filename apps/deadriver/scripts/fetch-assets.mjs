// Downloads brand assets into public/ if they aren't committed yet.
// Runs before every build (Vercel included). Safe to run repeatedly.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The brand lockup is committed (public/images/logo.png and the header
// renditions). Do not fetch the retired square mark.
const assets = [
  // The founder photo is no longer fetched: the original lives in
  // src/assets/brandon-aubey-original.png and the served AVIF/WebP/JPEG
  // renditions are generated from it and committed under public/images/.
];

mkdirSync(join(process.cwd(), 'public/images'), { recursive: true });

for (const a of assets) {
  const path = join(process.cwd(), a.file);
  if (existsSync(path)) continue;
  try {
    const res = await fetch(a.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
    console.log(`fetched ${a.file}`);
  } catch (err) {
    console.warn(`could not fetch ${a.file}: ${err.message} (site will fall back gracefully)`);
  }
}
