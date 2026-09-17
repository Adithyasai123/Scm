import { test, expect } from '@playwright/test';
import {
  mockUsers,
  mockZones,
  mockCircles,
  mockSSAs,
  mockCommissions,
  mockFranchiseTransactions,
  mockPlans,
  mockMnpList,
  mockDealers,
} from '../mocks/handlers';

test.describe('SCM Administrative Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure Super Admin permissions are active in localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'scm_auth_storage',
        JSON.stringify({
          state: {
            currentRoleKey: 'SUPER_ADMIN',
            username: 'admin',
            displayName: 'Adithya (Super Admin)',
            permissions: {
              roleId: 1,
              username: 'admin',
              hrmsId: 'HRMS001',
              roleName: 'Super Admin',
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
          },
          version: 0,
        })
      );
    });

    // Intercept collection domain during Playwright automated browser tests
    await page.route('https://ui.example.com/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname;
      const json = (data: any) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'SUCCESS', message: 'Success', data }),
        });

      if (path.includes('/users')) return json(mockUsers);
      if (path.includes('/zones')) return json(mockZones);
      if (path.includes('/circles')) return json(mockCircles);
      if (path.includes('/ssas')) return json(mockSSAs);
      if (path.includes('/dealerType')) return json([{ id: 'Retailer', name: 'Retailer' }]);
      if (path.includes('/getCategory')) return json([{ id: 1, name: 'Category A' }]);
      if (path.includes('/sendOtp') || path.includes('/validateOtp')) return json({ valid: true, message: 'OTP verified' });
      if (path.includes('/usercreation')) return json({ message: 'User created successfully', userId: 999 });
      if (path.includes('/fetchCommission') || path.includes('/fetchPrepaidOTFCommission') || path.includes('/fetchPostpaidCommission') || path.includes('/fetchLandlineCommission')) return json(mockCommissions);
      if (path.includes('/franchiseAddBalanceTransactions')) return json(mockFranchiseTransactions);
      if (path.includes('/getplans')) return json(mockPlans);
      if (path.includes('/findMnpData')) return json(mockMnpList);
      if (path.includes('/dealerList')) return json(mockDealers);
      return json([]);
    });

    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('SCM Dashboard');
  });

  test('Journey 1: User Administration & OTP Verification Workflow', async ({ page }) => {
    // Navigate directly to /users
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('User Administration');

    // Verify User table is populated
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=admin').first()).toBeVisible();

    // Open User Creation Modal
    await page.click('button:has-text("Create New User")');
    await expect(page.locator('text=Onboard New Administrative User')).toBeVisible();

    // Fill form
    await page.fill('input[placeholder="HRMS999"]', 'HRMS777');
    await page.fill('input[placeholder="user_ops"]', 'playwright_ops');
    await page.fill('input[placeholder="First Name"]', 'Automated');
    await page.fill('input[placeholder="9876543210"]', '9876543210');
    await page.fill('input[placeholder="••••••••"]', 'Test@1234');

    // Trigger OTP Flow
    await page.locator('button:has-text("Verify via OTP & Onboard")').click();

    // OTP Drawer appears
    await expect(page.locator('#otp-drawer-title')).toBeVisible({ timeout: 10000 });

    // Step 1: Confirm and trigger Send OTP
    await page.click('button:has-text("Send OTP Code")');

    // Step 2: OTP boxes appear
    await expect(page.locator('text=Enter 4-Digit One-Time Password')).toBeVisible();

    // Enter Mock OTP
    const otpBoxes = page.locator('.otp-box');
    await otpBoxes.nth(0).fill('1');
    await otpBoxes.nth(1).fill('2');
    await otpBoxes.nth(2).fill('3');
    await otpBoxes.nth(3).fill('4');

    // Step 3: Verify & Apply
    await page.click('button:has-text("Verify & Apply")');

    // Verify Success confirmation in drawer
    await expect(page.locator('text=Verification Successful')).toBeVisible({ timeout: 10000 });
  });

  test('Journey 2: Commission Engine Navigation & Configuration', async ({ page }) => {
    // Navigate directly to /commissions
    await page.goto('/commissions');
    await expect(page.locator('h1')).toContainText('Commission Engine Configuration');

    // Verify tabs
    await expect(page.locator('button:has-text("Prepaid FRC")')).toBeVisible();
    await expect(page.locator('button:has-text("Franchise Top-up Balance")')).toBeVisible();

    // Click Franchise Top-up Balance Tab
    await page.click('button:has-text("Franchise Top-up Balance")');
    await expect(page.locator('text=Metro Cellular Care')).toBeVisible();

    // Switch back to FRC
    await page.click('button:has-text("Prepaid FRC")');
    await expect(page.locator('text=COM-001')).toBeVisible();
  });

  test('Journey 3: Tariff Plans Catalog & Denomination Management', async ({ page }) => {
    // Navigate directly to /plans
    await page.goto('/plans');
    await expect(page.locator('h1')).toContainText('Tariff Plans, Numbers & MNP');

    // Verify catalog plans table
    await expect(page.locator('table')).toBeVisible();

    // Switch to Denominations tab
    await page.click('button:has-text("Denomination Configuration")');
    await expect(page.locator('text=Recharge Plan Lookup & Verification')).toBeVisible();

    // Switch to MNP tab
    await page.click('button:has-text("MNP Portability Records")');
    await expect(page.locator('button:has-text("Register MNP Port-In")')).toBeVisible();
  });
});
