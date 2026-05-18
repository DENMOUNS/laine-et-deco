import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  try {
    const docRef = await addDoc(collection(db, 'custom_order'), {
      test: true,
      userId: 'lmFy8saTupTa8Lmk0oOGSxfPgc13',
      createdAt: new Date().toISOString()
    });
    console.log('Added document with ID: ', docRef.id);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();