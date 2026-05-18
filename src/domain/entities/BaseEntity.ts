export type FirestoreTimestamp = Date | null | { seconds: number; nanoseconds: number };

export interface BaseEntity {
  id: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}
