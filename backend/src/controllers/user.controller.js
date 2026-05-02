const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * GET /api/users  [admin only]
 */
const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  return sendSuccess(res, { users });
};

/**
 * PATCH /api/users/:id/role  [admin only]
 */
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!['admin', 'member'].includes(role)) {
    return sendError(res, 'Role must be admin or member', 400);
  }

  // Prevent admin from changing their own role
  if (req.params.id === req.user._id.toString()) {
    return sendError(res, 'You cannot change your own role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  return sendSuccess(res, { user }, 'Role updated successfully');
};

module.exports = { getAllUsers, updateUserRole };
