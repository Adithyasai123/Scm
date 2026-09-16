import { plansApiClient } from '@/api/client';
import type {
  CommissionConfig,
  CommissionFilterParams,
  CreateCommissionPayload,
  UpdateCommissionPayload,
} from '@/types/api';

/**
 * Save single commission configuration rule (Prepaid FRC).
 */
export async function saveCommissionConfig(
  config: CreateCommissionPayload
): Promise<{ message: string; config?: CommissionConfig }> {
  return plansApiClient.post<{ message: string; config?: CommissionConfig }, { message: string; config?: CommissionConfig }>(
    '/scm-plans-api/scm-product-api/saveCommissionConfig',
    config
  );
}

/**
 * Bulk save multiple commission rules for Zone or All Circulation (zoneId=0).
 */
export async function saveMultipleCommissionConfig(
  zoneId: number = 0,
  configs: CreateCommissionPayload[]
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    `/scm-plans-api/scm-product-api/savemultipleCommissionConfig?zoneId=${zoneId}`,
    configs
  );
}

/**
 * Save postpaid commission configuration.
 */
export async function savePostpaidConfig(
  config: CreateCommissionPayload
): Promise<{ message: string; config?: CommissionConfig }> {
  return plansApiClient.post<{ message: string; config?: CommissionConfig }, { message: string; config?: CommissionConfig }>(
    '/scm-plans-api/scm-product-api/postpaidCommissionConfig',
    config
  );
}

/**
 * Save landline commission configuration.
 */
export async function saveLandlineConfig(
  config: CreateCommissionPayload
): Promise<{ message: string; config?: CommissionConfig }> {
  return plansApiClient.post<{ message: string; config?: CommissionConfig }, { message: string; config?: CommissionConfig }>(
    '/scm-plans-api/scm-product-api/landlineCommissionConfig',
    config
  );
}

/**
 * Fetch Prepaid First Recharge Commission (FRC) rules.
 */
export async function fetchPrepaidFrcCommission(
  params?: CommissionFilterParams
): Promise<CommissionConfig[]> {
  return plansApiClient.get<CommissionConfig[], CommissionConfig[]>(
    '/scm-plans-api/scm-product-api/fetchCommission',
    { params }
  );
}

/**
 * Fetch Prepaid Over-the-Top / Over-the-Floor (OTF) recharge commission rules.
 */
export async function fetchPrepaidOtfCommission(
  params?: CommissionFilterParams
): Promise<CommissionConfig[]> {
  return plansApiClient.get<CommissionConfig[], CommissionConfig[]>(
    '/scm-plans-api/scm-product-api/fetchPrepaidOTFCommission',
    { params }
  );
}

/**
 * Fetch Postpaid bill payment and activation commission rules.
 */
export async function fetchPostpaidCommission(
  params?: CommissionFilterParams
): Promise<CommissionConfig[]> {
  return plansApiClient.get<CommissionConfig[], CommissionConfig[]>(
    '/scm-plans-api/scm-product-api/fetchPostpaidCommission',
    { params }
  );
}

/**
 * Fetch Landline / Broadband activation and bill payment commission rules.
 */
export async function fetchLandlineCommission(
  params?: CommissionFilterParams
): Promise<CommissionConfig[]> {
  return plansApiClient.post<CommissionConfig[], CommissionConfig[]>(
    '/scm-plans-api/scm-product-api/fetchLandlineCommission',
    params || {}
  );
}

/**
 * Update an existing general/FRC commission configuration.
 */
export async function updateCommissionConfig(
  config: UpdateCommissionPayload
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    '/scm-plans-api/scm-product-api/updateCommissionConfig',
    config
  );
}

/**
 * Update a postpaid commission configuration.
 */
export async function updatePostpaidCommission(
  config: UpdateCommissionPayload
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    '/scm-plans-api/scm-product-api/updatePostpaidCommission',
    config
  );
}

/**
 * Update a landline commission configuration.
 */
export async function updateLandlineCommission(
  config: UpdateCommissionPayload
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    '/scm-plans-api/scm-product-api/updateLandlineCommission',
    config
  );
}

/**
 * Delete a general/FRC commission rule by ID.
 */
export async function deleteCommissionConfig(
  id: string | number
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    `/scm-plans-api/scm-product-api/deleteCommissionConfig?commissionId=${encodeURIComponent(id)}`
  );
}

/**
 * Delete a postpaid commission rule by ID.
 */
export async function deletePostpaidCommission(
  id: string | number
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    `/scm-plans-api/scm-product-api/deletePostpaidCommission?commissionId=${encodeURIComponent(id)}`
  );
}

/**
 * Delete a landline commission rule by ID.
 */
export async function deleteLandlineCommission(
  id: string | number
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    `/scm-plans-api/scm-product-api/deleteLandlineCommission?commissionId=${encodeURIComponent(id)}`
  );
}

export const commissionApi = {
  saveCommissionConfig,
  saveMultipleCommissionConfig,
  savePostpaidConfig,
  saveLandlineConfig,
  fetchPrepaidFrcCommission,
  fetchPrepaidOtfCommission,
  fetchPostpaidCommission,
  fetchLandlineCommission,
  updateCommissionConfig,
  updatePostpaidCommission,
  updateLandlineCommission,
  deleteCommissionConfig,
  deletePostpaidCommission,
  deleteLandlineCommission,
};
