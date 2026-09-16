import { getStoredUsername, stockApiClient } from '@/api/client';
import type {
  WalletAdjustmentPayload,
  WalletAdjustmentResponse,
} from '@/types/api';

/**
 * Perform manual wallet adjustment (credit or debit) for a dealer/franchise account.
 */
export async function walletAdjustment(
  payload: WalletAdjustmentPayload
): Promise<WalletAdjustmentResponse> {
  const body = {
    dlr_msisdn: (payload as any).dlr_msisdn || payload.msisdn,
    adjustment_type: (payload as any).adjustment_type || (payload.type === 'CREDIT' ? 1 : 2),
    adjustment_amount: (payload as any).adjustment_amount || payload.amount,
    wallet_type: (payload as any).wallet_type || 1,
    gui_user: (payload as any).gui_user || payload.username || getStoredUsername() || 'admin',
    remarks: (payload as any).remarks || payload.remarks || 'Wallet Adjustment',
    ...payload,
  };

  return stockApiClient.post<WalletAdjustmentResponse, WalletAdjustmentResponse>(
    '/scm-stock-api/stock-api/walletAdjustment',
    body
  );
}

export const walletApi = {
  walletAdjustment,
};
