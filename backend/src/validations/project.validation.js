const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'archived']).optional(),
});

const addMemberSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

module.exports = { createProjectSchema, updateProjectSchema, addMemberSchema };
