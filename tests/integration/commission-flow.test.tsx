import { describe, it, expect, vi } from 'vitest';
import { commissionApi } from '@/api/commission.api';
import { renderHook, act } from '@testing-library/react';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';

describe('Integration Flow: Commission Engine Lifecycle', () => {
  it('fetches categorized commission rules for FRC, OTF, Postpaid, and Landline', async () => {
    const frcRules = await commissionApi.fetchPrepaidFrcCommission({});
    expect(Array.isArray(frcRules)).toBe(true);
    expect(frcRules.length).toBeGreaterThan(0);

    const otfRules = await commissionApi.fetchPrepaidOtfCommission({});
    expect(Array.isArray(otfRules)).toBe(true);

    const postpaidRules = await commissionApi.fetchPostpaidCommission({});
    expect(Array.isArray(postpaidRules)).toBe(true);

    const landlineRules = await commissionApi.fetchLandlineCommission({});
    expect(Array.isArray(landlineRules)).toBe(true);
  });

  it('completes full OTP verification cycle before committing commission rule', async () => {
    let committedRule: any = null;

    const saveMutation = vi.fn(async () => {
      const res = await commissionApi.saveCommissionConfig({
        circleId: 1,
        categoryId: 1,
        commissionRate: '5.5%',
        type: 'FRC',
      } as any);
      committedRule = res;
      return res;
    });

    const { result } = renderHook(() =>
      useOtpGuardedAction(saveMutation, {
        topic: 'Commission_FRC',
        msisdn: '9876543210',
      })
    );

    // Initial
    expect(result.current.state).toBe('idle');

    // Initiate
    act(() => {
      result.current.initiate();
    });
    expect(result.current.state).toBe('confirming');

    // Confirm -> triggers sendOtp
    await act(async () => {
      await result.current.confirm();
    });
    expect(result.current.state).toBe('otpPending');

    // Submit correct OTP '1234'
    act(() => {
      result.current.setOtp('1234');
    });

    await act(async () => {
      await result.current.submitOtp();
    });

    expect(result.current.state).toBe('success');
    expect(saveMutation).toHaveBeenCalledTimes(1);
    expect(committedRule).not.toBeNull();
  });

  it('supports bulk zone commission configuration dispatch', async () => {
    const bulkPayload = [
      { circleId: 1, categoryId: 1, commissionRate: '4.0%', type: 'FRC' } as any,
      { circleId: 2, categoryId: 1, commissionRate: '4.2%', type: 'FRC' } as any,
    ];

    const res = await commissionApi.saveMultipleCommissionConfig(0, bulkPayload);
    expect(res).toBeDefined();
  });
});
