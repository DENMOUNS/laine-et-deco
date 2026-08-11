import { Router, Request, Response } from 'express';
import { getAuth, getDb, firebaseAdmin } from '../firebaseAdmin.js';

const db = new Proxy({} as any, {
  get(target, prop) {
    const currentDb = getDb();
    if (!currentDb) throw new Error("Firestore database is not initialized");
    const val = (currentDb as any)[prop];
    if (typeof val === 'function') {
      return val.bind(currentDb);
    }
    return val;
  }
});

const auth = new Proxy({} as any, {
  get(target, prop) {
    const currentAuth = getAuth();
    if (!currentAuth) throw new Error("Firebase auth is not initialized");
    const val = (currentAuth as any)[prop];
    if (typeof val === 'function') {
      return val.bind(currentAuth);
    }
    return val;
  }
});

const router = Router();

const asPositiveInt = (value: unknown) => Math.max(0, Math.floor(Number(value) || 0));

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!getAuth() || !getDb()) return res.status(503).json({ error: 'Firebase backend unavailable' });
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
      if (item.type === 'product') return [item];
      if (item.type === 'pack' && Array.isArray(item.components)) {
        const packQuantity = asPositiveInt(item.quantity);
        return item.components.map((component: any) => ({
          type: 'product',
          productId: component.productId,
          quantity: asPositiveInt(component.quantity) * packQuantity,
          packId: item.id,
          packName: item.name,
        }));
      }
      return [];
    });

    const groupOrderId = String(body.groupOrderId || `ORD-${crypto.randomUUID().split('-')[0].toUpperCase()}`);
    const now = new Date().toLocaleDateString('fr-FR');
    const result = await db.runTransaction(async (transaction) => {
      const immediate: any[] = [];
      const preorder: any[] = [];
      const productRefs = reservationItems.map((rawItem: any) => db!.collection('product').doc(String(rawItem.productId || rawItem.id || '')));
      const productSnapshots = await transaction.getAll(...productRefs);

      for (const [itemIndex, rawItem] of reservationItems.entries()) {
        const quantity = asPositiveInt(rawItem.quantity);
        if (quantity <= 0) continue;
        if (rawItem.type !== 'product') {
          throw Object.assign(new Error('Only product lines can be reserved atomically'), { statusCode: 400 });
        }

        const productId = String(rawItem.productId || rawItem.id || '');
        const productRef = productRefs[itemIndex];
        const productSnap = productSnapshots[itemIndex];
        if (!productSnap.exists) {
          throw Object.assign(new Error(`Product not found: ${productId}`), { statusCode: 409 });
        }
        const product: any = productSnap.data() || {};
        const configuredColor = rawItem.configuration?.color ? String(rawItem.configuration.color) : undefined;
        const stockByColor = product.stockByColor && typeof product.stockByColor === 'object' ? { ...product.stockByColor } : null;
        let currentStock = configuredColor && stockByColor && Object.hasOwn(stockByColor, configuredColor)
          ? asPositiveInt(stockByColor[configuredColor])
          : asPositiveInt(product.stock);
        const immediateQuantity = Math.min(currentStock, quantity);
        const preorderQuantity = quantity - immediateQuantity;
        const arrivals = Array.isArray(product.incomingStock) ? product.incomingStock.map((arrival: any) => ({ ...arrival })) : [];

        if (preorderQuantity > 0 && product.allowPreorder !== true) {
          throw Object.assign(new Error(`Preorder is disabled for product ${productId}`), { statusCode: 409 });
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
        if (remainingPreorder > 0) {
          throw Object.assign(new Error(`Insufficient incoming stock for product ${productId}`), { statusCode: 409 });
        }

        if (immediateQuantity > 0) {
          currentStock -= immediateQuantity;
          if (configuredColor && stockByColor && Object.hasOwn(stockByColor, configuredColor)) stockByColor[configuredColor] = currentStock;
          immediate.push({ id: productId, productId, type: 'product', name: product.name, price: Number(product.price) || 0, quantity: immediateQuantity, image: product.image, color: configuredColor, configuration: rawItem.configuration });
        }
        if (preorderQuantity > 0) {
          const nextArrival = arrivals
            .filter((arrival: any) => asPositiveInt(arrival.reservedQuantity) > 0 && arrival.status !== 'cancelled' && arrival.status !== 'received')
            .sort((a: any, b: any) => new Date(a.availableAt).getTime() - new Date(b.availableAt).getTime())[0];
          preorder.push({ id: productId, productId, type: 'product', name: product.name, price: Number(product.price) || 0, quantity: preorderQuantity, image: product.image, color: configuredColor, configuration: rawItem.configuration, isPreorder: true, expectedAvailabilityDate: nextArrival?.availableAt });
        }
        transaction.update(productRef, { stock: configuredColor && stockByColor && Object.hasOwn(stockByColor, configuredColor) ? asPositiveInt(product.stock) : currentStock, quantity: configuredColor && stockByColor && Object.hasOwn(stockByColor, configuredColor) ? asPositiveInt(product.stock) : currentStock, stockByColor: stockByColor || product.stockByColor, in_stock: currentStock > 0, incomingStock: arrivals, updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp() });
      }

      const immediateSubtotal = immediate.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const preorderSubtotal = preorder.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const subtotal = immediateSubtotal + preorderSubtotal;
      const discount = Math.max(0, Number(body.discount) || 0);
      const shipping = Math.max(0, Number(body.shippingFee) || 0);
      const makeOrder = (lines: any[], mode: 'immediate' | 'preorder', shippingFee: number) => {
        if (lines.length === 0) return null;
        const partSubtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const partDiscount = subtotal > 0 ? discount * partSubtotal / subtotal : 0;
        const id = `${groupOrderId}-${mode === 'immediate' ? 'NOW' : 'PRE'}`;
        return { id, uuid: crypto.randomUUID(), parentOrderId: groupOrderId, userId: decoded.uid, customer: body.customer || '', customerName: body.customerName || body.customer || '', address: body.address || '', phone: body.phone || '', coordinates: body.coordinates || '', items: lines.reduce((sum, item) => sum + item.quantity, 0), orderDetails: lines, subtotal: partSubtotal, discount: partDiscount, total: partSubtotal + shippingFee - partDiscount, shippingFee, fulfillmentMode: mode, status: mode === 'preorder' ? 'preorder' : 'processing', date: now, createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(), paymentMethod: body.paymentMethod || 'delivery', trackingSteps: [{ status: 'Confirmée', description: 'Votre commande a été reçue.', date: now, completed: true }] };
      };
      const orders = [makeOrder(immediate, 'immediate', shipping), makeOrder(preorder, 'preorder', 0)].filter(Boolean) as any[];
      for (const order of orders) transaction.create(db!.collection('order').doc(), order);
      return { orderIds: orders.map((order) => order.id), immediateSubtotal, preorderSubtotal };
    });

    return res.status(201).json(result);
  } catch (error: any) {
    const status = Number(error?.statusCode) || 500;
    return res.status(status).json({ error: error?.message || 'Unable to create order' });
  }
});

export default router;
