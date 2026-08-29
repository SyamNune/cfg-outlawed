const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const Case = require('../models/Case');
const { VectorSearchService } = require('../services/vectorSearchService');

async function seedVectorEmbeddings() {
  const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
  console.log('Connecting to database for Vector Embedding Seeding...');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB.');

  // 1. Vectorize Knowledge Articles
  const articles = await KnowledgeArticle.find({});
  console.log(`Vectorizing ${articles.length} Knowledge Articles...`);
  for (const art of articles) {
    const textToEmbed = [
      art.title,
      art.category,
      art.summary,
      art.provisionsAndRights,
      (art.actsAndSections || []).join(' '),
      (art.proceduralChecklist || []).join(' '),
      (art.requiredEvidence || []).join(' '),
      (art.relevanceKeywords || []).join(' ')
    ].join(' ');

    art.embedding = await VectorSearchService.getEmbedding(textToEmbed);
    await art.save();
    console.log(` ✓ Embedded Knowledge Article: "${art.title}" (${art.embedding.length} dims)`);
  }

  // 2. Vectorize Cases
  const cases = await Case.find({});
  console.log(`\nVectorizing ${cases.length} Cases...`);
  for (const c of cases) {
    const textToEmbed = [
      c.title,
      c.description,
      c.facts,
      c.category,
      c.client?.category,
      (c.aiAnalysis?.applicableActs || []).join(' '),
      (c.aiAnalysis?.suggestedRemedies || []).join(' '),
      (c.aiAnalysis?.similarityTags || []).join(' ')
    ].filter(Boolean).join(' ');

    c.embedding = await VectorSearchService.getEmbedding(textToEmbed);
    await c.save();
    console.log(` ✓ Embedded Case: [${c.caseNumber}] "${c.title}" (${c.embedding.length} dims)`);
  }

  console.log('\n--- ALL KNOWLEDGE ARTICLES & CASES VECTORIZED SUCCESSFULLY! ---');
  await mongoose.disconnect();
}

seedVectorEmbeddings().catch(err => {
  console.error('❌ Vector Embedding Seeding Error:', err);
  process.exit(1);
});
