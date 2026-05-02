const Task = require('../models/Task');
const Project = require('../models/Project');
const { sendSuccess, sendError } = require('../utils/response');
const { createTaskSchema, updateTaskSchema, updateStatusSchema } = require('../validations/task.validation');

/**
 * POST /api/projects/:id/tasks  [admin]
 */
const createTask = async (req, res) => {
  const body = createTaskSchema.parse(req.body);
  const projectId = req.params.id;

  const project = await Project.findById(projectId);
  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  // Validate assignee is a project member
  if (body.assigneeId) {
    const isMember = project.members.some((m) => m.toString() === body.assigneeId);
    if (!isMember) {
      return sendError(res, 'Assignee is not a member of this project', 400);
    }
  }

  const task = await Task.create({
    title: body.title,
    description: body.description,
    status: body.status,
    priority: body.priority,
    dueDate: body.dueDate || null,
    assignee: body.assigneeId || null,
    project: projectId,
  });

  const populated = await task.populate([
    { path: 'assignee', select: 'name email' },
    { path: 'project', select: 'name' },
  ]);

  return sendSuccess(res, { task: populated }, 'Task created successfully', 201);
};

/**
 * GET /api/projects/:id/tasks  [admin: all | member: own]
 */
const getTasksByProject = async (req, res) => {
  const query = { project: req.params.id };

  if (req.user.role === 'member') {
    query.assignee = req.user._id;
  }

  const tasks = await Task.find(query)
    .populate('assignee', 'name email')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { tasks });
};

/**
 * GET /api/tasks/mine  [member]
 * NOTE: defined BEFORE /:id in the route file to avoid conflict
 */
const getMyTasks = async (req, res) => {
  const tasks = await Task.find({ assignee: req.user._id })
    .populate('project', 'name _id')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { tasks });
};

/**
 * GET /api/tasks/:id  [admin: any | member: own]
 */
const getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', 'name email')
    .populate('project', 'name _id');

  if (!task) {
    return sendError(res, 'Task not found', 404);
  }

  if (req.user.role === 'member') {
    if (!task.assignee || task.assignee._id.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden: not your task', 403);
    }
  }

  return sendSuccess(res, { task });
};

/**
 * PUT /api/tasks/:id  [admin]
 */
const updateTask = async (req, res) => {
  const body = updateTaskSchema.parse(req.body);

  // Map assigneeId to assignee
  const updateData = { ...body };
  if ('assigneeId' in body) {
    updateData.assignee = body.assigneeId || null;
    delete updateData.assigneeId;
  }

  const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('assignee', 'name email')
    .populate('project', 'name _id');

  if (!task) {
    return sendError(res, 'Task not found', 404);
  }

  return sendSuccess(res, { task }, 'Task updated successfully');
};

/**
 * PATCH /api/tasks/:id/status  [admin or assignee]
 */
const updateTaskStatus = async (req, res) => {
  const { status } = updateStatusSchema.parse(req.body);

  const task = await Task.findById(req.params.id);
  if (!task) {
    return sendError(res, 'Task not found', 404);
  }

  if (req.user.role === 'member') {
    if (!task.assignee || task.assignee.toString() !== req.user._id.toString()) {
      return sendError(res, 'Forbidden: you can only update your own task status', 403);
    }
  }

  task.status = status;
  await task.save();

  const populated = await task.populate([
    { path: 'assignee', select: 'name email' },
    { path: 'project', select: 'name _id' },
  ]);

  return sendSuccess(res, { task: populated }, 'Status updated successfully');
};

/**
 * DELETE /api/tasks/:id  [admin]
 */
const deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return sendError(res, 'Task not found', 404);
  }

  return sendSuccess(res, null, 'Task deleted successfully');
};

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
