const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  docType: { 
    type: String, 
    default: 'Other',
    enum: [
      'Aadhaar / ID Proof',
      'FIR / Police Complaint',
      'Land Title / Patta / Revenue Record',
      'Medical Report / Certificate',
      'Salary / Wage Slip / Bank Statement',
      'Legal Notice',
      'Court Order / Summons',
      'Field Photo / Evidence',
      'Affidavit',
      'Other'
    ]
  },
  fileName: { type: String, required: true },
  fileData: { type: String, default: '' }, // base64 or link
  fileSize: { type: String, default: '120 KB' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploaderName: { type: String, default: 'Nyaaya Mitra' },
  uploadedAt: { type: Date, default: Date.now }
});

const fieldVisitSchema = new mongoose.Schema({
  visitDate: { type: Date, default: Date.now },
  officerName: { type: String, required: true },
  location: { type: String, required: true },
  beneficiaryStatement: { type: String, default: '' },
  observations: { type: String, required: true },
  evidenceNotes: { type: String, default: '' },
  actionRecommended: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
});

const caseUpdateSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String, default: 'System' },
  authorRole: { type: String, default: 'nyaaya_mitra' },
  title: { type: String, required: true },
  note: { type: String, required: true },
  date: { type: Date, default: Date.now },
  updateType: {
    type: String,
    enum: ['field_work', 'status_change', 'hearing_note', 'document_added', 'expert_escalation', 'expert_opinion', 'general'],
    default: 'field_work'
  }
});

const expertGuidanceSchema = new mongoose.Schema({
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  expertName: { type: String, required: true },
  statutesAndSections: [{ type: String }],
  formalOpinion: { type: String, required: true },
  recommendedActions: [{ type: String }],
  draftingSuggestions: { type: String, default: '' },
  aiSuggestionsReviewed: { type: Boolean, default: false },
  aiReviewFeedback: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const caseSchema = new mongoose.Schema(
  {
    caseNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    caseId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Case title is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'PROPERTY',
    },
    client: {
      name: { type: String, default: 'Beneficiary' },
      age: { type: Number, default: 35 },
      gender: { type: String, default: 'Female' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      district: { type: String, default: 'Mandya' },
      villageTaluk: { type: String, default: '' },
      category: {
        type: String,
        default: 'General Legal Aid'
      }
    },
    description: {
      type: String,
      required: [true, 'Case description is required'],
    },
    facts: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'medium',
    },
    status: {
      type: String,
      default: 'ACTIVE',
    },
    district: {
      type: String,
      required: true,
      default: 'Mandya',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedExpert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    documents: [documentSchema],
    fieldVisits: [fieldVisitSchema],
    updates: [caseUpdateSchema],
    expertRequest: {
      isRequested: { type: Boolean, default: false },
      requestedAt: { type: Date },
      reason: { type: String, default: '' },
      urgency: {
        type: String,
        enum: ['standard', 'urgent', 'critical'],
        default: 'standard'
      },
      status: {
        type: String,
        enum: ['none', 'pending_review', 'approved_assigned', 'rejected'],
        default: 'none'
      },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reviewNote: { type: String, default: '' }
    },
    expertGuidance: [expertGuidanceSchema],
    aiAnalysis: {
      summary: { type: String, default: '' },
      applicableActs: [{ type: String }],
      suggestedRemedies: [{ type: String }],
      requiredDocuments: [{ type: String }],
      riskAssessment: { type: String, default: '' },
      similarityTags: [{ type: String }],
      generatedAt: { type: Date }
    },
    isDelayed: {
      type: Boolean,
      default: false,
    },
    deadlineDate: {
      type: Date,
      default: () => new Date(+new Date() + 14 * 24 * 60 * 60 * 1000) // Default 14 days
    },
    embedding: [{ type: Number }],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching & district filtering
caseSchema.index({ district: 1, priority: 1, status: 1 });
caseSchema.index({ 'client.category': 1 });

module.exports = mongoose.model('Case', caseSchema);
