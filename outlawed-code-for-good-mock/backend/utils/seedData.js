const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');
const KnowledgeArticle = require('../models/KnowledgeArticle');
const Document = require('../models/Document');
const DocumentChunk = require('../models/DocumentChunk');
const { processAndStoreDocument } = require('../services/documentChunkService');

const seedDatabase = async () => {
  try {
    console.log('Starting OutLawed Database Seeding...');

    // Clear existing data across all collections
    await User.deleteMany({});
    await Case.deleteMany({});
    await KnowledgeArticle.deleteMany({});
    await Document.deleteMany({});
    await DocumentChunk.deleteMany({});

    // 1. Create Core Users
    const users = await User.create([
      {
        name: 'Ravi Kumar',
        email: 'ravi@example.com',
        password: 'password123',
        role: 'PARALEGAL',
        district: 'Mandya',
        language: 'kn',
        phone: '+91 98451 22334',
        specialization: 'Paralegal Volunteer / Rural Land & Labor',
        metrics: {
          casesHandled: 28,
          fieldVisitsCount: 42,
          resolvedCount: 19,
          rating: 4.9,
          pendingCases: 9
        }
      },
      {
        name: 'Ravi Kumar',
        email: 'mitra@nyaaya.org',
        password: 'password123',
        role: 'PARALEGAL',
        district: 'Mandya',
        language: 'kn',
        phone: '+91 98451 22334',
        specialization: 'Paralegal Volunteer / Rural Land & Labor',
        metrics: {
          casesHandled: 28,
          fieldVisitsCount: 42,
          resolvedCount: 19,
          rating: 4.9,
          pendingCases: 9
        }
      },
      {
        name: 'Pooja Rao',
        email: 'pooja.mitra@nyaaya.org',
        password: 'password123',
        role: 'nyaaya_mitra',
        district: 'Bengaluru Urban',
        phone: '+91 97412 88765',
        specialization: 'Paralegal Volunteer / Women & Child Welfare',
        metrics: {
          casesHandled: 22,
          fieldVisitsCount: 35,
          resolvedCount: 16,
          rating: 4.8,
          pendingCases: 6
        }
      },
      {
        name: 'Manoj Patil',
        email: 'manoj.mitra@nyaaya.org',
        password: 'password123',
        role: 'nyaaya_mitra',
        district: 'Mysuru',
        phone: '+91 94480 33211',
        specialization: 'Paralegal Volunteer / Scheduled Castes & Tribe Welfare',
        metrics: {
          casesHandled: 18,
          fieldVisitsCount: 26,
          resolvedCount: 12,
          rating: 4.7,
          pendingCases: 6
        }
      },
      {
        name: 'Sunita Sharma',
        email: 'manager@nyaaya.org',
        password: 'password123',
        role: 'case_manager',
        district: 'Bengaluru Urban',
        phone: '+91 94490 55667',
        specialization: 'District Legal Aid Coordinator / DLSA Secretary',
        metrics: {
          casesHandled: 145,
          fieldVisitsCount: 12,
          resolvedCount: 98,
          rating: 4.9,
          pendingCases: 47
        }
      },
      {
        name: 'Adv. Rajesh Verma',
        email: 'expert@nyaaya.org',
        password: 'password123',
        role: 'legal_expert',
        district: 'Bengaluru Urban',
        phone: '+91 98800 77889',
        specialization: 'High Court Senior Counsel / Land & Constitutional Law',
        metrics: {
          casesHandled: 64,
          fieldVisitsCount: 4,
          resolvedCount: 52,
          rating: 5.0,
          pendingCases: 12
        }
      },
      {
        name: 'Adv. Meenakshi Sundaram',
        email: 'meenakshi.expert@nyaaya.org',
        password: 'password123',
        role: 'legal_expert',
        district: 'Bengaluru Urban',
        phone: '+91 98450 66554',
        specialization: 'Senior Advocate / Domestic Violence & Labor Protection',
        metrics: {
          casesHandled: 58,
          fieldVisitsCount: 6,
          resolvedCount: 48,
          rating: 4.9,
          pendingCases: 10
        }
      },
      {
        name: 'System Administrator',
        email: 'admin@nyaaya.org',
        password: 'password123',
        role: 'admin',
        district: 'All Districts',
        phone: '+91 99000 11223',
        specialization: 'State Legal Services Authority Portal Administrator',
        metrics: {
          casesHandled: 0,
          fieldVisitsCount: 0,
          resolvedCount: 0,
          rating: 5.0,
          pendingCases: 0
        }
      }
    ]);

    const raviUser = users[0];
    const poojaUser = users[1];
    const sunitaUser = users[3];
    const rajeshExpert = users[4];
    const meenakshiExpert = users[5];

    // 2. Create Statutory Knowledge Base Articles (for RAG)
    await KnowledgeArticle.create([
      {
        title: 'Protection of Women from Domestic Violence Act (PWDVA), 2005 - Practical Guide',
        category: 'Domestic Violence & Maintenance',
        actsAndSections: [
          'PWDVA 2005 - Section 12 (Application to Magistrate)',
          'PWDVA 2005 - Section 18 (Protection Orders)',
          'PWDVA 2005 - Section 19 (Residence Orders & Right to Shared Household)',
          'PWDVA 2005 - Section 20 & 22 (Monetary Relief & Compensation Orders)',
          'CrPC 125 / BNSS Section 144 (Right of Wife and Children to Monthly Maintenance)'
        ],
        summary: 'Comprehensive legal toolkit for paralegals aiding women facing domestic cruelty, physical or economic abuse, and illegal eviction from shared domestic households.',
        provisionsAndRights: 'Every woman residing in a domestic relationship in a shared household is entitled to free protection, stay orders against dispossession, emergency shelter admission, medical care, and monthly maintenance assistance through DLSA panel advocates.',
        proceduralChecklist: [
          'Draft and file Domestic Incident Report (DIR) with Protection Officer',
          'Submit Affidavit of Disclosure of Assets & Liabilities (Rajnesh v. Neha compliance)',
          'Pray for emergency ex-parte interim relief under Section 18 & 19 within 3 days of filing',
          'Connect with One Stop Centre (Sakhi) for emergency shelter and counseling'
        ],
        requiredEvidence: [
          'Marriage proof / Shared household utility bills / Voter ID',
          'Medical injury certificate / MLC copy from government hospital',
          'Protection Officer (PO) verification statement'
        ],
        precedents: [
          {
            caseTitle: 'Rajnesh v. Neha & Anr.',
            court: 'Supreme Court of India',
            year: 2020,
            rulingSummary: 'Supreme Court laid down binding pan-India guidelines for uniform maintenance determination, mandating mandatory asset affidavits to prevent trial delay.',
            keyTakeaway: 'Interim maintenance must be awarded from date of application, not date of final order.'
          },
          {
            caseTitle: 'Satish Chander Ahuja v. Sneha Ahuja',
            court: 'Supreme Court of India',
            year: 2020,
            rulingSummary: 'Overruled previous restrictive precedent; held that daughter-in-law has enforceable right of residence in shared household owned by in-laws.',
            keyTakeaway: 'Woman cannot be evicted from matrimonial home without following due process of law.'
          }
        ],
        relevanceKeywords: ['domestic violence', 'pwdva', 'cruelty', 'maintenance', 'husband', 'eviction', 'shared household', 'dowry']
      },
      {
        title: 'Agricultural Land Title Protection & Illegal Encroachment Remedies',
        category: 'Land & Tenancy Dispute',
        actsAndSections: [
          'Specific Relief Act, 1963 - Section 6 (Summary Suit for Dispossession)',
          'State Land Revenue Act - Sections on Mutation, Survey & Tahsildar Inquiries',
          'Scheduled Tribes & Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006',
          'Transfer of Property Act, 1882 - Section 52 & 53A (Doctrine of Part Performance & Lis Pendens)'
        ],
        summary: 'Procedural guidance for small and marginal farmers resisting illegal dispossession, boundary tampering, forged sale deeds, and revenue record tampering.',
        provisionsAndRights: 'Dispossessed persons can file a summary suit under Section 6 Specific Relief Act within 6 months of illegal dispossession. Title does not need to be proven in Section 6 proceedings; only prior peaceful possession and unlawful eviction.',
        proceduralChecklist: [
          'Obtain certified 15-year Record of Rights (RTC/Pahani) and Village Map Extract',
          'Lodge police complaint for criminal trespass (BNS 329 / IPC 447) and obtain CSR/FIR',
          'File representation before Tahsildar / Assistant Commissioner for immediate boundary survey',
          'Initiate DLSA Pre-Litigation Mediation or Suit for Permanent Injunction'
        ],
        requiredEvidence: [
          'Record of Rights (RTC) / Patta Passbook / Grant Certificate',
          'Land Tax (Kist) receipts for last 5 consecutive years',
          'Photographs / Geo-tagged drone footage of current agricultural standing crops',
          'Neighboring landholder boundary confirmation affidavits'
        ],
        precedents: [
          {
            caseTitle: 'Poona Ram v. Moti Ram & Ors.',
            court: 'Supreme Court of India',
            year: 2019,
            rulingSummary: 'Held that continuous, uninterrupted peaceful possession gives better possessory title against anyone except the rightful owner.',
            keyTakeaway: 'Even a trespasser cannot be evicted by brute force; lawful eviction decree mandatory.'
          }
        ],
        relevanceKeywords: ['land', 'patta', 'rtc', 'encroachment', 'farmer', 'tahsildar', 'dispossession', 'crops', 'boundary']
      },
      {
        title: 'Unorganised & Migrant Workers Wage Recovery Framework',
        category: 'Labor & Wage Exploitation',
        actsAndSections: [
          'Code on Wages, 2019 / Minimum Wages Act, 1948',
          'Payment of Wages Act, 1936 - Section 15 (Claims & 10x Compensation Penalty)',
          'Contract Labour (Regulation and Abolition) Act, 1970 - Section 21',
          'Building and Other Construction Workers (BOCW) Act, 1996'
        ],
        summary: 'Enforcement protocol for paralegal volunteers recovering withheld wages, minimum wage shortfalls, and overtime compensation for construction and unorganised workers.',
        provisionsAndRights: 'If a contractor fails to pay wages within the statutory period, the Principal Employer is legally bound to disburse wages directly. Section 15 allows recovery with up to ten times compensation.',
        proceduralChecklist: [
          'Prepare worker attendance roster and wage calculation sheet',
          'Serve formal 7-day Demand Notice on Contractor and Principal Employer',
          'File claim petition before Assistant Labour Commissioner / Payment of Wages Authority',
          'Register unorganized workers on e-Shram portal for social security eligibility'
        ],
        requiredEvidence: [
          'Contractor ID card / Worksite gate entry pass',
          'Bank statement showing missing salary deposits',
          'WhatsApp messages / audio recordings acknowledging wage dues',
          'Joint claim application signed by affected co-workers'
        ],
        precedents: [
          {
            caseTitle: 'People\'s Union for Democratic Rights (PUDR) v. Union of India',
            court: 'Supreme Court of India',
            year: 1982,
            rulingSummary: 'Asiad Workers Landmark Ruling: Supreme Court held that paying less than minimum wage amounts to "forced labour" violative of Article 23 of Constitution.',
            keyTakeaway: 'Non-payment of statutory minimum wage is a direct fundamental rights violation.'
          }
        ],
        relevanceKeywords: ['labor', 'wages', 'construction', 'contractor', 'minimum wages', 'unpaid', 'migrant worker', 'bocw']
      }
    ]);

    // 3. Create Rich Legal Aid Cases with Documents, Field Visits, Updates, Expert Guidance, and AI Analysis
    await Case.create([
      {
        caseNumber: 'NY-2026-001',
        title: 'Illegal Encroachment & Crop Destruction on Ancestral 2-Acre Patta Land',
        client: {
          name: 'Basavarajappa Gowda',
          age: 58,
          gender: 'Male',
          phone: '+91 98450 11982',
          address: 'Hulimavu Village, Doddaballapura Taluk',
          district: 'Bengaluru Urban',
          villageTaluk: 'Doddaballapura',
          category: 'Land & Tenancy Dispute'
        },
        description: 'Client is a marginal farmer holding 2 acres of ancestral agricultural land under Patta No. 142/3. Local real estate developers along with musclemen bulldozed standing ragi crops on the northern border, claiming the land falls under government gomala land and attempting to construct an illegal boundary wall.',
        facts: 'Continuous peaceful possession for over 42 years documented via RTC extracts and revenue tax receipts. The developer forged a survey sketch without serving mandatory notice to adjoining landholders.',
        priority: 'high',
        status: 'assigned_expert',
        district: 'Bengaluru Urban',
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        assignedExpert: rajeshExpert._id,
        documents: [
          {
            title: 'Ancestral Patta Grant & RTC Record (15 Years)',
            docType: 'Land Title / Patta / Revenue Record',
            fileName: 'RTC_Extract_142_3_Doddaballapura.pdf',
            fileData: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
            fileSize: '1.4 MB',
            uploadedBy: raviUser._id,
            uploaderName: 'Ravi Kumar (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Police CSR Complaint on Bulldozing & Threat',
            docType: 'FIR / Police Complaint',
            fileName: 'CSR_Complaint_Trespass_Police.pdf',
            fileSize: '420 KB',
            uploadedBy: raviUser._id,
            uploaderName: 'Ravi Kumar (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Geotagged Photographs of Destroyed Ragi Crops',
            docType: 'Field Photo / Evidence',
            fileName: 'Field_Damage_Photo_NorthBorder.jpg',
            fileSize: '2.8 MB',
            uploadedBy: raviUser._id,
            uploaderName: 'Ravi Kumar (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            officerName: 'Ravi Kumar',
            location: 'Survey No. 142/3, Hulimavu Village',
            beneficiaryStatement: 'The developers arrived with earthmovers at 6 AM without any revenue officer present. When my son objected, they threatened him with dire consequences.',
            observations: 'Inspected boundary stones. Northern stone clearly dislodged by heavy machinery. Standing ragi crop across 35 guntas completely leveled.',
            evidenceNotes: 'Collected GPS coordinates of damaged plot; verified tax receipt copies shown by village accountant.',
            actionRecommended: 'High priority injunction suit required; submit emergency complaint to Tahsildar and DLSA Coordinator.',
            recordedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [
          {
            author: raviUser._id,
            authorName: 'Ravi Kumar',
            authorRole: 'nyaaya_mitra',
            title: 'Initial Case Intake & Field Spot Visit Completed',
            note: 'Visited spot, recorded statement of farmer Basavarajappa, collected RTC extracts and lodged CSR at local police station.',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            updateType: 'field_work'
          },
          {
            author: raviUser._id,
            authorName: 'Ravi Kumar',
            authorRole: 'nyaaya_mitra',
            title: 'Legal Expert Escalation Requested',
            note: 'Due to imminent threat of concrete wall construction, requested Senior Advocate guidance on Section 6 Specific Relief injunction petition.',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updateType: 'expert_escalation'
          },
          {
            author: sunitaUser._id,
            authorName: 'Sunita Sharma',
            authorRole: 'case_manager',
            title: 'Assigned to Senior Legal Expert Adv. Rajesh Verma',
            note: 'Reviewed urgency of land grabbing case. Approved escalation and assigned to Adv. Rajesh Verma for immediate injunction drafting.',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            updateType: 'status_change'
          }
        ],
        expertRequest: {
          isRequested: true,
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          reason: 'Imminent threat of irreversible construction on agricultural land; requires urgent civil court interim stay order drafting.',
          urgency: 'critical',
          status: 'approved_assigned',
          reviewedBy: sunitaUser._id,
          reviewNote: 'Approved. Urgent injunction petition required before Principal Civil Judge.'
        },
        expertGuidance: [
          {
            expert: rajeshExpert._id,
            expertName: 'Adv. Rajesh Verma',
            statutesAndSections: [
              'Specific Relief Act 1963 - Section 6 (Summary Possession Suit)',
              'Code of Civil Procedure (CPC) - Order 39 Rules 1 & 2 (Temporary Injunction)',
              'Karnataka Land Revenue Act 1964 - Section 192A (Encroachment on agricultural tenure)'
            ],
            formalOpinion: 'The client holds strong, continuous documentary evidence of possession through 15-year RTCs and land tax receipts. The developer has committed unlawful dispossessory acts without notice. We should immediately move the Civil Court under Order 39 Rules 1 & 2 CPC for an ex-parte ad-interim injunction restraining any further construction or interference with peaceful possession.',
            recommendedActions: [
              'File Plaint and Interim Application (IA-1) under Order 39 Rules 1 & 2 in Court of Senior Civil Judge, Bengaluru Rural.',
              'Issue urgent statutory notice under Section 80 CPC / representation to Tahsildar to depute ADLR (Assistant Director of Land Records) for official demarcation.',
              'Submit copy of civil suit filing to local Police Sub-Inspector to maintain status quo at the spot.'
            ],
            draftingSuggestions: 'Draft IA-1 specifically emphasizing the immediate irreparable injury caused by crop destruction and loss of livelihood under Article 21.',
            aiSuggestionsReviewed: true,
            aiReviewFeedback: 'AI analysis accurately identified Section 6 Specific Relief provisions and Poona Ram precedent. Verified and incorporated into formal drafting strategy.',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
          }
        ],
        aiAnalysis: {
          summary: 'High priority land encroachment case involving marginal farmer holding continuous 42-year documented title. Threat of permanent boundary wall construction requires immediate ad-interim injunction.',
          applicableActs: [
            'Specific Relief Act, 1963 - Section 6',
            'Code of Civil Procedure, 1908 - Order 39 Rules 1 & 2',
            'State Land Revenue Code & Boundary Demarcation Rules',
            'Constitution of India - Article 21 & 300A'
          ],
          suggestedRemedies: [
            'Immediate Ex-Parte Ad-Interim Injunction under Order 39 CPC',
            'ADLR Survey Demarcation representation before Tahsildar',
            'Police protection application to preserve crop possession'
          ],
          requiredDocuments: [
            'Certified 15-year RTC (Record of Rights)',
            'Tax payment receipts for last 5 years',
            'Photographs with time and GPS stamp of destroyed crops',
            'Copy of Police CSR Complaint'
          ],
          riskAssessment: 'CRITICAL / HIGH RISK: Immediate physical construction threatened. Ex-parte stay mandatory within 48 hours.',
          similarityTags: ['Land & Tenancy Dispute', 'Encroachment', 'Specific Relief', 'Temporary Injunction', 'Doddaballapura'],
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        isDelayed: false,
        deadlineDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        caseNumber: 'NY-2026-002',
        title: 'Domestic Abuse, Illegal Eviction & Maintenance for Mother of Two',
        client: {
          name: 'Lakshmi Devi',
          age: 32,
          gender: 'Female',
          phone: '+91 97410 99881',
          address: 'K.R. Puram Ward No. 12, Bengaluru Urban',
          district: 'Bengaluru Urban',
          villageTaluk: 'K.R. Puram',
          category: 'Domestic Violence & Maintenance'
        },
        description: 'Beneficiary subjected to habitual physical battery and dowry demands by husband and in-laws. Last night, beneficiary and her two minor children (ages 6 and 4) were locked out and physically ejected from matrimonial home without clothes, food, or shelter.',
        facts: 'Married for 8 years. Beneficiary has no independent source of income. Currently taking emergency refuge at a neighbor house. Husband earns Rs. 65,000/month as IT technician.',
        priority: 'high',
        status: 'field_visit_completed',
        district: 'Bengaluru Urban',
        createdBy: poojaUser._id,
        assignedTo: poojaUser._id,
        assignedExpert: meenakshiExpert._id,
        documents: [
          {
            title: 'Government Hospital MLC Wound Certificate',
            docType: 'Medical Report / Certificate',
            fileName: 'Govt_Hospital_MLC_Injury_Report.pdf',
            fileSize: '890 KB',
            uploadedBy: poojaUser._id,
            uploaderName: 'Pooja Rao (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Marriage Certificate & Children Birth Certificates',
            docType: 'Aadhaar / ID Proof',
            fileName: 'Marriage_Proof_BirthCerts.pdf',
            fileSize: '1.2 MB',
            uploadedBy: poojaUser._id,
            uploaderName: 'Pooja Rao (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            officerName: 'Pooja Rao',
            location: 'K.R. Puram Temporary Shelter',
            beneficiaryStatement: 'My husband beat me and snatched my phone. He threatened that if I step inside the house, he will set my belongings on fire. My children have not eaten properly.',
            observations: 'Contusions and bruises visible on beneficiary left arm and forehead. Accompanied her to Bowring Hospital for medical examination.',
            evidenceNotes: 'Obtained copy of MLC certificate and assisted in lodging complaint with Protection Officer at Sakhi One Stop Centre.',
            actionRecommended: 'High priority court intervention for Section 18 Protection and Section 19 Residence order.',
            recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [
          {
            author: poojaUser._id,
            authorName: 'Pooja Rao',
            authorRole: 'nyaaya_mitra',
            title: 'Medical Aid & Shelter Coordination',
            note: 'Ensured safe temporary shelter at Sakhi One Stop Centre; collected medical records and filed DIR Form-1 with Protection Officer.',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            updateType: 'field_work'
          }
        ],
        expertRequest: {
          isRequested: true,
          requestedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
          reason: 'Emergency Residence & Restraining Order required before Magistrate court within 24 hours to secure safe roof for mother and minor children.',
          urgency: 'critical',
          status: 'pending_review'
        },
        aiAnalysis: {
          summary: 'Critical domestic abuse case involving physical violence and unlawful ejection from matrimonial home with minor children. Direct entitlement to Section 18 Protection, Section 19 Residence, and Section 20 Interim Maintenance.',
          applicableActs: [
            'Protection of Women from Domestic Violence Act, 2005 - Section 12, 18, 19, 20',
            'BNSS / CrPC 125 (Monthly Maintenance for Wife and Minors)',
            'Legal Services Authorities Act 1987 (100% Free Legal Aid for Women)'
          ],
          suggestedRemedies: [
            'Ex-Parte Residence Order under Section 19 PWDVA',
            'Protection Order restraining husband from entering vicinity of shelter',
            'Interim Maintenance of Rs. 20,000/month under Section 20'
          ],
          requiredDocuments: [
            'DIR Form 1 from Protection Officer',
            'Medical Examination MLC Certificate',
            'Affidavit of Assets & Liabilities under Rajnesh v. Neha guidelines'
          ],
          riskAssessment: 'CRITICAL / HIGH RISK: Immediate physical security and accommodation support required.',
          similarityTags: ['Domestic Violence', 'Maintenance', 'Shared Household', 'Protection Order', 'PWDVA'],
          generatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        isDelayed: false,
        deadlineDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        caseNumber: 'NY-2026-003',
        title: 'Non-Payment of 3-Month Minimum Wages for 14 Migrant Construction Workers',
        client: {
          name: 'Shambu Mahato (Representing 14 Laborers)',
          age: 41,
          gender: 'Male',
          phone: '+91 96112 33445',
          address: 'Labor Camp, Hoodi Metro Site, Bengaluru Urban',
          district: 'Bengaluru Urban',
          villageTaluk: 'Hoodi',
          category: 'Labor & Wage Exploitation'
        },
        description: 'A cohort of 14 interstate migrant laborers from Bihar were hired by a subcontractor for civil construction works. Subcontractor absconded without paying 3 months of wages totaling Rs. 4,85,000. Principal contractor refusing to accept liability.',
        facts: 'Workers possess site gate passes and supervisor WhatsApp logs showing daily 10-hour shifts. Contractor deducted mess food charges but paid zero cash wages.',
        priority: 'high',
        status: 'under_review',
        district: 'Bengaluru Urban',
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        documents: [
          {
            title: '14 Workers Gate Pass & Roster Photo Records',
            docType: 'Salary / Wage Slip / Bank Statement',
            fileName: 'Worker_Rosters_GatePass_Hoodi.pdf',
            fileSize: '3.1 MB',
            uploadedBy: raviUser._id,
            uploaderName: 'Ravi Kumar (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            officerName: 'Ravi Kumar',
            location: 'Hoodi Labor Settlement',
            beneficiaryStatement: 'We have no money even to buy groceries or return back home for Chhath festival. Contractor switched off phone.',
            observations: 'Verified conditions of 14 workers at makeshift tin sheds. Verified supervisor muster roll registers.',
            evidenceNotes: 'Collected joint authorization letter signed by all 14 workers authorizing NyaayaSetu representation.',
            actionRecommended: 'Issue statutory 7-day Demand Notice to Principal Employer under Section 21 Contract Labour Act.',
            recordedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [
          {
            author: raviUser._id,
            authorName: 'Ravi Kumar',
            authorRole: 'nyaaya_mitra',
            title: 'Joint Claim Application Prepared',
            note: 'Compiled wage calculation matrix under Payment of Wages Act Section 15 claiming 10x penalty.',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            updateType: 'field_work'
          }
        ],
        aiAnalysis: {
          summary: 'Interstate migrant workers wage exploitation with absconding subcontractor. Principal Employer is statutorily liable under Section 21 of Contract Labour Act 1970 and Payment of Wages Act 1936.',
          applicableActs: [
            'Payment of Wages Act, 1936 - Section 15',
            'Contract Labour (Regulation & Abolition) Act, 1970 - Section 21',
            'Code on Wages, 2019 / Minimum Wages Act 1948',
            'Constitution of India - Article 23 (Prohibition of Forced Labour / Asiad Workers Precedent)'
          ],
          suggestedRemedies: [
            'Direct Statutory Demand Notice to Principal Developer',
            'Joint Claim Application before Assistant Labour Commissioner',
            'Emergency Ration support through District Civil Supplies Officer'
          ],
          requiredDocuments: [
            'Site entry gate passes',
            'Joint affidavit signed by 14 workers',
            'Itemized wage arrears calculation sheet'
          ],
          riskAssessment: 'HIGH PRIORITY: 14 families facing acute starvation and destitution. Speedy conciliation required.',
          similarityTags: ['Labor & Wage Exploitation', 'Migrant Workers', 'Payment of Wages', 'Principal Employer Liability'],
          generatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        isDelayed: false,
        deadlineDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        caseNumber: 'NY-2026-004',
        title: 'Arbitrary Rejection of Indira Gandhi National Widow Pension Scheme',
        client: {
          name: 'Gangamma Shivappa',
          age: 64,
          gender: 'Female',
          phone: '+91 94488 22119',
          address: 'Kadugodi Colony, Bengaluru Urban',
          district: 'Bengaluru Urban',
          villageTaluk: 'Kadugodi',
          category: 'Welfare & Pension Entitlements'
        },
        description: 'Client is an elderly widow living alone below the poverty line. Her monthly widow pension of Rs. 1,200 was abruptly terminated 6 months ago citing technical mismatch in Aadhaar and Death Certificate spelling.',
        facts: 'All primary documents verified. Local Jan Seva Kendra operator failed to upload correction documents.',
        priority: 'low',
        status: 'submitted',
        district: 'Bengaluru Urban',
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        documents: [
          {
            title: 'Death Certificate of Husband & BPL Ration Card',
            docType: 'Aadhaar / ID Proof',
            fileName: 'Death_Certificate_BPL_Card.pdf',
            fileSize: '650 KB',
            uploadedBy: raviUser._id,
            uploaderName: 'Ravi Kumar (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            officerName: 'Ravi Kumar',
            location: 'Kadugodi Beneficiary Home',
            beneficiaryStatement: 'I have visited the taluk office 5 times by walking 4 kilometers. Nobody answers my query.',
            observations: 'Beneficiary has genuine BPL card and original death certificate. Minor phonetic spelling difference in husband name.',
            evidenceNotes: 'Attested self-declaration affidavit prepared before notary.',
            actionRecommended: 'Submit grievance dossier to Tahsildar Social Welfare Section during weekly Lok Adalat.',
            recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [],
        aiAnalysis: {
          summary: 'Welfare entitlement denial due to trivial spelling discrepancy in administrative portal. Entitled to immediate pension restoration and back arrears under NSAP scheme.',
          applicableActs: [
            'National Social Assistance Programme (NSAP) Guidelines',
            'Right to Information (RTI) Act 2005',
            'Karnataka Sakala Services Act 2011 (Time-bound delivery of government services)'
          ],
          suggestedRemedies: [
            'Administrative rectification application before Tahsildar',
            'RTI Application for pension sanction file inspection',
            'Special Lok Adalat representation for senior citizen welfare'
          ],
          requiredDocuments: ['Aadhaar Card', 'BPL Card', 'Husband Death Certificate', 'Notarized Identity Affidavit'],
          riskAssessment: 'LOW / ROUTINE: Administrative correction achievable through Tahsildar Sakala portal representation.',
          similarityTags: ['Welfare & Pension Entitlements', 'Widow Pension', 'NSAP', 'BPL'],
          generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        isDelayed: false,
        deadlineDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
      },
      {
        caseNumber: 'NY-2026-005',
        title: 'Delayed Statutory Relief Disbursement for SC/ST PoA Caste Atrocity Victim',
        client: {
          name: 'Malleshappa Nagappa',
          age: 46,
          gender: 'Male',
          phone: '+91 94481 77665',
          address: 'Hunsur Taluk, Mysuru District',
          district: 'Mysuru',
          villageTaluk: 'Hunsur',
          category: 'SC/ST Atrocities Act Relief'
        },
        description: 'Beneficiary was assaulted by dominant caste landlords while accessing village common well water. FIR registered under Section 3(1)(r)(s) SC/ST (PoA) Act 45 days ago, but mandatory 25% interim compensation has not been disbursed by District Social Welfare Department.',
        facts: 'FIR No. 112/2026 registered. DSP investigation completed charge-sheet, but District Vigilance Committee meeting has been postponed twice.',
        priority: 'high',
        status: 'under_review',
        district: 'Mysuru',
        createdBy: users[2]._id, // Manoj Patil
        assignedTo: users[2]._id,
        documents: [
          {
            title: 'FIR Copy under SC/ST (PoA) Act 1989',
            docType: 'FIR / Police Complaint',
            fileName: 'FIR_112_SC_ST_Act_Hunsur.pdf',
            fileSize: '780 KB',
            uploadedBy: users[2]._id,
            uploaderName: 'Manoj Patil (Nyaaya Mitra)',
            uploadedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            officerName: 'Manoj Patil',
            location: 'Hunsur Town',
            beneficiaryStatement: 'I had to spend Rs. 22,000 for hospital treatment after the assault. The welfare department is delaying my compensation file.',
            observations: 'Verified FIR and medical bills. The victim is under immense financial pressure.',
            evidenceNotes: 'Submitted formal letter to District Social Welfare Officer.',
            actionRecommended: 'High priority alert to Case Manager; file urgent DLSA representation before District Magistrate.',
            recordedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [
          {
            author: users[2]._id,
            authorName: 'Manoj Patil',
            authorRole: 'nyaaya_mitra',
            title: 'Follow-up with District Social Welfare Office',
            note: 'Officer stated file is pending Deputy Commissioner signature.',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            updateType: 'field_work'
          }
        ],
        aiAnalysis: {
          summary: 'Statutory compensation delay under SC/ST PoA Rules 1995. Rules mandate mandatory disbursement within 7 days of FIR registration. 45 days delay represents clear administrative default.',
          applicableActs: [
            'Scheduled Castes & Scheduled Tribes (Prevention of Atrocities) Act, 1989',
            'SC/ST (PoA) Rules, 1995 - Rule 12(4) (Time-bound Compensation Schedule)',
            'Constitution of India - Article 17 (Abolition of Untouchability) & Article 21'
          ],
          suggestedRemedies: [
            'Immediate Notice to District Magistrate / Chairman DVMC',
            'High Court Writ of Mandamus for statutory compensation release',
            'DLSA Free Legal Aid Counsel appointment for Special Court trial'
          ],
          requiredDocuments: ['FIR Copy', 'Caste Certificate', 'Medical Injury MLC Report', 'Bank Passbook'],
          riskAssessment: 'DELAYED / HIGH PRIORITY: Statutory 7-day compensation deadline breached by over 38 days.',
          similarityTags: ['SC/ST Atrocities Act Relief', 'Compensation Delay', 'PoA Rules 1995', 'Mysuru'],
          generatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
        },
        isDelayed: true, // Marked delayed for Case Manager SLA monitoring!
        deadlineDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      },
      {
        caseNumber: 'NY-2026-006',
        title: 'Microfinance Coercive Recovery, Usurious Interest & Harassment of SHG Women',
        client: {
          name: 'Radha Mohan (Kaveri Self Help Group)',
          age: 39,
          gender: 'Female',
          phone: '+91 97422 11099',
          address: 'Srirangapatna Village, Mandya District',
          district: 'Mandya',
          villageTaluk: 'Srirangapatna',
          category: 'Consumer & Microfinance Fraud'
        },
        description: 'Unregulated microfinance collection agents harassing 8 women members of a self-help group with threatening visits at midnight and demanding 48% annualized interest rate in violation of RBI MFI directions.',
        facts: 'Loans disbursed without key fact statements. Agents confiscated blank signed cheques and ration cards as illegal collateral.',
        priority: 'medium',
        status: 'submitted',
        district: 'Mandya',
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        documents: [],
        fieldVisits: [],
        updates: [],
        aiAnalysis: {
          summary: 'Microfinance recovery harassment in violation of RBI Master Directions 2022 on Regulatory Framework for Microfinance Loans. Confiscation of ration cards and night visits constitute criminal extortion.',
          applicableActs: [
            'RBI Master Direction – Reserve Bank of India (Regulatory Framework for Microfinance Loans) Directions, 2022',
            'Consumer Protection Act, 2019 - Section 35',
            'Bharatiya Nyaya Sanhita (BNS) Sections on Extortion and Criminal Intimidation'
          ],
          suggestedRemedies: [
            'Immediate representation to Banking / NBFC Ombudsman',
            'Police Complaint against abusive collection agents',
            'District Consumer Commission Complaint for unfair trade practice'
          ],
          requiredDocuments: ['Loan repayment passbooks', 'Receipt slips', 'Audio/call recordings of threats', 'SHG resolution copy'],
          riskAssessment: 'MEDIUM PRIORITY: Coercive tactics require prompt Ombudsman notice and police protection.',
          similarityTags: ['Consumer & Microfinance Fraud', 'RBI Guidelines', 'SHG', 'Coercive Recovery'],
          generatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        },
        isDelayed: false,
        deadlineDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        caseId: 'CASE-1001',
        caseNumber: 'CASE-1001',
        title: 'Land Dispute',
        category: 'PROPERTY',
        district: 'Mandya',
        status: 'ACTIVE',
        priority: 'high',
        description: 'Dispute regarding ownership of agricultural land in Mandya district. Client was dispossessed without notice.',
        facts: 'Ancestral agricultural land of 2 acres cultivated continuously for over 15 years with valid Patta and RTC extracts. Neighboring estate developers attempted illegal fencing.',
        client: {
          name: 'Somanna Gowda',
          age: 52,
          gender: 'Male',
          phone: '+91 98860 11223',
          address: 'Survey No. 42, Maddur Taluk',
          district: 'Mandya',
          category: 'Land & Tenancy Dispute'
        },
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        aiAnalysis: {
          summary: 'Unlawful dispossession of agricultural land under Section 6 of Specific Relief Act, 1963. Continuous possession established via 15-year RTCs.',
          applicableActs: [
            'Specific Relief Act, 1963 - Section 6',
            'Karnataka Land Revenue Act, 1964',
            'Code of Civil Procedure, 1908 - Order 39 Rules 1 & 2'
          ],
          suggestedRemedies: [
            'Immediate interim injunction suit before Civil Judge Senior Division',
            'Application to Tahsildar for emergency spot inspection and boundary demarcation',
            'DLSA Pre-Litigation Mediation application'
          ],
          requiredDocuments: ['Record of Rights (RTC / Pahani)', 'Mutation Extract', 'Land Tax Receipts', 'Village Map'],
          riskAssessment: 'HIGH PRIORITY: Imminent risk of permanent construction and crop damage.',
          similarityTags: ['Land Dispute', 'Mandya', 'Injunction', 'Specific Relief'],
          generatedAt: new Date()
        }
      },
      {
        caseNumber: 'NY-2025-042',
        caseId: 'NY-2025-042',
        title: 'Eviction Stay & ₹12,000 Interim Maintenance Decree under PWDVA 2005',
        status: 'resolved',
        priority: 'high',
        district: 'Bengaluru Urban',
        category: 'Domestic Violence & Maintenance',
        client: {
          name: 'Smt. Kavitha Devi',
          age: 31,
          gender: 'Female',
          phone: '+91 98450 11223',
          address: 'House No. 44, Yelahanka Old Town, Bengaluru',
          villageTaluk: 'Yelahanka',
          district: 'Bengaluru Urban',
          category: 'Domestic Violence & Maintenance'
        },
        description: 'Beneficiary was violently ejected from matrimonial home with two school-going children without maintenance. Nyaaya Mitra logged emergency field verification, attached medical discharge summaries and marriage proofs, and escalated for DLSA legal counsel.',
        facts: 'Married in 2017; husband owns 3-storey commercial property in Yelahanka; respondent stopped school fee payments and locked petitioner out in November 2025.',
        createdBy: poojaUser._id,
        assignedTo: poojaUser._id,
        assignedExpert: meenakshiExpert._id,
        documents: [
          {
            title: 'Domestic Incident Report (DIR) - Protection Officer Form 1',
            docType: 'Other',
            fileName: 'DIR_Report_Kavitha.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/DIR_Report_Kavitha.pdf',
            fileSize: '420 KB',
            uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Asset & Liability Disclosure Affidavit (Rajnesh v Neha Format)',
            docType: 'Affidavit',
            fileName: 'Asset_Affidavit_Kavitha.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/Asset_Affidavit_Kavitha.pdf',
            fileSize: '510 KB',
            uploadedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'JMFC 2nd ACMM Court Interim Maintenance Order',
            docType: 'Court Order / Summons',
            fileName: 'Interim_Order_12000.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/Interim_Order_12000.pdf',
            fileSize: '680 KB',
            uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
            officerName: 'Pooja Rao',
            location: 'Yelahanka Matrimonial Home & Sakhi One Stop Centre',
            beneficiaryStatement: 'Husband locked doors and refused entry; children missing examinations.',
            observations: 'Interacted with local Protection Officer; secured temporary shelter admission at Sakhi Centre and collected neighbor statements.',
            actionRecommended: 'Move emergency application under PWDVA Sec 12 & Sec 23 before 2nd ACMM Court.'
          }
        ],
        aiAnalysis: {
          summary: 'Clear prima facie case under PWDVA 2005 Sections 18, 19, 20 and CrPC 125. Supreme Court in Rajnesh v. Neha mandates expeditious interim maintenance.',
          applicableActs: [
            'Protection of Women from Domestic Violence Act 2005 - Section 18',
            'Protection of Women from Domestic Violence Act 2005 - Section 19',
            'CrPC Section 125 / BNSS Section 144'
          ],
          suggestedRemedies: [
            'Emergency Residence Order under Section 19(1)(f)',
            'Monthly Interim Maintenance of ₹12,000',
            'Restraining order against domestic harassment'
          ]
        },
        expertGuidance: [
          {
            expert: meenakshiExpert._id,
            expertName: meenakshiExpert.name,
            formalOpinion: 'Advised filing under PWDVA Sec 12 along with interim application under Sec 23. Filed asset disclosure affidavit. 2nd ACMM Court passed ex-parte interim maintenance order directing respondent to pay ₹12,000/month and restore residence possession.',
            statutesAndSections: ['PWDVA 2005 Sec 18', 'PWDVA 2005 Sec 19', 'CrPC 125'],
            draftingSuggestions: 'Highlight continuous economic deprivation and school tuition arrears.',
            createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [
          {
            title: 'Final Consent Decree & Lok Adalat Settlement',
            note: 'Both parties appeared before National Lok Adalat; respondent agreed to pay ₹12,000 monthly bank transfer and surrendered residential 1BHK unit. Case successfully closed and decree satisfied.',
            authorName: 'Adv. Meenakshi Sundaram',
            authorRole: 'legal_expert',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updateType: 'status_change'
          }
        ]
      },
      {
        caseNumber: 'NY-2025-068',
        caseId: 'NY-2025-068',
        title: 'Restoration of 1.8-Acre Ancestral Agricultural Land from Illegal Encroachment',
        status: 'resolved',
        priority: 'high',
        district: 'Mandya',
        category: 'Land & Tenancy Dispute',
        client: {
          name: 'Sri. Basavaraju K.',
          age: 58,
          gender: 'Male',
          phone: '+91 97410 44556',
          address: 'Survey No. 84/2, Maddur Taluk, Mandya District',
          villageTaluk: 'Maddur',
          district: 'Mandya',
          category: 'Land & Tenancy Dispute'
        },
        description: 'Smallholder farmer holding valid RTC Patta had boundary stones unlawfully uprooted by neighboring commercial poultry operator during harvest season. DLSA team intervened with revenue authorities.',
        facts: 'RTC mutation register entry from 1984 confirms petitioner title; opponent attempted to fence common access cart-track.',
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        assignedExpert: rajeshExpert._id,
        documents: [
          {
            title: 'Certified RTC Mutation Register Extract (Pahani)',
            docType: 'Land Title / Patta / Revenue Record',
            fileName: 'RTC_Basavaraju.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/RTC_Basavaraju.pdf',
            fileSize: '350 KB',
            uploadedAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Tahsildar Boundary Demarcation & Survey Map',
            docType: 'Field Photo / Evidence',
            fileName: 'ADLR_Survey_Map.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/ADLR_Survey_Map.pdf',
            fileSize: '890 KB',
            uploadedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000),
            officerName: 'Ravi Kumar',
            location: 'Survey No. 84/2 Maddur Boundary',
            beneficiaryStatement: 'Opposite party destroyed standing ragi crops and placed barbed wire fence.',
            observations: 'Conducted joint spot inspection with village revenue accountant; verified encroached cart-track.',
            actionRecommended: 'File emergency petition under Karnataka Land Revenue Act Section 140 before Tahsildar.'
          }
        ],
        aiAnalysis: {
          summary: 'Karnataka Land Revenue Act 1964 Section 140 empowers Tahsildar to resolve boundary disputes and restore surveyed pegs.',
          applicableActs: [
            'Karnataka Land Revenue Act 1964 - Section 140',
            'Specific Relief Act 1963 - Section 6'
          ],
          suggestedRemedies: [
            'Tahsildar spot demarcation order',
            'Injunction suit before Maddur Civil Court'
          ]
        },
        expertGuidance: [
          {
            expert: rajeshExpert._id,
            expertName: rajeshExpert.name,
            formalOpinion: 'Filed statutory boundary demarcation petition under KLRA Sec 140 before Tahsildar Maddur. Secured order directing ADLR surveyor to install permanent concrete boundary stones.',
            statutesAndSections: ['KLRA 1964 Sec 140', 'Specific Relief Act 1963 Sec 6'],
            createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [
          {
            title: 'Survey & Boundary Pegs Restored',
            note: 'ADLR Survey team restored boundary stones under police protection. Encroachment cleared, possession restored to Sri Basavaraju. Case resolved.',
            authorName: 'Ravi Kumar',
            authorRole: 'nyaaya_mitra',
            date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
            updateType: 'status_change'
          }
        ]
      },
      {
        caseNumber: 'NY-2025-091',
        caseId: 'NY-2025-091',
        title: 'Recovery of ₹1.85 Lakh Unpaid Minimum Wages for 8 Brick Kiln Laborers',
        status: 'resolved',
        priority: 'medium',
        district: 'Mysuru',
        category: 'Labor & Wage Exploitation',
        client: {
          name: 'Smt. Ratnamma & 7 Others',
          age: 42,
          gender: 'Female',
          phone: '+91 94481 77889',
          address: 'Nanjangud Industrial Area, Mysuru',
          villageTaluk: 'Nanjangud',
          district: 'Mysuru',
          category: 'Labor & Wage Exploitation'
        },
        description: 'Migrant seasonal workers detained at brick kiln with 4 months withheld wages. Nyaaya Mitra alerted DLSA, filed joint claim petition before Assistant Labour Commissioner.',
        facts: 'Contractor withheld wages citing advances; workers were denied movement and forced to work 12-hour shifts.',
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        assignedExpert: rajeshExpert._id,
        documents: [
          {
            title: 'Wage Register Muster Roll & Daily Token Slips',
            docType: 'Salary / Wage Slip / Bank Statement',
            fileName: 'Muster_Roll_Ratnamma.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/Muster_Roll_Ratnamma.pdf',
            fileSize: '310 KB',
            uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Labour Court Full & Final Settlement Receipt',
            docType: 'Court Order / Summons',
            fileName: 'Labour_Settlement_Receipt.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/Labour_Settlement_Receipt.pdf',
            fileSize: '490 KB',
            uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          }
        ],
        fieldVisits: [
          {
            visitDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
            officerName: 'Ravi Kumar',
            location: 'Nanjangud Brick Kiln Site',
            observations: 'Verified presence of 8 laborers without wage disbursement records since August.',
            actionRecommended: 'Issue statutory notice under Payment of Wages Act Sec 15.'
          }
        ],
        aiAnalysis: {
          summary: 'Minimum Wages Act 1948 Section 20 provides for recovery of withheld wages plus up to 10x penalty.',
          applicableActs: [
            'Minimum Wages Act 1948 - Section 20',
            'Payment of Wages Act 1936 - Section 15'
          ]
        },
        expertGuidance: [
          {
            expert: rajeshExpert._id,
            expertName: rajeshExpert.name,
            formalOpinion: 'Represented laborers before Labour Officer conciliation. Kiln owner agreed to direct deposit of all arrears under threat of prosecution.',
            statutesAndSections: ['Minimum Wages Act 1948 Sec 20'],
            createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
          }
        ],
        updates: [
          {
            title: 'Full Compensation Disbursed',
            note: 'Kiln proprietor transferred ₹1,85,000 directly into individual beneficiary bank accounts under DLSA supervision. All laborers safely relocated. Case resolved.',
            authorName: 'Sunita Sharma',
            authorRole: 'case_manager',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            updateType: 'status_change'
          }
        ]
      },
      {
        caseNumber: 'NY-2025-115',
        caseId: 'NY-2025-115',
        title: 'Sanction & Arrears Release of ₹48,000 Disabled Pension & Free Legal Aid',
        status: 'resolved',
        priority: 'low',
        district: 'Mandya',
        category: 'Welfare & Pension Entitlements',
        client: {
          name: 'Sri. Manjunatha Gowda',
          age: 49,
          gender: 'Male',
          phone: '+91 96112 33445',
          address: 'Pandavapura Rural, Mandya',
          villageTaluk: 'Pandavapura',
          district: 'Mandya',
          category: 'Welfare & Pension Entitlements'
        },
        description: 'Locomotor disabled agricultural worker had pension stopped due to biometric authentication mismatch. DLSA filed representation securing manual exemption and arrears.',
        facts: '75% disability UDID certificate held; biometric thumb impression failed at village kiosk.',
        createdBy: raviUser._id,
        assignedTo: raviUser._id,
        documents: [
          {
            title: 'UDID Government Disability Certificate (75% Locomotor)',
            docType: 'Medical Report / Certificate',
            fileName: 'UDID_Manjunatha.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/UDID_Manjunatha.pdf',
            fileSize: '290 KB',
            uploadedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000)
          },
          {
            title: 'Treasury Direct Benefit Transfer Arrears Sanction Order',
            docType: 'Court Order / Summons',
            fileName: 'Treasury_Sanction_Order.pdf',
            fileData: 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/Treasury_Sanction_Order.pdf',
            fileSize: '410 KB',
            uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          }
        ],
        aiAnalysis: {
          summary: 'Rights of Persons with Disabilities Act 2016 Section 24 mandates social security and barrier-free access to pensions.',
          applicableActs: [
            'Rights of Persons with Disabilities Act 2016 - Section 24'
          ]
        },
        updates: [
          {
            title: 'Direct Benefit Transfer Restored & Arrears Credited',
            note: 'Treasury released 24 months pension arrears (₹48,000) and enabled doorstep physical banking. Case resolved successfully.',
            authorName: 'Ravi Kumar',
            authorRole: 'nyaaya_mitra',
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            updateType: 'status_change'
          }
        ]
      }
    ]);

    // 4. Seed Raw Documents and Generate Document Chunks with Vector Embeddings
    console.log('Ingesting documents and generating vector chunks...');
    const rawDocuments = [
      {
        documentId: 'DOC-001',
        title: 'Previous Land Dispute Case Report - Mandya Agricultural Encroachment',
        type: 'CASE_REPORT',
        content: 'The client approached the organization regarding illegal encroachment on agricultural land in Mandya. The beneficiary held valid Record of Rights (RTC/Pahani) for 15 consecutive years. An emergency petition was filed under Section 6 of the Specific Relief Act 1963 before the Civil Judge Senior Division. An ad-interim ex-parte injunction order was obtained under Order 39 Rules 1 and 2 of CPC restraining the opposite party from interfering with peaceful cultivation. Revenue authorities subsequently conducted a joint spot inspection and confirmed peaceful possession.',
        language: 'en',
        district: 'Mandya',
        caseId: 'CASE-1001'
      },
      {
        documentId: 'DOC-002',
        title: 'Domestic Violence Emergency Protection & Maintenance SOP',
        type: 'STATUTE',
        content: 'Under Section 18 of the Protection of Women from Domestic Violence Act 2005, the Judicial Magistrate has full powers to pass an immediate ex-parte protection order restraining the respondent from entering the place of employment or shared residence. Under Section 19, the woman has an absolute right to reside in the shared household regardless of whether she has legal ownership or title. Monthly maintenance under Section 20 and BNSS Section 144 / CrPC 125 must be computed according to the asset affidavit guidelines laid down in Rajnesh v. Neha.',
        language: 'en',
        district: 'Bengaluru Urban',
        caseId: 'CASE-1001'
      },
      {
        documentId: 'DOC-003',
        title: 'Unpaid Construction Labor Wages Claim - BOCW Guidelines',
        type: 'LEGAL_NOTICE',
        content: 'Under Section 15 of the Payment of Wages Act 1936 and Code on Wages 2019, if a contractor fails to disburse wages within 7 days of the wage period, the Principal Employer is legally bound to pay wages directly. A joint claim application signed by affected workers before the Assistant Labor Commissioner allows recovery of unpaid amounts along with up to 10 times statutory compensation penalties.',
        language: 'en',
        district: 'Mysuru',
        caseId: 'CASE-1001'
      }
    ];

    for (const doc of rawDocuments) {
      await processAndStoreDocument(doc);
    }

    console.log('OutLawed Database Seeded Successfully with users, cases, documents & document_chunks!');
    return true;
  } catch (error) {
    console.error('Error Seeding Database:', error.message);
    return false;
  }
};

module.exports = seedDatabase;
