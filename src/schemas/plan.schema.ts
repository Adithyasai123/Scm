import { z } from 'zod';

export const createPlanSchema = z.object({
  operator: z.string().min(1, 'Operator is required').default('BSNL'),
  denomination: z.number().positive('Denomination must be positive'),
  talkvalue: z.number().min(0, 'Talk value cannot be negative').default(0),
  country: z.string().default('IN'),
  startDate: z.string().min(1, 'Start date is required').default('2025-01-01'),
  endDate: z.string().min(1, 'End date is required').default('2026-12-31'),
  planType: z.string().min(1, 'Plan type is required'),
  description: z.string().default(''),
  tabName: z.string().min(1, 'Tab name is required').default('Prepaid'),
  circleId: z.number().min(1, 'Circle is required').default(1),
  validity: z.number().positive('Validity days must be positive'),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export type CreatePlanFormData = z.infer<typeof createPlanSchema>;
