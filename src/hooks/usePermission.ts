import { useAuthStore } from '@/stores/authStore';
import { UserPermissions } from '@/types/api';

export function usePermission(key: keyof UserPermissions): boolean {
  return useAuthStore((state) => state.hasPermission(key));
}

export function usePermissions(): UserPermissions | null {
  return useAuthStore((state) => state.permissions);
}
