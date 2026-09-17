// Centralized SCM Data Store
// Provides a unified, comprehensive multi-record repository for:
// - Zones, Circles, SSAs
// - Users & Role Permissions
// - Dealers & Franchise Hierarchy
// - Commission Rules (Prepaid FRC, Prepaid OTF, Postpaid, Landline / Fiber, Franchise Balance)
// - Tariff Plans & Denominations
// - Number Series Allocations
// - MNP Porting Transactions

export interface Zone {
  id: number;
  name: string;
}

export interface Circle {
  id: number;
  name: string;
  zoneId: number;
}

export interface SSA {
  id: number;
  name: string;
  circleId: number;
}

export interface UserPermissionSet {
  roleId: number;
  username: string;
  hrmsId: string;
  roleName: string;
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
}

export interface SCMUser {
  userId: string;
  hrmsId: string;
  username: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  address: string;
  status: number;
  roleId: number;
  roleName: string;
  ssaId: number;
  circleId: number;
  zoneId: number;
  dob: string;
  loginStatus: string;
  permissions: UserPermissionSet;
}

export interface DealerRecord {
  msisdn: string;
  name: string;
  dealerType: 'Retailer' | 'Franchise' | 'SubFranchise' | 'FOS';
  category: string;
  circleId: number;
  ssaId: number;
  status: 'ACTIVE' | 'INACTIVE';
  panId: string;
  aadharId: string;
  franchiseMsisdn: string;
  subFranchiseMsisdn: string;
  zoneCode?: string;
  circleCode?: string;
}

export interface CommissionConfig {
  id: number;
  configId: string;
  category: string;
  categoryId: number;
  circleId: number;
  circleName: string;
  commissionRate: string;
  bonus: string;
  status: 'ACTIVE' | 'INACTIVE';
  type: 'FRC' | 'OTF' | 'POSTPAID' | 'LANDLINE';
  commissionType: string;
  updatedDate: string;
}

export interface FranchiseTxn {
  id: string;
  transactionId: string;
  franchiseMsisdn: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  requestedBy: string;
}

export interface TariffPlan {
  sno: number;
  operator: string;
  denomination: number;
  talkvalue: number;
  country: string;
  startDate: string;
  endDate: string;
  planType: string;
  description: string;
  tabName: 'Prepaid' | 'Postpaid' | 'Landline';
  circleId: number;
  validity: number;
  fromDate: string;
  toDate: string;
}

export interface NumberSeriesRecord {
  id: string;
  series: string;
  circleId: number;
  circleName: string;
  operatorId: string;
  totalNumbers: number;
  activeCount: number;
}

export interface MnpRecord {
  id: string;
  msisdn: string;
  donorOperator: string;
  recipientOperator: string;
  portingDate: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'REJECTED' | 'PENDING_VERIFICATION';
}

// ─────────────────────────────────────────────────────────────
// INITIAL DATA ARRAYS (Rich Multi-Record Datasets)
// ─────────────────────────────────────────────────────────────

export const INITIAL_ZONES: Zone[] = [
  { id: 1, name: 'North Zone' },
  { id: 2, name: 'South Zone' },
  { id: 3, name: 'East Zone' },
  { id: 4, name: 'West Zone' },
];

export const INITIAL_CIRCLES: Circle[] = [
  { id: 1, name: 'Delhi Circle', zoneId: 1 },
  { id: 2, name: 'UP Circle', zoneId: 1 },
  { id: 3, name: 'Tamil Nadu Circle', zoneId: 2 },
  { id: 4, name: 'Karnataka Circle', zoneId: 2 },
  { id: 5, name: 'Kolkata Circle', zoneId: 3 },
  { id: 6, name: 'Maharashtra Circle', zoneId: 4 },
];

export const INITIAL_SSAS: SSA[] = [
  { id: 1, name: 'Delhi SSA', circleId: 1 },
  { id: 2, name: 'Noida SSA', circleId: 1 },
  { id: 3, name: 'Lucknow SSA', circleId: 2 },
  { id: 4, name: 'Chennai SSA', circleId: 3 },
  { id: 5, name: 'Bengaluru SSA', circleId: 4 },
  { id: 6, name: 'Kolkata Central SSA', circleId: 5 },
  { id: 7, name: 'Mumbai Suburban SSA', circleId: 6 },
  { id: 8, name: 'Pune SSA', circleId: 6 },
];

