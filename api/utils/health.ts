export type DatabaseHealth = 'connected' | 'unavailable' | 'timeout';

export async function checkDatabaseHealth(
  query: () => Promise<unknown>,
  timeoutMs = 2_500
): Promise<DatabaseHealth> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<'timeout'>((resolve) => {
    timeoutHandle = setTimeout(() => resolve('timeout'), timeoutMs);
  });

  try {
    const result = await Promise.race([query().then(() => 'connected' as const).catch(() => 'unavailable' as const), timeout]);
    return result;
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}
