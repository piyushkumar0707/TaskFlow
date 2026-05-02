const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/dashboard
 * Returns different data based on user role
 */
const getDashboard = async (req, res) => {
  if (req.user.role === 'admin') {
    // Run all admin queries in parallel
    const [
      totalProjects,
      activeProjects,
      archivedProjects,
      taskStatusAgg,
      overdueTasks,
      projectStats,
      recentActivity,
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'active' }),
      Project.countDocuments({ status: 'archived' }),

      // Tasks grouped by status
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),

      // Overdue tasks (not done, due date in the past)
      Task.find({ dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
        .populate('project', 'name')
        .populate('assignee', 'name email')
        .lean(),

      // Per-project completion stats
      Task.aggregate([
        {
          $group: {
            _id: '$project',
            totalTasks: { $sum: 1 },
            doneTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: 'projects',
            localField: '_id',
            foreignField: '_id',
            as: 'project',
          },
        },
        { $unwind: '$project' },
        {
          $project: {
            projectName: '$project.name',
            projectStatus: '$project.status',
            totalTasks: 1,
            doneTasks: 1,
            completionPercent: {
              $multiply: [{ $divide: ['$doneTasks', '$totalTasks'] }, 100],
            },
          },
        },
        { $sort: { completionPercent: -1 } },
      ]),

      // Recent activity (last 10 updated tasks)
      Task.find({})
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('project', 'name')
        .populate('assignee', 'name')
        .lean(),
    ]);

    // Transform tasksByStatus array → object
    const tasksByStatus = { todo: 0, in_progress: 0, done: 0 };
    taskStatusAgg.forEach((item) => {
      tasksByStatus[item._id] = item.count;
    });

    return sendSuccess(res, {
      projects: { total: totalProjects, active: activeProjects, archived: archivedProjects },
      tasksByStatus,
      overdueTasks,
      projectStats,
      recentActivity,
    });
  }

  // Member dashboard
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const [myTaskStatusAgg, myOverdueTasks, myTasksByProject] = await Promise.all([
    Task.aggregate([
      { $match: { assignee: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Task.find({ assignee: userId, dueDate: { $lt: new Date() }, status: { $ne: 'done' } })
      .populate('project', 'name')
      .lean(),

    Task.aggregate([
      { $match: { assignee: userId } },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: '$projectInfo' },
      {
        $group: {
          _id: '$project',
          projectName: { $first: '$projectInfo.name' },
          tasks: {
            $push: {
              _id: '$_id',
              title: '$title',
              status: '$status',
              priority: '$priority',
              dueDate: '$dueDate',
            },
          },
        },
      },
    ]),
  ]);

  const myTasksByStatus = { todo: 0, in_progress: 0, done: 0 };
  myTaskStatusAgg.forEach((item) => {
    myTasksByStatus[item._id] = item.count;
  });

  return sendSuccess(res, {
    myTasksByStatus,
    myOverdueTasks,
    myTasksByProject,
  });
};

module.exports = { getDashboard };
