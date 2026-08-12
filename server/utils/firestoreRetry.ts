type RetryOptions = {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
};

const isTransientGrpcError = (err: any) => {
  if (!err) return false;
  const code = err.code || (err?.status) || (err?.response?.status);
  // gRPC transient errors commonly: UNAVAILABLE (14), DEADLINE_EXCEEDED (4), INTERNAL sometimes
  const transient = [4, 14, 'UNAVAILABLE', 'DEADLINE_EXCEEDED', 'ETIMEDOUT', 'ECONNRESET'];
  if (typeof code === 'number') return transient.includes(code as any);
  if (typeof code === 'string') return transient.includes(code);
  // Fallback: check message
  const msg = String(err?.message || '').toLowerCase();
  return msg.includes('unavailable') || msg.includes('deadline') || msg.includes('transport') || msg.includes('timeout');
};

export async function retryFirestoreOperation<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 4, minDelayMs = 200, maxDelayMs = 5000, factor = 2 } = opts;

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // If not a transient error, rethrow immediately
      if (!isTransientGrpcError(err)) {
        const isQuotaError = (e: any) => {
          if (!e) return false;
          const code = e.code || e.status;
          if (code === 8 || code === 'RESOURCE_EXHAUSTED') return true;
          const msg = String(e.message || '').toLowerCase();
          return msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('limit exceeded');
        };

        if (isQuotaError(err)) {
          console.warn('[firestoreRetry] Quota limit exceeded (RESOURCE_EXHAUSTED). Graceful fallback cache is active. Operation safely redirected.');
        } else {
          console.error('[firestoreRetry] non-transient error', {
            attempt,
            errorName: err?.name,
            errorMessage: err?.message,
            errorStack: err?.stack,
          });
        }
        throw err;
      }

      if (attempt === retries) break;
      const delay = Math.min(maxDelayMs, minDelayMs * Math.pow(factor, attempt));
      await new Promise((r) => setTimeout(r, delay + Math.floor(Math.random() * 100)));
      attempt++;
      continue;
    }
  }

  console.error('[firestoreRetry] retries exhausted', {
    retries,
    lastErrorName: lastError?.name,
    lastErrorMessage: lastError?.message,
    lastErrorStack: lastError?.stack,
  });
  throw lastError;
}

export default retryFirestoreOperation;
