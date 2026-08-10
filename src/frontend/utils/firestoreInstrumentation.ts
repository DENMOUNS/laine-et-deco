export type FirestoreMetricType = 'getDocs' | 'getDoc' | 'onSnapshot' | 'aggregate' | 'apiFetch';

interface FirestoreMetrics {
  reads: number;
  subscriptions: number;
  apiFetches: number;
  byType: Record<string, number>;
  lastLogAt: number;
}

const DEFAULT_METRICS: FirestoreMetrics = {
  reads: 0,
  subscriptions: 0,
  apiFetches: 0,
  byType: {
    getDocs: 0,
    getDoc: 0,
    onSnapshot: 0,
    aggregate: 0,
    apiFetch: 0,
  },
  lastLogAt: Date.now(),
};

const getWindowMetrics = (): FirestoreMetrics => {
  if (typeof window === 'undefined') return { ...DEFAULT_METRICS };
  const key = '__firestoreMetrics';
  if (!(window as any)[key]) {
    (window as any)[key] = { ...DEFAULT_METRICS };
  }
  return (window as any)[key] as FirestoreMetrics;
};

export const incrementFirestoreMetric = (type: FirestoreMetricType, entityType?: string) => {
  const metrics = getWindowMetrics();
  metrics.byType[type] = (metrics.byType[type] || 0) + 1;
  if (type === 'getDocs' || type === 'getDoc' || type === 'aggregate') {
    metrics.reads += 1;
  }
  if (type === 'onSnapshot') {
    metrics.subscriptions += 1;
  }
  if (type === 'apiFetch') {
    metrics.apiFetches += 1;
  }

  const now = Date.now();
  if (now - metrics.lastLogAt > 10_000) {
    metrics.lastLogAt = now;
    console.info('[firestore-metrics]', {
      entityType,
      type,
      counts: { ...metrics.byType },
      reads: metrics.reads,
      subscriptions: metrics.subscriptions,
      apiFetches: metrics.apiFetches,
    });
  }
};

export const getFirestoreMetrics = () => ({ ...getWindowMetrics() });