export const INITIAL_USERS: SCMUser[] = [
  {
    userId: 'USR-001',
    hrmsId: 'HRMS001',
    username: 'admin',
    mobileNumber: '9876543210',
    firstName: 'Adithya',
    lastName: 'Admin',
    address: 'Connaught Place, New Delhi',
    status: 1,
    roleId: 1,
    roleName: 'Super Admin',
    ssaId: 1,
    circleId: 1,
    zoneId: 1,
    dob: '1992-05-15',
    loginStatus: '1',
    permissions: {
      roleId: 1,
      username: 'admin',
      hrmsId: 'HRMS001',
      roleName: 'Super Admin',
      dealerPermissions: true,
      walletPermissions: true,
      userPermissions: true,
      commissionPermissions: true,
      plansNumberpermissions: true,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: true,
      franchiseAddBalance: true,
      bulkRecharge: true,
      varepReports: true,
      userActivityReports: true,
      dealerStatus: true,
      transactionStatus: true,
      topupReversal: true,
      mnp: true,
      prepaidCommissions: true,
      postpaidCommissions: true,
      landlineCommissions: true,
      FOSCreation: true,
    },
  },
  {
    userId: 'USR-002',
    hrmsId: 'HRMS002',
    username: 'rajesh_k',
    mobileNumber: '9812345678',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    address: 'Koramangala, Bengaluru',
    status: 1,
    roleId: 2,
    roleName: 'Circle Manager',
    ssaId: 5,
    circleId: 4,
    zoneId: 2,
    dob: '1988-11-20',
    loginStatus: '0',
    permissions: {
      roleId: 2,
      username: 'rajesh_k',
      hrmsId: 'HRMS002',
      roleName: 'Circle Manager',
      dealerPermissions: true,
      walletPermissions: false,
      userPermissions: false,
      commissionPermissions: true,
      plansNumberpermissions: true,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: true,
      franchiseAddBalance: false,
      bulkRecharge: true,
      varepReports: true,
      userActivityReports: false,
      dealerStatus: true,
      transactionStatus: true,
      topupReversal: false,
      mnp: true,
      prepaidCommissions: true,
      postpaidCommissions: true,
      landlineCommissions: false,
      FOSCreation: true,
    },
  },
  {
    userId: 'USR-003',
    hrmsId: 'HRMS003',
    username: 'priya_sharma',
    mobileNumber: '9899123456',
    firstName: 'Priya',
    lastName: 'Sharma',
    address: 'Sector 18, Noida',
    status: 1,
    roleId: 2,
    roleName: 'Operations Lead',
    ssaId: 2,
    circleId: 1,
    zoneId: 1,
    dob: '1994-08-12',
    loginStatus: '1',
    permissions: {
      roleId: 2,
      username: 'priya_sharma',
      hrmsId: 'HRMS003',
      roleName: 'Operations Lead',
      dealerPermissions: true,
      walletPermissions: true,
      userPermissions: true,
      commissionPermissions: false,
      plansNumberpermissions: true,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: true,
      franchiseAddBalance: true,
      bulkRecharge: true,
      varepReports: true,
      userActivityReports: true,
      dealerStatus: true,
      transactionStatus: true,
      topupReversal: true,
      mnp: true,
      prepaidCommissions: false,
      postpaidCommissions: false,
      landlineCommissions: false,
      FOSCreation: true,
    },
  },
  {
    userId: 'USR-004',
    hrmsId: 'HRMS004',
    username: 'suresh_v',
    mobileNumber: '9444012345',
    firstName: 'Suresh',
    lastName: 'Varma',
    address: 'Anna Nagar, Chennai',
    status: 0,
    roleId: 3,
    roleName: 'Auditor',
    ssaId: 4,
    circleId: 3,
    zoneId: 2,
    dob: '1985-03-25',
    loginStatus: '0',
    permissions: {
      roleId: 3,
      username: 'suresh_v',
      hrmsId: 'HRMS004',
      roleName: 'Auditor',
      dealerPermissions: true,
      walletPermissions: false,
      userPermissions: false,
      commissionPermissions: false,
      plansNumberpermissions: false,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: false,
      franchiseAddBalance: false,
      bulkRecharge: false,
      varepReports: true,
      userActivityReports: true,
      dealerStatus: false,
      transactionStatus: true,
      topupReversal: false,
      mnp: false,
      prepaidCommissions: false,
      postpaidCommissions: false,
      landlineCommissions: false,
      FOSCreation: false,
    },
  },
  {
    userId: 'USR-005',
    hrmsId: 'HRMS005',
    username: 'vikram_m',
    mobileNumber: '9820012345',
    firstName: 'Vikram',
    lastName: 'Malhotra',
    address: 'Bandra West, Mumbai',
    status: 1,
    roleId: 2,
    roleName: 'Circle Manager',
    ssaId: 7,
    circleId: 6,
    zoneId: 4,
    dob: '1987-04-18',
    loginStatus: '1',
    permissions: {
      roleId: 2,
      username: 'vikram_m',
      hrmsId: 'HRMS005',
      roleName: 'Circle Manager',
      dealerPermissions: true,
      walletPermissions: true,
      userPermissions: false,
      commissionPermissions: true,
      plansNumberpermissions: true,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: true,
      franchiseAddBalance: true,
      bulkRecharge: true,
      varepReports: true,
      userActivityReports: false,
      dealerStatus: true,
      transactionStatus: true,
      topupReversal: false,
      mnp: true,
      prepaidCommissions: true,
      postpaidCommissions: true,
      landlineCommissions: true,
      FOSCreation: true,
    },
  },
  {
    userId: 'USR-006',
    hrmsId: 'HRMS006',
    username: 'ananya_roy',
    mobileNumber: '9831012345',
    firstName: 'Ananya',
    lastName: 'Roy',
    address: 'Salt Lake City, Kolkata',
    status: 1,
    roleId: 3,
    roleName: 'Commission Officer',
    ssaId: 6,
    circleId: 5,
    zoneId: 3,
    dob: '1991-09-30',
    loginStatus: '1',
    permissions: {
      roleId: 3,
      username: 'ananya_roy',
      hrmsId: 'HRMS006',
      roleName: 'Commission Officer',
      dealerPermissions: false,
      walletPermissions: false,
      userPermissions: false,
      commissionPermissions: true,
      plansNumberpermissions: true,
      reportsPermissions: true,
      stockCheck: false,
      dealerMpinReset: false,
      franchiseAddBalance: false,
      bulkRecharge: false,
      varepReports: true,
      userActivityReports: false,
      dealerStatus: false,
      transactionStatus: false,
      topupReversal: false,
      mnp: false,
      prepaidCommissions: true,
      postpaidCommissions: true,
      landlineCommissions: true,
      FOSCreation: false,
    },
  },
  {
    userId: 'USR-007',
    hrmsId: 'HRMS007',
    username: 'manoj_tiwari',
    mobileNumber: '9415012345',
    firstName: 'Manoj',
    lastName: 'Tiwari',
    address: 'Hazratganj, Lucknow',
    status: 1,
    roleId: 2,
    roleName: 'Circle Manager',
    ssaId: 3,
    circleId: 2,
    zoneId: 1,
    dob: '1986-07-22',
    loginStatus: '0',
    permissions: {
      roleId: 2,
      username: 'manoj_tiwari',
      hrmsId: 'HRMS007',
      roleName: 'Circle Manager',
      dealerPermissions: true,
      walletPermissions: true,
      userPermissions: false,
      commissionPermissions: true,
      plansNumberpermissions: true,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: true,
      franchiseAddBalance: true,
      bulkRecharge: true,
      varepReports: true,
      userActivityReports: false,
      dealerStatus: true,
      transactionStatus: true,
      topupReversal: false,
      mnp: true,
      prepaidCommissions: true,
      postpaidCommissions: true,
      landlineCommissions: false,
      FOSCreation: true,
    },
  },
  {
    userId: 'USR-008',
    hrmsId: 'HRMS008',
    username: 'deepa_p',
    mobileNumber: '9448012345',
    firstName: 'Deepa',
    lastName: 'Pillai',
    address: 'Indiranagar, Bengaluru',
    status: 1,
    roleId: 4,
    roleName: 'Finance Auditor',
    ssaId: 5,
    circleId: 4,
    zoneId: 2,
    dob: '1993-12-05',
    loginStatus: '1',
    permissions: {
      roleId: 4,
      username: 'deepa_p',
      hrmsId: 'HRMS008',
      roleName: 'Finance Auditor',
      dealerPermissions: false,
      walletPermissions: true,
      userPermissions: false,
      commissionPermissions: false,
      plansNumberpermissions: false,
      reportsPermissions: true,
      stockCheck: true,
      dealerMpinReset: false,
      franchiseAddBalance: true,
      bulkRecharge: false,
      varepReports: true,
      userActivityReports: true,
      dealerStatus: false,
      transactionStatus: true,
      topupReversal: true,
      mnp: false,
      prepaidCommissions: false,
      postpaidCommissions: false,
      landlineCommissions: false,
      FOSCreation: false,
    },
  },
];

