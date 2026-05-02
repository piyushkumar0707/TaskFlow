require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Project = require('../src/models/Project');

async function debug() {
  await mongoose.connect(process.env.MONGO_URI);
  const alice = await User.findOne({ email: 'alice@test.com' });
  console.log('Alice ID:', alice._id);

  const aliceTasks = await Task.find({ assignee: alice._id });
  console.log('Tasks assigned to Alice (Task.find):', aliceTasks.length);

  const aliceProjects = await Project.find({ members: alice._id });
  console.log('Projects Alice is member of:', aliceProjects.length);

  // Test aggregation specifically
  const agg = await Task.aggregate([
    { $match: { assignee: alice._id } },
    { $count: 'total' }
  ]);
  console.log('Aggregation match (direct):', agg);

  const agg2 = await Task.aggregate([
    { $match: { assignee: new mongoose.Types.ObjectId(alice._id) } },
    { $count: 'total' }
  ]);
  console.log('Aggregation match (explicit ObjectId):', agg2);

  await mongoose.disconnect();
}

debug();
