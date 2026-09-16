import { getStoredUsername, plansApiClient } from '@/api/client';
import type {
  CreatePlanPayload,
  DenominationPayload,
  Plan,
  PlanFilterParams,
  UpdatePlanPayload,
} from '@/types/api';

/**
 * Fetch all available tariff plans with optional filtering.
 */
export async function getPlans(params?: PlanFilterParams): Promise<Plan[]> {
  return plansApiClient.get<Plan[], Plan[]>('/scm-plans-api/scm-product-api/getplans', { params });
}

/**
 * Add a new tariff or recharge plan to the catalog.
 */
export async function addPlan(payload: CreatePlanPayload, customUser?: string): Promise<{ message: string; plan?: Plan }> {
  const username = customUser || getStoredUsername() || 'admin';
  return plansApiClient.post<{ message: string; plan?: Plan }, { message: string; plan?: Plan }>(
    `/scm-plans-api/scm-product-api/addplan?username=${encodeURIComponent(username)}`,
    payload
  );
}

/**
 * Update an existing tariff plan's details, validity, or price.
 */
export async function updatePlan(
  sno: string | number,
  payload: UpdatePlanPayload,
  customUser?: string
): Promise<{ message: string }> {
  const username = customUser || getStoredUsername() || 'admin';
  return plansApiClient.put<{ message: string }, { message: string }>(
    `/scm-plans-api/scm-product-api/updateplan/${encodeURIComponent(sno)}?username=${encodeURIComponent(username)}`,
    payload
  );
}

/**
 * Deactivate or remove a plan from the active catalog (OTP-protected).
 */
export async function deletePlan(
  sno: string | number,
  customUser?: string
): Promise<{ message: string }> {
  const username = customUser || getStoredUsername() || 'admin';
  return plansApiClient.delete<{ message: string }, { message: string }>(
    `/scm-plans-api/scm-product-api/deleteplan/${encodeURIComponent(sno)}?username=${encodeURIComponent(username)}`
  );
}

/**
 * Fetch plan details corresponding to a specific recharge denomination.
 */
export async function fetchRechargePlan(
  price: number,
  circleId: number = 1,
  planType: string = 'Prepaid'
): Promise<Plan> {
  return plansApiClient.get<Plan, Plan>(
    `/scm-plans-api/scm-product-api/rechargePlan?price=${price}&circleId=${circleId}&planType=${encodeURIComponent(planType)}`
  );
}

/**
 * Save / configure a single recharge denomination.
 */
export async function saveDenomination(
  payload: DenominationPayload
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    '/scm-plans-api/scm-product-api/saveDenomination',
    payload
  );
}

/**
 * Save multiple recharge denominations for a Zone (Zone 0 = All Circulation).
 */
export async function saveMultipleDenominations(
  zoneId: number = 0,
  payload: DenominationPayload[]
): Promise<{ message: string }> {
  return plansApiClient.post<{ message: string }, { message: string }>(
    `/scm-plans-api/scm-product-api/saveMultipleDenominations?zoneId=${zoneId}`,
    payload
  );
}

export const planApi = {
  getPlans,
  addPlan,
  updatePlan,
  deletePlan,
  fetchRechargePlan,
  saveDenomination,
  saveMultipleDenominations,
};
