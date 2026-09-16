import { dbApiClient, getStoredUsername } from '@/api/client';
import type {
  Category,
  Circle,
  CircleInfo,
  CreateMnpPayload,
  CreateNumberSeriesPayload,
  DealerType,
  MnpData,
  MnpFilterParams,
  NumberSeries,
  NumberSeriesFilterParams,
  OtpResponse,
  SendOtpPayload,
  SSA,
  UpdateMnpPayload,
  UpdateNumberSeriesPayload,
  ValidateOtpPayload,
  Zone,
} from '@/types/api';

/**
 * Fetch all operational telecom zones.
 */
export async function getZones(): Promise<Zone[]> {
  return dbApiClient.get<Zone[], Zone[]>('/scm-db-api/masterdata-db-api/zones');
}

/**
 * Fetch circles, optionally filtered by zone.
 */
export async function getCircles(zoneCode?: string): Promise<Circle[]> {
  return dbApiClient.get<Circle[], Circle[]>('/scm-db-api/masterdata-db-api/circles', {
    params: zoneCode ? { zoneCode } : undefined,
  });
}

/**
 * Fetch circles belonging to a specific zone.
 */
export async function getZoneBasedCircles(zoneId: number | string): Promise<Circle[]> {
  return dbApiClient.get<Circle[], Circle[]>(
    `/scm-db-api/masterdata-db-api/zonebasedcircles?zoneId=${encodeURIComponent(zoneId)}`
  );
}

/**
 * Fetch detailed circle metadata and contact information.
 */
export async function getCirclesInfo(hrmsId: string = 'HRMS001'): Promise<CircleInfo[]> {
  return dbApiClient.get<CircleInfo[], CircleInfo[]>(
    `/scm-user-api/scm-user-api/getCirclesInfo?hrmsId=${encodeURIComponent(hrmsId)}`
  );
}

/**
 * Fetch Secondary Switching Areas (SSAs) by circle ID.
 */
export async function getSSAs(circleId?: number | string): Promise<SSA[]> {
  return dbApiClient.get<SSA[], SSA[]>('/scm-db-api/masterdata-db-api/ssas', {
    params: circleId ? { circleId } : undefined,
  });
}

/**
 * Fetch all available dealer types (Retailer, Franchise, SubFranchise, FOS).
 */
export async function getDealerTypes(): Promise<DealerType[]> {
  return dbApiClient.get<DealerType[], DealerType[]>('/scm-db-api/masterdata-db-api/dealerType');
}

/**
 * Fetch all categories of dealers/outlets.
 */
export async function getCategory(): Promise<Category[]> {
  return dbApiClient.get<Category[], Category[]>('/scm-db-api/masterdata-db-api/getCategory');
}

/**
 * Fetch categories mapped to a specific dealer type.
 */
export async function getCategoryByDealer(dealerType: string): Promise<Category[]> {
  return dbApiClient.get<Category[], Category[]>(
    `/scm-db-api/masterdata-db-api/getCategoryByDealer/${encodeURIComponent(dealerType)}`
  );
}

/**
 * Request OTP generation for verification (MSISDN, HRMS, or Email).
 */
export async function sendOtp(payload: SendOtpPayload): Promise<OtpResponse> {
  return dbApiClient.post<OtpResponse, OtpResponse>('/scm-db-api/masterdata-db-api/sendOtp', payload);
}

/**
 * Validate the OTP submitted by the user/dealer.
 */
export async function validateOtp(payload: ValidateOtpPayload): Promise<{ verified: boolean; message?: string }> {
  return dbApiClient.post<{ verified: boolean; message?: string }, { verified: boolean; message?: string }>(
    `/scm-db-api/masterdata-db-api/validateOtp?otp=${payload.otp}&operation=${payload.operation}&msisdn=${payload.msisdn}`,
    payload
  );
}

/**
 * Search and list MNP porting requests.
 */
