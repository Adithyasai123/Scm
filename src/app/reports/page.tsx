'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { franchiseApi } from '@/api/franchise.api';
import { walletApi } from '@/api/wallet.api';
import { DataTable, Column } from '@/components/tables/DataTable';
import { SearchToolbar } from '@/components/tables/SearchToolbar';
import { StatusBadge } from '@/components/tables/StatusBadge';
import { OTPVerificationModal } from '@/components/feedback/OTPVerificationModal';
import { ConfirmationDialog } from '@/components/feedback/ConfirmationDialog';
import { useOtpGuardedAction } from '@/hooks/useOtpGuardedAction';
import { PermissionGuard } from '@/components/forms/PermissionGuard';
import { useAuthStore } from '@/stores/authStore';
import { FranchiseTransaction } from '@/types/api';
import { FileText, Wallet, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const queryClient = useQueryClient();
  const hasReportsPerm = useAuthStore((state) => state.hasPermission('reportsPermissions'));
  const [search, setSearch] = useState('');
  const [selectedTxnForApproval, setSelectedTxnForApproval] = useState<FranchiseTransaction | null>(null);

  // Wallet form state
  const [walletForm, setWalletForm] = useState({
    msisdn: '',
    amount: 5000,
    reason: 'Monthly Channel Incentive Allocation',
  });
  const [walletSuccess, setWalletSuccess] = useState<string | null>(null);

  // Fetch Transactions
  const { data: transactions, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['franchise-transactions'],
    queryFn: () => franchiseApi.getTransactions(),
    enabled: hasReportsPerm,
  });

  // Approve OTP action
  const approveOtpAction = useOtpGuardedAction(
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

  const columns: Column<FranchiseTransaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (t: any) => (
        <div>
          <span className="font-bold font-mono text-slate-900 text-xs">{t.id || t.transactionId}</span>
          <div className="text-[10px] text-slate-400">Date: {t.requestDate || t.requestedDate}</div>
        </div>
      ),
    },
    {
      key: 'requestedBy',
      header: 'Franchise Entity',
      render: (t: any) => (
        <div>
          <div className="font-semibold text-slate-800">{t.requestedBy || t.franchiseeName}</div>
          <div className="text-[11px] font-mono text-slate-400">MSISDN: {t.franchiseMsisdn || t.mobileNumber || '9876543210'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Requested Amount',
      render: (t: any) => <span className="font-black font-mono text-slate-900">{formatCurrency(t.amount || 0)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'actions',
      header: 'Approval Governance',
      render: (t) => (
        <div className="flex items-center space-x-2">
          {t.status === 'PENDING' ? (
            <>
              <button
                onClick={() => {
                  setSelectedTxnForApproval(t);
                  approveOtpAction.initiate();
                }}
                type="button"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approve (OTP)</span>
              </button>
              <button
                onClick={async () => {
                  await franchiseApi.reject({ transactionId: String(t.id || (t as any).transactionId || ''), username: 'admin', reason: 'Insufficient quota' });
                  queryClient.invalidateQueries({ queryKey: ['franchise-transactions'] });
                }}
                type="button"
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400 font-medium italic">Processed</span>
          )}
        </div>
      ),
    },
  ];

  const txnList = Array.isArray(transactions) ? transactions : [];
  const filteredTxns = txnList.filter(
    (t: any) =>
      (t.requestedBy || t.franchiseeName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(t.id || t.transactionId || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.franchiseMsisdn || t.mobileNumber || '').includes(search)
  );

  return (
    <PermissionGuard permission="reportsPermissions">
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Franchise Balance & Wallet Ledger</h1>
        <p className="page-subtitle">
          Approve or reject franchise top-up balance requests and execute direct wallet reconciliation adjustments.
        </p>
      </div>

      {/* Grid: Transactions Table & Direct Wallet Adjustment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Table */}
        <div className="lg:col-span-2 space-y-4">
          <SearchToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search by Franchise Name, MSISDN, or Txn ID..."
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />

          <DataTable
            columns={columns}
            data={filteredTxns}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            keyExtractor={(t: any) => t.id || t.transactionId || Math.random()}
          />
        </div>

        {/* Direct Wallet Adjustment Panel */}
        <div className="bg-surface rounded-lg border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Wallet Adjustment</h3>
              <p className="text-xs text-slate-500">Direct dealer stock credit / debit</p>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const res: any = await walletApi.walletAdjustment({
                msisdn: walletForm.msisdn,
                dealerCode: walletForm.msisdn,
                amount: Number(walletForm.amount),
                reason: walletForm.reason,
                username: 'admin',
              } as any);
              setWalletSuccess(`Wallet credited! New Balance: ${formatCurrency(res?.newBalance || res?.balanceAfter || 50000)}`);
              setWalletForm({ msisdn: '', amount: 5000, reason: 'Monthly Channel Incentive Allocation' });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Target Dealer MSISDN *
              </label>
              <input
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                value={walletForm.msisdn}
                onChange={(e) => setWalletForm({ ...walletForm, msisdn: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Adjustment Amount (?) *
              </label>
              <input
                type="number"
                required
                value={walletForm.amount}
                onChange={(e) => setWalletForm({ ...walletForm, amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Adjustment Purpose / Audit Note
              </label>
              <textarea
                rows={2}
                value={walletForm.reason}
                onChange={(e) => setWalletForm({ ...walletForm, reason: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {walletSuccess && (
              <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300 rounded-xl font-medium">
                {walletSuccess}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm transition-all"
            >
              Post Wallet Adjustment
            </button>
          </form>
        </div>
      </div>

      {/* OTP Modal for Approval */}
      <OTPVerificationModal
        isOpen={approveOtpAction.isModalOpen}
        state={approveOtpAction.state}
        error={approveOtpAction.error}
        otp={approveOtpAction.otp}
        msisdn={selectedTxnForApproval?.franchiseMsisdn || (selectedTxnForApproval as any)?.mobileNumber || '9876543210'}
        topic="Franchise_Balance_Approval"
        onOtpChange={approveOtpAction.setOtp}
        onConfirm={approveOtpAction.confirm}
        onSubmit={approveOtpAction.submitOtp}
        onCancel={approveOtpAction.cancel}
        onResend={approveOtpAction.resendOtp}
      />
      </div>
    </PermissionGuard>
  );
}

