/**
 * Firestore Entity Service
 * 
 * Centralized Firestore CRUD operations.
 * Re-exported from its original location for the new architecture.
 * The original file (src/frontend/services/firestoreEntityService.ts) is kept
 * as the canonical implementation to avoid breaking existing imports during
 * the progressive migration.
 */

export {
  subscribeToEntityCollection,
  createFirestoreEntity,
  updateFirestoreEntity,
  setFirestoreEntity,
  deleteFirestoreEntity,
} from '../../frontend/services/firestoreEntityService';

export type {
  EntityServiceOptions,
  EntityPayload,
} from '../../frontend/services/firestoreEntityService';
