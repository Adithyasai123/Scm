import { describe, it, expect } from 'vitest';
import { createUserSchema } from '@/schemas/user.schema';
import { createDealerSchema } from '@/schemas/dealer.schema';
import { createPlanSchema } from '@/schemas/plan.schema';

describe('Zod Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('validates a correct user creation payload', () => {
      const validUser = {
        hrmsId: 'HRMS100',
        username: 'telecom_user',
        mobileNumber: '9876543210',
        firstName: 'Raj',
        lastName: 'Sharma',
        address: '123 Telecom Street, Delhi',
        dob: '1990-01-01',
        roleId: 1,
        zoneId: 1,
        circleId: 1,
        ssaId: 1,
        password: 'SecurePassword123!',
        status: 1,
        permissions: {
          roleId: 1,
          username: 'telecom_user',
          hrmsId: 'HRMS100',
          roleName: 'Admin',
          dealerPermissions: true,
          walletPermissions: true,
          userPermissions: true,
          commissionPermissions: true,
          plansNumberpermissions: true,
          reportsPermissions: true,
          stockCheck: true,
          dealerMpinReset: true,
          franchiseAddBalance: true,
          bulkRecharge: true,
          varepReports: true,
          userActivityReports: true,
          dealerStatus: true,
          transactionStatus: true,
          topupReversal: true,
          mnp: true,
          prepaidCommissions: true,
          postpaidCommissions: true,
          landlineCommissions: true,
          FOSCreation: true,
        },
      };

      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('rejects invalid mobile number format', () => {
      const invalidUser = {
        hrmsId: 'HRMS100',
        username: 'telecom_user',
        mobileNumber: '12345', // Invalid
        firstName: 'Raj',
        lastName: 'Sharma',
        address: '123 Telecom Street',
        dob: '1990-01-01',
        roleId: 1,
        zoneId: 1,
        circleId: 1,
        ssaId: 1,
        password: 'password123',
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });

  describe('createDealerSchema', () => {
    it('validates a valid dealer payload with PAN', () => {
      const validDealer = {
        name: 'Apex Telecom',
        msisdn: '9845012345',
        dealerType: 'Retailer',
        category: 'Category A',
        circleId: 1,
        ssaId: 1,
        panId: 'ABCDE1234F',
        aadharId: '123456789012',
        status: 'ACTIVE',
      };

      const result = createDealerSchema.safeParse(validDealer);
      expect(result.success).toBe(true);
    });
  });

  describe('createPlanSchema', () => {
    it('validates a valid tariff plan', () => {
      const validPlan = {
        operator: 'BSNL',
        denomination: 199,
        talkvalue: 100,
        country: 'IN',
        startDate: '2025-01-01',
        endDate: '2026-12-31',
        planType: 'Prepaid Data',
        description: 'Unlimited 4G',
        tabName: 'Prepaid',
        circleId: 1,
        validity: 28,
        fromDate: '2025-01-01',
        toDate: '2026-12-31',
      };

      const result = createPlanSchema.safeParse(validPlan);
      expect(result.success).toBe(true);
    });

    it('validates a plan when fromDate and toDate are omitted (UI publish format)', () => {
      const uiPlan = {
        operator: 'BSNL',
        denomination: 299,
        talkvalue: 150,
        planType: 'Prepaid 4G/5G',
        description: '1.5GB/day Unlimited Voice & Data',
        tabName: 'Prepaid',
        circleId: 1,
        validity: 30,
        startDate: '2025-01-01',
        endDate: '2026-12-31',
      };

      const result = createPlanSchema.safeParse(uiPlan);
      expect(result.success).toBe(true);
    });
  });
});
