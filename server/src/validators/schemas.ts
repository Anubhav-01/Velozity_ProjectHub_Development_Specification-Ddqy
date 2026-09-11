import { z } from 'zod';
import { TaskStatus, TaskPriority, Role, ProjectStatus } from '@prisma/client';

// ── Common / Reusable ─────────────────────────────────────────

export const idParamSchema = z.object({
  id: z.string().cuid('Invalid ID format'),
});

export const paginationSchema = z.object({
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v, 10), 100) : 20)),
});

// ── Auth validators ───────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number',
    ),
  role: z.enum([Role.DEVELOPER, Role.PROJECT_MANAGER]).optional().default(Role.DEVELOPER),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ── User validators ───────────────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number',
    ),
  role: z.nativeEnum(Role),
});

export const updateUserSchema = createUserSchema
  .partial()
  .omit({ password: true })
  .extend({
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .optional(),
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ── Client validators ─────────────────────────────────────────

export const createClientSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  companyName: z.string().min(2, 'Company name is required').max(200),
  phone: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ── Project validators ────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  clientId: z.string().cuid('Invalid client ID'),
  status: z.nativeEnum(ProjectStatus).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ── Task validators ───────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(300),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  projectId: z.string().cuid('Invalid project ID'),
  assignedDeveloperId: z.string().cuid('Invalid developer ID'),
  status: z.nativeEnum(TaskStatus).optional().default(TaskStatus.TODO),
  priority: z.nativeEnum(TaskPriority).optional().default(TaskPriority.MEDIUM),
  dueDate: z.string().datetime({ message: 'Invalid date format. Use ISO 8601.' }),
});

export const updateTaskSchema = createTaskSchema
  .omit({ projectId: true })
  .partial();

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus, {
    errorMap: () => ({
      message: `Status must be one of: ${Object.values(TaskStatus).join(', ')}`,
    }),
  }),
});

export const taskQuerySchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  projectId: z.string().cuid().optional(),
  assignedDeveloperId: z.string().cuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  isOverdue: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v, 10), 100) : 20)),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;

// ── Activity validators ───────────────────────────────────────

export const activityQuerySchema = z.object({
  projectId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v, 10), 50) : 20)),
});

export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;

// ── Route param validators ────────────────────────────────────

export const projectIdParamSchema = z.object({
  projectId: z.string().cuid('Invalid project ID'),
});

export const taskIdParamSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
});