export const INITIAL_DEALERS: DealerRecord[] = [
  {
    msisdn: '9845012345',
    name: 'Apex Telecom Agency',
    dealerType: 'Retailer',
    category: 'Category A',
    circleId: 4,
    ssaId: 5,
    status: 'ACTIVE',
    panId: 'ABCDE1234F',
    aadharId: '123456789012',
    franchiseMsisdn: '9822012345',
    subFranchiseMsisdn: '9822012345',
    zoneCode: 'South',
    circleCode: 'Karnataka Circle',
  },
  {
    msisdn: '9811012345',
    name: 'Metro Cellular Care',
    dealerType: 'Franchise',
    category: 'Category A',
    circleId: 1,
    ssaId: 1,
    status: 'ACTIVE',
    panId: 'BCDEF2345G',
    aadharId: '234567890123',
    franchiseMsisdn: '',
    subFranchiseMsisdn: '',
    zoneCode: 'North',
    circleCode: 'Delhi Circle',
  },
  {
    msisdn: '9822012345',
    name: 'Sunrise Mobile World',
    dealerType: 'SubFranchise',
    category: 'Category B',
    circleId: 2,
    ssaId: 3,
    status: 'INACTIVE',
    panId: 'CDEFG3456H',
    aadharId: '345678901234',
    franchiseMsisdn: '9811012345',
    subFranchiseMsisdn: '',
    zoneCode: 'North',
    circleCode: 'UP Circle',
  },
  {
    msisdn: '9833012345',
    name: 'Kolkata Smart Links',
    dealerType: 'Retailer',
    category: 'Category C',
    circleId: 5,
    ssaId: 6,
    status: 'ACTIVE',
    panId: 'DEFGH4567J',
    aadharId: '456789012345',
    franchiseMsisdn: '9811012345',
    subFranchiseMsisdn: '9822012345',
    zoneCode: 'East',
    circleCode: 'Kolkata Circle',
  },
  {
    msisdn: '9866012345',
    name: 'Deccan Digital Hub',
    dealerType: 'Franchise',
    category: 'Category A',
    circleId: 3,
    ssaId: 4,
    status: 'ACTIVE',
    panId: 'EFGHI5678K',
    aadharId: '567890123456',
    franchiseMsisdn: '',
    subFranchiseMsisdn: '',
    zoneCode: 'South',
    circleCode: 'Tamil Nadu Circle',
  },
  {
    msisdn: '9877012345',
    name: 'Western Connect Communications',
    dealerType: 'Franchise',
    category: 'Category A',
    circleId: 6,
    ssaId: 7,
    status: 'ACTIVE',
    panId: 'FGHIJ6789L',
    aadharId: '678901234567',
    franchiseMsisdn: '',
    subFranchiseMsisdn: '',
    zoneCode: 'West',
    circleCode: 'Maharashtra Circle',
  },
  {
    msisdn: '9888012345',
    name: 'Pune Rapid Solutions',
    dealerType: 'SubFranchise',
    category: 'Category B',
    circleId: 6,
    ssaId: 8,
    status: 'ACTIVE',
    panId: 'GHIJK7890M',
    aadharId: '789012345678',
    franchiseMsisdn: '9877012345',
    subFranchiseMsisdn: '',
    zoneCode: 'West',
    circleCode: 'Maharashtra Circle',
  },
  {
    msisdn: '9899012345',
    name: 'Noida Telecom Express',
    dealerType: 'Retailer',
    category: 'Category B',
    circleId: 1,
    ssaId: 2,
    status: 'ACTIVE',
    panId: 'HIJKL8901N',
    aadharId: '890123456789',
    franchiseMsisdn: '9811012345',
    subFranchiseMsisdn: '',
    zoneCode: 'North',
    circleCode: 'Delhi Circle',
  },
  {
    msisdn: '9855012345',
    name: 'Bengaluru Southern Retail',
    dealerType: 'Retailer',
    category: 'Category A',
    circleId: 4,
    ssaId: 5,
    status: 'ACTIVE',
    panId: 'IJKLM9012P',
    aadharId: '901234567890',
    franchiseMsisdn: '9845012345',
    subFranchiseMsisdn: '',
    zoneCode: 'South',
    circleCode: 'Karnataka Circle',
  },
  {
    msisdn: '9844012345',
    name: 'Chennai Central Cellular',
    dealerType: 'Retailer',
    category: 'Category C',
    circleId: 3,
    ssaId: 4,
    status: 'ACTIVE',
    panId: 'JKLMN0123Q',
    aadharId: '012345678901',
    franchiseMsisdn: '9866012345',
    subFranchiseMsisdn: '',
    zoneCode: 'South',
    circleCode: 'Tamil Nadu Circle',
  },
  {
    msisdn: '9812012345',
    name: 'Ganges Valley Franchise',
    dealerType: 'Franchise',
    category: 'Category B',
    circleId: 2,
    ssaId: 3,
    status: 'ACTIVE',
    panId: 'KLMNO1234R',
    aadharId: '112233445566',
    franchiseMsisdn: '',
    subFranchiseMsisdn: '',
    zoneCode: 'North',
    circleCode: 'UP Circle',
  },
  {
    msisdn: '9823012345',
    name: 'Howrah Mobile Junction',
    dealerType: 'Retailer',
    category: 'Category B',
    circleId: 5,
    ssaId: 6,
    status: 'ACTIVE',
    panId: 'LMNOP2345S',
    aadharId: '223344556677',
    franchiseMsisdn: '9833012345',
    subFranchiseMsisdn: '',
    zoneCode: 'East',
    circleCode: 'Kolkata Circle',
  },
  {
    msisdn: '9834012345',
    name: 'FastTrack FOS Fleet',
    dealerType: 'FOS',
    category: 'Category C',
    circleId: 1,
    ssaId: 1,
    status: 'ACTIVE',
    panId: 'MNOPQ3456T',
    aadharId: '334455667788',
    franchiseMsisdn: '9811012345',
    subFranchiseMsisdn: '',
    zoneCode: 'North',
    circleCode: 'Delhi Circle',
  },
];

