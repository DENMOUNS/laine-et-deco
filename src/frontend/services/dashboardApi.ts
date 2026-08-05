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

const compactData = (data: Record<string, any>) =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));

const buildSystemConfigDocs = (siteConfig: any) => {
  const branding = siteConfig?.branding || {};
  const newsletter = siteConfig?.newsletterPopup || {};
  const invoiceConfig = siteConfig?.invoiceConfig || {};
  const qrConfig = siteConfig?.qrConfig || {};
  const docs: { collectionName: string; id: string; data: any }[] = [
    {
      collectionName: 'invoice_config',
      id: 'global',
      data: compactData({
        phone: invoiceConfig.phone,
        email: invoiceConfig.email,
        paymentPhone: invoiceConfig.paymentPhone,
        paymentName: invoiceConfig.paymentName,
        address: invoiceConfig.address,
        message1: invoiceConfig.message1,
        message2: invoiceConfig.message2,
        footerMessage: invoiceConfig.footerMessage,
      }),
    },
    {
      collectionName: 'qr_config',
      id: 'global',
      data: compactData({
        whatsappNumber: qrConfig.whatsappNumber,
        whatsappMessage: qrConfig.whatsappMessage,
        welcomeMessage: qrConfig.welcomeMessage,
      }),
    },
    {
      collectionName: 'site_logo',
      id: 'default-logo',
      data: compactData({
        image: '',
        lien: branding.logo || siteConfig?.hero?.backgroundImages?.[0],
        status: 'active',
      }),
    },
    {
      collectionName: 'site_color',
      id: 'default-color',
      data: compactData({
        primaryColor: branding.primaryColor || siteConfig?.primaryColor,
        secondaryColor: branding.secondaryColor,
        accentColor: siteConfig?.accentColor,
        backgroundColor: siteConfig?.backgroundColor,
        status: 'active',
      }),
    },
    {
      collectionName: 'announcement_banner',
      id: 'default-announcement',
      data: compactData({
        message: siteConfig?.adBannerText,
        status: siteConfig?.showAdBanner ? 'active' : undefined,
      }),
    },
    {
      collectionName: 'loyalty_config_history',
      id: 'default-loyalty',
      data: compactData({
        config: siteConfig?.loyaltyConfig,
        status: siteConfig?.loyaltyConfig ? 'active' : undefined,
      }),
    },
    {
      collectionName: 'maintenance_config_history',
      id: 'default-maintenance',
      data: compactData({
        isActive: siteConfig?.maintenance?.isActive,
        message: siteConfig?.maintenance?.message,
        endDate: siteConfig?.maintenance?.endDate,
        status: siteConfig?.maintenance ? 'active' : undefined,
      }),
    },
    {
      collectionName: 'newsletter_config_history',
      id: 'default-newsletter',
      data: compactData({
        isActive: newsletter.isActive,
        title: newsletter.title,
        message: newsletter.message,
        delay: newsletter.delay,
        image: newsletter.image,
        button1Text: newsletter.button1Text,
        button2Text: newsletter.button2Text,
        status: newsletter.isActive !== undefined ? 'active' : undefined,
      }),
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
        ctaText: siteConfig?.hero?.ctaText,
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

export const fetchDashboardConfig = async (type: 'qr_config' | 'invoice_config') => {
  return request(`/api/dashboard/config/${type}`, { method: 'GET' });
};

export const saveDashboardConfig = async (collection: 'qr_config' | 'invoice_config', data: any) => {
  return request(`/api/dashboard/config/${collection}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};




export const getSystemConfig = async (collectionName: string, id: string) => {
  // Generic read via /config endpoint - requires auth
  return request(`/api/dashboard/config/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`);
};

export const saveSystemConfig = async (collectionName: string, id: string, data: any) => {
  // Generic write via /config endpoint - requires admin auth
  return request(`/api/dashboard/config/${encodeURIComponent(collectionName)}/${encodeURIComponent(id)}`, {
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
