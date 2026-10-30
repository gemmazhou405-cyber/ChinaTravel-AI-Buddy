// Local client for the aggregate-only growth endpoint, using its dedicated read-only secret. Never follows redirects.
import { pathToFileURL } from 'node:url';

export async function runReport({ env = process.env, fetcher = globalThis.fetch, write = (text) => process.stdout.write(text) } = {}) {
  const fail = (message) => {
    write(`Growth report failed: ${message}\n`);
    return 1;
  };
  const secret = typeof env.GROWTH_REPORT_SECRET === 'string' ? env.GROWTH_REPORT_SECRET.trim() : '';
  const configuredUrl = typeof env.GROWTH_REPORT_URL === 'string' ? env.GROWTH_REPORT_URL.trim() : '';
  if (!secret || !configuredUrl) return fail('set GROWTH_REPORT_URL and GROWTH_REPORT_SECRET.');

  let url;
  try {
    url = new URL(configuredUrl);
  } catch {
    return fail('GROWTH_REPORT_URL must be a valid endpoint URL.');
  }
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (
    (url.protocol !== 'https:' && !localHttp)
    || url.pathname !== '/api/admin/growth-summary'
    || url.username || url.password || /[?#]/.test(configuredUrl)
  ) {
    return fail('use the exact growth-summary endpoint over HTTPS, or loopback HTTP, without credentials, query, or fragment.');
  }
  if (/[\r\n]/.test(secret)) return fail('GROWTH_REPORT_SECRET contains invalid header characters.');

  try {
    const response = await fetcher(url.href, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) return fail(`endpoint returned HTTP ${response.status}.`);
    let summary;
    try {
      summary = await response.json();
    } catch {
      return fail('endpoint did not return a JSON summary.');
    }
    if (
      summary?.complete !== true
      || !summary.windows || typeof summary.windows !== 'object' || Array.isArray(summary.windows)
    ) {
      return fail('endpoint did not return a complete aggregate summary.');
    }
    write(`${JSON.stringify(summary, null, 2)}\n`);
    return 0;
  } catch {
    // Fetch/redirect/timeout errors can contain URLs, headers, or provider response data.
    return fail('request failed or timed out; redirects are not followed.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runReport();
}