export const INITIAL_COMMISSIONS: CommissionConfig[] = [
  // ── 1. PREPAID FRC COMMISSIONS (Multiple Diverse Rules) ──
  {
    id: 1,
    configId: 'COM-001',
    category: 'Prepaid FRC Plan 199',
    categoryId: 1,
    circleId: 1,
    circleName: 'Delhi Circle',
    commissionRate: '4.5%',
    bonus: '₹50',
    status: 'ACTIVE',
    type: 'FRC',
    commissionType: 'FRC',
    updatedDate: '2025-01-10',
  },
  {
    id: 5,
    configId: 'COM-005',
    category: 'Prepaid FRC Plan 249',
    categoryId: 1,
    circleId: 4,
    circleName: 'Karnataka Circle',
    commissionRate: '5.0%',
    bonus: '₹60',
    status: 'ACTIVE',
    type: 'FRC',
    commissionType: 'FRC',
    updatedDate: '2025-01-18',
  },
  {
    id: 6,
    configId: 'COM-006',
    category: 'Prepaid FRC Plan 399',
    categoryId: 2,
    circleId: 6,
    circleName: 'Maharashtra Circle',
    commissionRate: '5.5%',
    bonus: '₹80',
    status: 'ACTIVE',
    type: 'FRC',
    commissionType: 'FRC',
    updatedDate: '2025-02-01',
  },
  {
    id: 7,
    configId: 'COM-007',
    category: 'Prepaid FRC Plan 599',
    categoryId: 1,
    circleId: 3,
    circleName: 'Tamil Nadu Circle',
    commissionRate: '6.0%',
    bonus: '₹120',
    status: 'ACTIVE',
    type: 'FRC',
    commissionType: 'FRC',
    updatedDate: '2025-02-15',
  },
  {
    id: 8,
    configId: 'COM-008',
    category: 'Prepaid FRC Plan 666',
    categoryId: 3,
    circleId: 2,
    circleName: 'UP Circle',
    commissionRate: '4.0%',
    bonus: '₹40',
    status: 'ACTIVE',
    type: 'FRC',
    commissionType: 'FRC',
    updatedDate: '2025-02-28',
  },
  {
    id: 9,
    configId: 'COM-009',
    category: 'Prepaid FRC Plan 999',
    categoryId: 2,
    circleId: 5,
    circleName: 'Kolkata Circle',
    commissionRate: '6.5%',
    bonus: '₹150',
    status: 'ACTIVE',
    type: 'FRC',
    commissionType: 'FRC',
    updatedDate: '2025-03-05',
  },

  // ── 2. PREPAID OTF COMMISSIONS (Multiple Diverse Rules) ──
  {
    id: 2,
    configId: 'COM-002',
    category: 'Prepaid OTF SCM Tier 1',
    categoryId: 2,
    circleId: 4,
    circleName: 'Karnataka Circle',
    commissionRate: '3.0%',
    bonus: '₹20',
    status: 'ACTIVE',
    type: 'OTF',
    commissionType: 'OTF',
    updatedDate: '2025-02-14',
  },
  {
    id: 10,
    configId: 'COM-010',
    category: 'Prepaid OTF High Volume Slabs',
    categoryId: 1,
    circleId: 1,
    circleName: 'Delhi Circle',
    commissionRate: '3.5%',
    bonus: '₹35',
    status: 'ACTIVE',
    type: 'OTF',
    commissionType: 'OTF',
    updatedDate: '2025-02-20',
  },
  {
    id: 11,
    configId: 'COM-011',
    category: 'Prepaid OTF Rural Push Incentive',
    categoryId: 2,
    circleId: 2,
    circleName: 'UP Circle',
    commissionRate: '4.0%',
    bonus: '₹45',
    status: 'ACTIVE',
    type: 'OTF',
    commissionType: 'OTF',
    updatedDate: '2025-02-25',
  },
  {
    id: 12,
    configId: 'COM-012',
    category: 'Prepaid OTF Metro Super Performer',
    categoryId: 1,
    circleId: 6,
    circleName: 'Maharashtra Circle',
    commissionRate: '4.5%',
    bonus: '₹50',
    status: 'ACTIVE',
    type: 'OTF',
    commissionType: 'OTF',
    updatedDate: '2025-03-01',
  },
  {
    id: 13,
    configId: 'COM-013',
    category: 'Prepaid OTF Quarter Milestone',
    categoryId: 3,
    circleId: 5,
    circleName: 'Kolkata Circle',
    commissionRate: '3.2%',
    bonus: '₹25',
    status: 'ACTIVE',
    type: 'OTF',
    commissionType: 'OTF',
    updatedDate: '2025-03-06',
  },
  {
    id: 14,
    configId: 'COM-014',
    category: 'Prepaid OTF Festival Activation Drive',
    categoryId: 2,
    circleId: 3,
    circleName: 'Tamil Nadu Circle',
    commissionRate: '4.2%',
    bonus: '₹40',
    status: 'ACTIVE',
    type: 'OTF',
    commissionType: 'OTF',
    updatedDate: '2025-03-10',
  },

  // ── 3. POSTPAID COMMISSIONS (Multiple Diverse Rules) ──
  {
    id: 3,
    configId: 'COM-003',
    category: 'Postpaid Corporate 599',
    categoryId: 1,
    circleId: 1,
    circleName: 'Delhi Circle',
    commissionRate: '₹120 / activation',
    bonus: '₹100',
    status: 'ACTIVE',
    type: 'POSTPAID',
    commissionType: 'POSTPAID',
    updatedDate: '2025-03-01',
  },
  {
    id: 15,
    configId: 'COM-015',
    category: 'Postpaid Executive 799',
    categoryId: 1,
    circleId: 6,
    circleName: 'Maharashtra Circle',
    commissionRate: '₹180 / activation',
    bonus: '₹150',
    status: 'ACTIVE',
    type: 'POSTPAID',
    commissionType: 'POSTPAID',
    updatedDate: '2025-03-03',
  },
  {
    id: 16,
    configId: 'COM-016',
    category: 'Postpaid Enterprise Fleet 999',
    categoryId: 2,
    circleId: 4,
    circleName: 'Karnataka Circle',
    commissionRate: '₹250 / activation',
    bonus: '₹200',
    status: 'ACTIVE',
    type: 'POSTPAID',
    commissionType: 'POSTPAID',
    updatedDate: '2025-03-07',
  },
  {
    id: 17,
    configId: 'COM-017',
    category: 'Postpaid Family Circle 499',
    categoryId: 3,
    circleId: 2,
    circleName: 'UP Circle',
    commissionRate: '₹100 / activation',
    bonus: '₹80',
    status: 'ACTIVE',
    type: 'POSTPAID',
    commissionType: 'POSTPAID',
    updatedDate: '2025-03-09',
  },
  {
    id: 18,
    configId: 'COM-018',
    category: 'Postpaid Retail Platinum 1499',
    categoryId: 1,
    circleId: 3,
    circleName: 'Tamil Nadu Circle',
    commissionRate: '₹350 / activation',
    bonus: '₹300',
    status: 'ACTIVE',
    type: 'POSTPAID',
    commissionType: 'POSTPAID',
    updatedDate: '2025-03-12',
  },
  {
    id: 19,
    configId: 'COM-019',
    category: 'Postpaid Government Quota 399',
    categoryId: 2,
    circleId: 5,
    circleName: 'Kolkata Circle',
    commissionRate: '₹90 / activation',
    bonus: '₹50',
    status: 'ACTIVE',
    type: 'POSTPAID',
    commissionType: 'POSTPAID',
    updatedDate: '2025-03-14',
  },

  // ── 4. LANDLINE & BHARAT FIBER COMMISSIONS (Multiple Diverse Rules) ──
  {
    id: 4,
    configId: 'COM-004',
    category: 'Landline Bharat Fiber 100M',
    categoryId: 3,
    circleId: 2,
    circleName: 'UP Circle',
    commissionRate: '₹250 / installation',
    bonus: '₹150',
    status: 'ACTIVE',
    type: 'LANDLINE',
    commissionType: 'LANDLINE',
    updatedDate: '2025-03-05',
  },
  {
    id: 20,
    configId: 'COM-020',
    category: 'Landline Bharat Fiber Superfast 300M',
    categoryId: 1,
    circleId: 1,
    circleName: 'Delhi Circle',
    commissionRate: '₹350 / installation',
    bonus: '₹200',
    status: 'ACTIVE',
    type: 'LANDLINE',
    commissionType: 'LANDLINE',
    updatedDate: '2025-03-08',
  },
  {
    id: 21,
    configId: 'COM-021',
    category: 'Landline Bharat Fiber Ultra Gigabit 1G',
    categoryId: 1,
    circleId: 4,
    circleName: 'Karnataka Circle',
    commissionRate: '₹500 / installation',
    bonus: '₹300',
    status: 'ACTIVE',
    type: 'LANDLINE',
    commissionType: 'LANDLINE',
    updatedDate: '2025-03-10',
  },
  {
    id: 22,
    configId: 'COM-022',
    category: 'Landline Copper Voice Basic',
    categoryId: 2,
    circleId: 6,
    circleName: 'Maharashtra Circle',
    commissionRate: '₹150 / installation',
    bonus: '₹100',
    status: 'ACTIVE',
    type: 'LANDLINE',
    commissionType: 'LANDLINE',
    updatedDate: '2025-03-11',
  },
  {
    id: 23,
    configId: 'COM-023',
    category: 'Landline Bharat Fiber Rural Broadband',
    categoryId: 3,
    circleId: 3,
    circleName: 'Tamil Nadu Circle',
    commissionRate: '₹200 / installation',
    bonus: '₹120',
    status: 'ACTIVE',
    type: 'LANDLINE',
    commissionType: 'LANDLINE',
    updatedDate: '2025-03-13',
  },
  {
    id: 24,
    configId: 'COM-024',
    category: 'Landline Enterprise Leased Line Fiber',
    categoryId: 1,
    circleId: 5,
    circleName: 'Kolkata Circle',
    commissionRate: '₹750 / installation',
    bonus: '₹500',
    status: 'ACTIVE',
    type: 'LANDLINE',
    commissionType: 'LANDLINE',
    updatedDate: '2025-03-15',
  },
];

