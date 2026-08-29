const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');
const jwt = require('jsonwebtoken');

const SECRET = process.env.AUTH_SECRET || 'nyaayasetu_super_secret_jwt_key_2026';

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, SECRET, { expiresIn: '1d' });
}

async function runEndToEndTests() {
  const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
  await mongoose.connect(uri);
  console.log('--- STARTING FULL END-TO-END WORKFLOW INTEGRATION TEST ---');

  // 1. Fetch or create test users for all 3 roles
  const paralegal = await User.findOne({ role: { $in: ['PARALEGAL', 'nyaaya_mitra'] } });
  const caseManager = await User.findOne({ role: 'CASE_MANAGER' });
  const legalExpert = await User.findOne({ role: 'LEGAL_EXPERT' });

  if (!paralegal || !caseManager || !legalExpert) {
    throw new Error('Required roles not found in DB.');
  }

  console.log(`✓ Test Users:
   - Paralegal: ${paralegal.name} (${paralegal.email})
   - Case Manager: ${caseManager.name} (${caseManager.email})
   - Legal Expert: ${legalExpert.name} (${legalExpert.email})`);

  // 2. Create a test case as Paralegal
  const testCaseNumber = `TEST-${Date.now().toString().slice(-4)}`;
  const testCase = await Case.create({
    caseNumber: testCaseNumber,
    title: `Integration Test Case - Tenancy Violation & Eviction Threat`,
    description: 'Landlord threatened illegal eviction without statutory 30-day notice under Karnataka Rent Act.',
    facts: 'Beneficiary has paid rent regularly via bank transfers for 18 months.',
    priority: 'high',
    status: 'under_review',
    district: paralegal.district || 'Mandya',
    category: 'Land & Tenancy Dispute',
    client: {
      name: 'Ramesh Gowda',
      phone: '+91 98450 99887',
      age: 42,
      gender: 'Male',
      category: 'General / Backward Class',
      villageTaluk: 'Pandavapura',
      address: 'Near Old Bus Stand'
    },
    createdBy: paralegal._id,
    assignedTo: paralegal._id
  });

  console.log(`✓ Case created: ${testCase.caseNumber} ("${testCase.title}")`);

  // 3. Paralegal requests Legal Expert Escalation
  testCase.expertRequest = {
    isRequested: true,
    requestedAt: new Date(),
    reason: 'Urgent interim stay application required before Civil Judge Junior Division.',
    urgency: 'urgent',
    status: 'pending_review'
  };
  await testCase.save();
  console.log(`✓ Paralegal submitted Legal Expert Escalation (status: pending_review)`);

  // 4. Verify Case Manager sees this in the pending escalation queue
  const pendingRequestsBefore = await Case.find({
    'expertRequest.isRequested': true,
    'expertRequest.status': 'pending_review',
    district: testCase.district
  });
  const foundInQueue = pendingRequestsBefore.some(r => r._id.toString() === testCase._id.toString());
  console.log(`✓ Case Manager queue count: ${pendingRequestsBefore.length} (Contains test case: ${foundInQueue})`);
  if (!foundInQueue) throw new Error('Test case not found in pending expert requests queue');

  // 5. Case Manager assigns/allocates the Legal Expert
  testCase.assignedExpert = legalExpert._id;
  testCase.status = 'assigned_expert';
  testCase.expertRequest.status = 'approved_assigned';
  testCase.expertRequest.reviewedBy = caseManager._id;
  testCase.expertRequest.reviewNote = `Assigned to Senior Counsel ${legalExpert.name} for stay drafting.`;
  testCase.updates.push({
    author: caseManager._id,
    authorName: caseManager.name,
    authorRole: 'case_manager',
    title: 'Legal Expert Escalation Approved & Assigned',
    note: `Assigned to ${legalExpert.name}`,
    date: new Date(),
    updateType: 'expert_escalation'
  });
  await testCase.save();
  console.log(`✓ Case Manager allocated Legal Expert: ${legalExpert.name} (expertRequest.status -> approved_assigned)`);

  // 6. Verify case is REMOVED from Case Manager's pending escalation queue
  const pendingRequestsAfter = await Case.find({
    'expertRequest.isRequested': true,
    'expertRequest.status': 'pending_review',
    district: testCase.district
  });
  const stillInQueue = pendingRequestsAfter.some(r => r._id.toString() === testCase._id.toString());
  console.log(`✓ Case Manager queue count after allocation: ${pendingRequestsAfter.length} (Contains test case: ${stillInQueue})`);
  if (stillInQueue) throw new Error('Allocated case still in pending escalation queue!');

  // 7. Verify Legal Expert sees the case in active caseload
  const expertCases = await Case.find({
    assignedExpert: legalExpert._id,
    status: { $nin: ['resolved', 'closed'] }
  });
  const expertHasCase = expertCases.some(c => c._id.toString() === testCase._id.toString());
  console.log(`✓ Legal Expert active cases count: ${expertCases.length} (Contains test case: ${expertHasCase})`);
  if (!expertHasCase) throw new Error('Legal expert cannot see assigned case!');

  // 8. Legal Expert provides formal opinion and statutes
  testCase.expertGuidance.push({
    expert: legalExpert._id,
    expertName: legalExpert.name,
    statutesAndSections: ['Karnataka Rent Act 1999 - Section 27', 'Specific Relief Act 1963 - Section 38'],
    formalOpinion: 'The tenant cannot be dispossessed without due process of law. Recommend filing an urgent civil suit for perpetual injunction restraining the landlord from illegal eviction.',
    recommendedActions: [
      'Issue formal legal notice under Section 106 Transfer of Property Act',
      'File application for temporary injunction with affidavit under Order 39 Rules 1 & 2 CPC'
    ],
    draftingSuggestions: 'Attach rent receipts and electricity utility bills as Exhibit A-1.',
    aiSuggestionsReviewed: true,
    aiReviewFeedback: 'Verified statutory grounds against Karnataka High Court precedent (2022).',
    createdAt: new Date()
  });
  testCase.status = 'hearing_scheduled';
  testCase.updates.push({
    author: legalExpert._id,
    authorName: legalExpert.name,
    authorRole: 'legal_expert',
    title: 'Legal Expert Guidance Provided',
    note: 'Formal legal guidance recorded with statutory citations.',
    date: new Date(),
    updateType: 'expert_opinion'
  });
  await testCase.save();
  console.log(`✓ Legal Expert dispatched formal opinion & statutory citations`);

  // 9. Verify Paralegal can access the expert guidance on the case
  const updatedCaseForParalegal = await Case.findById(testCase._id).populate('expertGuidance.expert');
  if (!updatedCaseForParalegal.expertGuidance || updatedCaseForParalegal.expertGuidance.length === 0) {
    throw new Error('Expert guidance not found on case for paralegal view!');
  }
  console.log(`✓ Paralegal retrieved Case with Expert Guidance:
     - Expert Name: ${updatedCaseForParalegal.expertGuidance[0].expertName}
     - Statutes: ${updatedCaseForParalegal.expertGuidance[0].statutesAndSections.join(', ')}
     - Opinion: "${updatedCaseForParalegal.expertGuidance[0].formalOpinion.slice(0, 70)}..."`);

  // 10. Mark case as Resolved & Disposed
  updatedCaseForParalegal.status = 'resolved';
  updatedCaseForParalegal.updates.push({
    author: legalExpert._id,
    authorName: legalExpert.name,
    authorRole: 'legal_expert',
    title: 'Case Resolved & Injunction Granted',
    note: 'Interim injunction obtained from Principal Civil Judge. Landlord restrained.',
    date: new Date(),
    updateType: 'status_change'
  });
  await updatedCaseForParalegal.save();
  console.log(`✓ Case marked as RESOLVED & DISPOSED`);

  // 11. Verify case is present in Previous Cases vault for all roles
  const previousCasesVault = await Case.find({ status: { $in: ['resolved', 'closed'] } });
  const inVault = previousCasesVault.some(c => c._id.toString() === testCase._id.toString());
  console.log(`✓ Previous Cases Vault total count: ${previousCasesVault.length} (Contains test case: ${inVault})`);
  if (!inVault) throw new Error('Resolved case not found in previous cases vault!');

  // Cleanup test case
  await Case.findByIdAndDelete(testCase._id);
  console.log(`✓ Cleaned up test case ${testCase.caseNumber}`);

  console.log('--- ALL 11 WORKFLOW STEPS PASSED SUCCESSFULLY! ---');
  await mongoose.disconnect();
}

runEndToEndTests().catch(err => {
  console.error('❌ E2E Test Failed:', err);
  process.exit(1);
});
