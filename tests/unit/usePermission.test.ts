import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('Auth Store & Permission Logic', () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it('returns false for permissions when logged out', () => {
    const hasPerm = useAuthStore.getState().hasPermission('commissionPermissions');
    expect(hasPerm).toBe(false);
  });

  it('returns true when user holds permission', () => {
    useAuthStore.getState().login({
      username: 'test_admin',
      hrmsId: 'HRMS001',
      msisdn: '9876543210',
      displayName: 'Test Admin',
    });

    const hasPerm = useAuthStore.getState().hasPermission('dealerPermissions');
    expect(hasPerm).toBe(true);
  });

  it('updates permissions dynamically via updatePermission', () => {
    useAuthStore.getState().login({
      username: 'test_admin',
      hrmsId: 'HRMS001',
      msisdn: '9876543210',
      displayName: 'Test Admin',
    });

    useAuthStore.getState().updatePermission('dealerPermissions', false);
    expect(useAuthStore.getState().hasPermission('dealerPermissions')).toBe(false);

    useAuthStore.getState().updatePermission('dealerPermissions', true);
    expect(useAuthStore.getState().hasPermission('dealerPermissions')).toBe(true);
  });
});