export const INITIAL_TRANSACTIONS: FranchiseTxn[] = [
  {
    id: 'FTX-9001',
    transactionId: 'FTX-9001',
    franchiseMsisdn: '9811012345',
    amount: 50000,
    status: 'PENDING',
    requestDate: '2025-03-12',
    requestedBy: 'Metro Cellular Care',
  },
  {
    id: 'FTX-9002',
    transactionId: 'FTX-9002',
    franchiseMsisdn: '9845012345',
    amount: 25000,
    status: 'APPROVED',
    requestDate: '2025-03-11',
    requestedBy: 'Apex Telecom Agency',
  },
  {
    id: 'FTX-9003',
    transactionId: 'FTX-9003',
    franchiseMsisdn: '9822012345',
    amount: 15000,
    status: 'REJECTED',
    requestDate: '2025-03-09',
    requestedBy: 'Sunrise Mobile World',
  },
  {
    id: 'FTX-9004',
    transactionId: 'FTX-9004',
    franchiseMsisdn: '9866012345',
    amount: 100000,
    status: 'PENDING',
    requestDate: '2025-03-14',
    requestedBy: 'Deccan Digital Hub',
  },
  {
    id: 'FTX-9005',
    transactionId: 'FTX-9005',
    franchiseMsisdn: '9877012345',
    amount: 75000,
    status: 'APPROVED',
    requestDate: '2025-03-13',
    requestedBy: 'Western Connect Communications',
  },
  {
    id: 'FTX-9006',
    transactionId: 'FTX-9006',
    franchiseMsisdn: '9812012345',
    amount: 40000,
    status: 'PENDING',
    requestDate: '2025-03-15',
    requestedBy: 'Ganges Valley Franchise',
  },
  {
    id: 'FTX-9007',
    transactionId: 'FTX-9007',
    franchiseMsisdn: '9888012345',
    amount: 30000,
    status: 'APPROVED',
    requestDate: '2025-03-10',
    requestedBy: 'Pune Rapid Solutions',
  },
  {
    id: 'FTX-9008',
    transactionId: 'FTX-9008',
    franchiseMsisdn: '9833012345',
    amount: 20000,
    status: 'APPROVED',
    requestDate: '2025-03-08',
    requestedBy: 'Kolkata Smart Links',
  },
];

