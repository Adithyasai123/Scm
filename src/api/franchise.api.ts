import { franchiseApiClient, getStoredUsername } from '@/api/client';
import type {
  FranchiseTransaction,
  FranchiseTransactionFilterParams,
  TransactionApprovalPayload,
  TransactionRejectionPayload,
} from '@/types/api';

/**
 * Fetch franchise top-up transactions.
 */
export async function getTransactions(
  params?: FranchiseTransactionFilterParams
): Promise<FranchiseTransaction[]> {
  const circleId = params?.circleId || params?.circleCode || '';
  return franchiseApiClient.get<FranchiseTransaction[], FranchiseTransaction[]>(
    `/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalanceTransactions?circle=${encodeURIComponent(circleId)}`
  );
}

/**
 * Approve a pending franchise balance top-up request.
 */
export async function approve(
  payloadOrId: TransactionApprovalPayload | string,
  customUser?: string
): Promise<{ message: string }> {
  const username = customUser || getStoredUsername() || 'admin';
  const transactionId =
    typeof payloadOrId === 'string' ? payloadOrId : payloadOrId.transactionId;

  return franchiseApiClient.post<{ message: string }, { message: string }>(
    '/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalance/approve',
    {
      fabSeqList: [transactionId],
      actionUser: username,
      transactionId,
      username,
    }
  );
}

/**
 * Reject a pending franchise balance request with reason.
 */
export async function reject(
  payload: TransactionRejectionPayload,
  customUser?: string
): Promise<{ message: string }> {
  const username = customUser || getStoredUsername() || 'admin';
  return franchiseApiClient.post<{ message: string }, { message: string }>(
    '/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalance/reject',
    {
      fabSeqList: [payload.transactionId],
      actionUser: username,
      ...payload,
      username,
    }
  );
}

export const franchiseApi = {
  getTransactions,
  approve,
  reject,
};
