// showCollections.js
const { MongoClient } = require('mongodb');
require('dotenv').config();
(async function(){
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/scholarshiphub';
  let dbName = uri.split('/').pop() || 'scholarshiphub';
  if (!dbName) dbName = 'scholarshiphub';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to', uri);
    const db = client.db(dbName);
    const cols = await db.listCollections().toArray();
    if (!cols.length) {
      console.log('No collections found in', db.databaseName);
    } else {
      console.log('Collections:', cols.map(c=>c.name).join(', '));
      for (const c of cols) {
        const docs = await db.collection(c.name).find({}).limit(5).toArray();
        console.log(`\n--- ${c.name} (up to 5 docs) ---`);
        console.dir(docs, { depth: 2, maxArrayLength: 50 });
      }
    }
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await client.close();
  }
})();
