import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const app = initializeApp();
const db = getFirestore(app);

async function check() {
  const qrSnap = await db.collection('qr_config').get();
  
  const invSnap = await db.collection('invoice_config').get();
  
  process.exit(0);
}
check();
