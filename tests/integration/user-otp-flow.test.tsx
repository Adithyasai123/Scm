import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';

describe('Integration Flow: OTP-Guarded Mutation Pipeline', () => {
  it('executes full pipeline: initiate -> send OTP -> validate OTP -> execute mutation -> success', async () => {
    const mockMutation = vi.fn().mockResolvedValue({ status: 'SUCCESS', userId: 'USR-999' });
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() =>
      useOtpGuardedAction(mockMutation, {
        topic: 'UserCreation',
        msisdn: '9876543210',
        onSuccess,
        onError,
      })
    );

    // 1. Initial state
    expect(result.current.state).toBe('idle');

    // 2. Initiate mutation
    act(() => {
      result.current.initiate();
    });
    expect(result.current.state).toBe('confirming');
    expect(result.current.isModalOpen).toBe(true);

    // 3. User confirms -> Dispatches OTP
    await act(async () => {
      await result.current.confirm();
    });
    expect(result.current.state).toBe('otpPending');

    // 4. Enter valid OTP
    act(() => {
      result.current.setOtp('1234');
    });

    // 5. Submit OTP -> validates and executes mutation
    await act(async () => {
      await result.current.submitOtp();
    });

    expect(result.current.state).toBe('success');
    expect(mockMutation).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ status: 'SUCCESS', userId: 'USR-999' });
    expect(onError).not.toHaveBeenCalled();
  });

  it('handles invalid OTP error and stays in otpPending to allow re-entry', async () => {
    const mockMutation = vi.fn();
    const { result } = renderHook(() =>
      useOtpGuardedAction(mockMutation, {
        topic: 'UserCreation',
        msisdn: '9876543210',
      })
    );

    // Fast forward to otpPending
    act(() => {
      result.current.initiate();
    });
    await act(async () => {
      await result.current.confirm();
    });
    expect(result.current.state).toBe('otpPending');

    // Enter invalid OTP '9999' (configured in MSW mock to fail)
    act(() => {
      result.current.setOtp('9999');
    });

    await act(async () => {
      await result.current.submitOtp();
    });

    // Invariant: Mutation MUST NOT run on invalid OTP
    expect(mockMutation).not.toHaveBeenCalled();
    // Invariant: Modal remains open in otpPending state with error displayed
    expect(result.current.state).toBe('otpPending');
    expect(result.current.error).toContain('Invalid OTP');
  });
});
