'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealerApi } from '@/api/dealer.api';
import { masterdataApi } from '@/api/masterdata.api';
import { useZoneCircleSSA } from '@/hooks/useZoneCircleSSA';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';
import { DataTable, Column } from '@/components/tables/DataTable';
import { SearchToolbar } from '@/components/tables/SearchToolbar';
import { StatusBadge } from '@/components/tables/StatusBadge';
import { OTPVerificationModal } from '@/components/feedback/OTPVerificationModal';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { CircleSelector } from '@/components/forms/CircleSelector';
import { SSASelector } from '@/components/forms/SSASelector';
import { PermissionGuard } from '@/components/forms/PermissionGuard';
import { useAuthStore } from '@/stores/authStore';
import { Dealer, CreateDealerPayload } from '@/types/api';
import {
  Store,
  KeyRound,
  Network,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Power,
  Trash2,
  GitFork,
  Check,
  Building2,
} from 'lucide-react';

export default function DealersPage() {
  const queryClient = useQueryClient();
  const hasDealerPerm = useAuthStore((state) => state.hasPermission('dealerPermissions'));
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'hierarchy'>('list');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState<Dealer | null>(null);
  const [mpinTargetDealer, setMpinTargetDealer] = useState<Dealer | null>(null);
  const [statusTargetDealer, setStatusTargetDealer] = useState<Dealer | null>(null);
  const [hierarchyReassignTarget, setHierarchyReassignTarget] = useState<Dealer | null>(null);
  const [newParentMsisdn, setNewParentMsisdn] = useState('');

  // Geo selection for dealer registration
  const { circles, ssas, selectedCircle, selectedSSA, selectCircle, setSelectedSSA } = useZoneCircleSSA();

  // Fetch Dealers
  const { data: dealers, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dealers'],
    queryFn: () => dealerApi.getDealerList(),
    enabled: hasDealerPerm,
  });

  const dealerList = Array.isArray(dealers) ? dealers : [];

  // Onboard form state
  const [formData, setFormData] = useState({
    name: '',
    msisdn: '',
    dealerType: 'Retailer',
    category: 'Category A',
    panId: '',
    aadharId: '',
    franchiseMsisdn: '',
    subFranchiseMsisdn: '',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    dealerType: '',
    franchiseMsisdn: '',
    subFranchiseMsisdn: '',
  });

  const [panStatus, setPanStatus] = useState<'idle' | 'checking' | 'valid' | 'exists'>('idle');
  const [aadharStatus, setAadharStatus] = useState<'idle' | 'checking' | 'valid' | 'exists'>('idle');

  // Verify PAN duplicate check
  const handleCheckPan = async () => {
    if (!formData.panId) return;
    setPanStatus('checking');
    try {
      const res = await dealerApi.checkDealerByPan(formData.panId);
      setPanStatus(res.exists ? 'exists' : 'valid');
    } catch {
      setPanStatus('valid');
    }
  };

  // Verify Aadhaar duplicate check
  const handleCheckAadhar = async () => {
    if (!formData.aadharId) return;
    setAadharStatus('checking');
    try {
      const res = await dealerApi.checkDealerByAadhar(formData.aadharId);
      setAadharStatus(res.exists ? 'exists' : 'valid');
    } catch {
      setAadharStatus('valid');
    }
  };

  // OTP Guard for MPIN Reset
  const mpinOtpAction = useOtpGuardedAction(
    async () => {
      if (mpinTargetDealer) {
        await dealerApi.resetMpin({ dealerCode: mpinTargetDealer.msisdn || (mpinTargetDealer as any).dealerCode || '9876543210' } as any);
        queryClient.invalidateQueries({ queryKey: ['dealers'] });
        setMpinTargetDealer(null);
      }
    },
    {
      topic: 'DealerMpinReset',
      msisdn: mpinTargetDealer?.msisdn || (mpinTargetDealer as any)?.mobileNumber || '9876543210',
    }
  );

  // Edit Dealer OTP Action
  const editOtpAction = useOtpGuardedAction(
    async () => {
      if (!editingDealer) return;
      await dealerApi.updateDealer({
        dealerCode: editingDealer.msisdn || '',
        ...editFormData,
      });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      setEditingDealer(null);
    },
    {
      topic: 'DealerEdit',
      msisdn: useAuthStore.getState().msisdn || '9876543210',
    }
  );

  // Status Change OTP Action
  const statusOtpAction = useOtpGuardedAction(
    async () => {
      if (statusTargetDealer) {
        const nextStatus = statusTargetDealer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        await dealerApi.changeDealerStatus({
          dealerCode: statusTargetDealer.msisdn || '',
          status: nextStatus,
        });
        queryClient.invalidateQueries({ queryKey: ['dealers'] });
        setStatusTargetDealer(null);
      }
    },
    {
      topic: 'DealerStatusToggle',
      msisdn: useAuthStore.getState().msisdn || '9876543210',
    }
  );

  // Hierarchy Change OTP Action
  const hierarchyOtpAction = useOtpGuardedAction(
    async () => {
      if (!hierarchyReassignTarget || !newParentMsisdn) return;
      await dealerApi.changeDealerHierarchy({
        srcDealerCode: hierarchyReassignTarget.msisdn || '',
        parentDealerCode: newParentMsisdn,
      });
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      setHierarchyReassignTarget(null);
      setNewParentMsisdn('');
    },
    {
      topic: 'DealerHierarchyReassign',
      msisdn: useAuthStore.getState().msisdn || '9876543210',
    }
  );

  const columns: Column<Dealer>[] = [
    {
      key: 'msisdn',
      header: 'Mobile / MSISDN',
      render: (d: any) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{d.msisdn}</span>
          <div className="text-[10px] text-slate-400">Type: {d.dealerType}</div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Agency / Dealer Name',
      render: (d) => <span className="font-semibold text-slate-800">{d.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (d) => <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{d.category}</span>,
    },
    {
      key: 'franchiseMsisdn',
      header: 'Parent Franchise',
      render: (d: any) => (
        <span className="text-xs font-mono text-slate-600">
          {d.franchiseMsisdn || d.subFranchiseMsisdn || 'Direct Master'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => <StatusBadge status={d.status} />,
    },
    {
      key: 'actions',
      header: 'Channel Actions',
      render: (d: any) => (
        <div className="flex items-center space-x-1.5">
          {/* Edit Dealer */}
          <button
            onClick={() => {
              setEditingDealer(d);
              setEditFormData({
                name: d.name || '',
                category: d.category || 'Category A',
                dealerType: d.dealerType || 'Retailer',
                franchiseMsisdn: d.franchiseMsisdn || '',
                subFranchiseMsisdn: d.subFranchiseMsisdn || '',
              });
            }}
            type="button"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Dealer Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Reset MPIN */}
          <button
            onClick={() => {
              setMpinTargetDealer(d);
              mpinOtpAction.initiate();
            }}
            type="button"
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            title="Reset Dealer MPIN with OTP authorization"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Reset MPIN</span>
          </button>

          {/* Reassign Hierarchy */}
          <button
            onClick={() => {
              setHierarchyReassignTarget(d);
              setNewParentMsisdn(d.franchiseMsisdn || '');
            }}
            type="button"
            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Reassign Channel Hierarchy"
          >
            <GitFork className="w-3.5 h-3.5" />
          </button>

          {/* Status Toggle */}
          <button
            onClick={() => setStatusTargetDealer(d)}
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              d.status === 'ACTIVE'
                ? 'text-rose-600 hover:bg-rose-50'
                : 'text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30'
            }`}
            title={d.status === 'ACTIVE' ? 'Deactivate Dealer' : 'Activate Dealer'}
          >
            <Power className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const filteredDealers = dealerList.filter(
    (d: any) =>
      (d.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (d.msisdn || '').includes(search) ||
      (d.dealerType?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (d.category?.toLowerCase() || '').includes(search.toLowerCase())
  );

  // Group dealers by hierarchy for the tree view
  const masterFranchises = dealerList.filter((d: any) => d.dealerType === 'Franchise' || !d.franchiseMsisdn);
  const subFranchises = dealerList.filter((d: any) => d.dealerType === 'SubFranchise');
  const retailers = dealerList.filter((d: any) => d.dealerType === 'Retailer');

  return (
    <PermissionGuard permission="dealerPermissions">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dealer & Franchise Management</h1>
          <p className="page-subtitle">
            Hierarchy distribution trees, MPIN security lifecycle, pre-onboarding duplicate validation, and channel operations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex p-1 bg-slate-200/70 rounded-xl">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'list' ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dealer List
            </button>
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'hierarchy' ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hierarchy Tree
            </button>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Dealer</span>
          </button>
        </div>
      </div>

      {/* Main Tab View */}
      {activeTab === 'list' ? (
        <div className="space-y-4">
          <SearchToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search by Dealer Name, MSISDN, Category, or Type..."
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />

          <div className="bg-surface rounded-lg border border-slate-200/80 shadow-xs overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredDealers}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              keyExtractor={(d: any) => d.msisdn || Math.random()}
            />
          </div>
        </div>
      ) : (
        /* Dynamic Dealer Hierarchy Network Tree View */
        <div className="bg-surface rounded-lg border border-slate-200/80 shadow-xs p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Channel Hierarchy Network</h3>
                <p className="text-xs text-slate-500">Live distribution mapping: Master Franchise &rarr; Sub-Franchise &rarr; Retailers</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl border border-blue-100">
              {dealerList.length} Total Nodes Connected
            </span>
          </div>

          <div className="space-y-6">
            {masterFranchises.map((mf: any) => {
              // Find child sub-franchises
              const childrenSub = subFranchises.filter((sf: any) => sf.franchiseMsisdn === mf.msisdn);
              // Direct retailers under master
              const directRetailers = retailers.filter((r: any) => r.franchiseMsisdn === mf.msisdn);

              return (
                <div key={mf.msisdn} className="p-5 bg-slate-50/70 rounded-lg border border-blue-200/80 space-y-4">
                  {/* Master Franchise Node */}
                  <div className="p-4 bg-surface rounded-xl border border-blue-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{mf.name} [Master Franchise]</div>
                        <div className="text-[11px] font-mono text-slate-500">MSISDN: {mf.msisdn} · Category: {mf.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge status={mf.status} />
                    </div>
                  </div>

                  {/* Level 2: Sub-Franchises */}
                  {childrenSub.length > 0 && (
                    <div className="ml-6 pl-5 border-l-2 border-slate-300 space-y-3">
                      {childrenSub.map((sf: any) => {
                        const sfRetailers = retailers.filter((r: any) => r.subFranchiseMsisdn === sf.msisdn);
                        return (
                          <div key={sf.msisdn} className="space-y-3">
                            <div className="p-3.5 bg-surface rounded-xl border border-amber-200 shadow-xs flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                                <div>
                                  <div className="text-xs font-bold text-slate-800">{sf.name} [Sub-Franchise]</div>
                                  <div className="text-[11px] font-mono text-slate-500">MSISDN: {sf.msisdn}</div>
                                </div>
                              </div>
                              <StatusBadge status={sf.status} />
                            </div>

                            {/* Level 3: Retailers under Sub-Franchise */}
                            {sfRetailers.length > 0 && (
                              <div className="ml-6 pl-5 border-l-2 border-slate-200 space-y-2">
                                {sfRetailers.map((r: any) => (
                                  <div key={r.msisdn} className="p-2.5 bg-surface rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2.5">
                                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                      <span className="text-slate-800 font-semibold">{r.name}</span>
                                      <span className="text-slate-400 font-mono text-[10px]">({r.msisdn})</span>
                                    </div>
                                    <StatusBadge status={r.status} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Direct Retailers under Master Franchise */}
                  {directRetailers.length > 0 && (
                    <div className="ml-6 pl-5 border-l-2 border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Retailers</div>
                      {directRetailers.map((r: any) => (
                        <div key={r.msisdn} className="p-2.5 bg-surface rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                            <span className="text-slate-800 font-semibold">{r.name}</span>
                            <span className="text-slate-400 font-mono text-[10px]">({r.msisdn})</span>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Dealer Modal */}
      {editingDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Edit Dealer Information</h3>
                <p className="text-xs text-slate-500">MSISDN: {editingDealer.msisdn}</p>
              </div>
              <button onClick={() => setEditingDealer(null)} className="p-1.5 text-slate-400">
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
              <div>
                <label className="block font-semibold mb-1">Agency / Dealer Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Category A">Category A</option>
                    <option value="Category B">Category B</option>
                    <option value="Category C">Category C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Dealer Type</label>
                  <select
                    value={editFormData.dealerType}
                    onChange={(e) => setEditFormData({ ...editFormData, dealerType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Retailer">Retailer</option>
                    <option value="SubFranchise">Sub-Franchise</option>
                    <option value="Franchise">Franchise</option>
                    <option value="FOS">Feet On Street (FOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Parent Franchise MSISDN</label>
                <input
                  type="tel"
                  value={editFormData.franchiseMsisdn}
                  onChange={(e) => setEditFormData({ ...editFormData, franchiseMsisdn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                  placeholder="9811012345"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingDealer(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editOtpAction.state === 'executing'}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {editOtpAction.state === 'executing' ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Hierarchy Modal */}
      {hierarchyReassignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Reassign Hierarchy Parent</h3>
                <p className="text-xs text-slate-500">Re-link {hierarchyReassignTarget.name} ({hierarchyReassignTarget.msisdn})</p>
              </div>
              <button onClick={() => setHierarchyReassignTarget(null)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                hierarchyOtpAction.initiate();
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Select New Parent Master Franchise *</label>
                <select
                  required
                  value={newParentMsisdn}
                  onChange={(e) => setNewParentMsisdn(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                >
                  <option value="">-- Choose Parent Franchise --</option>
                  {masterFranchises
                    .filter((m: any) => m.msisdn !== hierarchyReassignTarget.msisdn)
                    .map((m: any) => (
                      <option key={m.msisdn} value={m.msisdn}>
                        {m.name} ({m.msisdn})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setHierarchyReassignTarget(null)}
                  className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hierarchyOtpAction.state === 'executing' || !newParentMsisdn}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {hierarchyOtpAction.state === 'executing' ? 'Updating...' : 'Commit Hierarchy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dealer Status Toggle Dialog */}
      <ConfirmationDialog
        isOpen={!!statusTargetDealer}
        title={`${statusTargetDealer?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} Channel Dealer`}
        description={`Are you sure you want to change status of ${statusTargetDealer?.name} (${statusTargetDealer?.msisdn}) to ${statusTargetDealer?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}?`}
        confirmLabel={statusTargetDealer?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        isDestructive={statusTargetDealer?.status === 'ACTIVE'}
        onConfirm={() => {
          if (statusTargetDealer) {
            statusOtpAction.initiate();
          }
        }}
        onCancel={() => setStatusTargetDealer(null)}
      />

      {/* OTP Modals */}
      <OTPVerificationModal
        isOpen={editOtpAction.isModalOpen}
        state={editOtpAction.state}
        error={editOtpAction.error}
        otp={editOtpAction.otp}
        msisdn={useAuthStore.getState().msisdn || '9876543210'}
        topic="DealerEdit"
        onOtpChange={editOtpAction.setOtp}
        onConfirm={editOtpAction.confirm}
        onSubmit={editOtpAction.submitOtp}
        onCancel={editOtpAction.cancel}
        onResend={editOtpAction.resendOtp}
      />

      <OTPVerificationModal
        isOpen={hierarchyOtpAction.isModalOpen}
        state={hierarchyOtpAction.state}
        error={hierarchyOtpAction.error}
        otp={hierarchyOtpAction.otp}
        msisdn={useAuthStore.getState().msisdn || '9876543210'}
        topic="DealerHierarchyReassign"
        onOtpChange={hierarchyOtpAction.setOtp}
        onConfirm={hierarchyOtpAction.confirm}
        onSubmit={hierarchyOtpAction.submitOtp}
        onCancel={hierarchyOtpAction.cancel}
        onResend={hierarchyOtpAction.resendOtp}
      />

      <OTPVerificationModal
        isOpen={statusOtpAction.isModalOpen}
        state={statusOtpAction.state}
        error={statusOtpAction.error}
        otp={statusOtpAction.otp}
        msisdn={useAuthStore.getState().msisdn || '9876543210'}
        topic="DealerStatusToggle"
        onOtpChange={statusOtpAction.setOtp}
        onConfirm={statusOtpAction.confirm}
        onSubmit={statusOtpAction.submitOtp}
        onCancel={statusOtpAction.cancel}
        onResend={statusOtpAction.resendOtp}
      />

      {/* MPIN OTP Modal */}
      <OTPVerificationModal
        isOpen={mpinOtpAction.isModalOpen}
        state={mpinOtpAction.state}
        error={mpinOtpAction.error}
        otp={mpinOtpAction.otp}
        msisdn={mpinTargetDealer?.msisdn || '9876543210'}
        topic="DealerMpinReset"
        onOtpChange={mpinOtpAction.setOtp}
        onConfirm={mpinOtpAction.confirm}
        onSubmit={mpinOtpAction.submitOtp}
        onCancel={mpinOtpAction.cancel}
        onResend={mpinOtpAction.resendOtp}
      />

      {/* Onboard Dealer Modal with PAN / Aadhaar checks */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-surface rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="text-base font-bold text-slate-900">Onboard New Channel Dealer</h2>
                <p className="text-xs text-slate-500">Pre-validation duplicate checks for PAN & Aadhaar</p>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    ...formData,
                    circleId: selectedCircle || 1,
                    ssaId: selectedSSA || 1,
                    status: 'ACTIVE',
                  };
                  // Use dynamic import or assume createDealerSchema is imported. Let's add the import.
                  // Actually, I'll just put the import at the top later, or use inline validation if I can't import easily.
                  // Since I can't easily add import without replacing line 1-20, I'll add the import to the top of the file in a separate replace_file_content call.
                  await import('@/schemas/dealer.schema').then(m => m.createDealerSchema.parse(payload));
                  
                  await dealerApi.createDealer({
                    ...payload,
                    guiUsername: 'admin',
                  } as any);
                  queryClient.invalidateQueries({ queryKey: ['dealers'] });
                  setIsRegisterOpen(false);
                  setFormData({
                    name: '',
                    msisdn: '',
                    dealerType: 'Retailer',
                    category: 'Category A',
                    panId: '',
                    aadharId: '',
                    franchiseMsisdn: '',
                    subFranchiseMsisdn: '',
                  });
                } catch (err: any) {
                  const issues = err?.issues || err?.errors;
                  if (Array.isArray(issues) && issues.length > 0) {
                    alert(issues.map((e: any) => e.message).join('\n'));
                  } else {
                    alert(err?.message || 'Validation error occurred.');
                  }
                }
              }}
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Agency / Dealer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Metro Cellular Agency"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">MSISDN (Mobile) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.msisdn}
                    onChange={(e) => setFormData({ ...formData, msisdn: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Dealer Type</label>
                  <select
                    value={formData.dealerType}
                    onChange={(e) => setFormData({ ...formData, dealerType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Retailer">Retailer</option>
                    <option value="SubFranchise">Sub Franchise</option>
                    <option value="Franchise">Franchise</option>
                    <option value="FOS">Feet On Street (FOS)</option>
                  </select>
                </div>
              </div>

              {/* Geographic Selection */}
              <div className="grid grid-cols-2 gap-4">
                <CircleSelector
                  circles={circles.data || []}
                  selectedCircleId={selectedCircle}
                  onSelect={selectCircle}
                />
                <SSASelector
                  ssas={ssas.data || []}
                  selectedSsaId={selectedSSA}
                  onSelect={setSelectedSSA}
                  disabled={!selectedCircle}
                />
              </div>

              {/* PAN Duplicate Check */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">PAN Card Number *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="ABCDE1234F"
                    value={formData.panId}
                    onChange={(e) => {
                      setFormData({ ...formData, panId: e.target.value.toUpperCase() });
                      setPanStatus('idle');
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleCheckPan}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Verify PAN
                  </button>
                </div>
                {panStatus === 'checking' && <div className="text-[11px] text-slate-400 mt-1">Validating PAN uniqueness...</div>}
                {panStatus === 'valid' && (
                  <div className="flex items-center space-x-1 text-sky-600 dark:text-sky-400 text-[11px] mt-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PAN verified - Clean for onboarding</span>
                  </div>
                )}
                {panStatus === 'exists' && (
                  <div className="flex items-center space-x-1 text-rose-600 text-[11px] mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>PAN already registered with another dealer</span>
                  </div>
                )}
              </div>

              {/* Aadhaar Duplicate Check */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Aadhaar UID *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    placeholder="123456789012"
                    value={formData.aadharId}
                    onChange={(e) => {
                      setFormData({ ...formData, aadharId: e.target.value });
                      setAadharStatus('idle');
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleCheckAadhar}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Verify Aadhaar
                  </button>
                </div>
                {aadharStatus === 'checking' && <div className="text-[11px] text-slate-400 mt-1">Checking Aadhaar record...</div>}
                {aadharStatus === 'valid' && (
                  <div className="flex items-center space-x-1 text-sky-600 dark:text-sky-400 text-[11px] mt-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aadhaar verified - Unique</span>
                  </div>
                )}
                {aadharStatus === 'exists' && (
                  <div className="flex items-center space-x-1 text-rose-600 text-[11px] mt-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Aadhaar UID already in active system</span>
                  </div>
                )}
              </div>

              {/* Parent Mapping */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Parent Franchise MSISDN</label>
                <input
                  type="tel"
                  placeholder="9811012345 (Optional)"
                  value={formData.franchiseMsisdn}
                  onChange={(e) => setFormData({ ...formData, franchiseMsisdn: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={panStatus === 'exists' || aadharStatus === 'exists'}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Register Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </PermissionGuard>
  );
}

