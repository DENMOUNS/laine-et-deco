export type FirestoreTimestamp = Date | null | { seconds: number; nanoseconds: number };
export type EntityTimestamp = FirestoreTimestamp | string;

/** Contrat minimal des documents Firestore / constantes locales. */
export interface BaseEntity {
  id?: string;
  createdAt?: EntityTimestamp;
  updatedAt?: EntityTimestamp;
}
