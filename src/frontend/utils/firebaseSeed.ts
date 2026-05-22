import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import * as constants from '../../constants';

let hasSeeded = false;

/**
 * Seed Firestore with initial data from constants.ts.
 * Only seeds collections that are EMPTY — safe to call multiple times.
 * Called automatically at app boot.
 */
export const seedFirebase = async () => {
  if (!db || hasSeeded) return;
  hasSeeded = true;

  const collectionsToSeed = [
    // Products & catalog
    { name: 'product', data: constants.PRODUCTS },
    { name: 'category', data: constants.CATEGORIES },
    { name: 'pack', data: constants.PACKS },
    { name: 'blog_post', data: constants.BLOG_POSTS },
    { name: 'review', data: constants.REVIEWS },
    { name: 'faq', data: constants.FAQ_ITEMS },
    { name: 'community_post', data: constants.COMMUNITY_POSTS },
    { name: 'lookbook_post', data: constants.LOOKBOOK_POSTS },
    { name: 'badge', data: constants.BADGES },
    { name: 'member_portfolio', data: constants.INITIAL_PORTFOLIOS },

    // Commerce & pricing
    { name: 'coupon', data: constants.COUPONS },
    { name: 'promo_event', data: constants.PROMO_EVENTS },
    { name: 'flash_sale', data: constants.DEFAULT_FLASH_SALES },
    { name: 'shipping_rule', data: constants.SHIPPING_RULES },
    { name: 'tax_rule', data: constants.TAX_RULES },
    { name: 'catalog_price_rule', data: constants.CATALOG_PRICE_RULES },
    { name: 'currency', data: constants.CURRENCIES },
    { name: 'customer_group', data: constants.CUSTOMER_GROUPS },
    // Communication
    { name: 'notification', data: constants.NOTIFICATIONS },
    { name: 'chat_message', data: constants.CHAT_MESSAGES },
    { name: 'conversation', data: constants.CONVERSATIONS },
    { name: 'email', data: constants.EMAILS },
    { name: 'push_notification', data: constants.PUSH_NOTIFICATIONS },
    { name: 'subscriber', data: constants.SUBSCRIBERS },

    // Operations
    { name: 'expense', data: constants.EXPENSES },
    { name: 'rma', data: constants.RMAS },
    { name: 'abandoned_cart', data: constants.ABANDONED_CARTS },

    // Config (these stay as fallback in constants but also seed)
    { name: 'site_config', data: [constants.SITE_CONFIG] },

    { name: 'site_logo', data: [{ id: 'default-logo', image: '', lien: (constants.SITE_CONFIG as any).branding?.logo || '/logo.png', status: 'active' }] },
    { name: 'site_color', data: [{ id: 'default-color', primaryColor: constants.SITE_CONFIG.primaryColor || '#3E4A3D', secondaryColor: (constants.SITE_CONFIG as any).branding?.secondaryColor || '#B85535', accentColor: constants.SITE_CONFIG.accentColor || '#5C6B5A', backgroundColor: '#fbf9f6', status: 'active' }] },
    { name: 'hero_banner', data: (constants.SITE_CONFIG.sliderItems || []).map((s: any) => ({ id: s.id, image: s.image, title: s.title, subtitle: s.subtitle || '', ctaText: (constants.SITE_CONFIG as any).hero?.ctaText || 'Découvrir', status: 'active' })) },
    { name: 'announcement_banner', data: [{ id: 'default-announcement', message: constants.SITE_CONFIG.adBannerText || '', status: constants.SITE_CONFIG.showAdBanner ? 'active' : 'inactive' }] },
    { name: 'scrolling_banner', data: ((constants.SITE_CONFIG as any).marqueeItems || []).map((item: any) => ({ id: item.id, text: item.text, iconName: item.iconName, status: 'active' })) },
    { name: 'seo_page', data: Object.entries((constants.SITE_CONFIG as any).seo || {}).map(([page, meta]: [string, any]) => ({ id: 'seo-' + page, page, metaTitle: meta.title, metaDescription: meta.description, status: 'active' })) },
    { name: 'loyalty_config_history', data: [{ id: 'default-loyalty', config: constants.SITE_CONFIG.loyaltyConfig, status: 'active' }] },
    { name: 'maintenance_config_history', data: [{ id: 'default-maintenance', isActive: (constants.SITE_CONFIG as any).maintenance?.isActive || false, message: (constants.SITE_CONFIG as any).maintenance?.message || '', status: 'active' }] },
    { name: 'newsletter_config_history', data: [{ id: 'default-newsletter', isActive: (constants.SITE_CONFIG as any).newsletterPopup?.isActive || false, title: (constants.SITE_CONFIG as any).newsletterPopup?.title || '', message: (constants.SITE_CONFIG as any).newsletterPopup?.message || '', delay: (constants.SITE_CONFIG as any).newsletterPopup?.delay || 5000, image: (constants.SITE_CONFIG as any).newsletterPopup?.image || '', button1Text: 'S\'inscrire', button2Text: 'Non merci', status: 'active' }] },
    { name: 'custom_section_config', data: (constants.SITE_CONFIG.customSections || []).map((cs: any) => ({ id: cs.id, title: cs.title, type: cs.type, itemIds: cs.itemIds, status: 'active' })) },
    { name: 'invoice_config', data: [{ id: 'global', phone: '+237 000 000 000', email: 'contact@laine-deco.com', paymentPhone: '+237 000 000 000', paymentName: 'Laine et Déco', address: 'Douala, Cameroun', message1: 'Les articles faits sur-mesure ne sont ni repris ni échangés.', message2: 'Merci de vérifier votre commande à la réception.', footerMessage: 'Merci pour votre confiance !' }] },
    { name: 'qr_config', data: [{ id: 'global', whatsappNumber: (constants.SITE_CONFIG as any).qrConfig?.whatsappNumber || '+237600000000', whatsappMessage: (constants.SITE_CONFIG as any).qrConfig?.whatsappMessage || 'Bonjour Laine et Déco, je souhaite passer commande.', welcomeMessage: (constants.SITE_CONFIG as any).qrConfig?.welcomeMessage || 'Bienvenue chez Laine et Déco ! Découvrez nos créations uniques.' }] },

    { name: 'city', data: constants.INITIAL_CITIES },
    { name: 'nav_item', data: constants.NAV_ITEMS },
    { name: 'admin_role', data: constants.ADMIN_ROLES },
    { name: 'user', data: constants.USERS },
    { name: 'order', data: constants.ORDERS },
  ];

  for (const col of collectionsToSeed) {
    try {
      if (!col.data || col.data.length === 0) continue;

      const snapshot = await getDocs(collection(db, col.name));
      if (!snapshot.empty) continue;

      // Firestore batch limit is 500 operations
      const chunks = [];
      for (let i = 0; i < col.data.length; i += 450) {
        chunks.push(col.data.slice(i, i + 450));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((item: any) => {
          const docRef = item.id
            ? doc(db, col.name, String(item.id))
            : doc(collection(db, col.name));
          batch.set(docRef, {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'permission-denied') continue;
      console.warn(`Seed: failed to seed "${col.name}"`, err);
    }
  }
};
