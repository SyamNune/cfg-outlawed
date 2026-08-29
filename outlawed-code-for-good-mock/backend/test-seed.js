require('dotenv').config();
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seedData');
const User = require('./models/User');
const Case = require('./models/Case');
const Document = require('./models/Document');
const DocumentChunk = require('./models/DocumentChunk');
const { searchVectorChunks } = require('./services/documentChunkService');

async function main() {
  console.log('Connecting to OutLawed database...');
  const conn = await connectDB();
  if (conn) {
    console.log('Seeding OutLawed database with 4 collections...');
    await seedDatabase();

    // Verify Counts
    const userCount = await User.countDocuments();
    const caseCount = await Case.countDocuments();
    const docCount = await Document.countDocuments();
    const chunkCount = await DocumentChunk.countDocuments();

    console.log('==============================================');
    console.log('OutLawed Collection Summary:');
    console.log(`   - users:           ${userCount} records`);
    console.log(`   - cases:           ${caseCount} records`);
    console.log(`   - documents:       ${docCount} records`);
    console.log(`   - document_chunks: ${chunkCount} records (with embeddings)`);
    console.log('==============================================');

    // Test Vector Search
    console.log('Testing Vector Search on Document Chunks:');
    const testQuery = 'agricultural land eviction and protection order';
    const searchResults = await searchVectorChunks(testQuery, { limit: 2 });
    console.log(`   Query: "${testQuery}"`);
    console.log(`   Top Match: Document ${searchResults[0]?.documentId} (Score: ${searchResults[0]?.score})`);
    console.log(`   Snippet: "${searchResults[0]?.text?.slice(0, 100)}..."`);
    console.log('==============================================');
    console.log('Setup verified successfully!');
  } else {
    console.log('Failed to connect to MongoDB Atlas');
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

