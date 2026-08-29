const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Case = require('../models/Case');

async function fixDocumentData() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to DB');

  const cases = await Case.find({});
  let updatedCount = 0;

  for (const c of cases) {
    if (c.documents && c.documents.length > 0) {
      let modified = false;
      for (const d of c.documents) {
        if (!d.fileData || d.fileData === '' || d.fileData === 'EMPTY') {
          // If fileName is ScrumFundamentalsCertified, link to the Supabase uploaded file
          if (d.fileName && d.fileName.includes('ScrumFundamentalsCertified')) {
            console.log(`Linking document "${d.title}" (${d.fileName}) to Supabase URL`);
            d.fileData = 'https://xajbcdqwoaytvgodagyf.supabase.co/storage/v1/object/public/case-documents/cases/1787992212539_ScrumFundamentalsCertified-SYA.pdf';
            modified = true;
            updatedCount++;
          }
        }
      }
      if (modified) {
        await c.save();
      }
    }
  }

  console.log(`Updated ${updatedCount} document records.`);
  await mongoose.disconnect();
}

fixDocumentData().catch(console.error);
