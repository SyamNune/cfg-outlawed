const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const SECRET = process.env.AUTH_SECRET || 'nyaayasetu_super_secret_jwt_key_2026';
const BASE_URL = 'http://localhost:5000/api';

async function testAllRoutes() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('--- TESTING ALL BACKEND API ROUTES ---');

  const admin = await User.findOne({ role: { $in: ['admin', 'ADMIN'] } });
  const cm = await User.findOne({ role: { $in: ['case_manager', 'CASE_MANAGER'] } });
  const paralegal = await User.findOne({ role: { $in: ['PARALEGAL', 'nyaaya_mitra', 'paralegal'] } });
  const expert = await User.findOne({ role: { $in: ['legal_expert', 'LEGAL_EXPERT'] } });

  console.log('Found users:', {
    admin: admin?.email,
    cm: cm?.email,
    paralegal: paralegal?.email,
    expert: expert?.email
  });

  const adminToken = admin ? jwt.sign({ id: admin._id, role: admin.role }, SECRET, { expiresIn: '1h' }) : '';
  const cmToken = cm ? jwt.sign({ id: cm._id, role: cm.role }, SECRET, { expiresIn: '1h' }) : '';
  const paraToken = paralegal ? jwt.sign({ id: paralegal._id, role: paralegal.role }, SECRET, { expiresIn: '1h' }) : '';
  const expertToken = expert ? jwt.sign({ id: expert._id, role: expert.role }, SECRET, { expiresIn: '1h' }) : '';

  const endpoints = [
    { method: 'GET', url: '/auth/me', token: paraToken, name: 'Auth Get Me' },
    { method: 'GET', url: '/cases', token: paraToken, name: 'Cases List' },
    { method: 'GET', url: '/cases?scope=previous_cases', token: paraToken, name: 'Previous Cases' },
    { method: 'GET', url: '/case-manager/dashboard-metrics', token: cmToken, name: 'CM Dashboard Metrics' },
    { method: 'GET', url: '/case-manager/expert-requests', token: cmToken, name: 'CM Expert Requests' },
    { method: 'GET', url: '/case-manager/volunteer-performance', token: cmToken, name: 'CM Volunteer Performance' },
    { method: 'GET', url: '/ai/status', token: paraToken, name: 'AI Status' },
    { method: 'GET', url: '/ai/knowledge', token: paraToken, name: 'AI Knowledge' },
    { method: 'POST', url: '/ai/chat', token: paraToken, body: { query: 'maintenance under PWDVA' }, name: 'AI Chat RAG' },
    { method: 'POST', url: '/ai/find-similar', token: paraToken, body: { title: 'Land dispute Patta', category: 'Land & Tenancy Dispute' }, name: 'AI Find Similar' },
    { method: 'GET', url: '/admin/users', token: adminToken, name: 'Admin Get Users' },
    { method: 'GET', url: '/admin/stats', token: adminToken, name: 'Admin Stats' },
  ];

  let failedCount = 0;

  for (const ep of endpoints) {
    if (!ep.token) {
      console.warn(`⚠️ Skipping ${ep.name} (no token)`);
      continue;
    }
    try {
      const res = await fetch(`${BASE_URL}${ep.url}`, {
        method: ep.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ep.token}`
        },
        body: ep.body ? JSON.stringify(ep.body) : undefined
      });

      if (res.ok) {
        console.log(`✓ [${res.status}] ${ep.name} (${ep.method} ${ep.url})`);
      } else {
        const errorText = await res.text();
        console.error(`❌ [${res.status}] ${ep.name} (${ep.method} ${ep.url}): ${errorText}`);
        failedCount++;
      }
    } catch (err) {
      console.error(`❌ [EXCEPTION] ${ep.name} (${ep.method} ${ep.url}):`, err.message);
      failedCount++;
    }
  }

  console.log(`\nTest finished. Failures: ${failedCount}`);
  await mongoose.disconnect();
}

testAllRoutes().catch(console.error);
