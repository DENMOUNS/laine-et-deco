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
      if (!isTransientGrpcError(err)) throw err;

      if (attempt === retries) break;
      const delay = Math.min(maxDelayMs, minDelayMs * Math.pow(factor, attempt));
      await new Promise((r) => setTimeout(r, delay + Math.floor(Math.random() * 100)));
      attempt++;
      continue;
    }
  }

  throw lastError;
}

export default retryFirestoreOperation;
