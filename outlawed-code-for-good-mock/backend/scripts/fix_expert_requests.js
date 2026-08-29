const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Case = require('../models/Case');

async function fix() {
  const uri = process.env.DATABASE_URL || process.env.MONGO_URI;
  console.log('Connecting to database...');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB database');

  const allCases = await Case.find({});
  console.log('Total cases in DB:', allCases.length);

  for (const c of allCases) {
    if (c.assignedExpert && c.expertRequest && c.expertRequest.status === 'pending_review') {
      console.log(`Updating case "${c.title}" (${c._id}) -> expertRequest.status to 'approved_assigned'`);
      c.expertRequest.status = 'approved_assigned';
      await c.save();
    }
  }

  const pending = await Case.find({ 'expertRequest.isRequested': true, 'expertRequest.status': 'pending_review' });
  console.log('Remaining pending expert requests count:', pending.length);
  pending.forEach(p => {
    console.log(` - [${p.caseNumber}] "${p.title}" (District: ${p.district}, Expert: ${p.assignedExpert})`);
  });

  await mongoose.disconnect();
  console.log('Done.');
}

fix().catch(err => {
  console.error('Error fixing cases:', err);
  process.exit(1);
});
