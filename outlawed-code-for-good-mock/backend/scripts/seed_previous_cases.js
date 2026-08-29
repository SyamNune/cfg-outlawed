const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function seedPreviousCases() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to MongoDB for Previous Cases Seeding...');

  const users = await User.find({}).lean();
  const ravi = users.find(u => u.name === 'Ravi Kumar') || users[0];
  const pooja = users.find(u => u.name === 'Pooja Rao') || users[1];
  const rajesh = users.find(u => u.name.includes('Rajesh')) || users[0];
  const meenakshi = users.find(u => u.name.includes('Meenakshi')) || users[0];

  const previousCases = [
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
      createdBy: pooja._id,
      assignedTo: pooja._id,
      assignedExpert: meenakshi._id,
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
          expert: meenakshi._id,
          expertName: meenakshi.name,
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
      createdBy: ravi._id,
      assignedTo: ravi._id,
      assignedExpert: rajesh._id,
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
          expert: rajesh._id,
          expertName: rajesh.name,
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
      createdBy: ravi._id,
      assignedTo: ravi._id,
      assignedExpert: rajesh._id,
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
          expert: rajesh._id,
          expertName: rajesh.name,
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
      createdBy: ravi._id,
      assignedTo: ravi._id,
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
  ];

  for (const c of previousCases) {
    const existing = await Case.findOne({ caseNumber: c.caseNumber });
    if (!existing) {
      await Case.create(c);
      console.log('Created Previous Case:', c.caseNumber, '-', c.title);
    } else {
      console.log('Already exists:', c.caseNumber);
    }
  }

  const allCases = await Case.find({ status: { $in: ['resolved', 'closed'] } }).lean();
  console.log(`Total Resolved / Previous Cases now in MongoDB: ${allCases.length}`);
  process.exit(0);
}

seedPreviousCases().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
