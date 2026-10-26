// Push changed chinaeasebuddy.com URLs to IndexNow (Bing and other participating engines).
// Usage: node scripts/indexnow.mjs https://chinaeasebuddy.com/page-a/ /page-b/ ...
// Paths starting with "/" are treated as chinaeasebuddy.com URLs.
import { readdirSync, readFileSync } from 'node:fs';

const HOST = 'chinaeasebuddy.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

// The key is the public/{key}.txt file whose content is the key itself.
const keyFiles = readdirSync('public').filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (keyFiles.length !== 1) {
  console.error(`Expected exactly one IndexNow key file in public/, found ${keyFiles.length}.`);
  process.exit(1);
}
const key = keyFiles[0].replace(/\.txt$/, '');
if (readFileSync(`public/${keyFiles[0]}`, 'utf8') !== key) {
  console.error(`public/${keyFiles[0]} must contain only the key.`);
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/indexnow.mjs <url> [url ...]');
  process.exit(1);
}

const urlList = [];
for (const arg of args) {
  let url;
  try {
    url = new URL(arg.startsWith('/') ? `https://${HOST}${arg}` : arg);
  } catch {
    console.error(`Not a URL: ${arg}`);
    process.exit(1);
  }
  if (url.hostname !== HOST || url.protocol !== 'https:') {
    console.error(`Only https://${HOST} URLs are accepted: ${arg}`);
    process.exit(1);
  }
  urlList.push(url.href);
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
});
const ok = response.status === 200 || response.status === 202;
console.log(`IndexNow ${response.status} ${response.statusText || ''}`.trim() + ` for ${urlList.length} URL(s): ${ok ? 'accepted' : 'not accepted'}`);
if (!ok) {
  const text = await response.text();
  if (text) console.log(text.slice(0, 500));
  process.exit(1);
}