export const INITIAL_PLANS: TariffPlan[] = [
  {
    sno: 101,
    operator: 'BSNL',
    denomination: 199,
    talkvalue: 100,
    country: 'IN',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    planType: 'Prepaid Voice & Data',
    description: '1.5GB/day + Unlimited Calling + 100 SMS/day',
    tabName: 'Prepaid',
    circleId: 1,
    validity: 28,
    fromDate: '2024-01-01',
    toDate: '2026-12-31',
  },
  {
    sno: 102,
    operator: 'BSNL',
    denomination: 399,
    talkvalue: 200,
    country: 'IN',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    planType: 'Prepaid 70 Days Power',
    description: '2GB/day + Unlimited National Roaming + BSNL Tunes',
    tabName: 'Prepaid',
    circleId: 4,
    validity: 70,
    fromDate: '2024-01-01',
    toDate: '2026-12-31',
  },
  {
    sno: 103,
    operator: 'BSNL',
    denomination: 599,
    talkvalue: 500,
    country: 'IN',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    planType: 'Postpaid Corporate 599',
    description: 'Unlimited 4G/5G Data with Free Roaming & 100 SMS',
    tabName: 'Postpaid',
    circleId: 1,
    validity: 30,
    fromDate: '2024-01-01',
    toDate: '2026-12-31',
  },
  {
    sno: 104,
    operator: 'BSNL',
    denomination: 299,
    talkvalue: 250,
    country: 'IN',
    startDate: '2024-02-01',
    endDate: '2026-12-31',
    planType: 'Prepaid Hero Unlimited',
    description: '3GB/day Weekend Data Rollover + BSNL Cinema Pass',
    tabName: 'Prepaid',
    circleId: 6,
    validity: 28,
    fromDate: '2024-02-01',
    toDate: '2026-12-31',
  },
  {
    sno: 105,
    operator: 'BSNL',
    denomination: 666,
    talkvalue: 600,
    country: 'IN',
    startDate: '2024-01-15',
    endDate: '2026-12-31',
    planType: 'Prepaid Long Validity',
    description: '2GB/day for 84 Days + Free Caller Tune Service',
    tabName: 'Prepaid',
    circleId: 2,
    validity: 84,
    fromDate: '2024-01-15',
    toDate: '2026-12-31',
  },
  {
    sno: 106,
    operator: 'BSNL',
    denomination: 2999,
    talkvalue: 2500,
    country: 'IN',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    planType: 'Prepaid 365 Days Elite',
    description: 'Annual 3GB/day True 5G Pack + OTT Bundle',
    tabName: 'Prepaid',
    circleId: 1,
    validity: 365,
    fromDate: '2024-01-01',
    toDate: '2026-12-31',
  },
  {
    sno: 107,
    operator: 'BSNL',
    denomination: 799,
    talkvalue: 700,
    country: 'IN',
    startDate: '2024-03-01',
    endDate: '2026-12-31',
    planType: 'Postpaid Executive 799',
    description: '150GB Data Rollover + 2 Family Add-on SIMs Free',
    tabName: 'Postpaid',
    circleId: 4,
    validity: 30,
    fromDate: '2024-03-01',
    toDate: '2026-12-31',
  },
  {
    sno: 108,
    operator: 'BSNL',
    denomination: 1499,
    talkvalue: 1400,
    country: 'IN',
    startDate: '2024-03-10',
    endDate: '2026-12-31',
    planType: 'Postpaid Platinum 1499',
    description: '300GB High-Speed Data + Unlimited International Calling (US/UK/Canada)',
    tabName: 'Postpaid',
    circleId: 3,
    validity: 30,
    fromDate: '2024-03-10',
    toDate: '2026-12-31',
  },
  {
    sno: 109,
    operator: 'BSNL',
    denomination: 499,
    talkvalue: 0,
    country: 'IN',
    startDate: '2024-02-15',
    endDate: '2026-12-31',
    planType: 'Bharat Fiber Basic Plus',
    description: '60 Mbps Unlimited FTTH Broadband with Free Landline Voice',
    tabName: 'Landline',
    circleId: 5,
    validity: 30,
    fromDate: '2024-02-15',
    toDate: '2026-12-31',
  },
  {
    sno: 110,
    operator: 'BSNL',
    denomination: 999,
    talkvalue: 0,
    country: 'IN',
    startDate: '2024-02-20',
    endDate: '2026-12-31',
    planType: 'Bharat Fiber Ultra Gigabit',
    description: '200 Mbps Premium Broadband with Hotstar + SonyLIV + Zee5 OTT',
    tabName: 'Landline',
    circleId: 6,
    validity: 30,
    fromDate: '2024-02-20',
    toDate: '2026-12-31',
  },
  {
    sno: 111,
    operator: 'BSNL',
    denomination: 149,
    talkvalue: 100,
    country: 'IN',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    planType: 'Prepaid Student Starter',
    description: '1GB/day + 100 SMS/day + Free Education Portal access',
    tabName: 'Prepaid',
    circleId: 2,
    validity: 24,
    fromDate: '2024-01-01',
    toDate: '2026-12-31',
  },
];

