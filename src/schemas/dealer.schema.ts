import { z } from 'zod';

export const createDealerSchema = z.object({
  msisdn: z.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dealerType: z.string().min(1, 'Dealer type is required'),
  category: z.string().min(1, 'Category is required'),
  circleId: z.number().min(1, 'Please select a circle'),
  ssaId: z.number().min(1, 'Please select an SSA'),
  panId: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format (e.g. ABCDE1234F)').optional().or(z.literal('')),
  aadharId: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits').optional().or(z.literal('')),
  franchiseMsisdn: z.string().optional(),
  subFranchiseMsisdn: z.string().optional(),
  status: z.string().default('ACTIVE'),
});

export type CreateDealerFormData = z.infer<typeof createDealerSchema>;
