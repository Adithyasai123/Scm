import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError, ApiResponse } from '@/types/api';

/**
 * Username storage key for X-Username header.
 */
const USERNAME_STORAGE_KEY = 'scm_username';

let currentUsername: string | null = null;

/**
 * Helper to get active username from memory, localStorage, or cookies.
 */
export function getStoredUsername(): string | null {
  if (currentUsername) return currentUsername;
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(USERNAME_STORAGE_KEY);
      if (stored) return stored;
    } catch {
      // Storage access blocked or unavailable
    }
  }
  return null;
}

/**
 * Helper to update active username across HTTP client requests.
 */
export function setStoredUsername(username: string | null): void {
  currentUsername = username;
  if (typeof window !== 'undefined') {
    try {
      if (username) {
        window.localStorage.setItem(USERNAME_STORAGE_KEY, username);
      } else {
        window.localStorage.removeItem(USERNAME_STORAGE_KEY);
      }
    } catch {
      // Storage access blocked or unavailable
    }
  }
}

/**
 * Type guard for normalized ApiError
 */
export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    'code' in err &&
    'retriable' in err
  );
}

/**
 * Normalizes any error or response into a standard ApiError object.
 */
function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  const axiosError = error as AxiosError<{
    status?: boolean | string | number;
    statusCode?: number;
    code?: string | number;
    message?: string;
    error?: string;
    details?: unknown;
  }>;

  if (axiosError.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data;

    // Status 5xx and 429 are retriable
    const retriable = status === 429 || (status >= 500 && status < 600);

    const message =
      data?.message ||
      data?.error ||
      axiosError.message ||
      `Request failed with status ${status}`;

    const code =
      data?.code ||
      data?.statusCode ||
      `HTTP_${status}`;

    return {
      code,
      message,
      retriable,
      status,
      details: data?.details ?? data,
    };
  }

  if (axiosError.request) {
    // Network failure, timeout, or server didn't respond
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error: The server could not be reached. Please check your connection.',
      retriable: true,
      status: 0,
      details: axiosError.message,
    };
  }

  return {
    code: 'CLIENT_ERROR',
    message: axiosError.message || 'An unexpected error occurred.',
    retriable: false,
    details: error,
  };
}

/**
 * Unwraps an ApiResponse envelope or direct data payload.
 */
export function unwrap<T>(payload: unknown): T {
  if (payload === null || payload === undefined) {
    return payload as T;
  }

  if (typeof payload === 'object') {
    // If it's an AxiosResponse
    if ('data' in payload && 'status' in payload && 'headers' in payload) {
      const axiosData = (payload as AxiosResponse<unknown>).data;
      return unwrap<T>(axiosData);
    }

    // If it's an ApiResponse envelope { status, message, data }
    const candidate = payload as Partial<ApiResponse<T>>;
    if ('data' in candidate && ('status' in candidate || 'message' in candidate)) {
      if (candidate.status === false || candidate.status === 'ERROR' || candidate.status === 'FAILED') {
        const error: ApiError = {
          code: candidate.statusCode || 'BUSINESS_ERROR',
          message: candidate.message || 'Operation failed',
          retriable: false,
          details: candidate,
        };
        throw error;
      }
      return candidate.data as T;
    }
  }

  return payload as T;
}

/**
 * Configure request and response interceptors on an AxiosInstance.
 */
function applyInterceptors(instance: AxiosInstance): void {
  // Request Interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers = config.headers || {};
      config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
      config.headers['Accept'] = 'application/json';

      const username = getStoredUsername();
      if (username && !config.headers['X-Username']) {
        config.headers['X-Username'] = username;
      }

      return config;
    },
    (error: unknown) => {
      return Promise.reject(normalizeError(error));
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const body = response.data;

      // Check if response conforms to ApiResponse envelope
      if (body && typeof body === 'object' && ('data' in body || 'status' in body)) {
        const statusVal = body.status;

        // Check for business failure responses inside HTTP 200
        if (statusVal === false || statusVal === 'ERROR' || statusVal === 'FAILED') {
          const apiError: ApiError = {
            code: body.statusCode || body.code || 'API_BUSINESS_ERROR',
            message: body.message || 'The requested operation failed.',
            retriable: false,
            status: response.status,
            details: body,
          };
          return Promise.reject(apiError);
        }

        // Return the unwrapped inner data payload
        if (body.data !== undefined) {
          return body.data;
        }
      }

      // If plain payload, return data as is
      return body;
    },
    (error: unknown) => {
      return Promise.reject(normalizeError(error));
    }
  );
}

/**
 * Factory for creating configured Axios clients.
 */
export function createApiClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  applyInterceptors(instance);
  return instance;
}

// Base URL: relative same-origin ("") for local execution, or custom external backend if configured
const DEFAULT_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' ? '' : 'http://localhost:3000');
const USER_API_BASE = process.env.NEXT_PUBLIC_USER_API_URL || DEFAULT_BASE;
const DB_API_BASE = process.env.NEXT_PUBLIC_DB_API_URL || DEFAULT_BASE;
const PLANS_API_BASE = process.env.NEXT_PUBLIC_PLANS_API_URL || DEFAULT_BASE;
const DEALER_API_BASE = process.env.NEXT_PUBLIC_DEALER_API_URL || DEFAULT_BASE;
const FRANCHISE_API_BASE = process.env.NEXT_PUBLIC_FRANCHISE_API_URL || DEFAULT_BASE;
const STOCK_API_BASE = process.env.NEXT_PUBLIC_STOCK_API_URL || DEFAULT_BASE;

/**
 * User Service HTTP Client
 */
export const userApiClient = createApiClient(USER_API_BASE);

/**
 * Master Data & Database HTTP Client
 */
export const dbApiClient = createApiClient(DB_API_BASE);

/**
 * Plans & Denominations HTTP Client
 */
export const plansApiClient = createApiClient(PLANS_API_BASE);

/**
 * Dealer Management HTTP Client
 */
export const dealerApiClient = createApiClient(DEALER_API_BASE);

/**
 * Franchise & Transactions HTTP Client
 */
export const franchiseApiClient = createApiClient(FRANCHISE_API_BASE);

/**
 * Stock & Inventory HTTP Client
 */
export const stockApiClient = createApiClient(STOCK_API_BASE);
