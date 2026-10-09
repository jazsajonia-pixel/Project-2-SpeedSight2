const SERVERLESS_CONNECTION_LIMIT = '1';

/**
 * Keep Prisma's per-instance pool small for serverless runtimes while
 * preserving an explicitly configured connection_limit.
 */
export function normalizeDatabaseUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', SERVERLESS_CONNECTION_LIMIT);
    }
    return url.toString();
  } catch {
    // Let Prisma report the original malformed URL with its normal error.
    return databaseUrl;
  }
}
