import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPermissions } from '@/types/api';

export const DEFAULT_PERMISSIONS: UserPermissions = {
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
};

export const PRESET_ROLES: Record<string, { roleName: string; displayName: string; permissions: UserPermissions }> = {
  SUPER_ADMIN: {
    roleName: 'Super Admin',
    displayName: 'Adithya (Super Admin)',
    permissions: { ...DEFAULT_PERMISSIONS, roleId: 1, roleName: 'Super Admin' },
  },
  CIRCLE_MANAGER: {
    roleName: 'Circle Ops Manager',
    displayName: 'Rajesh (Circle Manager)',
    permissions: {
      roleId: 2,
      username: 'ops_mgr',
      hrmsId: 'HRMS002',
      roleName: 'Circle Manager',
      dealerPermissions: true,
      walletPermissions: false,
      userPermissions: true,
      commissionPermissions: false,
      plansNumberpermissions: true,
      reportsPermissions: false,
      stockCheck: true,
      dealerMpinReset: true,
      franchiseAddBalance: false,
      bulkRecharge: true,
      varepReports: false,
      userActivityReports: true,
      dealerStatus: true,
      transactionStatus: false,
      topupReversal: false,
      mnp: true,
      prepaidCommissions: false,
      postpaidCommissions: false,
      landlineCommissions: false,
      FOSCreation: true,
    },
  },
  COMMISSION_OFFICER: {
    roleName: 'Commission Specialist',
    displayName: 'Sunita (Commission Lead)',
    permissions: {
      roleId: 3,
      username: 'comm_officer',
      hrmsId: 'HRMS003',
      roleName: 'Commission Specialist',
      dealerPermissions: false,
      walletPermissions: false,
      userPermissions: false,
      commissionPermissions: true,
      plansNumberpermissions: true,
      reportsPermissions: true,
      stockCheck: false,
      dealerMpinReset: false,
      franchiseAddBalance: false,
      bulkRecharge: false,
      varepReports: true,
      userActivityReports: false,
      dealerStatus: false,
      transactionStatus: true,
      topupReversal: false,
      mnp: true,
      prepaidCommissions: true,
      postpaidCommissions: true,
      landlineCommissions: true,
      FOSCreation: false,
    },
  },
  FINANCE_AUDITOR: {
    roleName: 'Finance & Wallet Auditor',
    displayName: 'Vikram (Finance Auditor)',
    permissions: {
      roleId: 4,
      username: 'finance_audit',
      hrmsId: 'HRMS004',
      roleName: 'Finance Auditor',
      dealerPermissions: false,
      walletPermissions: true,
      userPermissions: false,
      commissionPermissions: false,
      plansNumberpermissions: false,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: false,
      franchiseAddBalance: true,
      bulkRecharge: false,
      varepReports: true,
      userActivityReports: true,
      dealerStatus: false,
      transactionStatus: true,
      topupReversal: true,
      mnp: false,
      prepaidCommissions: false,
      postpaidCommissions: false,
      landlineCommissions: false,
      FOSCreation: false,
    },
  },
  READ_ONLY: {
    roleName: 'Read-Only Inspector',
    displayName: 'Ananya (Auditor)',
    permissions: {
      roleId: 5,
      username: 'auditor',
      hrmsId: 'HRMS005',
      roleName: 'Auditor',
      dealerPermissions: false,
      walletPermissions: false,
      userPermissions: false,
      commissionPermissions: false,
      plansNumberpermissions: false,
      reportsPermissions: false,
      stockCheck: false,
      dealerMpinReset: false,
      franchiseAddBalance: false,
      bulkRecharge: false,
      varepReports: false,
      userActivityReports: false,
      dealerStatus: false,
      transactionStatus: false,
      topupReversal: false,
      mnp: false,
      prepaidCommissions: false,
      postpaidCommissions: false,
      landlineCommissions: false,
      FOSCreation: false,
    },
  },
};

interface AuthState {
  username: string | null;
  hrmsId: string | null;
  msisdn: string | null;
  displayName: string | null;
  permissions: UserPermissions | null;
  currentRoleKey: string;
  isAuthenticated: boolean;
  login: (data: { username: string; hrmsId: string; msisdn: string; displayName: string; permissions?: UserPermissions }) => void;
  logout: () => void;
  hasPermission: (key: keyof UserPermissions) => boolean;
  updatePermission: (key: keyof UserPermissions, value: boolean) => void;
  switchRole: (roleKey: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      username: 'admin',
      hrmsId: 'HRMS001',
      msisdn: '9876543210',
      displayName: 'Adithya (Admin)',
      permissions: DEFAULT_PERMISSIONS,
      currentRoleKey: 'SUPER_ADMIN',
      isAuthenticated: true,
      login: (data) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('scm_username', data.username);
        }
        set({
          username: data.username,
          hrmsId: data.hrmsId,
          msisdn: data.msisdn,
          displayName: data.displayName,
          permissions: data.permissions || DEFAULT_PERMISSIONS,
          currentRoleKey: 'SUPER_ADMIN',
          isAuthenticated: true,
        });
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('scm_username');
        }
        set({
          username: null,
          hrmsId: null,
          msisdn: null,
          displayName: null,
          permissions: null,
          currentRoleKey: 'SUPER_ADMIN',
          isAuthenticated: false,
        });
      },
      hasPermission: (key) => {
        const { permissions, isAuthenticated } = get();
        if (!isAuthenticated || !permissions) return false;
        const val = (permissions as any)[key];
        return val === true || val === 1 || val === '1' || val === 'true';
      },
      updatePermission: (key, value) => {
        const current = get().permissions || DEFAULT_PERMISSIONS;
        set({ permissions: { ...current, [key]: value }, currentRoleKey: 'CUSTOM' });
      },
      switchRole: (roleKey: string) => {
        const role = PRESET_ROLES[roleKey];
        if (role) {
          const newPermissions = { ...role.permissions };
          const newUsername = (newPermissions as any).username || 'admin';
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('scm_username', newUsername);
            } catch {}
          }
          set({
            permissions: newPermissions,
            displayName: role.displayName,
            currentRoleKey: roleKey,
            username: newUsername,
            hrmsId: (newPermissions as any).hrmsId || 'HRMS001',
            isAuthenticated: true,
          });
        }
      },
    }),
    { name: 'scm-auth-storage' }
  )
);