export const INITIAL_NUMBER_SERIES: NumberSeriesRecord[] = [
  { id: 'NS-001', series: '94400', circleId: 1, circleName: 'Delhi Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 7850 },
  { id: 'NS-002', series: '94401', circleId: 4, circleName: 'Karnataka Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 9200 },
  { id: 'NS-003', series: '94402', circleId: 2, circleName: 'UP Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 6400 },
  { id: 'NS-004', series: '94403', circleId: 6, circleName: 'Maharashtra Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 8150 },
  { id: 'NS-005', series: '94404', circleId: 3, circleName: 'Tamil Nadu Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 8900 },
  { id: 'NS-006', series: '94405', circleId: 5, circleName: 'Kolkata Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 5600 },
  { id: 'NS-007', series: '94406', circleId: 1, circleName: 'Delhi Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 4300 },
  { id: 'NS-008', series: '94407', circleId: 4, circleName: 'Karnataka Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 9750 },
];

export const INITIAL_MNP_LIST: MnpRecord[] = [
  { id: 'MNP-101', msisdn: '9845012345', donorOperator: 'Airtel', recipientOperator: 'BSNL', portingDate: '2025-01-15', status: 'COMPLETED' },
  { id: 'MNP-102', msisdn: '9811012345', donorOperator: 'Jio', recipientOperator: 'BSNL', portingDate: '2025-02-20', status: 'IN_PROGRESS' },
  { id: 'MNP-103', msisdn: '9822012345', donorOperator: 'Vi', recipientOperator: 'BSNL', portingDate: '2025-03-01', status: 'COMPLETED' },
  { id: 'MNP-104', msisdn: '9833012345', donorOperator: 'Airtel', recipientOperator: 'BSNL', portingDate: '2025-03-05', status: 'PENDING_VERIFICATION' },
  { id: 'MNP-105', msisdn: '9866012345', donorOperator: 'Jio', recipientOperator: 'BSNL', portingDate: '2025-03-08', status: 'COMPLETED' },
  { id: 'MNP-106', msisdn: '9877012345', donorOperator: 'Vi', recipientOperator: 'BSNL', portingDate: '2025-03-10', status: 'IN_PROGRESS' },
  { id: 'MNP-107', msisdn: '9888012345', donorOperator: 'Airtel', recipientOperator: 'BSNL', portingDate: '2025-03-12', status: 'REJECTED' },
  { id: 'MNP-108', msisdn: '9899012345', donorOperator: 'Jio', recipientOperator: 'BSNL', portingDate: '2025-03-14', status: 'IN_PROGRESS' },
];

// ─────────────────────────────────────────────────────────────
// CENTRALIZED STATE SINGLETON (Survives Hot Reloads)
// ─────────────────────────────────────────────────────────────

interface GlobalSCMDataStore {
  users: SCMUser[];
  dealers: DealerRecord[];
  commissions: CommissionConfig[];
  transactions: FranchiseTxn[];
  plans: TariffPlan[];
  numberSeries: NumberSeriesRecord[];
  mnpList: MnpRecord[];
}

declare global {
  // eslint-disable-next-line no-var
  var __SCM_CENTRAL_STORE__: GlobalSCMDataStore | undefined;
}

function getOrInitStore(): GlobalSCMDataStore {
  if (!globalThis.__SCM_CENTRAL_STORE__) {
    globalThis.__SCM_CENTRAL_STORE__ = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      dealers: JSON.parse(JSON.stringify(INITIAL_DEALERS)),
      commissions: JSON.parse(JSON.stringify(INITIAL_COMMISSIONS)),
      transactions: JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS)),
      plans: JSON.parse(JSON.stringify(INITIAL_PLANS)),
      numberSeries: JSON.parse(JSON.stringify(INITIAL_NUMBER_SERIES)),
      mnpList: JSON.parse(JSON.stringify(INITIAL_MNP_LIST)),
    };
  }
  return globalThis.__SCM_CENTRAL_STORE__;
}

export const centralStore = {
  // Getters
  getUsers: () => getOrInitStore().users,
  getDealers: () => getOrInitStore().dealers,
  getCommissions: (filterType?: 'FRC' | 'OTF' | 'POSTPAID' | 'LANDLINE') => {
    const store = getOrInitStore();
    const seen = new Set<string>();
    store.commissions = store.commissions.filter((c) => {
      const key = String(c.configId || c.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const list = store.commissions;
    if (!filterType) return list;
    return list.filter((c) => c.type === filterType);
  },
  getTransactions: () => getOrInitStore().transactions,
  getPlans: (tab?: string) => {
    const list = getOrInitStore().plans;
    if (!tab) return list;
    return list.filter((p) => p.tabName.toLowerCase() === tab.toLowerCase());
  },
  getNumberSeries: () => getOrInitStore().numberSeries,
  getMnpList: () => getOrInitStore().mnpList,

  // Mutations
  addUser: (user: SCMUser) => {
    const store = getOrInitStore();
    store.users = [user, ...store.users];
    return user;
  },
  updateUser: (username: string, patch: Partial<SCMUser>) => {
    const store = getOrInitStore();
    store.users = store.users.map((u) => (u.username === username ? { ...u, ...patch } : u));
  },
  updateUserStatus: (username: string, status: number) => {
    const store = getOrInitStore();
    store.users = store.users.map((u) => (u.username === username ? { ...u, status } : u));
  },

  addDealer: (dealer: DealerRecord) => {
    const store = getOrInitStore();
    store.dealers = [dealer, ...store.dealers];
    return dealer;
  },
  updateDealer: (msisdn: string, patch: Partial<DealerRecord>) => {
    const store = getOrInitStore();
    store.dealers = store.dealers.map((d) => (d.msisdn === msisdn ? { ...d, ...patch } : d));
  },
  deleteDealer: (msisdn: string) => {
    const store = getOrInitStore();
    store.dealers = store.dealers.filter((d) => d.msisdn !== msisdn);
  },

  addCommission: (rule: CommissionConfig) => {
    const store = getOrInitStore();
    const exists = store.commissions.some(
      (c) => (c.configId && c.configId === rule.configId) || (c.id && c.id === rule.id)
    );
    if (!exists) {
      store.commissions = [rule, ...store.commissions];
    }
    return rule;
  },
  updateCommission: (id: number | string, patch: Partial<CommissionConfig>) => {
    const store = getOrInitStore();
    store.commissions = store.commissions.map((c) =>
      c.id === Number(id) || c.configId === String(id) ? { ...c, ...patch } : c
    );
  },
  deleteCommission: (id: number | string) => {
    const store = getOrInitStore();
    store.commissions = store.commissions.filter(
      (c) => c.id !== Number(id) && c.configId !== String(id)
    );
  },

  approveTransaction: (id: string) => {
    const store = getOrInitStore();
    store.transactions = store.transactions.map((t) =>
      t.id === id || t.transactionId === id ? { ...t, status: 'APPROVED' } : t
    );
  },
  rejectTransaction: (id: string) => {
    const store = getOrInitStore();
    store.transactions = store.transactions.map((t) =>
      t.id === id || t.transactionId === id ? { ...t, status: 'REJECTED' } : t
    );
  },

  addPlan: (plan: TariffPlan) => {
    const store = getOrInitStore();
    store.plans = [plan, ...store.plans];
    return plan;
  },
  updatePlan: (sno: number, patch: Partial<TariffPlan>) => {
    const store = getOrInitStore();
    store.plans = store.plans.map((p) => (p.sno === sno ? { ...p, ...patch } : p));
  },
  deletePlan: (sno: number) => {
    const store = getOrInitStore();
    store.plans = store.plans.filter((p) => p.sno !== sno);
  },

  addNumberSeries: (series: NumberSeriesRecord) => {
    const store = getOrInitStore();
    store.numberSeries = [series, ...store.numberSeries];
    return series;
  },
  updateNumberSeries: (series: string, patch: Partial<NumberSeriesRecord>) => {
    const store = getOrInitStore();
    store.numberSeries = store.numberSeries.map((s) => (s.series === series ? { ...s, ...patch } : s));
  },
  deleteNumberSeries: (series: string) => {
    const store = getOrInitStore();
    store.numberSeries = store.numberSeries.filter((s) => s.series !== series);
  },

  addMnp: (record: MnpRecord) => {
    const store = getOrInitStore();
    store.mnpList = [record, ...store.mnpList];
    return record;
  },
  updateMnp: (msisdn: string, patch: Partial<MnpRecord>) => {
    const store = getOrInitStore();
    store.mnpList = store.mnpList.map((m) => (m.msisdn === msisdn ? { ...m, ...patch } : m));
  },
  deleteMnp: (msisdn: string) => {
    const store = getOrInitStore();
    store.mnpList = store.mnpList.filter((m) => m.msisdn !== msisdn);
  },

  // Reset helper for testing
  reset: () => {
    globalThis.__SCM_CENTRAL_STORE__ = {
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      dealers: JSON.parse(JSON.stringify(INITIAL_DEALERS)),
      commissions: JSON.parse(JSON.stringify(INITIAL_COMMISSIONS)),
      transactions: JSON.parse(JSON.stringify(INITIAL_TRANSACTIONS)),
      plans: JSON.parse(JSON.stringify(INITIAL_PLANS)),
      numberSeries: JSON.parse(JSON.stringify(INITIAL_NUMBER_SERIES)),
      mnpList: JSON.parse(JSON.stringify(INITIAL_MNP_LIST)),
    };
  },
};
