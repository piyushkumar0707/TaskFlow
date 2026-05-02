const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  const body = registerSchema.parse(req.body);

  // Check for duplicate email
  const existing = await User.findOne({ email: body.email });
  if (existing) {
    return sendError(res, 'Email already in use', 409);
  }

  const user = await User.create(body);
  const token = generateToken({ id: user._id, role: user.role });

  return sendSuccess(
    res,
    {
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    },
    'Registration successful',
    201
  );
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await User.findOne({ email: body.email }).select('+password');

  // Use same message for both "not found" and "wrong password" — security best practice
  if (!user || !(await user.comparePassword(body.password))) {
    return sendError(res, 'Invalid credentials', 401);
  }

  const token = generateToken({ id: user._id, role: user.role });

  return sendSuccess(res, {
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  return sendSuccess(res, { user: req.user });
};

module.exports = { register, login, getMe };
