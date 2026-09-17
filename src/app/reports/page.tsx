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
import { useRouter } from 'next/navigation';
import { FileText, Wallet, ArrowUpRight, Loader2, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const router = useRouter();
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
  const [isWalletSubmitting, setIsWalletSubmitting] = useState(false);

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
          <span className="font-bold font-mono text-foreground text-xs">{t.id || t.transactionId}</span>
          <div className="text-[10px] text-muted-fg">Date: {t.requestDate || t.requestedDate}</div>
        </div>
      ),
    },
    {
      key: 'requestedBy',
      header: 'Franchise Entity',
      render: (t: any) => (
        <div>
          <div className="font-semibold text-foreground">{t.requestedBy || t.franchiseeName}</div>
          <div className="text-[11px] font-mono text-muted-fg">MSISDN: {t.franchiseMsisdn || t.mobileNumber || '9876543210'}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Requested Amount',
      render: (t: any) => <span className="font-black font-mono text-foreground">{formatCurrency(t.amount || 0)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'actions',
      header: 'Approval Governance',
      className: 'text-center',
      render: (t) => (
        <div className="flex items-center justify-center space-x-2">
          {t.status === 'PENDING' ? (
            <>
              <button
                onClick={() => {
                  setSelectedTxnForApproval(t);
                  approveOtpAction.initiate();
                }}
                type="button"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500 rounded-lg shadow-2xs transition-all cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={async () => {
                  await franchiseApi.reject({ transactionId: String(t.id || (t as any).transactionId || ''), username: 'admin', reason: 'Insufficient quota' });
                  queryClient.invalidateQueries({ queryKey: ['franchise-transactions'] });
                }}
                type="button"
                className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800/80 rounded-lg transition-all cursor-pointer"
              >
                Reject
              </button>
            </>
          ) : (
            <span className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-lg cursor-default select-none min-w-[90px]">
              Processed
            </span>
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

      {/* Grid: Transactions Table & Direct Wallet Adjustment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Table */}
        <div className="lg:col-span-2 space-y-4">
          <SearchToolbar
            search={search}
            onSearchChange={setSearch}
            placeholder="Search..."
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
        <div className="bg-surface rounded-2xl border border-slate-200/80 dark:border-[#1E2A38] shadow-sm overflow-hidden space-y-0">
          <div className="bg-gradient-to-r from-sky-50/90 via-slate-50 to-sky-50/40 dark:from-[#16202C] dark:via-sky-950/20 dark:to-[#16202C] px-6 py-4 border-b border-sky-100 dark:border-[#1E2A38] flex items-center space-x-3">
            <div className="p-2 bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Wallet Adjustment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Direct dealer stock credit / debit</p>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsWalletSubmitting(true);
              setWalletSuccess(null);
              try {
                // Realistic submission delay
                await new Promise((r) => setTimeout(r, 650));
                const res: any = await walletApi.walletAdjustment({
                  msisdn: walletForm.msisdn,
                  dealerCode: walletForm.msisdn,
                  amount: Number(walletForm.amount),
                  reason: walletForm.reason,
                  username: 'admin',
                } as any);
                setWalletSuccess(`Wallet credited! New Balance: ${formatCurrency(res?.newBalance || res?.balanceAfter || 50000)}`);
                setWalletForm({ msisdn: '', amount: 5000, reason: 'Monthly Channel Incentive Allocation' });
              } finally {
                setIsWalletSubmitting(false);
              }
            }}
            className="p-6 space-y-4 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Dealer MSISDN *
              </label>
              <input
                type="tel"
                required
                pattern="[6-9][0-9]{9}"
                value={walletForm.msisdn}
                onChange={(e) => setWalletForm({ ...walletForm, msisdn: e.target.value })}
                placeholder="10-digit mobile"
                className="w-full p-2.5 bg-slate-50 dark:bg-[#16202C] border border-slate-200 dark:border-[#1E2A38] text-slate-900 dark:text-slate-100 rounded-xl focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Adjustment Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={walletForm.amount}
                onChange={(e) => setWalletForm({ ...walletForm, amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#16202C] border border-slate-200 dark:border-[#1E2A38] text-slate-900 dark:text-slate-100 rounded-xl focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono font-bold transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Adjustment Purpose / Audit Note
              </label>
              <textarea
                rows={2}
                value={walletForm.reason}
                onChange={(e) => setWalletForm({ ...walletForm, reason: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#16202C] border border-slate-200 dark:border-[#1E2A38] text-slate-900 dark:text-slate-100 rounded-xl focus:bg-surface focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
              />
            </div>

            {walletSuccess && (
              <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300 rounded-xl font-medium">
                {walletSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isWalletSubmitting}
              className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-75 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
            >
              {isWalletSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Adjustment...</span>
                </>
              ) : (
                <>
                  <span>Post Wallet Adjustment</span>
                  <ArrowUpRight className="w-4 h-4" />
                </>
              )}
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

