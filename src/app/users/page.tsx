'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user.api';
import { masterdataApi } from '@/api/masterdata.api';
import { useZoneCircleSSA } from '@/hooks/useZoneCircleSSA';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';
import { DataTable, Column } from '@/components/tables/DataTable';
import { SearchToolbar } from '@/components/tables/SearchToolbar';
import { StatusBadge } from '@/components/tables/StatusBadge';
import { OTPVerificationModal } from '@/components/feedback/OTPVerificationModal';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { ZoneSelector } from '@/components/forms/ZoneSelector';
import { CircleSelector } from '@/components/forms/CircleSelector';
import { SSASelector } from '@/components/forms/SSASelector';
import { PermissionGuard } from '@/components/forms/PermissionGuard';
import { useAuthStore } from '@/stores/authStore';
import { User, CreateUserPayload } from '@/types/api';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Shield,
  Key,
  Power,
  X,
  Check,
  Eye,
  Edit2,
  Filter,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hasUserPerm = useAuthStore((state) => state.hasPermission('userPermissions'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | '1' | '0'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');

  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusChangeTarget, setStatusChangeTarget] = useState<User | null>(null);

  // Geographic Cascade for Create Form
  const {
    zones,
    circles,
    ssas,
    selectedZone,
    selectedCircle,
    selectedSSA,
    selectZone,
    selectCircle,
    setSelectedSSA,
  } = useZoneCircleSSA();

  // Fetch Users
  const { data: users, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getUsersList(),
    enabled: hasUserPerm,
  });

  const usersList: User[] = Array.isArray(users) ? users : [];

  // Form State for User Creation
  const [formData, setFormData] = useState({
    hrmsId: '',
    username: '',
    mobileNumber: '',
    firstName: '',
    lastName: '',
    address: '',
    dob: '1995-01-01',
    password: '',
    roleId: 2,
    roleName: 'Circle Manager',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    hrmsId: '',
    firstName: '',
    lastName: '',
    address: '',
    mobileNumber: '',
    roleId: 2,
    roleName: '',
    zoneId: 1,
    circleId: 1,
    ssaId: 1,
    dob: '1995-01-01',
  });

  const [permissions, setPermissions] = useState<Record<string, boolean>>({
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
  });

  // OTP Guarded Action for User Creation
  const otpAction = useOtpGuardedAction(
    async () => {
      const payload: any = {
        ...formData,
        status: 1,
        zoneId: selectedZone || 1,
        circleId: selectedCircle || 1,
        ssaId: selectedSSA || 1,
        loginStatus: '1',
        createdBy: 'admin',
        updatedBy: null,
        ipAddress: '127.0.0.1',
        userIpAddress: '127.0.0.1',
        expiredate: '2030-12-31',
        cdt: new Date().toISOString(),
        permissions,
      };

      await userApi.createUser(payload);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsCreateModalOpen(false);
      setFormData({
        hrmsId: '',
        username: '',
        mobileNumber: '',
        firstName: '',
        lastName: '',
        address: '',
        dob: '1995-01-01',
        password: '',
        roleId: 2,
        roleName: 'Circle Manager',
      });
    },
    {
      topic: 'UserCreation',
      msisdn: formData.mobileNumber || '9876543210',
    }
  );

  // Status Change OTP Action
  const statusOtpAction = useOtpGuardedAction(
    async () => {
      if (!statusChangeTarget) return;
      const newStatus = statusChangeTarget.status === 1 ? 0 : 1;
      await userApi.changeUserStatus({
        username: statusChangeTarget.username,
        hrmsId: statusChangeTarget.hrmsId,
        status: newStatus,
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setStatusChangeTarget(null);
    },
    {
      topic: 'UserStatusToggle',
      msisdn: useAuthStore.getState().msisdn || '9876543210',
    }
  );

  // Edit User OTP Action
  const editOtpAction = useOtpGuardedAction(
    async () => {
      if (!selectedUserForEdit) return;
      await userApi.modifyUser({
        username: selectedUserForEdit.username,
        hrmsId: editFormData.hrmsId || selectedUserForEdit.hrmsId,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        address: editFormData.address,
        mobileNumber: editFormData.mobileNumber,
        roleId: editFormData.roleId || selectedUserForEdit.roleId || 2,
        zoneId: editFormData.zoneId || selectedUserForEdit.zoneId || 1,
        circleId: editFormData.circleId || selectedUserForEdit.circleId || 1,
        ssaId: editFormData.ssaId || selectedUserForEdit.ssaId || 1,
        dob: editFormData.dob,
      } as any);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUserForEdit(null);
    },
    {
      topic: 'UserEdit',
      msisdn: useAuthStore.getState().msisdn || '9876543210',
    }
  );

  // Permissions Mutation
  const permMutation = useMutation({
    mutationFn: async (updatedPerms: Record<string, boolean>) => {
      if (!selectedUserForPerms) return;
      await userApi.modifyPermissions({
        username: selectedUserForPerms.username,
        permissions: updatedPerms as any,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUserForPerms(null);
    },
  });

  // Filtered Users
  const filteredUsers = usersList.filter((u) => {
    const q = search.toLowerCase();
    const matchQuery =
      !q ||
      u.username.toLowerCase().includes(q) ||
      (u.hrmsId && u.hrmsId.toLowerCase().includes(q)) ||
      (u.firstName && u.firstName.toLowerCase().includes(q)) ||
      (u.lastName && u.lastName.toLowerCase().includes(q)) ||
      (u.mobileNumber && u.mobileNumber.includes(q));

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === '1' && u.status === 1) ||
      (statusFilter === '0' && u.status === 0);

    const matchRole =
      roleFilter === 'ALL' ||
      String(u.roleId) === roleFilter ||
      (u.roleName && u.roleName.toLowerCase().includes(roleFilter.toLowerCase()));

    const matchZone = zoneFilter === 'ALL' || String(u.zoneId) === zoneFilter;

    return matchQuery && matchStatus && matchRole && matchZone;
  });

  const columns: Column<User>[] = [
    {
      key: 'username',
      header: 'User / HRMS ID',
      render: (u) => (
        <div>
          <div className="font-bold text-foreground">{u.username}</div>
          <div className="text-[11px] font-mono text-muted-fg">HRMS: {u.hrmsId || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'firstName',
      header: 'Full Name',
      render: (u) => (
        <span className="font-semibold text-foreground">
          {u.firstName} {u.lastName}
        </span>
      ),
    },
    {
      key: 'mobileNumber',
      header: 'Mobile',
      render: (u) => <span className="font-mono text-xs text-muted-fg">{u.mobileNumber || 'N/A'}</span>,
    },
    {
      key: 'roleName',
      header: 'Role / Designation',
      render: (u) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800">
          {u.roleName || `Role ${u.roleId}`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (u) => <StatusBadge status={u.status === 1 ? 'ACTIVE' : 'INACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center space-x-1.5">
          {/* View Details */}
          <button
            onClick={() => setSelectedUserForView(u)}
            type="button"
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 dark:hover:text-sky-400 rounded-lg transition-colors cursor-pointer"
            title="View User Details & Permissions"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Edit User */}
          <button
            onClick={() => {
              setSelectedUserForEdit(u);
              setEditFormData({
                hrmsId: u.hrmsId || '',
                firstName: u.firstName || '',
                lastName: u.lastName || '',
                address: u.address || '',
                mobileNumber: u.mobileNumber || '',
                roleId: u.roleId || 2,
                roleName: u.roleName || '',
                zoneId: u.zoneId || 1,
                circleId: u.circleId || 1,
                ssaId: u.ssaId || 1,
                dob: (u as any).dob || '1995-01-01',
              });
            }}
            type="button"
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit User Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Manage Permissions */}
          <button
            onClick={() => setSelectedUserForPerms(u)}
            type="button"
            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Manage Permissions Matrix"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Toggle Status */}
          <button
            onClick={() => setStatusChangeTarget(u)}
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              u.status === 1
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-sky-600 hover:bg-sky-50'
            }`}
            title={u.status === 1 ? 'Deactivate User' : 'Activate User'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <PermissionGuard permission="userPermissions">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">User Administration</h1>
          <p className="page-subtitle">
            Administer SCM portal operators, hierarchical zone assignments, and 18-point authorization privileges.
          </p>
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-alt text-foreground text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              title="Go Back to Previous Page"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          type="button"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {/* Search & Filters Toolbar */}
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search..."
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        extraActions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs font-medium focus:outline-none focus:border-accent focus:bg-surface transition-colors cursor-pointer"
              aria-label="Filter by Status"
            >
              <option value="ALL">All Statuses</option>
              <option value="1">Active Only</option>
              <option value="0">Inactive Only</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs font-medium focus:outline-none focus:border-accent focus:bg-surface transition-colors cursor-pointer"
              aria-label="Filter by Role"
            >
              <option value="ALL">All Roles</option>
              <option value="1">Super Admin</option>
              <option value="2">Circle Manager</option>
              <option value="3">Auditor</option>
            </select>

            {/* Zone Filter */}
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-background border border-border rounded-md text-foreground text-xs font-medium focus:outline-none focus:border-accent focus:bg-surface transition-colors cursor-pointer"
              aria-label="Filter by Zone"
            >
              <option value="ALL">All Zones</option>
              {zones.data?.map((z) => (
                <option key={z.id} value={String(z.id)}>
                  {z.name}
                </option>
              ))}
            </select>

            {(search || statusFilter !== 'ALL' || roleFilter !== 'ALL' || zoneFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                  setRoleFilter('ALL');
                  setZoneFilter('ALL');
                }}
                className="px-2 py-1 text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-semibold cursor-pointer hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        }
      />

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        keyExtractor={(u) => u.username}
      />

      {/* User View Details Modal */}
      {selectedUserForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-slate-800/90 dark:via-sky-950/30 dark:to-slate-800/80 p-6 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-[13px] shadow-sm shadow-sky-600/30">
                  {selectedUserForView.firstName ? selectedUserForView.firstName[0] : 'U'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedUserForView.firstName} {selectedUserForView.lastName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">@{selectedUserForView.username} · HRMS: {selectedUserForView.hrmsId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserForView(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-surface-alt rounded-xl border border-border">
                <div>
                  <span className="text-slate-400 font-medium">Role</span>
                  <div className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedUserForView.roleName || 'Operator'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Mobile Number</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">{selectedUserForView.mobileNumber || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Account Status</span>
                  <div className="mt-0.5"><StatusBadge status={selectedUserForView.status === 1 ? 'ACTIVE' : 'INACTIVE'} /></div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Assigned Zone</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Zone {selectedUserForView.zoneId || 1}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Circle ID</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Circle {selectedUserForView.circleId || 1}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Secondary Area (SSA)</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">SSA {selectedUserForView.ssaId || 1}</div>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-400 font-medium">Operating Address</span>
                  <div className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{selectedUserForView.address || 'Telecom Operations Center'}</div>
                </div>
              </div>

              {/* 18 Permissions Matrix */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Authorized Permissions Matrix (18 Flags)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(selectedUserForView.permissions || {}).map(([key, val]) => {
                    if (typeof val !== 'boolean') return null;
                    return (
                      <div
                        key={key}
                        className={`p-2 rounded-xl border flex items-center justify-between ${
                          val ? 'bg-sky-50/70 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300' : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-500'
                        }`}
                      >
                        <span className="truncate pr-1">{key}</span>
                        {val ? <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" /> : <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-850">
              <button
                onClick={() => setSelectedUserForView(null)}
                className="px-4 py-2 border border-border dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-slate-800/90 dark:via-sky-950/30 dark:to-slate-800/80 p-6 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit User Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update administrative credentials for @{selectedUserForEdit.username}</p>
              </div>
              <button onClick={() => setSelectedUserForEdit(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editOtpAction.initiate();
              }}
              className="p-6 space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={editFormData.mobileNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={editFormData.roleName}
                  onChange={(e) => setEditFormData({ ...editFormData, roleName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 border border-border dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editOtpAction.state === 'executing'}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
                >
                  {editOtpAction.state === 'executing' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-slate-800/90 dark:via-sky-950/30 dark:to-slate-800/80 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Update Permissions: {selectedUserForPerms.username || selectedUserForPerms.name}
                </h3>
                <p className="text-xs text-muted-fg mt-0.5">Toggle authorization flags for this user account</p>
              </div>
              <button onClick={() => setSelectedUserForPerms(null)} className="p-1 text-muted-fg hover:text-foreground cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(selectedUserForPerms.permissions || {}).map(([key, val]) => {
                  if (typeof val !== 'boolean') return null;
                  return (
                    <label
                      key={key}
                      className="p-3 bg-surface-alt rounded-xl border border-border flex items-center justify-between cursor-pointer hover:bg-surface transition-colors"
                    >
                      <span className="font-semibold text-foreground truncate pr-2">{key}</span>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => {
                          const updated = {
                            ...selectedUserForPerms.permissions,
                            [key]: e.target.checked,
                          };
                          setSelectedUserForPerms({
                            ...selectedUserForPerms,
                            permissions: updated as any,
                          });
                        }}
                        className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end space-x-2 bg-surface-alt">
              <button
                onClick={() => setSelectedUserForPerms(null)}
                className="px-4 py-2 border border-border dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => permMutation.mutate(selectedUserForPerms.permissions as any)}
                disabled={permMutation.isPending}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
              >
                {permMutation.isPending ? 'Updating...' : 'Save Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Dialog */}
      <ConfirmationDialog
        isOpen={!!statusChangeTarget}
        title={`${statusChangeTarget?.status === 1 ? 'Deactivate' : 'Activate'} User Account`}
        description={`Are you sure you want to change the status of ${statusChangeTarget?.username}? Inactive users are prevented from logging in.`}
        confirmLabel={statusChangeTarget?.status === 1 ? 'Deactivate' : 'Activate'}
        isDestructive={statusChangeTarget?.status === 1}
        onConfirm={() => {
          if (statusChangeTarget) {
            statusOtpAction.initiate();
          }
        }}
        onCancel={() => setStatusChangeTarget(null)}
      />

      {/* Edit User OTP Modal */}
      <OTPVerificationModal
        isOpen={editOtpAction.isModalOpen}
        state={editOtpAction.state}
        error={editOtpAction.error}
        otp={editOtpAction.otp}
        msisdn={useAuthStore.getState().msisdn || '9876543210'}
        topic="UserEdit"
        onOtpChange={editOtpAction.setOtp}
        onConfirm={editOtpAction.confirm}
        onSubmit={editOtpAction.submitOtp}
        onCancel={editOtpAction.cancel}
        onResend={editOtpAction.resendOtp}
      />

      {/* Status Change OTP Modal */}
      <OTPVerificationModal
        isOpen={statusOtpAction.isModalOpen}
        state={statusOtpAction.state}
        error={statusOtpAction.error}
        otp={statusOtpAction.otp}
        msisdn={useAuthStore.getState().msisdn || '9876543210'}
        topic="UserStatusToggle"
        onOtpChange={statusOtpAction.setOtp}
        onConfirm={statusOtpAction.confirm}
        onSubmit={statusOtpAction.submitOtp}
        onCancel={statusOtpAction.cancel}
        onResend={statusOtpAction.resendOtp}
      />

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden my-8">
            <div className="bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-slate-800/90 dark:via-sky-950/30 dark:to-slate-800/80 p-6 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Onboard New Administrative User</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">6-step OTP-guarded user registration with geographic assignment</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    ...formData,
                    zoneId: selectedZone || 1,
                    circleId: selectedCircle || 1,
                    ssaId: selectedSSA || 1,
                    status: 1,
                    permissions
                  };
                  await import('@/schemas/user.schema').then(m => m.createUserSchema.parse(payload));
                  otpAction.initiate();
                } catch (err: any) {
                  const issues = err?.issues || err?.errors;
                  if (Array.isArray(issues) && issues.length > 0) {
                    alert(issues.map((e: any) => e.message).join('\n'));
                  } else {
                    alert(err?.message || 'Validation error occurred.');
                  }
                }
              }}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">HRMS ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="HRMS999"
                    value={formData.hrmsId}
                    onChange={(e) => setFormData({ ...formData, hrmsId: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="user_ops"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Mobile Number (For OTP) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Geographic Cascade */}
              <div className="p-4 bg-surface-alt rounded-xl border border-border space-y-3">
                <span className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Geographical Hierarchy Assignment
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <ZoneSelector
                    zones={zones.data || []}
                    selectedZoneId={selectedZone}
                    onSelect={selectZone}
                  />
                  <CircleSelector
                    circles={circles.data || []}
                    selectedCircleId={selectedCircle}
                    onSelect={selectCircle}
                    disabled={!selectedZone}
                  />
                  <SSASelector
                    ssas={ssas.data || []}
                    selectedSsaId={selectedSSA}
                    onSelect={setSelectedSSA}
                    disabled={!selectedCircle}
                  />
                </div>
              </div>

              {/* 18 Permissions Toggles */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-foreground uppercase tracking-wider">
                  Initial Permission Privileges
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-surface-alt rounded-xl border border-border">
                  {Object.keys(permissions).map((permKey) => (
                    <label key={permKey} className="flex items-center space-x-2 text-[11px] text-slate-700 dark:text-slate-300 cursor-pointer hover:text-sky-600 transition-colors">
                      <input
                        type="checkbox"
                        checked={permissions[permKey]}
                        onChange={(e) => setPermissions({ ...permissions, [permKey]: e.target.checked })}
                        className="w-3.5 h-3.5 text-sky-600 focus:ring-sky-500 rounded"
                      />
                      <span className="truncate">{permKey}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => otpAction.initiate()}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
                >
                  Verify via OTP & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={otpAction.isModalOpen}
        state={otpAction.state}
        error={otpAction.error}
        otp={otpAction.otp}
        msisdn={formData.mobileNumber || '9876543210'}
        topic="UserCreation"
        onOtpChange={otpAction.setOtp}
        onConfirm={otpAction.confirm}
        onSubmit={otpAction.submitOtp}
        onCancel={otpAction.cancel}
        onResend={otpAction.resendOtp}
      />
      </div>
    </PermissionGuard>
  );
}

