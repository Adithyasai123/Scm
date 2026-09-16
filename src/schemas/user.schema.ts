import { z } from 'zod';

export const permissionsSchema = z.object({
  roleId: z.number().default(1),
  username: z.string().default(''),
  hrmsId: z.string().default(''),
  roleName: z.string().nullable().default(null),
  dealerPermissions: z.boolean().default(false),
  walletPermissions: z.boolean().default(false),
  userPermissions: z.boolean().default(false),
  commissionPermissions: z.boolean().default(false),
  plansNumberpermissions: z.boolean().default(false),
  reportsPermissions: z.boolean().default(false),
  stockCheck: z.boolean().default(false),
  dealerMpinReset: z.boolean().default(false),
  franchiseAddBalance: z.boolean().default(false),
  bulkRecharge: z.boolean().default(false),
  varepReports: z.boolean().default(false),
  userActivityReports: z.boolean().default(false),
  dealerStatus: z.boolean().default(false),
  transactionStatus: z.boolean().default(false),
  topupReversal: z.boolean().default(false),
  mnp: z.boolean().default(false),
  prepaidCommissions: z.boolean().default(false),
  postpaidCommissions: z.boolean().default(false),
  landlineCommissions: z.boolean().default(false),
  FOSCreation: z.boolean().default(false),
});

export const createUserSchema = z.object({
  hrmsId: z.string().min(1, 'HRMS ID is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only alphanumeric and underscore allowed'),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  roleId: z.number().min(1, 'Please select a valid role'),
  zoneId: z.number().min(1, 'Please select a zone'),
  circleId: z.number().min(1, 'Please select a circle'),
  ssaId: z.number().min(1, 'Please select an SSA'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  status: z.number().default(1),
  permissions: permissionsSchema,
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