export async function findMnpData(
  params?: { msisdn?: string; username?: string }
): Promise<MnpData | MnpData[]> {
  const msisdn = params?.msisdn || '';
  const username = params?.username || 'admin';
  return dbApiClient.get<MnpData | MnpData[], MnpData | MnpData[]>(
    `/scm-db-api/masterdata-db-api/findMnpData?msisdn=${encodeURIComponent(msisdn)}&username=${encodeURIComponent(username)}`
  );
}

/**
 * Save new MNP port-in request.
 */
export async function saveMnp(data: CreateMnpPayload): Promise<{ message: string; record?: MnpData }> {
  return dbApiClient.post<{ message: string; record?: MnpData }, { message: string; record?: MnpData }>(
    '/scm-db-api/masterdata-db-api/savemnp',
    data
  );
}

/**
 * Modify existing MNP porting record.
 */
export async function modifyMnpData(data: UpdateMnpPayload): Promise<{ message: string }> {
  return dbApiClient.post<{ message: string }, { message: string }>(
    '/scm-db-api/masterdata-db-api/modifyMnpData',
    data
  );
}

/**
 * Delete or withdraw an MNP porting record.
 */
export async function deleteMnp(
  msisdn: string,
  customUser?: string
): Promise<{ message: string }> {
  const username = customUser || getStoredUsername() || 'admin';
  return dbApiClient.post<{ message: string }, { message: string }>(
    `/scm-db-api/masterdata-db-api/deleteMnp?msisdn=${encodeURIComponent(msisdn)}&username=${encodeURIComponent(username)}`,
    { msisdn, username }
  );
}

/**
 * Fetch allocated number series with optional series query.
 */
export async function getNumberSeries(
  params?: { series?: string; username?: string }
): Promise<NumberSeries[]> {
  const series = params?.series || '';
  const username = params?.username || getStoredUsername() || 'admin';
  return dbApiClient.get<NumberSeries[], NumberSeries[]>(
    `/scm-db-api/masterdata-db-api/getnumberseries?username=${encodeURIComponent(username)}&series=${encodeURIComponent(series)}`
  );
}

/**
 * Add a new number series batch to the system.
 */
export async function addNumberSeries(
  data: CreateNumberSeriesPayload,
  customUser?: string
): Promise<{ message: string; series?: NumberSeries }> {
  const username = customUser || getStoredUsername() || 'admin';
  return dbApiClient.post<{ message: string; series?: NumberSeries }, { message: string; series?: NumberSeries }>(
    `/scm-db-api/masterdata-db-api/addnumberseries?username=${encodeURIComponent(username)}`,
    data
  );
}

/**
 * Save / commit a number series configuration.
 */
export async function saveNumberSeries(
  data: CreateNumberSeriesPayload
): Promise<{ message: string }> {
  return dbApiClient.post<{ message: string }, { message: string }>(
    '/scm-db-api/masterdata-db-api/saveNumberSeries',
    data
  );
}

/**
 * Update an existing number series range or allocation.
 */
export async function editNumberSeries(
  data: UpdateNumberSeriesPayload,
  customUser?: string
): Promise<{ message: string }> {
  const username = customUser || getStoredUsername() || 'admin';
  return dbApiClient.put<{ message: string }, { message: string }>(
    `/scm-db-api/masterdata-db-api/editnumberseries?username=${encodeURIComponent(username)}`,
    data
  );
}

/**
 * Purge or decommission an active or expired number series.
 */
export async function purgeNumberSeries(
  series: string,
  customUser?: string
): Promise<{ message: string }> {
  const username = customUser || getStoredUsername() || 'admin';
  return dbApiClient.delete<{ message: string }, { message: string }>(
    `/scm-db-api/masterdata-db-api/purgenumberseries?username=${encodeURIComponent(username)}&series=${encodeURIComponent(series)}`
  );
}

export const masterdataApi = {
  getZones,
  getCircles,
  getZoneBasedCircles,
  getCirclesInfo,
  getSSAs,
  getDealerTypes,
  getCategory,
  getCategoryByDealer,
  sendOtp,
  validateOtp,
  findMnpData,
  saveMnp,
  modifyMnpData,
  deleteMnp,
  getNumberSeries,
  addNumberSeries,
  saveNumberSeries,
  editNumberSeries,
  purgeNumberSeries,
};
