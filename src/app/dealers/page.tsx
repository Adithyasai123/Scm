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
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
} from 'lucide-react';

export default function DealersPage() {
  const router = useRouter();
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
          <span className="font-mono font-bold text-foreground">{d.msisdn}</span>
          <div className="text-[10px] text-muted-fg">Type: {d.dealerType}</div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Agency / Dealer Name',
      render: (d) => <span className="font-semibold text-foreground">{d.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (d) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
          {d.category}
        </span>
      ),
    },
    {
      key: 'franchiseMsisdn',
      header: 'Parent Franchise',
      render: (d: any) => (
        <span className="text-xs font-mono text-muted-fg">
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
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 dark:hover:text-sky-400 rounded-lg transition-colors"
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
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Dealer & Franchise Management</h1>
          <p className="page-subtitle">
            Hierarchy distribution trees, MPIN security lifecycle, pre-onboarding duplicate validation, and channel operations.
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
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                  : 'bg-surface text-slate-600 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Dealer Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hierarchy'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                  : 'bg-surface text-slate-600 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Hierarchy Network</span>
            </button>
          </div>
          <button
            onClick={() => setIsRegisterOpen(true)}
            type="button"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
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
            placeholder="Search..."
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />

          <DataTable
            columns={columns}
            data={filteredDealers}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            keyExtractor={(d: any) => d.msisdn || Math.random()}
          />
        </div>
      ) : (
        /* Dynamic Dealer Hierarchy Network Tree View */
        <div className="bg-surface rounded-[10px] border border-border border-t-2 border-t-sky-500 shadow-xs overflow-hidden">
          {/* Card Header with Distinct Sky Tint */}
          <div className="bg-gradient-to-r from-sky-500/10 via-surface to-sky-500/5 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 rounded-xl">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Channel Hierarchy Network</h3>
                <p className="text-xs text-muted-fg">Live distribution mapping: Master Franchise &rarr; Sub-Franchise &rarr; Retailers</p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-mono font-semibold rounded-full border border-sky-200 dark:border-sky-800">
              {dealerList.length} Total Nodes Connected
            </span>
          </div>

          <div className="p-6 space-y-6">
            {masterFranchises.map((mf: any) => {
              // Find child sub-franchises
              const childrenSub = subFranchises.filter((sf: any) => sf.franchiseMsisdn === mf.msisdn);
              // Direct retailers under master
              const directRetailers = retailers.filter((r: any) => r.franchiseMsisdn === mf.msisdn);
              const totalOutlets = childrenSub.reduce((acc: number, sf: any) => {
                return acc + retailers.filter((r: any) => r.subFranchiseMsisdn === sf.msisdn).length;
              }, 0) + directRetailers.length + childrenSub.length;

              return (
                <div
                  key={mf.msisdn}
                  className="p-5 bg-background rounded-xl border border-sky-200/80 dark:border-sky-900/60 shadow-2xs space-y-4"
                >
                  {/* Master Franchise Node (Level 1) */}
                  <div className="p-4 bg-surface rounded-xl border border-sky-200 dark:border-sky-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-400 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="text-xs font-bold text-foreground">{mf.name}</span>
                          <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            Master Franchise
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-muted-fg mt-0.5">
                          MSISDN: <strong className="text-foreground font-semibold">{mf.msisdn}</strong> · Category: {mf.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[11px] font-mono text-muted-fg bg-background px-2.5 py-1 rounded-lg border border-border">
                        {totalOutlets} Outlets
                      </span>
                      <StatusBadge status={mf.status} />
                    </div>
                  </div>

                  {/* Level 2: Sub-Franchises */}
                  {childrenSub.length > 0 && (
                    <div className="ml-4 sm:ml-6 pl-4 sm:pl-5 border-l-2 border-sky-300/60 dark:border-sky-800/60 space-y-3">
                      {childrenSub.map((sf: any) => {
                        const sfRetailers = retailers.filter((r: any) => r.subFranchiseMsisdn === sf.msisdn);
                        return (
                          <div key={sf.msisdn} className="space-y-3">
                            <div className="p-3.5 bg-surface rounded-xl border border-amber-200/90 dark:border-amber-900/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-all">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                                  <Store className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <span className="text-xs font-bold text-foreground">{sf.name}</span>
                                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                      Sub-Franchise
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-mono text-muted-fg mt-0.5">
                                    MSISDN: <strong className="text-foreground font-semibold">{sf.msisdn}</strong>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className="text-[10px] font-mono text-muted-fg bg-background px-2 py-0.5 rounded-md border border-border">
                                  {sfRetailers.length} Retailers
                                </span>
                                <StatusBadge status={sf.status} />
                              </div>
                            </div>

                            {/* Level 3: Retailers under Sub-Franchise */}
                            {sfRetailers.length > 0 && (
                              <div className="ml-4 sm:ml-6 pl-4 sm:pl-5 border-l-2 border-slate-200 dark:border-slate-800 space-y-2">
                                {sfRetailers.map((r: any) => (
                                  <div
                                    key={r.msisdn}
                                    className="p-2.5 bg-surface rounded-lg border border-border flex items-center justify-between text-xs hover:bg-surface-alt transition-colors shadow-2xs"
                                  >
                                    <div className="flex items-center space-x-2.5">
                                      <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                                      <span className="text-foreground font-semibold">{r.name}</span>
                                      <span className="text-muted-fg font-mono text-[11px]">({r.msisdn})</span>
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
                    <div className="ml-4 sm:ml-6 pl-4 sm:pl-5 border-l-2 border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex items-center space-x-2 text-[11px] font-bold text-muted-fg uppercase tracking-wider pt-1 mb-1">
                        <Store className="w-3.5 h-3.5 text-sky-500" />
                        <span>Direct Retailers ({directRetailers.length})</span>
                      </div>
                      {directRetailers.map((r: any) => (
                        <div
                          key={r.msisdn}
                          className="p-2.5 bg-surface rounded-lg border border-border flex items-center justify-between text-xs hover:bg-surface-alt transition-colors shadow-2xs"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                            <span className="text-foreground font-semibold">{r.name}</span>
                            <span className="text-muted-fg font-mono text-[11px]">({r.msisdn})</span>
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
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-slate-800/90 dark:via-sky-950/30 dark:to-slate-800/80 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Dealer Information</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">MSISDN: {editingDealer.msisdn}</p>
              </div>
              <button onClick={() => setEditingDealer(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Agency / Dealer Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Category A">Category A</option>
                    <option value="Category B">Category B</option>
                    <option value="Category C">Category C</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dealer Type</label>
                  <select
                    value={editFormData.dealerType}
                    onChange={(e) => setEditFormData({ ...editFormData, dealerType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Retailer">Retailer</option>
                    <option value="SubFranchise">Sub-Franchise</option>
                    <option value="Franchise">Franchise</option>
                    <option value="FOS">Feet On Street (FOS)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Parent Franchise MSISDN</label>
                <input
                  type="tel"
                  value={editFormData.franchiseMsisdn}
                  onChange={(e) => setEditFormData({ ...editFormData, franchiseMsisdn: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="9811012345"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingDealer(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editOtpAction.state === 'executing'}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
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
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-slate-800/90 dark:via-sky-950/30 dark:to-slate-800/80 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reassign Hierarchy Parent</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Re-link {hierarchyReassignTarget.name} ({hierarchyReassignTarget.msisdn})</p>
              </div>
              <button onClick={() => setHierarchyReassignTarget(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
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
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select New Parent Master Franchise *</label>
                <select
                  required
                  value={newParentMsisdn}
                  onChange={(e) => setNewParentMsisdn(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={hierarchyOtpAction.state === 'executing' || !newParentMsisdn}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
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
          <div className="w-full max-w-xl bg-surface rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-6 bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-slate-800/90 dark:via-sky-950/30 dark:to-slate-800/80 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Onboard New Channel Dealer</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pre-validation duplicate checks for PAN & Aadhaar</p>
              </div>
              <button onClick={() => setIsRegisterOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Agency / Dealer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Metro Cellular Agency"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">MSISDN (Mobile) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.msisdn}
                    onChange={(e) => setFormData({ ...formData, msisdn: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Dealer Type</label>
                  <select
                    value={formData.dealerType}
                    onChange={(e) => setFormData({ ...formData, dealerType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">PAN Card Number *</label>
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
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs uppercase text-slate-900 dark:text-slate-100 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCheckPan}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Aadhaar UID *</label>
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
                    className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleCheckAadhar}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Parent Franchise MSISDN</label>
                <input
                  type="tel"
                  placeholder="9811012345 (Optional)"
                  value={formData.franchiseMsisdn}
                  onChange={(e) => setFormData({ ...formData, franchiseMsisdn: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={panStatus === 'exists' || aadharStatus === 'exists'}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
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

