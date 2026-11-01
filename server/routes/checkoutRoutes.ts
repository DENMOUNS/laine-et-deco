import { Router, Request, Response } from 'express';
import { auth, db, firebaseAdmin } from '../firebaseAdmin.js';

const router = Router();

const asPositiveInt = (value: unknown) => Math.max(0, Math.floor(Number(value) || 0));

function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (data instanceof Date || (typeof data === 'object' && typeof (data as any).toMillis === 'function')) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore) as any;
  }
  if (typeof data === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!auth || !db) return res.status(503).json({ error: 'Firebase backend unavailable' });
    const bearer = req.headers.authorization;
    if (!bearer?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    const decoded = await auth.verifyIdToken(bearer.slice(7));
    const body = req.body || {};
    const inputItems = Array.isArray(body.items) ? body.items : [];
    if (inputItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    if (inputItems.some((item: any) => item.type === 'pack' && !Array.isArray(item.components))) {
      return res.status(400).json({ error: 'Pack components are missing' });
    }

    const reservationItems = inputItems.flatMap((item: any) => {
      if (item.type === 'product') {
        const prodId = String(item.productId || item.id || '').trim();
        return [{
          ...item,
          productId: prodId,
          price: Number(item.price) || 0,
        }];
      }
      if (item.type === 'pack' && Array.isArray(item.components)) {
        const packQuantity = asPositiveInt(item.quantity);
        return item.components.map((component: any) => {
          const prodId = String(component.productId || component.id || '').trim();
          return {
            type: 'product',
            productId: prodId,
            quantity: asPositiveInt(component.quantity) * packQuantity,
            price: Number(component.price) || 0,
            name: component.name || item.name,
            image: component.image || item.image,
            packId: item.id,
            packName: item.name,
            configuration: component.configuration || item.configuration,
          };
        });
      }
      return [];
    });

    const groupOrderId = String(body.groupOrderId || `ORD-${crypto.randomUUID().split('-')[0].toUpperCase()}`);
    const now = new Date().toLocaleDateString('fr-FR');

    // Resolve Coupon document reference before transaction
    const rawCouponCode = String(body.couponCode || body.coupon || '').trim().toUpperCase();
    const rawCouponId = String(body.couponId || '').trim();
    let couponRef: any = null;

    if (rawCouponId) {
      couponRef = db.collection('coupon').doc(rawCouponId);
    } else if (rawCouponCode) {
      const codeQuery = await db.collection('coupon').where('code', '==', rawCouponCode).limit(1).get();
      if (!codeQuery.empty) {
        couponRef = codeQuery.docs[0].ref;
      } else {
        const directDoc = await db.collection('coupon').doc(rawCouponCode).get();
        if (directDoc.exists) couponRef = directDoc.ref;
      }
    }

    // Resolve City shipping fee before transaction
    let expectedCityShipping = 2500;
    const rawCity = String(body.city || body.cityName || '').trim();
    if (rawCity) {
      const cityQuery = await db.collection('city').where('name', '==', rawCity).limit(1).get();
      if (!cityQuery.empty) {
        const cityData = cityQuery.docs[0].data() || {};
        const fee = Number(cityData.deliveryFee ?? cityData.shippingFee);
        if (!isNaN(fee) && fee >= 0) expectedCityShipping = fee;
      }
    }

    const result = await db.runTransaction(async (transaction) => {
      const immediate: any[] = [];
      const preorder: any[] = [];

      // Collect UNIQUE non-empty product IDs to fetch from Firestore
      const uniqueProductIds: string[] = Array.from(
        new Set(
          reservationItems
            .map((item: any) => String(item.productId || item.id || '').trim())
            .filter(Boolean)
        )
      );

      const productMap = new Map<string, { ref: any; data: any; modifiedData: any }>();

      // Read phase: Products, Coupon, and User
      if (uniqueProductIds.length > 0) {
        const productRefs = uniqueProductIds.map((id) => db!.collection('product').doc(id));
        const productSnapshots = await transaction.getAll(...productRefs);

        uniqueProductIds.forEach((id, index) => {
          const snap = productSnapshots[index];
          if (snap && snap.exists) {
            const data = snap.data() || {};
            const modifiedData = {
              ...data,
              stockByColor: data.stockByColor && typeof data.stockByColor === 'object' ? { ...data.stockByColor } : null,
              incomingStock: Array.isArray(data.incomingStock) ? data.incomingStock.map((arr: any) => ({ ...arr })) : [],
            };
            productMap.set(id, { ref: productRefs[index], data, modifiedData });
          }
        });
      }

      let couponData: any = null;
      if (couponRef) {
        const cSnap: any = await transaction.get(couponRef);
        if (cSnap?.exists) {
          couponData = cSnap.data();
        }
      }

      const userRef = db!.collection('user').doc(decoded.uid);
      const userSnap = await transaction.get(userRef);

      for (const rawItem of reservationItems) {
        const quantity = asPositiveInt(rawItem.quantity);
        if (quantity <= 0) continue;

        const productId = String(rawItem.productId || rawItem.id || '').trim();
        const entry = productMap.get(productId);

        if (!entry) {
          throw Object.assign(new Error(`Le produit demandé "${rawItem.name || productId}" est introuvable ou n'est plus disponible.`), { statusCode: 400 });
        }

        const product = entry.modifiedData;
        const productName = product.name || rawItem.name || 'Produit';
        // Enforce verified catalog price from Firestore document, NEVER trust client input
        const itemPrice = Math.max(0, Number(product.price) || 0);
        const itemImage = product.image || rawItem.image || '';

        const configuredColor = rawItem.configuration?.color ? String(rawItem.configuration.color) : undefined;
        const stockByColor = product.stockByColor;
        const hasColorStock = Boolean(configuredColor && stockByColor && typeof stockByColor === 'object' && Object.prototype.hasOwnProperty.call(stockByColor, configuredColor));
        let currentStock = hasColorStock
          ? asPositiveInt(stockByColor[configuredColor!])
          : asPositiveInt(product.stock);

        const immediateQuantity = Math.min(currentStock, quantity);
        const preorderQuantity = quantity - immediateQuantity;
        const arrivals = product.incomingStock;

        if (preorderQuantity > 0 && product.allowPreorder !== true) {
          if (currentStock <= 0) {
            throw Object.assign(new Error(`Le produit ${productName} est en rupture de stock.`), { statusCode: 409 });
          }
        }

        let remainingPreorder = preorderQuantity;
        if (remainingPreorder > 0) {
          const candidates = arrivals
            .map((arrival: any, index: number) => ({ arrival, index }))
            .filter(({ arrival }: { arrival: any }) => arrival.status !== 'cancelled' && arrival.status !== 'received' && new Date(arrival.availableAt).getTime() > Date.now())
            .sort((a: { arrival: any }, b: { arrival: any }) => new Date(a.arrival.availableAt).getTime() - new Date(b.arrival.availableAt).getTime());

          for (const candidate of candidates) {
            const free = Math.max(0, asPositiveInt(candidate.arrival.quantity) - asPositiveInt(candidate.arrival.reservedQuantity));
            const allocated = Math.min(free, remainingPreorder);
            candidate.arrival.reservedQuantity = asPositiveInt(candidate.arrival.reservedQuantity) + allocated;
            remainingPreorder -= allocated;
            if (remainingPreorder === 0) break;
          }
        }

        if (remainingPreorder > 0 && product.allowPreorder) {
          throw Object.assign(new Error(`Stock réassort insuffisant pour ${productName}`), { statusCode: 409 });
        }

        if (immediateQuantity > 0) {
          currentStock -= immediateQuantity;
          if (hasColorStock && configuredColor) {
            stockByColor[configuredColor] = currentStock;
          } else {
            product.stock = currentStock;
          }
          immediate.push({
            id: productId || crypto.randomUUID(),
            productId,
            type: 'product',
            name: productName,
            price: itemPrice,
            quantity: immediateQuantity,
            image: itemImage,
            color: configuredColor,
            configuration: rawItem.configuration
          });
        }

        if (preorderQuantity > 0) {
          const nextArrival = arrivals
            .filter((arrival: any) => asPositiveInt(arrival.reservedQuantity) > 0 && arrival.status !== 'cancelled' && arrival.status !== 'received')
            .sort((a: any, b: any) => new Date(a.availableAt).getTime() - new Date(b.availableAt).getTime())[0];

          preorder.push({
            id: productId || crypto.randomUUID(),
            productId,
            type: 'product',
            name: productName,
            price: itemPrice,
            quantity: preorderQuantity,
            image: itemImage,
            color: configuredColor,
            configuration: rawItem.configuration,
            isPreorder: true,
            expectedAvailabilityDate: nextArrival?.availableAt
          });
        }
      }

      // Update mutated product docs in Firestore
      for (const entry of productMap.values()) {
        const product = entry.modifiedData;
        const mainStock = asPositiveInt(product.stock);
        transaction.update(entry.ref, {
          stock: mainStock,
          quantity: mainStock,
          stockByColor: product.stockByColor,
          in_stock: mainStock > 0,
          incomingStock: product.incomingStock,
          updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
        });
      }

      const immediateSubtotal = immediate.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const preorderSubtotal = preorder.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const subtotal = immediateSubtotal + preorderSubtotal;

      // Server-side calculated and verified discount
      let discount = 0;
      let couponOffersFreeShipping = false;

      if (couponData) {
        const isActive = couponData.active !== false && couponData.isActive !== false;
        const isExpired = couponData.expiresAt ? new Date(couponData.expiresAt).getTime() < Date.now() : false;
        const minOrder = Number(couponData.minOrderAmount || couponData.minAmount || 0);

        if (isActive && !isExpired && subtotal >= minOrder) {
          if (couponData.type === 'percent' || couponData.discountType === 'percent') {
            const pct = Math.min(100, Math.max(0, Number(couponData.value || couponData.discountPercent || couponData.discount || 0)));
            discount = Math.round((subtotal * pct) / 100);
          } else if (couponData.type === 'free_shipping' || couponData.freeShipping) {
            couponOffersFreeShipping = true;
          } else {
            const val = Math.max(0, Number(couponData.value || couponData.discountAmount || couponData.discount || 0));
            discount = Math.min(subtotal, val);
          }

          if (couponData.freeShipping) {
            couponOffersFreeShipping = true;
          }

          // Atomically increment coupon usage count
          transaction.update(couponRef, {
            usageCount: firebaseAdmin.firestore.FieldValue.increment(1),
            updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          });
        }
      } else if (body.referralCode && userSnap.exists && (Number(userSnap.data()?.orders || 0) === 0)) {
        // Valid 5% first order referral discount
        discount = Math.round(subtotal * 0.05);
      }

      // Server-side calculated and verified shipping fee
      const isPickup = body.deliveryMode === 'pickup' || body.pickup === true || body.shippingMethod === 'pickup';
      const isFreeShippingThreshold = subtotal >= 200000;
      let shipping = 0;

      if (!isPickup && !couponOffersFreeShipping && !isFreeShippingThreshold) {
        shipping = expectedCityShipping;
      }

      const isGiftWrap = Boolean(body.giftWrap?.enabled);
      const totalGiftFee = isGiftWrap ? Math.max(0, Number(body.giftFee) || 2000) : 0;
      const giftWrapData = isGiftWrap ? {
        enabled: true,
        message: String(body.giftWrap?.message || '').trim(),
        occasion: body.giftWrap?.occasion || 'birthday',
        recipientName: String(body.giftWrap?.recipientName || '').trim(),
        senderName: String(body.giftWrap?.senderName || '').trim(),
        ribbonColor: body.giftWrap?.ribbonColor || 'satin-gold',
        fee: totalGiftFee,
      } : undefined;

      const makeOrder = (lines: any[], mode: 'immediate' | 'preorder', shippingFee: number, giftFee: number) => {
        if (lines.length === 0) return null;
        const partSubtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const partDiscount = subtotal > 0 ? (discount * partSubtotal) / subtotal : 0;
        const id = `${groupOrderId}-${mode === 'immediate' ? 'NOW' : 'PRE'}`;
        return {
          id,
          uuid: crypto.randomUUID(),
          parentOrderId: groupOrderId,
          userId: decoded.uid,
          customer: body.customer || '',
          customerName: body.customerName || body.customer || '',
          address: body.address || '',
          phone: body.phone || '',
          coordinates: body.coordinates || '',
          items: lines.reduce((sum, item) => sum + item.quantity, 0),
          orderDetails: lines,
          subtotal: partSubtotal,
          discount: partDiscount,
          total: Math.max(0, partSubtotal + shippingFee + giftFee - partDiscount),
          shippingFee,
          giftFee,
          giftWrap: giftFee > 0 ? giftWrapData : undefined,
          fulfillmentMode: mode,
          status: mode === 'preorder' ? 'preorder' : 'processing',
          date: now,
          createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          paymentMethod: body.paymentMethod || 'delivery',
          trackingSteps: [{ status: 'Confirmée', description: 'Votre commande a été reçue.', date: now, completed: true }]
        };
      };

      const immediateGiftFee = immediate.length > 0 ? totalGiftFee : 0;
      const preorderGiftFee = immediate.length === 0 && preorder.length > 0 ? totalGiftFee : 0;
      const orders = [
        makeOrder(immediate, 'immediate', shipping, immediateGiftFee),
        makeOrder(preorder, 'preorder', 0, preorderGiftFee)
      ].filter(Boolean) as any[];

      for (const order of orders) {
        const orderRef = db!.collection('order').doc(order.id);
        transaction.set(orderRef, sanitizeForFirestore(order));
      }

      // Atomically award loyalty points (1% of total) and increment orders count on user doc
      const grandTotal = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const pointsEarned = Math.floor(grandTotal * 0.01);
      if (userSnap.exists) {
        transaction.update(userRef, {
          points: firebaseAdmin.firestore.FieldValue.increment(pointsEarned),
          orders: firebaseAdmin.firestore.FieldValue.increment(orders.length),
          updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return { orderIds: orders.map((order) => order.id), immediateSubtotal, preorderSubtotal };
    });

    return res.status(201).json(result);
  } catch (error: any) {
    console.error('Checkout error:', error);
    const status = Number(error?.statusCode) || 500;
    return res.status(status).json({ error: error?.message || 'Unable to create order' });
  }
});

export default router;
