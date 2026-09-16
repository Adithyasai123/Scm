'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commissionApi } from '@/api/commission.api';
import { masterdataApi } from '@/api/masterdata.api';
import { franchiseApi } from '@/api/franchise.api';
import { useZoneCircleSSA } from '@/hooks/useZoneCircleSSA';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';
import { useAuthStore } from '@/stores/authStore';
import { PermissionGuard } from '@/components/forms/PermissionGuard';
import { DataTable, Column } from '@/components/tables/DataTable';
import { SearchToolbar } from '@/components/tables/SearchToolbar';
import { StatusBadge } from '@/components/tables/StatusBadge';
import { OTPVerificationModal } from '@/components/feedback/OTPVerificationModal';
import { ZoneSelector } from '@/components/forms/ZoneSelector';
import { CircleSelector } from '@/components/forms/CircleSelector';
import { FranchiseTransaction } from '@/types/api';
import { formatCurrency } from '@/lib/utils';
import {
  Coins,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2,
  Layers,
  ArrowRight,
  ShieldAlert,
  Percent,
  X,
  CreditCard,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function CommissionsPage() {
  const queryClient = useQueryClient();
  const hasCommPerm = useAuthStore((state) => state.hasPermission('commissionPermissions'));
  const [activeTab, setActiveTab] = useState<'FRC' | 'OTF' | 'POSTPAID' | 'LANDLINE' | 'FRANCHISE_BALANCE'>('FRC');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [editingRule, setEditingRule] = useState<any | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<any | null>(null);
  const [selectedTxnForApproval, setSelectedTxnForApproval] = useState<FranchiseTransaction | null>(null);

  // Zone & Circle selector
  const { zones, circles, selectedZone, selectedCircle, selectZone, selectCircle } = useZoneCircleSSA();

  // Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: masterdataApi.getCategory,
    enabled: hasCommPerm,
  });

  // Commission Queries per tab
  const { data: commissions, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['commissions', activeTab],
    queryFn: () => {
      if (activeTab === 'FRC') return commissionApi.fetchPrepaidFrcCommission({});
      if (activeTab === 'OTF') return commissionApi.fetchPrepaidOtfCommission({});
      if (activeTab === 'POSTPAID') return commissionApi.fetchPostpaidCommission({});
      if (activeTab === 'LANDLINE') return commissionApi.fetchLandlineCommission({});
      return [];
    },
    enabled: hasCommPerm && activeTab !== 'FRANCHISE_BALANCE',
  });

  // Franchise Transactions Query
  const {
    data: transactions,
    isLoading: isTxnLoading,
    isError: isTxnError,
    refetch: refetchTxn,
    isFetching: isTxnFetching,
  } = useQuery({
    queryKey: ['franchise-transactions'],
    queryFn: () => franchiseApi.getTransactions(),
    enabled: hasCommPerm && activeTab === 'FRANCHISE_BALANCE',
  });

  const commissionList = Array.isArray(commissions) ? commissions : [];
  const txnList: FranchiseTransaction[] = Array.isArray(transactions) ? transactions : [];

  // Form State for new commission rule
  const userMsisdn = useAuthStore((state) => state.msisdn) || '9876543210';
  const username = useAuthStore((state) => state.username) || 'admin';

  const [formData, setFormData] = useState({
    masterCategoryId: 1,
    categoryId: 1,
    sellerCommission: '4.5',
    fraCommission: '1.0',
    subCommission: '0.5',
    tds: '5.0',
    denomination: '100',
    dtype: 'PERCENTAGE',
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    commissionRate: '',
    bonus: '',
    category: '',
  });

  // OTP Guarded Action to Save Commission
  const saveOtpAction = useOtpGuardedAction(
    async () => {
      const payload: any = {
        masterCategoryId: String(formData.masterCategoryId),
        circleId: String(selectedCircle || 1),
        sellerCommission: formData.sellerCommission,
        fraCommission: formData.fraCommission,
        subCommission: formData.subCommission,
        tds: formData.tds,
        denomination: formData.denomination,
        categoryId: String(formData.categoryId),
        commissionType: activeTab,
        dtype: formData.dtype,
        createdGuiUser: username,
      };

      if (isBulkMode) {
        await commissionApi.saveMultipleCommissionConfig(selectedZone || 0, [payload]);
      } else if (activeTab === 'FRC') {
        await commissionApi.saveCommissionConfig(payload);
      } else if (activeTab === 'POSTPAID') {
        await commissionApi.savePostpaidConfig(payload);
      } else if (activeTab === 'LANDLINE') {
        await commissionApi.saveLandlineConfig(payload);
      } else {
        await commissionApi.saveCommissionConfig(payload);
      }

      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      setIsAddOpen(false);
      setFormData({
        masterCategoryId: 1,
        categoryId: 1,
        sellerCommission: '4.5',
        fraCommission: '1.0',
        subCommission: '0.5',
        tds: '5.0',
        denomination: '100',
        dtype: 'PERCENTAGE',
      });
    },
    {
      topic: 'Commission_' + activeTab,
      msisdn: userMsisdn,
    }
  );

  // OTP Guarded Action to Delete Commission Rule
  const deleteOtpAction = useOtpGuardedAction(
    async () => {
      if (!ruleToDelete) return;
      const targetId = ruleToDelete.configId || ruleToDelete.id;

      if (activeTab === 'POSTPAID') {
        await commissionApi.deletePostpaidCommission(targetId);
      } else if (activeTab === 'LANDLINE') {
        await commissionApi.deleteLandlineCommission(targetId);
      } else {
        await commissionApi.deleteCommissionConfig(targetId);
      }

      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      setRuleToDelete(null);
    },
    {
      topic: 'Commission_Deletion',
      msisdn: userMsisdn,
    }
  );

  // OTP Guard for Approving Franchise Top-up Balance
  const approveTxnOtpAction = useOtpGuardedAction(
    async () => {
      if (selectedTxnForApproval) {
        await franchiseApi.approve({
          transactionId: String(selectedTxnForApproval.id || selectedTxnForApproval.transactionId || ''),
          username: 'admin',
        } as any);
        queryClient.invalidateQueries({ queryKey: ['franchise-transactions'] });
        setSelectedTxnForApproval(null);
      }
    },
    {
      topic: 'Franchise_Balance_Approval',
      msisdn: selectedTxnForApproval?.franchiseMsisdn || (selectedTxnForApproval as any)?.mobileNumber || '9876543210',
    }
  );

  // Reject Franchise Top-up Balance
  const rejectMutation = useMutation({
    mutationFn: async (txnId: string) => {
      await franchiseApi.reject({ transactionId: txnId, username: 'admin' } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-transactions'] });
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editingRule) return;
      const payload = {
        id: editingRule.id,
        configId: editingRule.configId,
        ...editFormData,
      };
      if (activeTab === 'POSTPAID') {
        await commissionApi.updatePostpaidCommission(payload as any);
      } else if (activeTab === 'LANDLINE') {
        await commissionApi.updateLandlineCommission(payload as any);
      } else {
        await commissionApi.updateCommissionConfig(payload as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] });
      setEditingRule(null);
    },
  });

  const columns: Column<any>[] = [
    {
      key: 'category',
      header: 'Commission Category',
      render: (c: any) => (
        <div>
          <span className="font-bold text-slate-900">{c.category || `${activeTab} Standard Rule`}</span>
          <div className="text-[10px] font-mono text-slate-400">ID: {c.configId || `COM-${c.id}`}</div>
        </div>
      ),
    },
    {
      key: 'circleName',
      header: 'Telecom Circle',
      render: (c) => <span className="text-xs font-semibold text-slate-800">{c.circleName || 'All Circles'}</span>,
    },
    {
      key: 'commissionRate',
      header: 'Commission / Incentive',
      render: (c) => <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{c.commissionRate || '4.5%'}</span>,
    },
    {
      key: 'bonus',
      header: 'Fixed Bonus',
      render: (c) => <span className="font-mono text-xs font-semibold text-slate-700">{c.bonus || '₹0'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => <StatusBadge status={c.status || 'ACTIVE'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingRule(c);
              setEditFormData({
                commissionRate: c.commissionRate || '',
                bonus: c.bonus || '',
                category: c.category || '',
              });
            }}
            type="button"
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 dark:hover:text-sky-400 rounded-lg transition-colors"
            title="Edit Commission Rule"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setRuleToDelete(c);
              deleteOtpAction.initiate();
            }}
            type="button"
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Commission Rule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const txnColumns: Column<FranchiseTransaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (t: any) => (
        <div>
          <span className="font-bold font-mono text-slate-900 text-xs">{t.id || t.transactionId}</span>
          <div className="text-[10px] text-slate-400">Date: {t.requestDate || t.requestedDate || '2025-03-12'}</div>
        </div>
      ),
    },
    {
      key: 'requestedBy',
      header: 'Franchise Entity',
      render: (t: any) => (
        <div>
          <div className="font-semibold text-slate-800">{t.requestedBy || t.franchiseeName || 'Franchise Partner'}</div>
          <div className="text-[11px] font-mono text-slate-400">MSISDN: {t.franchiseMsisdn || t.mobileNumber || '9811012345'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Requested Balance',
      render: (t: any) => <span className="font-black font-mono text-slate-900">{formatCurrency(t.amount || 0)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'actions',
      header: 'OTP Approval Governance',
      render: (t) => (
        <div className="flex items-center space-x-2">
          {t.status === 'PENDING' ? (
            <>
              <button
                onClick={() => {
                  setSelectedTxnForApproval(t);
                  approveTxnOtpAction.initiate();
                }}
                type="button"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve (OTP)</span>
              </button>
              <button
                onClick={() => rejectMutation.mutate(String(t.id || t.transactionId || ''))}
                disabled={rejectMutation.isPending}
                type="button"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 italic">Settled</span>
          )}
        </div>
      ),
    },
  ];

  const filteredCommissions = commissionList.filter(
    (c: any) =>
      (c.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (c.circleName?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (c.commissionRate || '').includes(search)
  );

  const filteredTxns = txnList.filter(
    (t: any) =>
      (t.id?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (t.requestedBy?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (t.franchiseMsisdn || '').includes(search)
  );

  return (
    <PermissionGuard permission="commissionPermissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Commission Engine Configuration</h1>
            <p className="page-subtitle">
              Administer prepaid FRC, OTF incentives, postpaid bill plans, landline broadband retail payouts, and franchise balance approvals.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/reports"
              className="inline-flex items-center space-x-2 px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Reports & Audit &rarr;</span>
            </Link>
            {activeTab !== 'FRANCHISE_BALANCE' && (
              <button
                onClick={() => setIsAddOpen(true)}
                type="button"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Commission Rule</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { key: 'FRC', label: 'Prepaid FRC (First Recharge)' },
            { key: 'OTF', label: 'Prepaid OTF (Over The Floor)' },
            { key: 'POSTPAID', label: 'Postpaid Activations' },
            { key: 'LANDLINE', label: 'Landline & Bharat Fiber' },
            { key: 'FRANCHISE_BALANCE', label: 'Franchise Top-up Balance' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25'
                  : 'bg-surface text-slate-600 hover:bg-slate-50 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Table View */}
        {activeTab === 'FRANCHISE_BALANCE' ? (
          <div className="space-y-4">
            <SearchToolbar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search franchise top-up transactions by ID, franchise name, or MSISDN..."
              onRefresh={() => refetchTxn()}
              isRefreshing={isTxnFetching}
            />

            <DataTable
              columns={txnColumns}
              data={filteredTxns}
              isLoading={isTxnLoading}
              isError={isTxnError}
              onRetry={() => refetchTxn()}
              keyExtractor={(t) => t.id || t.transactionId || Math.random()}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <SearchToolbar
              search={search}
              onSearchChange={setSearch}
              placeholder={`Search ${activeTab} commission rules by category, circle, or rate...`}
              onRefresh={() => refetch()}
              isRefreshing={isFetching}
            />

            <DataTable
              columns={columns}
              data={filteredCommissions}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
              keyExtractor={(c) => c.configId || c.id || Math.random()}
            />
          </div>
        )}

        {/* Edit Commission Modal */}
        {editingRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit {activeTab} Commission Rule</h3>
                  <p className="text-xs text-slate-500">ID: {editingRule.configId || editingRule.id}</p>
                </div>
                <button onClick={() => setEditingRule(null)} className="p-1.5 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  editMutation.mutate();
                }}
                className="p-6 space-y-4 text-xs"
              >
                <div>
                  <label className="block font-semibold mb-1">Commission Category</label>
                  <input
                    type="text"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Commission Rate / Percentage</label>
                  <input
                    type="text"
                    value={editFormData.commissionRate}
                    onChange={(e) => setEditFormData({ ...editFormData, commissionRate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-sky-600 dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g. 5.5% or ₹150"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Fixed Bonus Amount</label>
                  <input
                    type="text"
                    value={editFormData.bonus}
                    onChange={(e) => setEditFormData({ ...editFormData, bonus: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="e.g. ₹50"
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingRule(null)}
                    className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editMutation.isPending}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-sm shadow-sky-600/20"
                  >
                    {editMutation.isPending ? 'Saving...' : 'Update Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Commission Rule Modal with OTP */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-surface rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Configure {activeTab} Commission Rule</h2>
                  <p className="text-xs text-slate-500">6-Step OTP verification pipeline with Zone/Circle targeting</p>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveOtpAction.initiate();
                }}
                className="p-6 space-y-4 text-xs"
              >
                {/* Circulation Scope Mode */}
                <div className="p-3 bg-sky-50/70 dark:bg-sky-950/40 rounded-xl border border-sky-100 dark:border-sky-800 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sky-900 dark:text-sky-200 block">Circulation Scope</span>
                    <span className="text-[11px] text-sky-700 dark:text-sky-300">
                      {isBulkMode ? 'Bulk Zone / All Circulation (Zone 0)' : 'Single Circle Rule'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBulkMode(!isBulkMode)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-[11px] transition-colors"
                  >
                    Switch to {isBulkMode ? 'Single Circle' : 'Bulk Zone'}
                  </button>
                </div>

                {/* Geo Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <ZoneSelector
                    zones={zones.data || []}
                    selectedZoneId={selectedZone}
                    onSelect={selectZone}
                  />
                  {!isBulkMode && (
                    <CircleSelector
                      circles={circles.data || []}
                      selectedCircleId={selectedCircle}
                      onSelect={selectCircle}
                    />
                  )}
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block font-semibold mb-1">Commission Category Plan</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {(categories || [
                      { id: 1, name: 'Category A (Standard Prepaid/Postpaid)' },
                      { id: 2, name: 'Category B (Premium Commercial)' },
                      { id: 3, name: 'Category C (Rural Subsidized)' },
                    ]).map((cat: any) => (
                      <option key={cat.id || cat.categoryId} value={cat.id || cat.categoryId}>
                        {cat.name || cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Master Category ID</label>
                    <input
                      type="number"
                      value={formData.masterCategoryId}
                      onChange={(e) => setFormData({ ...formData, masterCategoryId: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Denomination</label>
                    <input
                      type="text"
                      value={formData.denomination}
                      onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Seller Commission</label>
                    <input
                      type="text"
                      value={formData.sellerCommission}
                      onChange={(e) => setFormData({ ...formData, sellerCommission: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold text-sky-600 dark:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="e.g. 4.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Franchise Commission</label>
                    <input
                      type="text"
                      value={formData.fraCommission}
                      onChange={(e) => setFormData({ ...formData, fraCommission: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="e.g. 1.0"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Sub Commission</label>
                    <input
                      type="text"
                      value={formData.subCommission}
                      onChange={(e) => setFormData({ ...formData, subCommission: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="e.g. 0.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">TDS</label>
                    <input
                      type="text"
                      value={formData.tds}
                      onChange={(e) => setFormData({ ...formData, tds: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="e.g. 5.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Commission Type (DTYPE)</label>
                  <select
                    value={formData.dtype}
                    onChange={(e) => setFormData({ ...formData, dtype: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-sm shadow-sky-600/20 transition-all"
                  >
                    Proceed to OTP Verification &rarr;
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Save Commission OTP Modal */}
        <OTPVerificationModal
          isOpen={saveOtpAction.isModalOpen}
          state={saveOtpAction.state}
          error={saveOtpAction.error}
          otp={saveOtpAction.otp}
          msisdn={userMsisdn}
          topic={'Commission_' + activeTab}
          onOtpChange={saveOtpAction.setOtp}
          onConfirm={saveOtpAction.confirm}
          onSubmit={saveOtpAction.submitOtp}
          onCancel={saveOtpAction.cancel}
          onResend={saveOtpAction.resendOtp}
        />

        {/* Delete Commission OTP Modal */}
        <OTPVerificationModal
          isOpen={deleteOtpAction.isModalOpen}
          state={deleteOtpAction.state}
          error={deleteOtpAction.error}
          otp={deleteOtpAction.otp}
          msisdn="9876543210"
          topic="Commission_Deletion"
          onOtpChange={deleteOtpAction.setOtp}
          onConfirm={deleteOtpAction.confirm}
          onSubmit={deleteOtpAction.submitOtp}
          onCancel={deleteOtpAction.cancel}
          onResend={deleteOtpAction.resendOtp}
        />

        {/* Approve Franchise Transaction OTP Modal */}
        <OTPVerificationModal
          isOpen={approveTxnOtpAction.isModalOpen}
          state={approveTxnOtpAction.state}
          error={approveTxnOtpAction.error}
          otp={approveTxnOtpAction.otp}
          msisdn={selectedTxnForApproval?.franchiseMsisdn || (selectedTxnForApproval as any)?.mobileNumber || '9876543210'}
          topic="Franchise_Balance_Approval"
          onOtpChange={approveTxnOtpAction.setOtp}
          onConfirm={approveTxnOtpAction.confirm}
          onSubmit={approveTxnOtpAction.submitOtp}
          onCancel={approveTxnOtpAction.cancel}
          onResend={approveTxnOtpAction.resendOtp}
        />
      </div>
    </PermissionGuard>
  );
}

