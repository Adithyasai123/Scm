'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ShieldCheck, RotateCcw, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { OtpState } from '@/hooks/useOtpGuardedAction';

interface OTPVerificationModalProps {
  isOpen: boolean;
  state: OtpState;
  error: string | null;
  otp: string;
  msisdn?: string;
  topic?: string;
  onOtpChange: (val: string) => void;
  onConfirm: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onResend: () => void;
}

const OTP_LENGTH = 4;

/** Map OTP state → step index (0-based) for the 3-step indicator */
function stateToStep(s: OtpState): number {
  if (s === 'idle' || s === 'confirming') return 0;
  if (s === 'sendingOtp' || s === 'otpPending' || s === 'validating') return 1;
  if (s === 'executing' || s === 'success') return 2;
  return 0;
}

/** Step indicator — 3 dots connected by lines */
function StepIndicator({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="step-track" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <span
            className={`step-dot ${i < step ? 'done' : i === step ? 'active' : 'future'}`}
          />
          {i < total - 1 && (
            <span className={`step-line ${i < step ? 'done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/** Individual digit OTP boxes with focus-advance */
function OtpBoxes({
  value,
  onChange,
  disabled,
  hasError,
  shake,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  hasError: boolean;
  shake: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '');

  const focus = useCallback((i: number) => {
    refs.current[i]?.focus();
  }, []);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) {
        const next = value.slice(0, i) + value.slice(i + 1);
        onChange(next.replace(/\D/g, '').slice(0, OTP_LENGTH));
      } else if (i > 0) {
        focus(i - 1);
        const next = value.slice(0, i - 1) + value.slice(i);
        onChange(next.replace(/\D/g, '').slice(0, OTP_LENGTH));
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault(); focus(i - 1);
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      e.preventDefault(); focus(i + 1);
    }
  };

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const arr = value.padEnd(OTP_LENGTH, ' ').split('');
    arr[i] = digit;
    const next = arr.join('').trim().replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(next);
    if (i < OTP_LENGTH - 1) focus(i + 1);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    onChange(pasted);
    focus(Math.min(pasted.length, OTP_LENGTH - 1));
  };

  return (
    <div
      className={`flex items-center justify-center gap-3 ${shake ? 'otp-shake' : ''}`}
      aria-label={`${OTP_LENGTH}-digit OTP input`}
    >
      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          disabled={disabled}
          aria-label={`OTP digit ${i + 1}`}
          autoFocus={i === 0}
          className={`otp-box ${digits[i] ? 'otp-filled' : ''} ${hasError ? 'otp-error' : ''}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  state,
  error,
  otp,
  msisdn,
  topic,
  onOtpChange,
  onConfirm,
  onSubmit,
  onCancel,
  onResend,
}) => {
  const [countdown, setCountdown] = useState(30);
  const [shake, setShake] = useState(false);

  /* Countdown timer */
  useEffect(() => {
    if (state === 'otpPending') {
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state]);

  /* Trigger shake on new error */
  useEffect(() => {
    if (error && state === 'otpPending') {
      setShake(true);
      const t = setTimeout(() => setShake(false), 360);
      return () => clearTimeout(t);
    }
  }, [error, state]);

  if (!isOpen) return null;

  const step = stateToStep(state);
  const isProcessing = state === 'validating' || state === 'executing' || state === 'sendingOtp';
  const showOtpInput = state === 'otpPending' || state === 'validating' || state === 'executing';
  const stepLabels = ['Confirm', 'Verify OTP', 'Complete'];

  return (
    <div
      className="drawer-backdrop"
      role="dialog"
      aria-modal
      aria-labelledby="otp-drawer-title"
    >
      <div className="drawer-panel">
        {/* ── Drawer Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-accent text-white">
              <ShieldCheck className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 id="otp-drawer-title" className="text-sm font-bold text-foreground leading-none">
                Telecom Authorization
              </h3>
              <p className="text-[11px] text-muted-fg mt-1 font-medium">
                {topic ? `Action: ${topic}` : 'Secure transaction verification'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StepIndicator step={step} />
            {!isProcessing && state !== 'success' && (
              <button
                onClick={onCancel}
                className="p-1 rounded-md text-muted-fg/70 hover:text-foreground hover:bg-[#E8EDEB]/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>

        {/* ── Drawer Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step labels */}
          <div className="flex justify-between text-[11px] text-muted-fg/70 font-semibold border-b border-border pb-3">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className={i === step ? 'text-accent font-bold' : ''}
              >
                {label}
              </span>
            ))}
          </div>

          {/* CONFIRMING STATE */}
          {state === 'confirming' && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-alt rounded-md border border-border space-y-2">
                <div className="text-xs font-semibold text-foreground">Authorized Telecom Mutation</div>
                <p className="text-xs text-muted-fg leading-relaxed">
                  You are about to execute a protected mutation for{' '}
                  <strong className="text-foreground">{topic || 'Requested Operation'}</strong>.
                  A one-time verification code will be dispatched to your registered MSISDN.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono font-bold text-accent">
                  <span>Target MSISDN:</span>
                  <span>{msisdn || '+91-9876543210'}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FFFBEB] border border-[#FFC010]/40 rounded-md text-[11px] text-[#7A5800] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#FFC010] shrink-0 mt-0.5" />
                <span>
                  Mandatory regulatory policy requires two-factor verification before applying changes to live sales channel records.
                </span>
              </div>
            </div>
          )}

          {/* SENDING OTP STATE */}
          {state === 'sendingOtp' && (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-xs font-semibold text-foreground">
                Dispatching OTP via Telecom Gateway...
              </p>
              <p className="text-[11px] text-muted-fg/70">
                Routing SMS payload to {msisdn || 'registered phone'}
              </p>
            </div>
          )}

          {/* OTP PENDING / VALIDATING / EXECUTING STATE */}
          {showOtpInput && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Enter 4-Digit One-Time Password
                </p>
                <p className="text-[11px] text-muted-fg">
                  Sent to <span className="font-mono font-bold text-foreground">{msisdn || 'your phone'}</span>
                </p>
              </div>

              <OtpBoxes
                value={otp}
                onChange={onOtpChange}
                disabled={state === 'validating' || state === 'executing'}
                hasError={!!error}
                shake={shake}
              />

              {error && (
                <div className="flex items-center gap-2 text-[#DB3030] bg-[#FDF2F2] border border-[#DB3030]/20 px-3 py-2 rounded-md text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-fg/70 pt-2">
                {countdown > 0 ? (
                  <span>Resend code in <strong className="font-mono text-foreground">{countdown}s</strong></span>
                ) : (
                  <button
                    type="button"
                    onClick={onResend}
                    className="text-accent hover:text-[#0369A1] font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Resend OTP
                  </button>
                )}
                <span className="text-[10px] text-muted-fg/70 font-mono">(Mock: Any 4 digits)</span>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {state === 'success' && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <CheckCircle2 className="w-7 h-7" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Verification Successful</p>
                <p className="text-xs text-muted-fg mt-1">The channel mutation has been committed to the registry.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Drawer Footer ── */}
        <div className="p-4 bg-background border-t border-border flex items-center justify-end gap-2.5 shrink-0">
          {state === 'confirming' && (
            <>
              <button type="button" onClick={onCancel} className="btn btn-ghost">
                Cancel
              </button>
              <button type="button" onClick={onConfirm} className="btn btn-primary">
                Send OTP Code
              </button>
            </>
          )}

          {showOtpInput && (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSubmit}
                disabled={otp.length < OTP_LENGTH || isProcessing}
                className="btn btn-primary"
              >
                {state === 'validating' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {state === 'executing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {state === 'validating'
                    ? 'Validating...'
                    : state === 'executing'
                    ? 'Applying...'
                    : 'Verify & Apply'}
                </span>
              </button>
            </>
          )}

          {state === 'success' && (
            <button type="button" onClick={onCancel} className="btn btn-primary">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

