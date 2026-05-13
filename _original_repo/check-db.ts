import Database from 'better-sqlite3';
import path from 'path';

try {
  const dbPath = path.resolve(process.cwd(), 'database.sqlite');
  const db = new Database(dbPath);
  console.log('Database opened successfully');
  db.close();
} catch (err) {
  console.error('Database failed:', err);
}
