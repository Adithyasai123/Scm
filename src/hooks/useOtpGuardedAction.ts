import { useState, useCallback } from 'react';
import { masterdataApi } from '@/api/masterdata.api';
import { ApiError } from '@/types/api';

export type OtpState =
  | 'idle'
  | 'confirming'
  | 'sendingOtp'
  | 'otpPending'
  | 'validating'
  | 'validated'
  | 'executing'
  | 'success'
  | 'error';

export interface UseOtpGuardedActionOptions {
  topic: string;
  msisdn: string;
  operation?: string;
  onSuccess?: (result: unknown) => void;
  onError?: (error: ApiError) => void;
}

export interface UseOtpGuardedActionReturn {
  state: OtpState;
  error: string | null;
  otp: string;
  setOtp: (otp: string) => void;
  initiate: () => void;
  confirm: () => Promise<void>;
  cancel: () => void;
  submitOtp: () => Promise<void>;
  resendOtp: () => Promise<void>;
  isModalOpen: boolean;
}

export function useOtpGuardedAction<T>(
  mutationFn: () => Promise<T>,
  options: UseOtpGuardedActionOptions
): UseOtpGuardedActionReturn {
  const [state, setState] = useState<OtpState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState('');

  const { topic, msisdn, operation = '10069', onSuccess, onError } = options;

  const sendOtp = useCallback(async () => {
    setState('sendingOtp');
    setError(null);
    try {
      await masterdataApi.sendOtp({ msisdn, operation, topic });
      setState('otpPending');
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to send OTP');
      setState('error');
    }
  }, [msisdn, operation, topic]);

  const initiate = useCallback(() => {
    setState('confirming');
    setError(null);
    setOtp('');
  }, []);

  const confirm = useCallback(async () => {
    await sendOtp();
  }, [sendOtp]);

  const cancel = useCallback(() => {
    setState('idle');
    setError(null);
    setOtp('');
  }, []);

  const submitOtp = useCallback(async () => {
    if (state === 'validating' || state === 'executing' || state === 'sendingOtp') {
      return;
    }
    if (!otp || otp.length < 4) {
      setError('Please enter a valid 4-digit OTP');
      return;
    }
    setState('validating');
    setError(null);
    try {
      await masterdataApi.validateOtp({ otp, operation, msisdn });
      setState('validated');

      // CRITICAL: Execute mutation strictly AFTER validation succeeds
      setState('executing');
      try {
        const result = await mutationFn();
        setState('success');
        onSuccess?.(result);
      } catch (execErr) {
        const apiErr = execErr as ApiError;
        setError(apiErr.message || 'Mutation failed');
        setState('error');
        onError?.(apiErr);
      }
    } catch (valErr) {
      const apiErr = valErr as ApiError;
      setError(apiErr.message || 'Invalid OTP. Please try again.');
      setState('otpPending'); // Allow retry in same modal
    }
  }, [otp, operation, msisdn, mutationFn, onSuccess, onError]);

  const resendOtp = useCallback(async () => {
    setOtp('');
    await sendOtp();
  }, [sendOtp]);

  return {
    state,
    error,
    otp,
    setOtp,
    initiate,
    confirm,
    cancel,
    submitOtp,
    resendOtp,
    isModalOpen: ['confirming', 'sendingOtp', 'otpPending', 'validating', 'validated', 'executing', 'success'].includes(state),
  };
}
