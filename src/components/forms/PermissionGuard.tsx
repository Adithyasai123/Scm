import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserPermissions } from '@/types/api';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  permission: keyof UserPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
}) => {
  const [mounted, setMounted] = useState(false);
  const permissions = useAuthStore((state) => state.permissions);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Guarantee hydration matching between SSR and client-side persisted localStorage
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse opacity-50 py-4">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const val = permissions ? (permissions as any)[permission] : false;
  const hasPermission = isAuthenticated && (val === true || val === 1 || val === '1' || val === 'true');

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center flex flex-col items-center justify-center space-y-2">
        <div className="p-3 bg-slate-200/60 rounded-full text-slate-600">
          <Lock className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">Access Restricted</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          You do not hold active authorization for <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700">{String(permission)}</code>.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

