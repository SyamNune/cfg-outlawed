const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    type: {
      type: String,
      default: 'CASE_REPORT',
      enum: ['CASE_REPORT', 'STATUTE', 'FIR', 'LEGAL_NOTICE', 'AFFIDAVIT', 'EVIDENCE', 'GENERAL'],
    },
    content: {
      type: String,
      required: [true, 'Document content is required'],
    },
    language: {
      type: String,
      default: 'en',
    },
    district: {
      type: String,
      default: 'Mandya',
    },
    caseId: {
      type: String,
      required: true,
      ref: 'Case',
    },
    metadata: {
      author: { type: String, default: '' },
      tags: [{ type: String }],
      totalChunks: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ caseId: 1 });
documentSchema.index({ district: 1 });

module.exports = mongoose.model('Document', documentSchema);
