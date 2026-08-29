const Case = require('../models/Case');
const User = require('../models/User');
const AILegalService = require('../services/aiLegalService');

// Helper to generate unique case numbers
const generateCaseNumber = async () => {
  const count = await Case.countDocuments();
  const year = new Date().getFullYear();
  const sequence = String(count + 1).padStart(3, '0');
  return `NY-${year}-${sequence}`;
};

// @desc    Get all cases with filter options
// @route   GET /api/cases
// @access  Private
const getCases = async (req, res, next) => {
  try {
    const { district, priority, status, category, search, scope } = req.query;
    const filter = {};

    // District filter
    if (district && district !== 'All' && district !== 'All Districts') {
      filter.district = district;
    }

    // Priority filter (high, medium, low)
    if (priority && priority !== 'all') {
      filter.priority = priority.toLowerCase();
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      filter['client.category'] = category;
    }

    // Scope filter (e.g., 'my_cases' or 'expert_assigned' or 'previous_cases')
    if (scope === 'previous_cases' || scope === 'solved_cases') {
      filter.status = { $in: ['resolved', 'closed'] };
    } else if (scope === 'my_cases' && req.user) {
      filter.$or = [{ assignedTo: req.user._id }, { createdBy: req.user._id }];
    } else if (scope === 'expert_assigned' && req.user) {
      filter.assignedExpert = req.user._id;
    } else if (scope === 'expert_requests') {
      filter['expertRequest.isRequested'] = true;
    }

    // Search query across caseNumber, title, client name, description
    if (search) {
      filter.$or = [
        { caseNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { 'client.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const cases = await Case.find(filter)
      .populate('assignedTo', 'name role phone district email')
      .populate('assignedExpert', 'name specialization phone email')
      .populate('createdBy', 'name role')
      .sort({ priority: -1, createdAt: -1 });

    res.json({ count: cases.length, cases });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single case by ID
// @route   GET /api/cases/:id
// @access  Private
const getCaseById = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id)
      .populate('assignedTo', 'name email role phone district metrics')
      .populate('assignedExpert', 'name email specialization phone')
      .populate('createdBy', 'name email role')
      .populate('expertRequest.reviewedBy', 'name role')
      .populate('expertGuidance.expert', 'name specialization');

    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    res.json({ case: legalCase });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new legal aid case (Nyaaya Mitra Intake)
// @route   POST /api/cases
// @access  Private
const createCase = async (req, res, next) => {
  try {
    const {
      title,
      client,
      description,
      facts,
      priority = 'medium',
      district,
      documents = [],
      fieldVisits = []
    } = req.body;

    if (!title || !description || !client?.name) {
      return res.status(400).json({ error: { message: 'Title, client name, and description are required.' } });
    }

    const caseNumber = await generateCaseNumber();
    const caseDistrict = district || client.district || req.user?.district || 'Bengaluru Urban';

    // 1. Initial automatic AI Legal Analysis via RAG
    const aiAnalysis = await AILegalService.analyzeCase({
      title,
      description,
      facts,
      category: client.category,
      client,
      priority
    });

    // 2. Build case object
    const newCase = new Case({
      caseNumber,
      title,
      client: {
        name: client.name,
        age: Number(client.age) || 30,
        gender: client.gender || 'Female',
        phone: client.phone || '',
        address: client.address || '',
        district: caseDistrict,
        villageTaluk: client.villageTaluk || '',
        category: client.category || 'General Legal Aid'
      },
      description,
      facts: facts || '',
      priority: priority.toLowerCase(),
      status: fieldVisits.length > 0 ? 'field_visit_completed' : 'submitted',
      district: caseDistrict,
      createdBy: req.user?._id,
      assignedTo: req.user?._id,
      documents: documents.map(d => ({
        ...d,
        uploadedBy: req.user?._id,
        uploaderName: req.user?.name || 'Nyaaya Mitra'
      })),
      fieldVisits: fieldVisits.map(fv => ({
        ...fv,
        officerName: fv.officerName || req.user?.name || 'Nyaaya Mitra'
      })),
      updates: [
        {
          author: req.user?._id,
          authorName: req.user?.name || 'Nyaaya Mitra',
          authorRole: req.user?.role || 'nyaaya_mitra',
          title: 'Case Intake Registered',
          note: `New legal aid case created with priority: ${priority.toUpperCase()}. AI initial analysis generated.`,
          date: new Date(),
          updateType: 'field_work'
        }
      ],
      aiAnalysis
    });

    const savedCase = await newCase.save();

    // Increment user metrics
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          'metrics.casesHandled': 1,
          'metrics.pendingCases': 1,
          'metrics.fieldVisitsCount': fieldVisits.length
        }
      });
    }

    res.status(201).json({
      message: 'Case successfully created',
      case: savedCase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update case details or priority
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const { title, description, facts, priority, status, client, district } = req.body;

    const oldPriority = legalCase.priority;
    const oldStatus = legalCase.status;

    if (title) legalCase.title = title;
    if (description) legalCase.description = description;
    if (facts !== undefined) legalCase.facts = facts;
    if (priority) legalCase.priority = priority.toLowerCase();
    if (status) legalCase.status = status;
    if (district) legalCase.district = district;
    if (client) {
      legalCase.client = { ...legalCase.client.toObject(), ...client };
    }

    // Log priority / status changes into timeline
    if (priority && priority.toLowerCase() !== oldPriority) {
      legalCase.updates.push({
        author: req.user?._id,
        authorName: req.user?.name || 'User',
        authorRole: req.user?.role || 'nyaaya_mitra',
        title: 'Priority Updated',
        note: `Case priority changed from ${oldPriority.toUpperCase()} to ${priority.toUpperCase()}.`,
        date: new Date(),
        updateType: 'status_change'
      });
    }

    if (status && status !== oldStatus) {
      legalCase.updates.push({
        author: req.user?._id,
        authorName: req.user?.name || 'User',
        authorRole: req.user?.role || 'nyaaya_mitra',
        title: 'Status Updated',
        note: `Case status changed to ${status.replace('_', ' ').toUpperCase()}.`,
        date: new Date(),
        updateType: 'status_change'
      });

      if (status === 'resolved' && legalCase.assignedTo) {
        await User.findByIdAndUpdate(legalCase.assignedTo, {
          $inc: { 'metrics.resolvedCount': 1, 'metrics.pendingCases': -1 }
        });
      }
    }

    const updatedCase = await legalCase.save();
    res.json({ message: 'Case updated successfully', case: updatedCase });
  } catch (error) {
    next(error);
  }
};

// @desc    Add field visit record to case
// @route   POST /api/cases/:id/field-visits
// @access  Private
const addFieldVisit = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const {
      visitDate = new Date(),
      officerName = req.user?.name || 'Nyaaya Mitra',
      location,
      beneficiaryStatement = '',
      observations,
      evidenceNotes = '',
      actionRecommended = ''
    } = req.body;

    if (!location || !observations) {
      return res.status(400).json({ error: { message: 'Location and observations are required for field visit.' } });
    }

    const newVisit = {
      visitDate,
      officerName,
      location,
      beneficiaryStatement,
      observations,
      evidenceNotes,
      actionRecommended,
      recordedAt: new Date()
    };

    legalCase.fieldVisits.push(newVisit);
    legalCase.status = 'field_visit_completed';

    // Add timeline log
    legalCase.updates.push({
      author: req.user?._id,
      authorName: officerName,
      authorRole: req.user?.role || 'nyaaya_mitra',
      title: 'Field Visit Conducted',
      note: `Field visit conducted at ${location}. Observations: "${observations.slice(0, 100)}..."`,
      date: new Date(),
      updateType: 'field_work'
    });

    await legalCase.save();

    // Increment user metrics
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'metrics.fieldVisitsCount': 1 }
      });
    }

    res.status(201).json({
      message: 'Field visit recorded successfully',
      case: legalCase
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add timeline update / progress note
// @route   POST /api/cases/:id/updates
// @access  Private
const addCaseUpdate = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const { title, note, updateType = 'field_work' } = req.body;

    if (!title || !note) {
      return res.status(400).json({ error: { message: 'Title and note are required.' } });
    }

    legalCase.updates.push({
      author: req.user?._id,
      authorName: req.user?.name || 'User',
      authorRole: req.user?.role || 'nyaaya_mitra',
      title,
      note,
      date: new Date(),
      updateType
    });

    await legalCase.save();
    res.status(201).json({ message: 'Progress update logged', case: legalCase });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document to case
// @route   POST /api/cases/:id/documents
// @access  Private
const addDocument = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const { title, docType = 'Other', fileName, fileData = '', fileSize = '250 KB' } = req.body;

    if (!title || !fileName) {
      return res.status(400).json({ error: { message: 'Document title and file name are required.' } });
    }

    const newDoc = {
      title,
      docType,
      fileName,
      fileData,
      fileSize,
      uploadedBy: req.user?._id,
      uploaderName: req.user?.name || 'Nyaaya Mitra',
      uploadedAt: new Date()
    };

    legalCase.documents.push(newDoc);
    legalCase.updates.push({
      author: req.user?._id,
      authorName: req.user?.name || 'User',
      authorRole: req.user?.role || 'nyaaya_mitra',
      title: 'Legal Document Uploaded',
      note: `Uploaded "${title}" (${docType} - ${fileName}) to document vault.`,
      date: new Date(),
      updateType: 'document_added'
    });

    await legalCase.save();
    res.status(201).json({ message: 'Document uploaded successfully', case: legalCase });
  } catch (error) {
    next(error);
  }
};

