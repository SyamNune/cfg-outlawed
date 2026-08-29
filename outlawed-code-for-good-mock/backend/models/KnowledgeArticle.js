const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    actsAndSections: [{ type: String }],
    summary: {
      type: String,
      required: true,
    },
    provisionsAndRights: {
      type: String,
      required: true,
    },
    proceduralChecklist: [{ type: String }],
    requiredEvidence: [{ type: String }],
    precedents: [
      {
        caseTitle: { type: String, required: true },
        court: { type: String, default: 'Supreme Court of India' },
        year: { type: Number },
        rulingSummary: { type: String, required: true },
        keyTakeaway: { type: String }
      }
    ],
    relevanceKeywords: [{ type: String }],
    embedding: [{ type: Number }],
  },
  {
    timestamps: true,
  }
);

knowledgeArticleSchema.index({ category: 1 });
knowledgeArticleSchema.index({ relevanceKeywords: 1 });

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
