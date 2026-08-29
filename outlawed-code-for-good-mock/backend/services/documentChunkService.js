const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');

/**
 * Text Chunking Utility
 * Splits document content into overlapping chunks respecting sentence boundaries.
 */
function chunkText(text = '', chunkSize = 500, overlap = 80) {
  if (!text || typeof text !== 'string') return [];

  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text];
  const chunks = [];
  let currentChunk = '';
  let startChar = 0;

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startChar,
        endChar: startChar + currentChunk.length,
      });
      // Calculate overlap starting point
      startChar += Math.max(1, currentChunk.length - overlap);
      currentChunk = currentChunk.slice(-overlap) + sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      startChar,
      endChar: startChar + currentChunk.length,
    });
  }

  return chunks;
}

/**
 * Vector Embedding Generator
 * Computes dense vector embeddings.
 * Can be connected to OpenAI, Gemini, or Hugging Face.
 * Falls back to a deterministic 384-dimensional semantic hash vector for development/testing.
 */
async function generateEmbedding(text = '', dimensions = 384) {
  if (!text) return new Array(dimensions).fill(0);

  // If OPENAI_API_KEY is configured, use OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (err) {
      console.warn('Cloud embedding notice, using local vector fallback:', err.message);
    }
  }

  // Fallback: Deterministic normalized n-dimensional pseudo-semantic vector for local testing
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const index = (charCode * 31 + j * 17 + i * 13) % dimensions;
      vector[index] += (charCode / 128.0) * (1.0 / (1 + i * 0.1));
    }
  }

  // Normalize vector to unit length (L2 norm)
  let norm = 0;
  for (let i = 0; i < dimensions; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm) || 1;
  return vector.map((v) => Number((v / norm).toFixed(6)));
}

/**
 * Process a Raw Document:
 * 1. Saves or updates Document in `documents`
 * 2. Splits content into chunks
 * 3. Generates embeddings for each chunk
 * 4. Stores chunks in `document_chunks`
 */
async function processAndStoreDocument(docData) {
  const { documentId, title, type, content, language = 'en', district = 'Mandya', caseId } = docData;

  // 1. Create or update parent Document
  const document = await Document.findOneAndUpdate(
    { documentId },
    {
      documentId,
      title,
      type: type || 'CASE_REPORT',
      content,
      language,
      district,
      caseId,
    },
    { upsert: true, returnDocument: 'after' }
  );

  // 2. Chunk text content
  const textChunks = chunkText(content, 450, 80);

  // 3. Clear previous chunks for this document if re-processing
  await DocumentChunk.deleteMany({ documentId });

  // 4. Generate embeddings and create Chunk records
  const chunkDocs = [];
  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    const embedding = await generateEmbedding(chunk.text);

    chunkDocs.push({
      documentId,
      caseId,
      chunkIndex: i,
      text: chunk.text,
      language,
      embedding,
      metadata: {
        tokenCount: Math.round(chunk.text.length / 4),
        startChar: chunk.startChar,
        endChar: chunk.endChar,
      },
    });
  }

  const savedChunks = await DocumentChunk.insertMany(chunkDocs);

  // Update total chunks count on parent document
  document.metadata = document.metadata || {};
  document.metadata.totalChunks = savedChunks.length;
  await document.save();

  return {
    document,
    chunkCount: savedChunks.length,
    chunks: savedChunks,
  };
}

/**
 * Semantic Vector Search on Document Chunks
 * Uses MongoDB Atlas $vectorSearch pipeline or cosine fallback.
 */
async function searchVectorChunks(queryText, { limit = 5, caseId = null } = {}) {
  const queryEmbedding = await generateEmbedding(queryText);

  // Check if Atlas Vector Search is available
  try {
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 50,
          limit: limit,
          filter: caseId ? { caseId: { $eq: caseId } } : undefined,
        },
      },
      {
        $project: {
          documentId: 1,
          caseId: 1,
          chunkIndex: 1,
          text: 1,
          language: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const results = await DocumentChunk.aggregate(pipeline);
    if (results && results.length > 0) {
      return results;
    }
  } catch (err) {
    // Atlas index may not be created yet; use in-memory cosine fallback
  }

  // Fallback: Cosine Similarity in Mongoose
  const allChunks = await DocumentChunk.find(caseId ? { caseId } : {}).limit(100).lean();

  const scored = allChunks.map((chunk) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    const vecA = queryEmbedding;
    const vecB = chunk.embedding || [];

    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const similarity = (normA && normB) ? (dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))) : 0;
    return {
      ...chunk,
      score: Number(similarity.toFixed(4)),
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

module.exports = {
  chunkText,
  generateEmbedding,
  processAndStoreDocument,
  searchVectorChunks,
};
