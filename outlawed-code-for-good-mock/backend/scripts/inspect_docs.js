const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
require('../models/User');
const Case = require('../models/Case');

async function checkDocs() {
  await mongoose.connect(process.env.DATABASE_URL);
  const cases = await Case.find({});
  console.log('Total cases:', cases.length);
  for (const c of cases) {
    if (c.documents && c.documents.length > 0) {
      console.log(`\n=== CASE [${c.caseNumber}] "${c.title}" (${c.documents.length} docs) ===`);
      for (const d of c.documents) {
        console.log({
          id: d._id,
          title: d.title,
          docType: d.docType,
          fileName: d.fileName,
          fileSize: d.fileSize,
          uploaderName: d.uploaderName,
          uploadedAt: d.uploadedAt,
          fileDataLength: d.fileData ? d.fileData.length : 0,
          fileDataPreview: d.fileData ? d.fileData.slice(0, 150) : 'EMPTY'
        });
      }
    }
  }
  await mongoose.disconnect();
}
checkDocs().catch(console.error);
