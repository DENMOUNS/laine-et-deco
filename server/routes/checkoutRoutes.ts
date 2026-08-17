import { Router, Request, Response } from 'express';
import { auth, db, firebaseAdmin } from '../firebaseAdmin.js';

const router = Router();

const asPositiveInt = (value: unknown) => Math.max(0, Math.floor(Number(value) || 0));

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

      for (const rawItem of reservationItems) {
        const quantity = asPositiveInt(rawItem.quantity);
        if (quantity <= 0) continue;

        const productId = String(rawItem.productId || rawItem.id || '').trim();
        const entry = productMap.get(productId);

        let productName = rawItem.name || 'Produit';
        let itemPrice = Number(rawItem.price) || 0;
        let itemImage = rawItem.image || '';

        if (entry) {
          const product = entry.modifiedData;
          productName = product.name || productName;
          itemPrice = Number(product.price) || itemPrice;
          itemImage = product.image || itemImage;

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
        } else {
          // Fallback if product document does not exist in Firestore database
          immediate.push({
            id: productId || crypto.randomUUID(),
            productId,
            type: 'product',
            name: productName,
            price: itemPrice,
            quantity,
            image: itemImage,
            color: rawItem.configuration?.color,
            configuration: rawItem.configuration
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
      const discount = Math.max(0, Number(body.discount) || 0);
      const shipping = Math.max(0, Number(body.shippingFee) || 0);
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
        transaction.set(orderRef, order);
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
