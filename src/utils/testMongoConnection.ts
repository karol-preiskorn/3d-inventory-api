import { MongoClient } from 'mongodb';

const testConnection = async () => {

  const uri = 'mongodb+srv://user:50731BTLjF2wTKMA@cluster0.htgjako.mongodb.net/test?retryWrites=true&w=majority&tls=true';

  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const db = client.db('3d-inventory');

    const collections = await db.listCollections().toArray();

    console.log('Collections:', collections.map((c) => c.name));

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  } finally {
    await client.close();
  }
};

testConnection();
