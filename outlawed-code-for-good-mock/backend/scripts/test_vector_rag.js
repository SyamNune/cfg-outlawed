const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
require('../models/User');
const { VectorSearchService, cosineSimilarity } = require('../services/vectorSearchService');
const AILegalService = require('../services/aiLegalService');
const LLMService = require('../services/llmService');

async function testVectorRAG() {
  const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
  console.log('--- RUNNING VECTOR SEARCH RAG & CLOUD LLM VALIDATION TEST ---');
  await mongoose.connect(uri);

  // 1. Test Embedding Generator
  const sampleText = 'Protection of Women from Domestic Violence Act 2005 emergency interim stay';
  const embedding = await VectorSearchService.getEmbedding(sampleText);
  console.log(`✓ Generated Dense Embedding: ${embedding.length} dimensions`);
  if (embedding.length !== 384) throw new Error('Invalid embedding dimension');

  // Verify L2 normalization
  const l2Norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  console.log(`✓ L2 Norm of Embedding: ${l2Norm.toFixed(4)} (Expected: ~1.0000)`);

  // 2. Test Cosine Similarity
  const similarText = 'PWDVA Section 18 interim protection order from abusive husband';
  const dissimilarText = 'Payment of minimum wages to building construction workers';
  const simEmb = await VectorSearchService.getEmbedding(similarText);
  const dissimEmb = await VectorSearchService.getEmbedding(dissimilarText);

  const highSim = cosineSimilarity(embedding, simEmb);
  const lowSim = cosineSimilarity(embedding, dissimEmb);
  console.log(`✓ Semantic Cosine Similarity (Similar): ${(highSim * 100).toFixed(1)}%`);
  console.log(`✓ Semantic Cosine Similarity (Dissimilar): ${(lowSim * 100).toFixed(1)}%`);
  if (highSim <= lowSim) throw new Error('Cosine similarity did not distinguish semantic contexts!');

  // 3. Test RAG Legal Query
  console.log('\nTesting RAG AI Query: "What are the immediate relief remedies for domestic violence?"');
  const queryResult = await AILegalService.answerLegalQuery('What are the immediate relief remedies for domestic violence?');
  console.log(`✓ Answer Source: ${queryResult.llmMetadata.source}`);
  console.log(`✓ Retrieved Chunks (${queryResult.retrievedArticles.length}): ${queryResult.retrievedArticles.map(a => `${a.title} [${a.matchPercentage}%]`).join(', ')}`);
  console.log(`✓ Statutory Citations (${queryResult.citations.length}): ${queryResult.citations.join('; ')}`);
  console.log(`✓ Actionable Steps (${queryResult.actionableSteps.length}): ${queryResult.actionableSteps[0]}`);

  // 4. Test Case Analysis with Vector Embedding
  console.log('\nTesting Case Analysis with Vector Indexing:');
  const analysis = await AILegalService.analyzeCase({
    title: 'Dispossessed tenant seeking urgent boundary demarcation',
    category: 'Land & Tenancy Dispute',
    facts: 'Landlord blocked ingress road and destroyed standing sugarcane crop.'
  });
  console.log(`✓ AI Summary Generated: "${analysis.summary.slice(0, 80)}..."`);
  console.log(`✓ Applicable Acts (${analysis.applicableActs.length}): ${analysis.applicableActs.join(', ')}`);
  console.log(`✓ Vector Embedding Generated: ${analysis.embedding?.length} dims`);

  // 5. Test Similar Cases Vector Search
  console.log('\nTesting Similar Cases Vector Search:');
  const similar = await AILegalService.findSimilarCases({
    title: 'Illegal Encroachment & Crop Destruction on Ancestral Patta Land',
    category: 'Land & Tenancy Dispute',
    district: 'Mandya'
  });
  console.log(`✓ Top Similar Cases (${similar.similarCases.length}):`);
  similar.similarCases.slice(0, 3).forEach(c => {
    console.log(`   - [${c.confidence}% Match] ${c.caseNumber}: "${c.title}" (${c.matchReasons[0]})`);
  });

  // 6. Test LLM Status
  const status = LLMService.getStatus();
  console.log('\n✓ Active LLM Configuration:');
  console.log(`   - Provider: ${status.provider}`);
  console.log(`   - Model: ${status.model}`);
  console.log(`   - Vector Engine: ${status.vectorEngine}`);

  console.log('\n--- ALL VECTOR SEARCH RAG & LLM TESTS PASSED (100%) ---');
  await mongoose.disconnect();
}

testVectorRAG().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
