import { describe, it, expect, vi } from 'vitest';
import { userApi } from '@/api/user.api';
import { dealerApi } from '@/api/dealer.api';
import { planApi } from '@/api/plan.api';
import { masterdataApi } from '@/api/masterdata.api';
import { renderHook, act } from '@testing-library/react';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';

describe('End-to-End Business Journeys', () => {
  // Journey 1: User Administration Lifecycle
  it('Journey 1: Onboard user via OTP, verify directory inclusion, and toggle operational status', async () => {
    // 1. Check existing users
    const initialUsers = await userApi.getUsersList();
    const countBefore = initialUsers.length;

    // 2. Perform OTP-guarded User Registration
    let createdUser: any = null;
    const registerMutation = vi.fn(async () => {
      const res = await userApi.createUser({
        username: 'e2e_ops_manager',
        hrmsId: 'HRMS888',
        firstName: 'E2E',
        lastName: 'Manager',
        mobileNumber: '9876543210',
        roleId: 2,
        roleName: 'Operations Manager',
        status: 1,
        zoneId: 1,
        circleId: 1,
        ssaId: 1,
        permissions: { userPermissions: true, dealerPermissions: true },
      } as any);
      createdUser = res;
      return res;
    });

    const { result: otpHook } = renderHook(() =>
      useOtpGuardedAction(registerMutation, {
        topic: 'UserCreation',
        msisdn: '9876543210',
      })
    );

    act(() => {
      otpHook.current.initiate();
    });
    await act(async () => {
      await otpHook.current.confirm();
    });
    act(() => {
      otpHook.current.setOtp('1234');
    });
    await act(async () => {
      await otpHook.current.submitOtp();
    });

    expect(otpHook.current.state).toBe('success');
    expect(registerMutation).toHaveBeenCalledTimes(1);

    // 3. Verify user is now in directory
    const updatedUsers = await userApi.getUsersList();
    expect(updatedUsers.length).toBe(countBefore + 1);
    const found = updatedUsers.find((u) => u.username === 'e2e_ops_manager');
    expect(found).toBeDefined();

    // 4. Toggle Status from Active (1) to Inactive (0)
    await userApi.changeUserStatus({
      username: 'e2e_ops_manager',
      hrmsId: 'HRMS888',
      status: 0,
    });

    const usersAfterToggle = await userApi.getUsersList();
    const toggledUser = usersAfterToggle.find((u) => u.username === 'e2e_ops_manager');
    expect(toggledUser?.status).toBe(0);
  });

  // Journey 2: Dealer Onboarding & MPIN Security
  it('Journey 2: Verify duplicate PAN/Aadhaar, onboard channel dealer, and reset MPIN with OTP', async () => {
    // 1. PAN validation check
    const panCheck = await dealerApi.checkDealerByPan('UNIQUE9999Z');
    expect(panCheck.exists).toBe(false);

    // 2. Aadhaar validation check
    const aadharCheck = await dealerApi.checkDealerByAadhar('999988887777');
    expect(aadharCheck.exists).toBe(false);

    // 3. Onboard Dealer
    const newDealerPayload = {
      name: 'E2E Telecom Outlet',
      msisdn: '9899001122',
      dealerType: 'Retailer',
      category: 'Category A',
      circleId: 1,
      ssaId: 1,
      panId: 'UNIQUE9999Z',
      aadharId: '999988887777',
      franchiseMsisdn: '9811012345',
    };

    const createRes = await dealerApi.createDealer(newDealerPayload as any);
    expect(createRes).toBeDefined();

    // 4. Verify Dealer in Directory
    const dealerList = await dealerApi.getDealerList();
    const createdDealer = dealerList.find((d: any) => d.msisdn === '9899001122');
    expect(createdDealer).toBeDefined();
    expect(createdDealer?.name).toBe('E2E Telecom Outlet');

    // 5. Reset Dealer MPIN with OTP
    let mpinResetDone = false;
    const mpinMutation = vi.fn(async () => {
      await dealerApi.resetMpin({ dealerCode: '9899001122', msisdn: '9899001122' } as any);
      mpinResetDone = true;
    });

    const { result: mpinHook } = renderHook(() =>
      useOtpGuardedAction(mpinMutation, {
        topic: 'DealerMpinReset',
        msisdn: '9899001122',
      })
    );

    act(() => {
      mpinHook.current.initiate();
    });
    await act(async () => {
      await mpinHook.current.confirm();
    });
    act(() => {
      mpinHook.current.setOtp('1234');
    });
    await act(async () => {
      await mpinHook.current.submitOtp();
    });

    expect(mpinHook.current.state).toBe('success');
    expect(mpinResetDone).toBe(true);
  });

  // Journey 3: Tariff Plan, Denomination & Number Series Allocation
  it('Journey 3: Create tariff plan, configure zone denomination, lookup recharge, and allocate number series', async () => {
    // 1. Fetch current plans
    const initialPlans = await planApi.getPlans();
    const planCountBefore = initialPlans.length;

    // 2. Publish New Tariff Plan
    const newPlanRes = await planApi.addPlan({
      operator: 'BSNL',
      denomination: 499,
      talkvalue: 400,
      planType: 'Prepaid Premium Unlimited',
      description: '3GB/day with OTT Subscription',
      tabName: 'Prepaid',
      circleId: 1,
      validity: 84,
    } as any);
    expect(newPlanRes).toBeDefined();

    const updatedPlans = await planApi.getPlans();
    expect(updatedPlans.length).toBe(planCountBefore + 1);

    // 3. Save Zone Denomination
    const denomRes = await planApi.saveDenomination({
      denomination: 499,
      validityDays: 84,
      circleCode: '1',
      planType: 'Prepaid',
    });
    expect(denomRes).toBeDefined();

    // 4. Lookup Recharge Plan
    const lookupPlan = await planApi.fetchRechargePlan(199);
    expect(lookupPlan).toBeDefined();
    expect(lookupPlan.denomination).toBe(199);

    // 5. Port-In Record via MNP
    const mnpRes = await masterdataApi.saveMnp({
      msisdn: '9876599999',
      donorOperator: 'Vodafone',
      recipientOperator: 'BSNL',
      upcCode: 'UPC999',
      upcExpiry: '2026-12-31',
      circleCode: '1',
    });
    expect(mnpRes).toBeDefined();

    // 6. Allocate New Number Series Batch
    const seriesRes = await masterdataApi.addNumberSeries({
      seriesId: 'NS-94499',
      startRange: '9449900000',
      endRange: '9449999999',
      circleCode: '1',
      serviceType: 'GSM',
      series: '94499',
    } as any);
    expect(seriesRes).toBeDefined();

    // Verify Number Series in Catalog
    const seriesList = await masterdataApi.getNumberSeries({});
    const foundSeries = seriesList.find((s: any) => s.series === '94499');
    expect(foundSeries).toBeDefined();
  });
});
