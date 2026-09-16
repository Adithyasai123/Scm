import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserPermissions } from '@/types/api';
import { X, Shield } from 'lucide-react';

interface DevPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DevPermissionsModal: React.FC<DevPermissionsModalProps> = ({ isOpen, onClose }) => {
  const permissions = useAuthStore((s) => s.permissions);
  const updatePermission = useAuthStore((s) => s.updatePermission);

  if (!isOpen || !permissions) return null;

  const permissionKeys: (keyof UserPermissions)[] = [
    'userPermissions',
    'dealerPermissions',
    'commissionPermissions',
    'plansNumberpermissions',
    'reportsPermissions',
    'walletPermissions',
    'dealerMpinReset',
    'dealerStatus',
    'franchiseAddBalance',
    'stockCheck',
    'bulkRecharge',
    'varepReports',
    'userActivityReports',
    'transactionStatus',
    'topupReversal',
    'mnp',
    'prepaidCommissions',
    'postpaidCommissions',
    'landlineCommissions',
    'FOSCreation',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001E2B]/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-surface rounded-[12px] shadow-[var(--shadow-modal)] border border-border overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-accent/10 text-accent rounded-md">
              <Shield className="w-4 h-4" strokeWidth={1.8} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Dev Permissions Control Panel</h3>
              <p className="text-[11px] text-muted-fg">Toggle permission flags to test dynamic navigation & UI guards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-muted-fg/70 hover:text-foreground rounded-md" aria-label="Close">
            <X className="w-4 h-4" strokeWidth={1.8} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {permissionKeys.map((key) => {
              const val = permissions[key];
              const isGranted = typeof val === 'boolean' ? val : false;
              return (
                <div
                  key={key}
                  onClick={() => updatePermission(key, !isGranted)}
                  className={`flex items-center justify-between p-2 rounded-md border cursor-pointer transition-colors ${
                    isGranted
                      ? 'bg-accent/10/60 border-accent/30 text-foreground'
                      : 'bg-background border-border text-muted-fg'
                  }`}
                >
                  <span className="text-[11px] font-semibold truncate pr-2">{key}</span>
                  {isGranted ? (
                    <span className="px-1.5 py-0.5 bg-accent text-white rounded text-[9px] font-bold uppercase tracking-wider">
                      Granted
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-[#E8EDEB] text-muted-fg rounded text-[9px] font-bold uppercase tracking-wider">
                      Denied
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3.5 bg-background border-t border-border flex items-center justify-between text-[11px] text-muted-fg">
          <span>Changes take effect immediately across all guarded screens.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-accent hover:bg-[#0369A1] text-white font-semibold rounded-md text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

