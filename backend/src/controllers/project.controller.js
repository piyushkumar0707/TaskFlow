const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { createProjectSchema, updateProjectSchema, addMemberSchema } = require('../validations/project.validation');

/**
 * POST /api/projects  [admin]
 */
const createProject = async (req, res) => {
  const body = createProjectSchema.parse(req.body);

  const project = await Project.create({
    ...body,
    createdBy: req.user._id,
    members: [req.user._id], // Creator auto-joins
  });

  const populated = await project.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'members', select: 'name email' },
  ]);

  return sendSuccess(res, { project: populated }, 'Project created successfully', 201);
};

/**
 * GET /api/projects  [admin]
 */
const getAllProjects = async (req, res) => {
  const projects = await Project.find({})
    .populate('createdBy', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { projects });
};

/**
 * GET /api/projects/mine  [member]
 */
const getMyProjects = async (req, res) => {
  const projects = await Project.find({ members: req.user._id })
    .populate('createdBy', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

  return sendSuccess(res, { projects });
};

/**
 * GET /api/projects/:id  [admin / member if in members]
 */
const getProjectById = async (req, res) => {
  let project;

  if (req.user.role === 'admin') {
    project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email _id');
  } else {
    project = await Project.findOne({
      _id: req.params.id,
      members: req.user._id,
    })
      .populate('createdBy', 'name email')
      .populate('members', 'name email _id');
  }

  if (!project) {
    return sendError(res, 'Project not found or access denied', 404);
  }

  // Get task count
  const taskCount = await Task.countDocuments({ project: req.params.id });

  return sendSuccess(res, { project, taskCount });
};

/**
 * PUT /api/projects/:id  [admin]
 */
const updateProject = async (req, res) => {
  const body = updateProjectSchema.parse(req.body);

  const project = await Project.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  })
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  return sendSuccess(res, { project }, 'Project updated successfully');
};

/**
 * DELETE /api/projects/:id  [admin]
 */
const deleteProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  // Delete all tasks in the project first
  await Task.deleteMany({ project: req.params.id });
  await Project.findByIdAndDelete(req.params.id);

  return sendSuccess(res, null, 'Project deleted successfully');
};

/**
 * POST /api/projects/:id/members  [admin]
 */
const addMember = async (req, res) => {
  const { userId } = addMemberSchema.parse(req.body);

  const project = await Project.findById(req.params.id);
  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Check for duplicate member
  if (project.members.some((m) => m.toString() === userId)) {
    return sendError(res, 'User is already a member of this project', 400);
  }

  project.members.push(userId);
  await project.save();

  const populated = await project.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'members', select: 'name email' },
  ]);

  return sendSuccess(res, { project: populated }, 'Member added successfully');
};

/**
 * DELETE /api/projects/:id/members/:userId  [admin]
 */
const removeMember = async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $pull: { members: req.params.userId } },
    { new: true }
  )
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  if (!project) {
    return sendError(res, 'Project not found', 404);
  }

  return sendSuccess(res, { project }, 'Member removed successfully');
};

module.exports = {
  createProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
