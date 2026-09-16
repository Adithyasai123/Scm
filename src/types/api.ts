/**
 * Shared TypeScript interfaces and types for the SCM Portal API layer.
 */

// ============================================================================
// Core API Envelopes and Errors
// ============================================================================

export interface ApiResponse<T> {
  status: boolean | string | number;
  statusCode?: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface ApiError {
  code: string | number;
  message: string;
  retriable: boolean;
  status?: number;
  details?: unknown;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Geographic & Hierarchy Master Data
// ============================================================================

export interface Zone {
  id: number;
  name: string;
  zoneId?: string | number;
  zoneCode?: string;
  zoneName?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
}

export interface Circle {
  id: number;
  name: string;
  zoneId: number;
  circleId?: string | number;
  circleCode?: string;
  circleName?: string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
}

export interface CircleInfo {
  circleId: string | number;
  circleCode: string;
  circleName: string;
  zoneCode: string;
  zoneName?: string;
  headquarters?: string;
  contactNumber?: string;
  email?: string;
  status: string;
}

export interface SSA {
  id: number;
  name: string;
  circleId: number;
  ssaId?: string | number;
  ssaCode?: string;
  ssaName?: string;
  status?: 'ACTIVE' | 'INACTIVE' | string;
}

export interface DealerType {
  dealerTypeId: string | number;
  typeCode: string;
  typeName: string;
  description?: string;
  isActive?: boolean;
}

export interface Category {
  categoryId: string | number;
  categoryCode: string;
  categoryName: string;
  dealerTypeCode?: string;
  description?: string;
}

// ============================================================================
// Authentication & OTP
// ============================================================================

export interface SendOtpPayload {
  msisdn?: string;
  mobileNumber?: string;
  operation?: string;
  topic?: string;
  email?: string;
  hrmsNo?: string;
  username?: string;
  channel?: 'SMS' | 'EMAIL' | 'BOTH';
  purpose?: string;
}

export interface ValidateOtpPayload {
  msisdn?: string;
  mobileNumber?: string;
  operation?: string;
  email?: string;
  hrmsNo?: string;
  username?: string;
  otp: string;
  txnId?: string;
  purpose?: string;
  [key: string]: any;
}

export interface OtpResponse {
  txnId: string;
  status?: string;
  message?: string;
  expiresInSeconds?: number;
  expiresAt?: string;
}

// ============================================================================
// User Management
// ============================================================================

export interface ModulePermission {
  read: boolean;
  write: boolean;
  delete: boolean;
  approve?: boolean;
}

export interface UserPermissions {
  roleId?: number;
  username?: string;
  hrmsId?: string;
  roleName?: string | null;
  dealerPermissions: boolean;
  walletPermissions: boolean;
  userPermissions: boolean;
  commissionPermissions: boolean;
  plansNumberpermissions: boolean;
  reportsPermissions: boolean;
  stockCheck: boolean;
  dealerMpinReset: boolean;
  franchiseAddBalance: boolean;
  bulkRecharge: boolean;
  varepReports: boolean;
  userActivityReports: boolean;
  dealerStatus: boolean;
  transactionStatus: boolean;
  topupReversal: boolean;
  mnp: boolean;
  prepaidCommissions: boolean;
  postpaidCommissions: boolean;
  landlineCommissions: boolean;
  FOSCreation: boolean;
  [key: string]: unknown;
}

export interface User {
  id?: string | number;
  userId?: string | number;
  username: string;
  hrmsNo?: string;
  hrmsId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber: string;
  role?: string;
  roleId?: number;
  roleName?: string | null;
  designation?: string;
  zoneId?: number;
  zoneCode?: string;
  circleId?: number;
  circleCode?: string;
  ssaId?: number;
  ssaCode?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | string | number;
  address?: string;
  permissions?: any;
  createdDate?: string;
  updatedDate?: string;
  lastLogin?: string;
}

export interface CreateUserPayload {
  username: string;
  hrmsNo: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  designation?: string;
  zoneCode?: string;
  circleCode?: string;
  ssaCode?: string;
  permissions?: string[];
  password?: string;
}

export interface ModifyUserPayload {
  username: string;
  name?: string;
  email?: string;
  mobileNumber?: string;
  role?: string;
  designation?: string;
  zoneCode?: string;
  circleCode?: string;
  ssaCode?: string;
  permissions?: string[];
  status?: string;
}

export interface ModifyPermissionsPayload {
  username: string;
  permissions: string[];
  roles?: string[];
  modules?: Record<string, ModulePermission>;
}

export interface ChangeUserStatusPayload {
  username: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | string;
  remarks?: string;
}

export interface ChangePasswordPayload {
  username: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface UserStatusResponse {
  username: string;
  status: string;
  isLocked: boolean;
  lastLogin?: string;
}

// ============================================================================
// Dealer Management
// ============================================================================

export interface DealerAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
}

export interface Dealer {
  id?: string | number;
  dealerId?: string;
  dealerCode?: string;
  dealerName?: string;
  name?: string;
  msisdn?: string;
  dealerType: string;
  category: string;
  parentDealerCode?: string;
  parentDealerId?: string;
  mobileNumber?: string;
  alternateMobile?: string;
  email?: string;
  panNumber?: string;
  panId?: string;
  aadharNumber?: string;
  aadharId?: string;
  gstNumber?: string;
  address?: any;
  zoneId?: number;
  zoneCode?: string;
  circleId?: number;
  circleCode?: string;
  ssaId?: number;
  ssaCode?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING' | 'PURGED' | string;
  walletBalance?: number;
  franchiseCode?: string;
  franchiseMsisdn?: string;
  subFranchiseCode?: string;
  subFranchiseMsisdn?: string;
  createdDate?: string;
  updatedDate?: string;
  [key: string]: any;
}

export interface CreateDealerPayload {
  dealerCode?: string;
  dealerName: string;
  dealerType: string;
  category: string;
  parentDealerCode?: string;
  mobileNumber: string;
  alternateMobile?: string;
  email: string;
  panNumber: string;
  aadharNumber: string;
  gstNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  zoneCode?: string;
  circleCode?: string;
  ssaCode?: string;
  initialBalance?: number;
  [key: string]: any;
}

export interface UpdateDealerPayload {
  dealerCode: string;
  dealerName?: string;
  dealerType?: string;
  category?: string;
  parentDealerCode?: string;
  mobileNumber?: string;
  alternateMobile?: string;
  email?: string;
  panNumber?: string;
  aadharNumber?: string;
  gstNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  zoneCode?: string;
  circleCode?: string;
  ssaCode?: string;
  status?: string;
}

export interface DealerFilterParams extends PaginationParams {
  circleCode?: string;
  zoneCode?: string;
  ssaCode?: string;
  dealerType?: string;
  category?: string;
  status?: string;
  search?: string;
}

export interface ChangeDealerStatusPayload {
  dealerCode: string;
  status: string;
  reason?: string;
}

export interface ChangeDealerHierarchyPayload {
  dealerCode?: string;
  newParentCode?: string;
  newFranchiseCode?: string;
  srcDealerCode?: string;
  parentDealerCode?: string;
  reason?: string;
  [key: string]: any;
}

export interface ResetMpinPayload {
  dealerCode: string;
  mobileNumber?: string;
  sendSms?: boolean;
}

export interface DealerVerificationResult {
  exists: boolean;
  dealerCode?: string;
  dealerName?: string;
  status?: string;
  message?: string;
}

// ============================================================================
// Commission Configuration
// ============================================================================

export type CommissionType =
  | 'PREPAID_FRC'
  | 'PREPAID_OTF'
  | 'POSTPAID'
  | 'LANDLINE';

export interface CommissionConfig {
  id?: string | number;
  configId?: string;
  ruleName: string;
  commissionType: CommissionType | string;
  dealerType: string;
  category?: string;
  zoneCode?: string;
  circleCode?: string;
  planId?: string | number;
  denomination?: number;
  commissionPercentage?: number;
  fixedCommission?: number;
  tdsPercentage?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  remarks?: string;
}

export interface CreateCommissionPayload {
  ruleName?: string;
  commissionType?: CommissionType | string;
  dealerType?: string;
  category?: string;
  zoneCode?: string;
  circleCode?: string;
  planId?: string | number;
  denomination?: number;
  commissionPercentage?: number;
  fixedCommission?: number;
  tdsPercentage?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  status?: string;
  remarks?: string;
  circleId?: number;
  categoryId?: number;
  commissionRate?: any;
  bonus?: any;
  type?: any;
  [key: string]: any;
}

export interface UpdateCommissionPayload extends Partial<CreateCommissionPayload> {
  id?: string | number;
  configId?: string;
}

export interface CommissionFilterParams {
  circleCode?: string;
  zoneCode?: string;
  dealerType?: string;
  category?: string;
  status?: string;
}

// ============================================================================
// Plan Management
// ============================================================================

export type PlanType = 'PREPAID' | 'POSTPAID' | 'LANDLINE' | 'BROADBAND';

export interface Plan {
  id?: string | number;
  planId: string;
  planName: string;
  planType: PlanType | string;
  denomination: number;
  validityDays: number;
  talktime?: number;
  dataMb?: number;
  smsCount?: number;
  description?: string;
  circleCode?: string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  effectiveDate?: string;
  expiryDate?: string;
  sno?: number;
  [key: string]: any;
}

export interface CreatePlanPayload {
  planId?: string;
  planName: string;
  planType: PlanType | string;
  denomination: number;
  validityDays: number;
  talktime?: number;
  dataMb?: number;
  smsCount?: number;
  description?: string;
  circleCode?: string;
  status?: string;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface UpdatePlanPayload extends Partial<CreatePlanPayload> {
  planId: string;
}

export interface PlanFilterParams {
  planType?: string;
  circleCode?: string;
  status?: string;
  minDenomination?: number;
  maxDenomination?: number;
}

export interface DenominationPayload {
  denomination: number;
  planType: string;
  circleCode?: string;
  description?: string;
  validityDays?: number;
  status?: string;
}

// ============================================================================
// MNP (Mobile Number Portability) & Number Series
// ============================================================================

export interface MnpData {
  id?: string | number;
  mnpId?: string;
  msisdn: string;
  donorOperator: string;
  recipientOperator: string;
  upcCode: string;
  upcExpiry: string;
  circleCode: string;
  zoneCode?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PORTED' | string;
  submissionDate?: string;
  completionDate?: string;
  portingDate?: string;
  remarks?: string;
  [key: string]: any;
}

export interface CreateMnpPayload {
  msisdn: string;
  donorOperator: string;
  recipientOperator: string;
  upcCode: string;
  upcExpiry: string;
  circleCode: string;
  zoneCode?: string;
  remarks?: string;
}

export interface UpdateMnpPayload extends Partial<CreateMnpPayload> {
  mnpId?: string;
  id?: string | number;
  status?: string;
}

export interface MnpFilterParams extends PaginationParams {
  msisdn?: string;
  circleCode?: string;
  status?: string;
  donorOperator?: string;
}

export interface NumberSeries {
  id?: string | number;
  seriesId?: string;
  startRange: string;
  endRange: string;
  circleCode: string;
  ssaCode?: string;
  serviceType: 'GSM' | 'CDMA' | 'LANDLINE' | 'FTTH' | string;
  category?: 'REGULAR' | 'VANITY' | 'PREMIUM' | string;
  allocatedTo?: string;
  totalNumbers?: number;
  availableNumbers?: number;
  status: 'ACTIVE' | 'PURGED' | 'EXHAUSTED' | string;
  createdDate?: string;
}

export interface CreateNumberSeriesPayload {
  seriesId?: string;
  startRange: string;
  endRange: string;
  circleCode: string;
  ssaCode?: string;
  serviceType: 'GSM' | 'CDMA' | 'LANDLINE' | 'FTTH' | string;
  category?: 'REGULAR' | 'VANITY' | 'PREMIUM' | string;
  allocatedTo?: string;
  totalNumbers?: number;
  status?: string;
}

export interface UpdateNumberSeriesPayload extends Partial<CreateNumberSeriesPayload> {
  seriesId?: string;
  id?: string | number;
}

export interface NumberSeriesFilterParams extends PaginationParams {
  circleCode?: string;
  ssaCode?: string;
  serviceType?: string;
  status?: string;
}

// ============================================================================
// Franchise & Transactions
// ============================================================================

export interface FranchiseTransaction {
  id?: string | number;
  transactionId: string;
  franchiseCode: string;
  franchiseName?: string;
  circleCode: string;
  transactionType:
    | 'CREDIT'
    | 'DEBIT'
    | 'TOPUP'
    | 'STOCK_PURCHASE'
    | 'COMMISSION_SETTLEMENT'
    | string;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  paymentMode?: 'CASH' | 'CHEQUE' | 'NEFT' | 'RTGS' | 'UPI' | 'ONLINE' | string;
  referenceNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  transactionDate: string;
  franchiseMsisdn?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  remarks?: string;
  [key: string]: any;
}

export interface FranchiseTransactionFilterParams extends PaginationParams {
  franchiseCode?: string;
  circleCode?: string;
  circleId?: string | number;
  status?: string;
  startDate?: string;
  endDate?: string;
  transactionType?: string;
  [key: string]: any;
}

export interface TransactionApprovalPayload {
  transactionId: string;
  remarks?: string;
  username?: string;
  [key: string]: any;
}

export interface TransactionRejectionPayload {
  transactionId: string;
  reason: string;
  username?: string;
  [key: string]: any;
}

export interface FranchiseInfo {
  franchiseCode: string;
  franchiseName: string;
  circleCode: string;
  zoneCode: string;
  mobileNumber: string;
  email?: string;
  status: string;
}

export interface SubFranchiseInfo {
  subFranchiseCode: string;
  subFranchiseName: string;
  parentFranchiseCode: string;
  circleCode: string;
  mobileNumber: string;
  status: string;
}

// ============================================================================
// Wallet Management
// ============================================================================

export interface WalletAdjustmentPayload {
  msisdn?: string;
  username?: string;
  dealerCode?: string;
  adjustmentType?: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  remarks?: string;
  referenceId?: string;
  approvedBy?: string;
  [key: string]: any;
}

export interface WalletAdjustmentResponse {
  transactionId?: string;
  dealerCode?: string;
  adjustmentType?: 'CREDIT' | 'DEBIT' | string;
  amount?: number;
  balanceBefore?: number;
  balanceAfter?: number;
  newBalance?: number;
  timestamp?: string;
  status?: string;
  referenceId?: string;
  message?: string;
  [key: string]: any;
}
