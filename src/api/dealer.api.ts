import { dealerApiClient, getStoredUsername } from '@/api/client';
import type {
  ChangeDealerHierarchyPayload,
  ChangeDealerStatusPayload,
  CreateDealerPayload,
  Dealer,
  DealerFilterParams,
  DealerVerificationResult,
  FranchiseInfo,
  ResetMpinPayload,
  SubFranchiseInfo,
  UpdateDealerPayload,
} from '@/types/api';

/**
 * List dealers with filtering, searching, and status checking.
 */
export async function getDealerList(
  params?: DealerFilterParams
): Promise<Dealer[]> {
  return dealerApiClient.get<Dealer[], Dealer[]>('/scm-dealer-api/scm-dealer-api/dealerList', { params });
}

/**
 * Fetch a dealer record by mobile/MSISDN.
 */
export async function fetchDealer(mobile: string, guiUsername?: string): Promise<Dealer> {
  const username = guiUsername || getStoredUsername() || 'admin';
  return dealerApiClient.get<Dealer, Dealer>(
    `/scm-dealer-api/scm-dealer-api/fetchDealer?mobile=${encodeURIComponent(mobile)}&gui_username=${encodeURIComponent(username)}`
  );
}

/**
 * Fetch complete dealer profile data.
 */
export async function fetchDealerData(msisdn: string, guiUsername?: string): Promise<Dealer> {
  const username = guiUsername || getStoredUsername() || 'admin';
  return dealerApiClient.get<Dealer, Dealer>(
    `/scm-dealer-api/scm-dealer-api/fetchDealerData?msisdn=${encodeURIComponent(msisdn)}&gui_username=${encodeURIComponent(username)}`
  );
}

/**
 * Onboard and create a new dealer, franchisee, or retail point of sale.
 */
export async function createDealer(payload: CreateDealerPayload): Promise<{ message: string; dealer?: Dealer }> {
  return dealerApiClient.post<{ message: string; dealer?: Dealer }, { message: string; dealer?: Dealer }>(
    '/scm-dealer-api/scm-dealer-api/createDealer',
    payload
  );
}

/**
 * Update dealer attributes and profile information.
 */
export async function updateDealer(payload: UpdateDealerPayload): Promise<{ message: string }> {
  return dealerApiClient.post<{ message: string }, { message: string }>(
    '/scm-dealer-api/scm-dealer-api/updateDealer',
    payload
  );
}

/**
 * Check if a PAN number is already associated with an active or pending dealer.
 */
export async function checkDealerByPan(
  panId: string
): Promise<DealerVerificationResult> {
  return dealerApiClient.get<DealerVerificationResult, DealerVerificationResult>(
    `/scm-dealer-api/scm-dealer-api/checkDealerByPan?panId=${encodeURIComponent(panId)}`
  );
}

/**
 * Check if an Aadhaar number is already associated with an existing dealer.
 */
export async function checkDealerByAadhar(
  aadharId: string
): Promise<DealerVerificationResult> {
  return dealerApiClient.get<DealerVerificationResult, DealerVerificationResult>(
    `/scm-dealer-api/scm-dealer-api/checkDealerByAadhar?aadharId=${encodeURIComponent(aadharId)}`
  );
}

/**
 * Check the operational and compliance status of a dealer.
 */
export async function checkDealerStatus(msisdn: string): Promise<{ status: string }> {
  return dealerApiClient.get<{ status: string }, { status: string }>(
    `/scm-dealer-api/scm-dealer-api/dealerStatusCheck?msisdn=${encodeURIComponent(msisdn)}`
  );
}

/**
 * Update dealer operational status (e.g. ACTIVE, INACTIVE, SUSPENDED).
 */
export async function changeDealerStatus(
  payload: ChangeDealerStatusPayload
): Promise<{ message: string }> {
  const username = getStoredUsername() || 'admin';
  return dealerApiClient.post<{ message: string }, { message: string }>(
    `/scm-dealer-api/scm-dealer-api/dealerStatusChange?msisdn=${encodeURIComponent(payload.dealerCode)}&username=${encodeURIComponent(username)}&status=${payload.status}`
  );
}

/**
 * Purge / permanently remove dealer record.
 */
export async function purgeDealer(msisdn: string): Promise<{ message: string }> {
  const username = getStoredUsername() || 'admin';
  return dealerApiClient.post<{ message: string }, { message: string }>(
    `/scm-dealer-api/scm-dealer-api/purgeDealer?msisdn=${encodeURIComponent(msisdn)}&username=${encodeURIComponent(username)}`
  );
}

/**
 * Reassign dealer within hierarchical channel tree (Master Franchise -> SubFranchise -> Retailer).
 */
export async function changeDealerHierarchy(
  payload: ChangeDealerHierarchyPayload
): Promise<{ message: string }> {
  const username = getStoredUsername() || 'admin';
  return dealerApiClient.post<{ message: string }, { message: string }>(
    `/scm-dealer-api/scm-dealer-api/changeDealerHierarchy?srcMsisdn=${encodeURIComponent(payload.srcDealerCode || payload.dealerCode || '')}&parentMsisdn=${encodeURIComponent(payload.parentDealerCode || payload.newParentCode || '')}&guiUsername=${encodeURIComponent(username)}&type=Franchise`
  );
}

/**
 * Initiate an OTP-protected reset of dealer's Mobile PIN (MPIN).
 */
export async function resetMpin(
  payload: ResetMpinPayload
): Promise<{ message: string }> {
  const username = getStoredUsername() || 'admin';
  const msisdn = (payload as any).msisdn || payload.dealerCode || '9876543210';
  return dealerApiClient.put<{ message: string }, { message: string }>(
    `/scm-dealer-api/scm-dealer-api/resetMpin?msisdn=${encodeURIComponent(msisdn)}&username=${encodeURIComponent(username)}`,
    {}
  );
}

/**
 * Fetch franchise information by MSISDN.
 */
export async function getFranchise(franchiseMsisdn: string): Promise<FranchiseInfo> {
  return dealerApiClient.get<FranchiseInfo, FranchiseInfo>(
    `/scm-dealer-api/scm-dealer-api/franchise?msisdn=${encodeURIComponent(franchiseMsisdn)}`
  );
}

/**
 * Fetch sub-franchise information by MSISDN.
 */
export async function getSubFranchise(subFranchiseMsisdn: string): Promise<SubFranchiseInfo> {
  return dealerApiClient.get<SubFranchiseInfo, SubFranchiseInfo>(
    `/scm-dealer-api/scm-dealer-api/subFranchise?msisdn=${encodeURIComponent(subFranchiseMsisdn)}`
  );
}

export const dealerApi = {
  getDealerList,
  fetchDealer,
  fetchDealerData,
  createDealer,
  updateDealer,
  checkDealerByPan,
  checkDealerByAadhar,
  checkDealerStatus,
  changeDealerStatus,
  purgeDealer,
  changeDealerHierarchy,
  resetMpin,
  getFranchise,
  getSubFranchise,
};