// @desc    Nyaaya Mitra requests Legal Expert escalation
// @route   POST /api/cases/:id/request-expert
// @access  Private
const requestLegalExpert = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const { reason, urgency = 'standard' } = req.body;

    legalCase.expertRequest = {
      isRequested: true,
      requestedAt: new Date(),
      reason: reason || 'Legal Expert guidance requested by Nyaaya Mitra for complex statutory compliance.',
      urgency,
      status: 'pending_review'
    };

    legalCase.updates.push({
      author: req.user?._id,
      authorName: req.user?.name || 'Nyaaya Mitra',
      authorRole: 'nyaaya_mitra',
      title: 'Legal Expert Escalation Requested',
      note: `Escalation requested (Urgency: ${urgency.toUpperCase()}). Reason: ${reason}`,
      date: new Date(),
      updateType: 'expert_escalation'
    });

    await legalCase.save();
    res.json({ message: 'Escalation request submitted to District Case Manager', case: legalCase });
  } catch (error) {
    next(error);
  }
};

// @desc    Legal Expert submits formal advice & reviews AI suggestions
// @route   POST /api/cases/:id/expert-guidance
// @access  Private
const provideExpertGuidance = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const {
      statutesAndSections = [],
      formalOpinion,
      recommendedActions = [],
      draftingSuggestions = '',
      aiSuggestionsReviewed = true,
      aiReviewFeedback = ''
    } = req.body;

    if (!formalOpinion) {
      return res.status(400).json({ error: { message: 'Formal legal opinion is required.' } });
    }

    const newGuidance = {
      expert: req.user?._id,
      expertName: req.user?.name || 'Adv. Legal Counsel',
      statutesAndSections,
      formalOpinion,
      recommendedActions,
      draftingSuggestions,
      aiSuggestionsReviewed,
      aiReviewFeedback,
      createdAt: new Date()
    };

    legalCase.expertGuidance.push(newGuidance);
    legalCase.status = 'hearing_scheduled';

    legalCase.updates.push({
      author: req.user?._id,
      authorName: req.user?.name || 'Legal Expert',
      authorRole: 'legal_expert',
      title: 'Legal Expert Guidance Provided',
      note: `Formal guidance provided by ${req.user?.name}. AI suggestions reviewed and approved.`,
      date: new Date(),
      updateType: 'expert_opinion'
    });

    await legalCase.save();
    res.status(201).json({ message: 'Legal guidance and recommendations recorded', case: legalCase });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Similar Historical Cases & RAG Precedents
// @route   GET /api/cases/:id/similar
// @access  Private
const getSimilarCases = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const results = await AILegalService.findSimilarCases(legalCase, legalCase._id);
    res.json(results);
  } catch (error) {
    next(error);
  }
};

// @desc    Run / Re-run AI Analysis on a Case
// @route   POST /api/cases/:id/ai-analyze
// @access  Private
const runAIAnalysis = async (req, res, next) => {
  try {
    const legalCase = await Case.findById(req.params.id);
    if (!legalCase) {
      return res.status(404).json({ error: { message: 'Case not found' } });
    }

    const analysis = await AILegalService.analyzeCase(legalCase);
    legalCase.aiAnalysis = analysis;
    await legalCase.save();

    res.json({ message: 'AI Analysis regenerated', aiAnalysis: analysis });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  addFieldVisit,
  addCaseUpdate,
  addDocument,
  requestLegalExpert,
  provideExpertGuidance,
  getSimilarCases,
  runAIAnalysis,
};
