const mongoose = require('mongoose');

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
    },
    caseId: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      default: 0,
    },
    text: {
      type: String,
      required: [true, 'Chunk text content is required'],
    },
    language: {
      type: String,
      default: 'en',
    },
    embedding: {
      type: [Number],
      default: [],
      index: false, // Indexed in MongoDB Atlas Search
    },
    metadata: {
      tokenCount: { type: Number, default: 0 },
      startChar: { type: Number, default: 0 },
      endChar: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: 'document_chunks',
  }
);

documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });
documentChunkSchema.index({ caseId: 1 });

module.exports = mongoose.model('DocumentChunk', documentChunkSchema);
