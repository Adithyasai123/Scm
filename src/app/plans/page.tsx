'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planApi } from '@/api/plan.api';
import { masterdataApi } from '@/api/masterdata.api';
import { DataTable, Column } from '@/components/tables/DataTable';
import { SearchToolbar } from '@/components/tables/SearchToolbar';
import { OTPVerificationModal } from '@/components/feedback/OTPVerificationModal';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';
import { PermissionGuard } from '@/components/forms/PermissionGuard';
import { useAuthStore } from '@/stores/authStore';
import { Plan, MnpData, NumberSeries } from '@/types/api';
import {
  Radio,
  Plus,
  Trash2,
  ArrowLeftRight,
  Hash,
  X,
  Edit2,
  CheckCircle2,
  Search,
  Layers,
  PhoneCall,
  Save,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PlansPage() {
  const queryClient = useQueryClient();
  const hasPlanPerm = useAuthStore((state) => state.hasPermission('plansNumberpermissions'));
  const [activeTab, setActiveTab] = useState<'plans' | 'denominations' | 'mnp' | 'series'>('plans');
  const [search, setSearch] = useState('');

  // Plans Modals
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  // MNP States
  const [mnpSearchMsisdn, setMnpSearchMsisdn] = useState('');
  const [isAddMnpOpen, setIsAddMnpOpen] = useState(false);
  const [mnpToEdit, setMnpToEdit] = useState<MnpData | null>(null);
  const [mnpToDelete, setMnpToDelete] = useState<MnpData | null>(null);

  // Number Series States
  const [seriesSearch, setSeriesSearch] = useState('');
  const [isAddSeriesOpen, setIsAddSeriesOpen] = useState(false);
  const [seriesToEdit, setSeriesToEdit] = useState<NumberSeries | null>(null);
  const [seriesToPurge, setSeriesToPurge] = useState<NumberSeries | null>(null);

  // Denomination Configuration States
  const [denomAmount, setDenomAmount] = useState(199);
  const [denomValidity, setDenomValidity] = useState(28);
  const [denomZone, setDenomZone] = useState<number>(0);
  const [rechargeLookupAmount, setRechargeLookupAmount] = useState<number>(199);
  const [lookupPlanResult, setLookupPlanResult] = useState<Plan | null>(null);

  // Fetch Plans
  const { data: plans, isLoading: plansLoading, isError: plansError, refetch: refetchPlans, isFetching: plansFetching } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planApi.getPlans(),
    enabled: hasPlanPerm,
  });

  // Fetch MNP Data
  const { data: mnpRecords, refetch: refetchMnp } = useQuery({
    queryKey: ['mnp-data'],
    queryFn: () => masterdataApi.findMnpData({}),
    enabled: hasPlanPerm,
  });

  // Fetch Number Series
  const { data: numberSeries, refetch: refetchSeries } = useQuery({
    queryKey: ['number-series'],
    queryFn: () => masterdataApi.getNumberSeries({}),
    enabled: hasPlanPerm,
  });

  // Fetch Zones
  const { data: zones } = useQuery({
    queryKey: ['zones'],
    queryFn: masterdataApi.getZones,
  });

  // Plan Form State
  const [planForm, setPlanForm] = useState({
    operator: 'BSNL',
    denomination: 299,
    talkvalue: 150,
    planType: 'Prepaid 4G/5G',
    description: '1.5GB/day Unlimited Voice & Data',
    tabName: 'Prepaid',
    circleId: 1,
    validity: 30,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    fromDate: '2025-01-01',
    toDate: '2026-12-31',
  });

  // MNP Form State
  const [mnpForm, setMnpForm] = useState({
    msisdn: '',
    donorOperator: 'Airtel',
    recipientOperator: 'BSNL',
    portingDate: new Date().toISOString().split('T')[0],
  });

  // Number Series Form State
  const [seriesForm, setSeriesForm] = useState({
    series: '94404',
    circleId: 1,
    circleName: 'Delhi Circle',
    operatorId: 'BSNL',
  });

  // OTP Guard for deleting plan
  const deletePlanOtp = useOtpGuardedAction(
    async () => {
      if (planToDelete) {
        await planApi.deletePlan(planToDelete.sno || (planToDelete.planId as any) || 1);
        queryClient.invalidateQueries({ queryKey: ['plans'] });
        setPlanToDelete(null);
      }
    },
    {
      topic: 'Plan_Deletion',
      msisdn: useAuthStore.getState().msisdn || '9876543210',
    }
  );

  // Edit Plan Mutation
  const editPlanMutation = useMutation({
    mutationFn: async () => {
      if (!planToEdit) return;
      await planApi.updatePlan(planToEdit.sno || (planToEdit.planId as any) || 1, planForm as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setPlanToEdit(null);
    },
  });

  // MNP Mutations
  const addMnpMutation = useMutation({
    mutationFn: async () => {
      await masterdataApi.saveMnp(mnpForm as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mnp-data'] });
      setIsAddMnpOpen(false);
      setMnpForm({ msisdn: '', donorOperator: 'Airtel', recipientOperator: 'BSNL', portingDate: new Date().toISOString().split('T')[0] });
    },
  });

  const deleteMnpMutation = useMutation({
    mutationFn: async (msisdn: string) => {
      await masterdataApi.deleteMnp(msisdn);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mnp-data'] });
      setMnpToDelete(null);
    },
  });

  // Number Series Mutations
  const addSeriesMutation = useMutation({
    mutationFn: async () => {
      await masterdataApi.addNumberSeries(seriesForm as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['number-series'] });
      setIsAddSeriesOpen(false);
    },
  });

  const purgeSeriesMutation = useMutation({
    mutationFn: async (series: string) => {
      await masterdataApi.purgeNumberSeries(series);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['number-series'] });
      setSeriesToPurge(null);
    },
  });

  // Table Columns
  const planColumns: Column<Plan>[] = [
    {
      key: 'denomination',
      header: 'Tariff Price',
      render: (p: any) => (
        <div>
          <span className="font-bold font-mono text-blue-600 text-sm">{formatCurrency(p.denomination || p.price || 0)}</span>
          <div className="text-[10px] text-slate-400">Talkvalue: ₹{p.talkvalue || 0}</div>
        </div>
      ),
    },
    {
      key: 'planType',
      header: 'Plan Category & Specs',
      render: (p: any) => (
        <div>
          <span className="font-semibold text-slate-800">{p.planType || p.planName}</span>
          <div className="text-xs text-slate-500 line-clamp-1">{p.description}</div>
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (p: any) => <span className="font-bold text-slate-700">{p.validity || p.validityDays || 30} Days</span>,
    },
    {
      key: 'operator',
      header: 'Operator',
      render: (p: any) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
          {p.operator || p.operatorCode || 'BSNL'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              setPlanToEdit(p);
              setPlanForm({
                operator: p.operator || 'BSNL',
                denomination: p.denomination || 299,
                talkvalue: p.talkvalue || 150,
                planType: p.planType || 'Prepaid 4G',
                description: p.description || '',
                tabName: p.tabName || 'Prepaid',
                circleId: p.circleId || 1,
                validity: p.validity || 30,
                startDate: p.startDate || '2025-01-01',
                endDate: p.endDate || '2026-12-31',
                fromDate: p.fromDate || p.startDate || '2025-01-01',
                toDate: p.toDate || p.endDate || '2026-12-31',
              });
            }}
            type="button"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Tariff Plan"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setPlanToDelete(p);
              deletePlanOtp.initiate();
            }}
            type="button"
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Tariff Plan (OTP protected)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const mnpList = Array.isArray(mnpRecords) ? mnpRecords : mnpRecords ? [mnpRecords] : [];
  const filteredMnp = mnpList.filter((m: any) => !mnpSearchMsisdn || (m.msisdn && m.msisdn.includes(mnpSearchMsisdn)));

  const seriesList = Array.isArray(numberSeries) ? numberSeries : [];
  const filteredSeries = seriesList.filter((s: any) => !seriesSearch || (s.series && s.series.includes(seriesSearch)));

  return (
    <PermissionGuard permission="plansNumberpermissions">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tariff Plans, Numbers & MNP</h1>
          <p className="page-subtitle">
            Manage service plans, zone denomination rules, mobile number portability, and allocated series batches.
          </p>
        </div>
        {activeTab === 'plans' && (
          <button
            onClick={() => setIsAddPlanOpen(true)}
            type="button"
            className="btn btn-primary text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tariff Plan</span>
          </button>
        )}
        {activeTab === 'mnp' && (
          <button
            onClick={() => setIsAddMnpOpen(true)}
            type="button"
            className="btn btn-primary text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register MNP Port-In</span>
          </button>
        )}
        {activeTab === 'series' && (
          <button
            onClick={() => setIsAddSeriesOpen(true)}
            type="button"
            className="btn btn-primary text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Allocate Series Batch</span>
          </button>
        )}
      </div>

      {/* 4 Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { key: 'plans', label: 'Tariff Plans Catalog', icon: Radio },
          { key: 'denominations', label: 'Denomination Configuration', icon: Hash },
          { key: 'mnp', label: 'MNP Portability Records', icon: ArrowLeftRight },
          { key: 'series', label: 'Number Series Allocation', icon: PhoneCall },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === t.key
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-surface text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Tariff Plans */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <SearchToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search by plan category, specs, or operator..."
            onRefresh={() => refetchPlans()}
            isRefreshing={plansFetching}
          />

          <DataTable
            columns={planColumns}
            data={Array.isArray(plans) ? plans.filter((p: any) => !search || (p.planType?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()))) : []}
            isLoading={plansLoading}
            isError={plansError}
            onRetry={() => refetchPlans()}
            keyExtractor={(p: any) => p.sno || Math.random()}
          />
        </div>
      )}

      {/* Tab 2: Denominations Configuration */}
      {activeTab === 'denominations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Denomination Form */}
          <div className="bg-surface rounded-lg border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Zone & Price Denomination Matrix</h3>
              <p className="text-xs text-slate-500">Save recharge denomination rules per circulation zone (Zone 0 = All Circles)</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await planApi.saveMultipleDenominations(denomZone, [
                  { denomination: denomAmount, validityDays: denomValidity, zoneCode: String(denomZone) } as any,
                ]);
                alert('Denomination configured successfully for zone!');
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Select Target Circulation Zone *</label>
                <select
                  value={denomZone}
                  onChange={(e) => setDenomZone(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                >
                  <option value={0}>All Circulation (Pan-India Zone 0)</option>
                  {zones?.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} (Zone {z.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Recharge Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={denomAmount}
                    onChange={(e) => setDenomAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Validity (Days) *</label>
                  <input
                    type="number"
                    required
                    value={denomValidity}
                    onChange={(e) => setDenomValidity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Save Denomination Rule
              </button>
            </form>
          </div>

          {/* Recharge Plan Lookup */}
          <div className="bg-surface rounded-lg border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Recharge Plan Lookup & Verification</h3>
              <p className="text-xs text-slate-500">Query active plans mapped to a specific denomination price</p>
            </div>

            <div className="flex space-x-2">
              <input
                type="number"
                value={rechargeLookupAmount}
                onChange={(e) => setRechargeLookupAmount(Number(e.target.value))}
                placeholder="Enter price (e.g. 199)..."
                className="flex-1 p-2.5 bg-slate-50 border rounded-xl text-xs font-mono"
              />
              <button
                type="button"
                onClick={async () => {
                  const res = await planApi.fetchRechargePlan(rechargeLookupAmount);
                  setLookupPlanResult(res);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Lookup Plan
              </button>
            </div>

            {lookupPlanResult && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2 text-xs">
                <div className="font-bold text-blue-900 text-sm">{lookupPlanResult.planType}</div>
                <div className="text-slate-600">{lookupPlanResult.description}</div>
                <div className="pt-2 border-t border-blue-100 flex justify-between font-mono text-[11px]">
                  <span>Price: ₹{lookupPlanResult.denomination}</span>
                  <span>Validity: {lookupPlanResult.validity} Days</span>
                  <span>Operator: {lookupPlanResult.operator}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: MNP Portability */}
      {activeTab === 'mnp' && (
        <div className="bg-surface rounded-lg border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Mobile Number Portability (MNP) Records</h3>
              <p className="text-xs text-slate-500">Lookup donor and recipient routing profiles and port-in status</p>
            </div>
            <div className="w-full sm:w-72">
              <input
                type="tel"
                value={mnpSearchMsisdn}
                onChange={(e) => setMnpSearchMsisdn(e.target.value)}
                placeholder="Filter by MSISDN..."
                className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredMnp.map((m: any) => (
              <div key={m.id || m.msisdn} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-900 text-sm">{m.msisdn}</span>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Port: <strong className="text-rose-700">{m.donorOperator}</strong> &rarr; <strong className="text-sky-700 dark:text-sky-400">{m.recipientOperator}</strong> · Effective: {m.portingDate}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 text-blue-700">
                    {m.status || 'IN_PROGRESS'}
                  </span>
                  <button
                    onClick={() => m.msisdn && deleteMnpMutation.mutate(m.msisdn)}
                    className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Cancel Port-in"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Number Series Allocation */}
      {activeTab === 'series' && (
        <div className="bg-surface rounded-lg border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Allocated Number Series Batches</h3>
              <p className="text-xs text-slate-500">Master database series ranges assigned across circles</p>
            </div>
            <div className="w-full sm:w-72">
              <input
                type="text"
                value={seriesSearch}
                onChange={(e) => setSeriesSearch(e.target.value)}
                placeholder="Filter by series (e.g. 944)..."
                className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSeries.map((s: any) => (
              <div key={s.id || s.series} className="p-4 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-lg text-blue-700 tracking-wider">
                    {s.series}XXXXX
                  </span>
                  <button
                    onClick={() => purgeSeriesMutation.mutate(s.series)}
                    className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg"
                    title="Purge Series"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>Assigned Circle:</span>
                    <strong className="text-slate-800">{s.circleName || 'Delhi Circle'}</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Pool Size:</span>
                    <span className="font-mono">{s.totalNumbers || 10000}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Active Allocations:</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{s.activeCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {/* 1. Add / Edit Tariff Plan Modal */}
      {(isAddPlanOpen || planToEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {planToEdit ? 'Update Tariff Plan' : 'Publish Tariff Plan'}
              </h3>
              <button
                onClick={() => {
                  setIsAddPlanOpen(false);
                  setPlanToEdit(null);
                }}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const payload = {
                    ...planForm,
                    fromDate: planForm.fromDate || planForm.startDate || '2025-01-01',
                    toDate: planForm.toDate || planForm.endDate || '2026-12-31',
                  };
                  const { createPlanSchema } = await import('@/schemas/plan.schema');
                  createPlanSchema.parse(payload);
                  if (planToEdit) {
                    editPlanMutation.mutate();
                  } else {
                    await planApi.addPlan(payload as any);
                    queryClient.invalidateQueries({ queryKey: ['plans'] });
                    setIsAddPlanOpen(false);
                  }
                } catch (err: any) {
                  const issues = err?.issues || err?.errors;
                  if (Array.isArray(issues) && issues.length > 0) {
                    alert(issues.map((e: any) => e.message).join('\n'));
                  } else {
                    alert(err?.message || 'Validation error occurred.');
                  }
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Plan Category / Type *</label>
                <input
                  type="text"
                  required
                  value={planForm.planType}
                  onChange={(e) => setPlanForm({ ...planForm, planType: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.denomination}
                    onChange={(e) => setPlanForm({ ...planForm, denomination: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Validity (Days) *</label>
                  <input
                    type="number"
                    required
                    value={planForm.validity}
                    onChange={(e) => setPlanForm({ ...planForm, validity: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPlanOpen(false);
                    setPlanToEdit(null);
                  }}
                  className="px-3 py-1.5 border rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">
                  {planToEdit ? 'Commit Updates' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Register MNP Modal */}
      {isAddMnpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Register Port-In Request</h3>
              <button onClick={() => setIsAddMnpOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addMnpMutation.mutate();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Mobile Number (MSISDN) *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={mnpForm.msisdn}
                  onChange={(e) => setMnpForm({ ...mnpForm, msisdn: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Donor Operator</label>
                  <input
                    type="text"
                    required
                    value={mnpForm.donorOperator}
                    onChange={(e) => setMnpForm({ ...mnpForm, donorOperator: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Recipient Operator</label>
                  <input
                    type="text"
                    required
                    value={mnpForm.recipientOperator}
                    onChange={(e) => setMnpForm({ ...mnpForm, recipientOperator: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsAddMnpOpen(false)} className="px-3 py-1.5 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">
                  Register Port-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Number Series Modal */}
      {isAddSeriesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Allocate Number Series Batch</h3>
              <button onClick={() => setIsAddSeriesOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addSeriesMutation.mutate();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">5-Digit Series Prefix (e.g. 94405) *</label>
                <input
                  type="text"
                  required
                  value={seriesForm.series}
                  onChange={(e) => setSeriesForm({ ...seriesForm, series: e.target.value })}
                  className="w-full p-2 bg-slate-50 border rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Target Circle</label>
                <select
                  value={seriesForm.circleId}
                  onChange={(e) => setSeriesForm({ ...seriesForm, circleId: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border rounded-xl"
                >
                  <option value={1}>Delhi Circle</option>
                  <option value={2}>UP Circle</option>
                  <option value={3}>Tamil Nadu Circle</option>
                  <option value={4}>Karnataka Circle</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setIsAddSeriesOpen(false)} className="px-3 py-1.5 border rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">
                  Allocate Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OTPVerificationModal
        isOpen={deletePlanOtp.isModalOpen}
        state={deletePlanOtp.state}
        error={deletePlanOtp.error}
        otp={deletePlanOtp.otp}
        msisdn={useAuthStore.getState().msisdn || '9876543210'}
        topic="Plan_Deletion"
        onOtpChange={deletePlanOtp.setOtp}
        onConfirm={deletePlanOtp.confirm}
        onSubmit={deletePlanOtp.submitOtp}
        onCancel={deletePlanOtp.cancel}
        onResend={deletePlanOtp.resendOtp}
      />
      </div>
    </PermissionGuard>
  );
}

