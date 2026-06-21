import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Export schema so it is easily accessible
export * from './schema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDb(): any {
  // On Cloudflare Pages with @opennextjs/cloudflare, bindings are accessed
  // via getCloudflareContext().env — NOT via process.env.
  // We use a dynamic import trick that works in Edge Runtime (ESM).
  // In local dev (standard Next.js) this will throw and we fall back to libsql.
  try {
    // getCloudflareContext is set up per-request via AsyncLocalStorage,
    // so this is safe to call synchronously within a request handler.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCloudflareContext } = require('@opennextjs/cloudflare');
    const ctx = getCloudflareContext() as { env: { DB?: D1Database } };
    if (ctx?.env?.DB) {
      return drizzleD1(ctx.env.DB, { schema });
    }
  } catch {
    // Not running on Cloudflare — fall through to local dev fallback
  }

  // Fallback to local SQLite file for standard Next.js local dev
  const client = createClient({
    url: 'file:local.db',
  });
  return drizzleLibsql(client, { schema });
}
