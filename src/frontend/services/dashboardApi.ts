import { initFirebase } from '../../backend/firebase';

const getAuthToken = async () => {
  const { auth } = initFirebase();
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
  try {
    return await request(`/api/entity/${encodeURIComponent(entity)}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('introuvable') || msg.includes('404') || msg.includes('not found')) {
      // Document missing or PUT forbidden; try to create with POST including desired id
      const payload = { ...data, id };
      return request(`/api/entity/${encodeURIComponent(entity)}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }

    throw err;
  }
};

const buildSystemConfigDocs = (siteConfig: any) => {
  const branding = siteConfig?.branding || {};
  const newsletter = siteConfig?.newsletterPopup || {};
  const docs = [
    {
      collectionName: 'invoice_config',
      id: 'global',
      data: {
        phone: '+237 000 000 000',
        email: 'contact@laine-deco.com',
        paymentPhone: '+237 000 000 000',
        paymentName: 'Laine et Déco',
        address: 'Douala, Cameroun',
        message1: 'Les articles faits sur-mesure ne sont ni repris ni échangés.',
        message2: 'Merci de vérifier votre commande à la réception.',
        footerMessage: 'Merci pour votre confiance !',
      },
    },
    {
      collectionName: 'qr_config',
      id: 'global',
      data: {
        whatsappNumber: siteConfig?.qrConfig?.whatsappNumber || '+237600000000',
        whatsappMessage: siteConfig?.qrConfig?.whatsappMessage || 'Bonjour Laine et Déco, je souhaite passer commande.',
        welcomeMessage: siteConfig?.qrConfig?.welcomeMessage || 'Bienvenue chez Laine et Déco ! Découvrez nos créations uniques.',
      },
    },
    {
      collectionName: 'site_logo',
      id: 'default-logo',
      data: { image: branding.logo || siteConfig?.hero?.backgroundImages?.[0] || '/logo.png', status: 'active' },
    },
    {
      collectionName: 'site_color',
      id: 'default-color',
      data: {
        primaryColor: branding.primaryColor || siteConfig?.primaryColor || '#3E4A3D',
        secondaryColor: branding.secondaryColor || '#B85535',
        accentColor: siteConfig?.accentColor || '#5C6B5A',
        backgroundColor: '#fbf9f6',
        status: 'active',
      },
    },
    {
      collectionName: 'announcement_banner',
      id: 'default-announcement',
      data: { message: siteConfig?.adBannerText || '', status: siteConfig?.showAdBanner ? 'active' : 'inactive' },
    },
    {
      collectionName: 'loyalty_config_history',
      id: 'default-loyalty',
      data: { config: siteConfig?.loyaltyConfig, status: 'active' },
    },
    {
      collectionName: 'maintenance_config_history',
      id: 'default-maintenance',
      data: {
        isActive: siteConfig?.maintenance?.isActive || false,
        message: siteConfig?.maintenance?.message || '',
        endDate: siteConfig?.maintenance?.endDate || '',
        status: 'active',
      },
    },
    {
      collectionName: 'newsletter_config_history',
      id: 'default-newsletter',
      data: {
        isActive: newsletter.isActive || false,
        title: newsletter.title || '',
        message: newsletter.message || '',
        delay: newsletter.delay || 5000,
        image: newsletter.image || '',
        button1Text: "S'inscrire",
        button2Text: 'Non merci',
        status: 'active',
      },
    },
  ];

  (siteConfig?.sliderItems || []).forEach((slide: any) => {
    docs.push({
      collectionName: 'hero_banner',
      id: String(slide.id),
      data: {
        image: slide.image,
        title: slide.title,
        subtitle: slide.subtitle || '',
        ctaText: siteConfig?.hero?.ctaText || 'Découvrir',
        status: 'active',
      },
    });
  });

  (siteConfig?.marqueeItems || []).forEach((item: any) => {
    docs.push({
      collectionName: 'scrolling_banner',
      id: String(item.id),
      data: { text: item.text, iconName: item.iconName, status: 'active' },
    });
  });

  Object.entries(siteConfig?.seo || {}).forEach(([page, pageMeta]: [string, any]) => {
    docs.push({
      collectionName: 'seo_page',
      id: `seo-${page}`,
      data: { page, metaTitle: pageMeta.title || '', metaDescription: pageMeta.description || '', status: 'active' },
    });
  });

  (siteConfig?.customSections || []).forEach((section: any) => {
    docs.push({
      collectionName: 'custom_section_config',
      id: String(section.id),
      data: { title: section.title, type: section.type, itemIds: section.itemIds || [], status: 'active' },
    });
  });

  return docs;
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

export const initializeSystemConfigs = async (siteConfig?: any) => {
  let cfg = siteConfig;
  if (!cfg) {
    try {
      cfg = await getSystemConfig('site_config', 'global');
    } catch (err: any) {
      throw new Error(`Impossible de récupérer site_config: ${err?.message || err}`);
    }
  }

  const docs = buildSystemConfigDocs(cfg || {});
  // Send updates sequentially with retries/backoff to avoid rate limits (429)
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const sendWithRetries = async (item: any) => {
    const maxAttempts = 5;
    let attempt = 0;
    while (true) {
      try {
        await updateEntity(item.collectionName, item.id, item.data);
        return;
      } catch (err: any) {
        attempt += 1;
        const msg = String(err?.message || '').toLowerCase();
        const isRateLimit = msg.includes('trop de requêtes') || msg.includes('too many requests') || msg.includes('429');
        if (!isRateLimit || attempt >= maxAttempts) {
          throw err;
        }
        const backoff = Math.min(2000, Math.pow(2, attempt) * 150);
        await sleep(backoff);
      }
    }
  };

  for (const item of docs) {
    await sendWithRetries(item);
    // small pause between requests
    await sleep(80);
  }

  return { message: 'Configurations initialisées.', count: docs.length };
};

export const getSystemConfig = async (collectionName: string, id: string) => {
  // Public read - no auth needed
  return request(`/api/dashboard/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`);
};

export const saveSystemConfig = async (collectionName: string, id: string, data: any) => {
  // Protected write - requires staff auth
  return request(`/api/dashboard/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
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

// Public fallback: ensure QR config exists (creates only if missing)
export const ensurePublicQrConfig = async () => {
  const resp = await fetch('/api/dashboard/public/qr/init', {
    method: 'POST',
    credentials: 'same-origin',
  });

  const body = await resp.json().catch(() => null);
  if (!resp.ok) {
    throw new Error(body?.error || resp.statusText || 'Erreur init QR');
  }

  return body;
};
