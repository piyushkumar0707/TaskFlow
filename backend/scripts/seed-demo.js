/**
 * Demo Seed Script — Full mock data for video walkthrough
 * Run: node scripts/seed-demo.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');

// ── Helpers ─────────────────────────────────────────────────────────────────
const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

// ── Seed Data ─────────────────────────────────────────────────────────────────
const usersData = [
  { name: 'Admin User',   email: 'admin@test.com',  password: 'Admin@1234',  role: 'admin'  },
  { name: 'Alice Chen',   email: 'alice@test.com',  password: 'Member@1234', role: 'member' },
  { name: 'Bob Martin',   email: 'bob@test.com',    password: 'Member@1234', role: 'member' },
  { name: 'Sara Khan',    email: 'sara@test.com',   password: 'Member@1234', role: 'member' },
  { name: 'James Wright', email: 'james@test.com',  password: 'Member@1234', role: 'member' },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected');

    // ── Clear all collections ────────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
    ]);
    console.log('✓ Cleared existing data');

    // ── Create Users ─────────────────────────────────────────────────────────
    const users = await Promise.all(
      usersData.map((u) => new User(u).save())
    );
    const [admin, alice, bob, sara, james] = users;
    console.log(`✓ Created ${users.length} users`);

    // ── Project 1: Website Redesign ──────────────────────────────────────────
    const p1 = await Project.create({
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with new branding and improved UX. Focus on performance and accessibility.',
      status: 'active',
      createdBy: admin._id,
      members: [admin._id, alice._id, bob._id, sara._id],
    });

    const p1Tasks = await Task.insertMany([
      { title: 'Design new homepage wireframes',       description: 'Create wireframes for desktop, tablet, and mobile viewpoints.',  status: 'done',        priority: 'high',   dueDate: daysFromNow(-10), assignee: alice._id,  project: p1._id },
      { title: 'Set up Next.js project scaffold',      description: 'Initialize project with TypeScript, Tailwind, and ESLint config.', status: 'done',       priority: 'high',   dueDate: daysFromNow(-8),  assignee: bob._id,    project: p1._id },
      { title: 'Implement new navigation component',   description: 'Build responsive navbar with mobile hamburger menu.',              status: 'in_progress', priority: 'high',   dueDate: daysFromNow(3),   assignee: alice._id,  project: p1._id },
      { title: 'Hero section animations',              description: 'Add Framer Motion scroll-triggered animations to hero section.',   status: 'in_progress', priority: 'medium', dueDate: daysFromNow(5),   assignee: bob._id,    project: p1._id },
      { title: 'SEO meta tags and sitemap',            description: 'Add structured data, Open Graph tags, and generate sitemap.xml.', status: 'todo',        priority: 'medium', dueDate: daysFromNow(7),   assignee: sara._id,   project: p1._id },
      { title: 'Performance audit and optimisation',   description: 'Target Lighthouse score ≥ 90 across all metrics.',               status: 'todo',        priority: 'high',   dueDate: daysFromNow(12),  assignee: alice._id,  project: p1._id },
      { title: 'Cross-browser compatibility testing',  description: 'Test on Chrome, Firefox, Safari, and Edge.',                     status: 'todo',        priority: 'low',    dueDate: daysFromNow(14),  assignee: bob._id,    project: p1._id },
      { title: 'Write deployment documentation',       description: 'Document CI/CD pipeline and environment variable setup.',         status: 'todo',        priority: 'low',    dueDate: daysFromNow(18),  assignee: sara._id,   project: p1._id },
      // Overdue task (for drama in the demo!)
      { title: 'Migrate legacy blog posts',            description: 'Export from WordPress and import to new CMS format.',             status: 'in_progress', priority: 'high',   dueDate: daysFromNow(-3),  assignee: sara._id,   project: p1._id },
    ]);

    // ── Project 2: Mobile App MVP ────────────────────────────────────────────
    const p2 = await Project.create({
      name: 'Mobile App MVP',
      description: 'Build the first version of the TaskFlow mobile app for iOS and Android using React Native.',
      status: 'active',
      createdBy: admin._id,
      members: [admin._id, bob._id, james._id],
    });

    await Task.insertMany([
      { title: 'React Native environment setup',       description: 'Configure Expo, Metro bundler, and device emulators.',           status: 'done',        priority: 'high',   dueDate: daysFromNow(-15), assignee: bob._id,    project: p2._id },
      { title: 'Auth flow — login and register',       description: 'Implement JWT auth with AsyncStorage token persistence.',         status: 'done',        priority: 'high',   dueDate: daysFromNow(-7),  assignee: james._id,  project: p2._id },
      { title: 'Dashboard screen',                     description: 'Build the main dashboard with task summary cards.',               status: 'in_progress', priority: 'high',   dueDate: daysFromNow(4),   assignee: bob._id,    project: p2._id },
      { title: 'Push notification integration',        description: 'Set up Firebase Cloud Messaging for task reminders.',             status: 'in_progress', priority: 'medium', dueDate: daysFromNow(6),   assignee: james._id,  project: p2._id },
      { title: 'Offline mode with local SQLite',       description: 'Cache tasks locally so app works without internet.',              status: 'todo',        priority: 'medium', dueDate: daysFromNow(10),  assignee: bob._id,    project: p2._id },
      { title: 'App Store listing assets',             description: 'Create screenshots, icon, and description for App Store.',       status: 'todo',        priority: 'low',    dueDate: daysFromNow(20),  assignee: james._id,  project: p2._id },
      // Overdue
      { title: 'API integration with backend',         description: 'Connect React Native frontend to Express REST API.',              status: 'todo',        priority: 'high',   dueDate: daysFromNow(-2),  assignee: james._id,  project: p2._id },
    ]);

    // ── Project 3: Q3 Marketing Campaign ────────────────────────────────────
    const p3 = await Project.create({
      name: 'Q3 Marketing Campaign',
      description: 'Launch multi-channel marketing campaign for Q3. Includes email, social, and paid channels with A/B testing.',
      status: 'active',
      createdBy: admin._id,
      members: [admin._id, sara._id, alice._id],
    });

    await Task.insertMany([
      { title: 'Define campaign strategy and KPIs',    description: 'Set measurable goals: CTR, conversion rate, and CAC targets.',   status: 'done',        priority: 'high',   dueDate: daysFromNow(-12), assignee: sara._id,   project: p3._id },
      { title: 'Design email templates',               description: 'Create 5 email variants for A/B testing in Mailchimp.',          status: 'done',        priority: 'medium', dueDate: daysFromNow(-6),  assignee: alice._id,  project: p3._id },
      { title: 'Set up Google Ads campaigns',          description: 'Launch search and display campaigns with £5k/month budget.',     status: 'in_progress', priority: 'high',   dueDate: daysFromNow(2),   assignee: sara._id,   project: p3._id },
      { title: 'Social media content calendar',        description: 'Plan 30 days of posts across LinkedIn, Twitter, and Instagram.', status: 'in_progress', priority: 'medium', dueDate: daysFromNow(5),   assignee: alice._id,  project: p3._id },
      { title: 'Landing page A/B test setup',          description: 'Configure VWO for split testing hero copy variants.',             status: 'todo',        priority: 'high',   dueDate: daysFromNow(8),   assignee: sara._id,   project: p3._id },
      { title: 'Weekly performance report',            description: 'Build automated dashboard in Google Data Studio.',               status: 'todo',        priority: 'low',    dueDate: daysFromNow(15),  assignee: alice._id,  project: p3._id },
    ]);

    // ── Project 4: API Gateway Migration (Archived) ──────────────────────────
    const p4 = await Project.create({
      name: 'API Gateway Migration',
      description: 'Migrate legacy REST endpoints to new API Gateway with rate limiting and auth middleware.',
      status: 'archived',
      createdBy: admin._id,
      members: [admin._id, bob._id],
    });

    await Task.insertMany([
      { title: 'Audit all existing endpoints',         description: 'Document every public and internal API route.',                  status: 'done',        priority: 'high',   dueDate: daysFromNow(-30), assignee: bob._id,    project: p4._id },
      { title: 'Set up Kong API Gateway',              description: 'Install and configure Kong with rate limiting plugin.',           status: 'done',        priority: 'high',   dueDate: daysFromNow(-25), assignee: bob._id,    project: p4._id },
      { title: 'Migrate auth endpoints',               description: 'Move /auth/* routes through new gateway.',                      status: 'done',        priority: 'high',   dueDate: daysFromNow(-20), assignee: bob._id,    project: p4._id },
    ]);

    console.log(`✓ Created 4 projects`);
    console.log(`✓ Created ${p1Tasks.length + 7 + 6 + 3} tasks`);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎬  DEMO DATA READY — Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Admin:  admin@test.com  /  Admin@1234');
    console.log('  Member: alice@test.com  /  Member@1234');
    console.log('  Member: bob@test.com    /  Member@1234');
    console.log('  Member: sara@test.com   /  Member@1234');
    console.log('  Member: james@test.com  /  Member@1234');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

run();
