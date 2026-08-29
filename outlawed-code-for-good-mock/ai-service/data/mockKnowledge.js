const knowledgeItems = [
  {
    id: 'CASE-1042',
    type: 'case',
    title: 'Agricultural land ownership dispute',
    summary: 'The client lacked complete property records. The team collected revenue records, mutation extracts, and witness statements before referral.',
    tags: ['land', 'property', 'ownership', 'documents', 'agricultural'],
    guidance: 'Start by mapping every available ownership record and flagging the missing documents for the legal-aid partner.'
  },
  {
    id: 'CASE-0873',
    type: 'case',
    title: 'Family property partition with incomplete deeds',
    summary: 'A family disagreement involved an incomplete title chain and missing registration copies.',
    tags: ['property', 'partition', 'documents', 'family', 'deed'],
    guidance: 'Request certified copies and prepare a clear chronology of transfers before advising the client.'
  },
  {
    id: 'DOC-0021',
    type: 'guidance',
    title: 'Property-document intake checklist',
    summary: 'Checklist for collecting title deeds, tax receipts, mutation records, identity documents, and proof of possession.',
    tags: ['property', 'documents', 'checklist', 'land'],
    guidance: 'Use this checklist during the first interview to avoid repeat visits.'
  }
];

module.exports = knowledgeItems;
