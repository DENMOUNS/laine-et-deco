import { Router } from 'express';
import { db, auth } from '../firebaseAdmin';

const router = Router();

// Middleware to verify Firebase Auth Token
const verifyToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  if (!auth) {
    // If Firebase Admin is not initialized, we mock authentication for development
    console.warn('Simulating auth verification because Firebase Admin is not initialized.');
    req.user = { uid: 'mock-user-id', email: 'mock@example.com' };
    return next();
  }

  try {
    if (token === 'anonymous') {
      req.user = { uid: 'anonymous' };
      return next();
    }
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Generic validation function
const validateEntity = (entityType: string, data: any, user: any) => {
  // Enforce authentication for specific entities
  const requiresAuth = ['review', 'community_post', 'user_profile', 'rma'];
  if (requiresAuth.includes(entityType) && user.uid === 'anonymous') {
    throw new Error('Authentication required for this entity');
  }

  // Add specific validation rules per entity
  switch (entityType) {
    case 'review':
      if (!data.comment || data.comment.length > 1000) throw new Error('Invalid comment length');
      if (data.rating < 1 || data.rating > 5) throw new Error('Invalid rating');
      data.userId = user.uid; // Force the userId to be the authenticated user
      break;
    case 'community_post':
      if (!data.content || data.content.length > 2000) throw new Error('Invalid content length');
      data.userId = user.uid;
      break;
    case 'order':
      if (data.total < 0) throw new Error('Invalid total amount');
      data.userId = user.uid;
      break;
    case 'rma':
      if (!data.reason || data.reason.length > 1000) throw new Error('Invalid reason length');
      data.userId = user.uid;
      break;
    case 'chat_message':
      if (!data.text || data.text.length > 1000) throw new Error('Invalid message length');
      if (data.senderId !== 'ai') {
        data.senderId = user.uid;
      }
      break;
    case 'user_profile':
      data.userId = user.uid;
      break;
    default:
      // For admin-only entities, we might want to check if the user is an admin here
      // But for now, we just pass the data through if it's not explicitly validated
      break;
  }
  
  return data;
};

// CREATE Entity
router.post('/:entityType', verifyToken, async (req: any, res: any) => {
  const { entityType } = req.params;
  
  try {
    const validatedData = validateEntity(entityType, req.body, req.user);
    const dataToSave = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!db) {
      console.log(`[MOCK] Created ${entityType}:`, dataToSave);
      return res.status(201).json({ id: `mock-id-${Date.now()}`, message: 'Simulated creation successful' });
    }

    const docRef = await db.collection(entityType).add(dataToSave);
    res.status(201).json({ id: docRef.id, message: 'Entity created successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error creating entity' });
  }
});

// UPDATE Entity
router.put('/:entityType/:id', verifyToken, async (req: any, res: any) => {
  const { entityType, id } = req.params;
  
  try {
    // For updates, we also validate, but we might only validate provided fields
    const validatedData = validateEntity(entityType, req.body, req.user);
    const dataToUpdate = {
      ...validatedData,
      updatedAt: new Date(),
    };

    if (!db) {
      console.log(`[MOCK] Updated ${entityType}/${id}:`, dataToUpdate);
      return res.status(200).json({ message: 'Simulated update successful' });
    }

    // Additional security: Check if the user owns the document before updating
    const docRef = db.collection(entityType).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    
    const existingData = docSnap.data();
    // Allow update if user is owner OR if it's an admin (in a real app, check custom claims)
    if (existingData?.userId && existingData.userId !== req.user.uid) {
      // Allow admins to bypass (mocking admin check for now)
      if (req.user.email !== 'landrymoutongo97@gmail.com') {
        return res.status(403).json({ error: 'Forbidden: You do not own this document' });
      }
    }

    await docRef.update(dataToUpdate);
    res.status(200).json({ message: 'Entity updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error updating entity' });
  }
});

// DELETE Entity
router.delete('/:entityType/:id', verifyToken, async (req: any, res: any) => {
  const { entityType, id } = req.params;
  
  try {
    if (!db) {
      console.log(`[MOCK] Deleted ${entityType}/${id}`);
      return res.status(200).json({ message: 'Simulated deletion successful' });
    }

    const docRef = db.collection(entityType).doc(id);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    
    const existingData = docSnap.data();
    if (existingData?.userId && existingData.userId !== req.user.uid) {
      if (req.user.email !== 'landrymoutongo97@gmail.com') {
        return res.status(403).json({ error: 'Forbidden: You do not own this document' });
      }
    }

    await docRef.delete();
    res.status(200).json({ message: 'Entity deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error deleting entity' });
  }
});

export default router;
