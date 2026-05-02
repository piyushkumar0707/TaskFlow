const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Status must be todo, in_progress, or done' }),
  }),
});

module.exports = { createTaskSchema, updateTaskSchema, updateStatusSchema };
