import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

const app = initializeApp();
const db = getFirestore(app);

async function check() {
  console.log("--- qr_config ---");
  const qrSnap = await db.collection('qr_config').get();
  qrSnap.forEach(doc => console.log(doc.id, doc.data()));
  
  console.log("\n--- invoice_config ---");
  const invSnap = await db.collection('invoice_config').get();
  invSnap.forEach(doc => console.log(doc.id, doc.data()));
  
  process.exit(0);
}
check();
