import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';

describe('useOtpGuardedAction Finite State Machine', () => {
  it('initializes in idle state', () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() =>
      useOtpGuardedAction(mutationFn, { topic: 'TestTopic', msisdn: '9876543210' })
    );

    expect(result.current.state).toBe('idle');
    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('transitions from idle to confirming on initiate', () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() =>
      useOtpGuardedAction(mutationFn, { topic: 'TestTopic', msisdn: '9876543210' })
    );

    act(() => {
      result.current.initiate();
    });

    expect(result.current.state).toBe('confirming');
    expect(result.current.isModalOpen).toBe(true);
  });

  it('transitions back to idle on cancel', () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() =>
      useOtpGuardedAction(mutationFn, { topic: 'TestTopic', msisdn: '9876543210' })
    );

    act(() => {
      result.current.initiate();
    });
    expect(result.current.state).toBe('confirming');

    act(() => {
      result.current.cancel();
    });
    expect(result.current.state).toBe('idle');
    expect(result.current.isModalOpen).toBe(false);
  });

  it('rejects short OTP input before submission', async () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(() =>
      useOtpGuardedAction(mutationFn, { topic: 'TestTopic', msisdn: '9876543210' })
    );

    act(() => {
      result.current.setOtp('12');
    });

    await act(async () => {
      await result.current.submitOtp();
    });

    expect(result.current.error).toBe('Please enter a valid 4-digit OTP');
    expect(mutationFn).not.toHaveBeenCalled();
  });
});
