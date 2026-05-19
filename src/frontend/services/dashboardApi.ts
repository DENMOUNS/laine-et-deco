import { auth } from '../../backend/firebase';

const getAuthToken = async () => {
  const user = auth?.currentUser;
  if (!user) {
    throw new Error('Utilisateur non authentifié');
  }
  return user.getIdToken();
};

const request = async (path: string, options: RequestInit = {}) => {
  const token = await getAuthToken();

  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    credentials: 'same-origin',
    ...options,
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error || response.statusText || 'Erreur API';
    throw new Error(message);
  }

  return body;
};

export const updateEntity = async (entity: string, id: string, data: any) => {
  return request(`/api/entity/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  return request('/api/dashboard/order/status', {
    method: 'PUT',
    body: JSON.stringify({ orderId, status }),
  });
};

export const resetCities = async () => {
  return request('/api/dashboard/cities/reset', {
    method: 'POST',
  });
};

export const seedDashboardData = async () => {
  return request('/api/dashboard/seed', {
    method: 'POST',
  });
};

export const sendPushNotification = async (title: string, message: string) => {
  return request('/api/dashboard/send-push-notification', {
    method: 'POST',
    body: JSON.stringify({ title, message }),
  });
};

export const sendStockTransaction = async (productId: string, type: 'add' | 'remove', quantity: number, note?: string) => {
  return request('/api/dashboard/stock/transaction', {
    method: 'POST',
    body: JSON.stringify({ productId, type, quantity, note }),
  });
};
