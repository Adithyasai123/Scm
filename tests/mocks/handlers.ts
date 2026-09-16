import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3001';

// Seed mock data
export const mockZones = [
  { id: 1, name: 'North Zone' },
  { id: 2, name: 'South Zone' },
  { id: 3, name: 'East Zone' },
  { id: 4, name: 'West Zone' },
];

export const mockCircles = [
  { id: 1, name: 'Delhi Circle', zoneId: 1 },
  { id: 2, name: 'UP Circle', zoneId: 1 },
  { id: 3, name: 'Tamil Nadu Circle', zoneId: 2 },
  { id: 4, name: 'Karnataka Circle', zoneId: 2 },
  { id: 5, name: 'Kolkata Circle', zoneId: 3 },
  { id: 6, name: 'Maharashtra Circle', zoneId: 4 },
];

export const mockSSAs = [
  { id: 1, name: 'Delhi SSA', circleId: 1 },
  { id: 2, name: 'Noida SSA', circleId: 1 },
  { id: 3, name: 'Lucknow SSA', circleId: 2 },
  { id: 4, name: 'Chennai SSA', circleId: 3 },
  { id: 5, name: 'Bengaluru SSA', circleId: 4 },
];

export let mockUsers = [
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
];

export let mockDealers = [
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
  },
  {
    msisdn: '9833012345',
    name: 'Kolkata Smart Links',
    dealerType: 'Retailer',
    category: 'Category C',
    circleId: 5,
    ssaId: 1,
    status: 'ACTIVE',
    panId: 'DEFGH4567J',
    aadharId: '456789012345',
    franchiseMsisdn: '9811012345',
    subFranchiseMsisdn: '9822012345',
  },
];

export let mockPlans = [
  {
    sno: 101,
    operator: 'BSNL',
    denomination: 199,
    talkvalue: 100,
    country: 'IN',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    planType: 'Prepaid Voice & Data',
    description: '1.5GB/day + Unlimited Calling',
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
    planType: 'Prepaid 70 Days',
    description: '2GB/day + 100 SMS/day',
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
    planType: 'Postpaid Corporate',
    description: 'Unlimited 4G/5G Data with Free Roaming',
    tabName: 'Postpaid',
    circleId: 1,
    validity: 30,
    fromDate: '2024-01-01',
    toDate: '2026-12-31',
  },
];

export let mockCommissions = [
  { id: 1, configId: 'COM-001', category: 'Prepaid FRC', categoryId: 1, circleId: 1, circleName: 'Delhi Circle', commissionRate: '4.5%', bonus: '₹50', status: 'ACTIVE', type: 'FRC', commissionType: 'FRC', updatedDate: '2025-01-10' },
  { id: 2, configId: 'COM-002', category: 'Prepaid OTF', categoryId: 2, circleId: 4, circleName: 'Karnataka Circle', commissionRate: '3.0%', bonus: '₹20', status: 'ACTIVE', type: 'OTF', commissionType: 'OTF', updatedDate: '2025-02-14' },
  { id: 3, configId: 'COM-003', category: 'Postpaid Corporate 599', categoryId: 1, circleId: 1, circleName: 'Delhi Circle', commissionRate: '₹120 / activation', bonus: '₹100', status: 'ACTIVE', type: 'POSTPAID', commissionType: 'POSTPAID', updatedDate: '2025-03-01' },
  { id: 4, configId: 'COM-004', category: 'Landline Bharat Fiber', categoryId: 3, circleId: 2, circleName: 'UP Circle', commissionRate: '₹250 / installation', bonus: '₹150', status: 'ACTIVE', type: 'LANDLINE', commissionType: 'LANDLINE', updatedDate: '2025-03-05' },
];

export let mockFranchiseTransactions = [
  { id: 'FTX-9001', transactionId: 'FTX-9001', franchiseMsisdn: '9811012345', amount: 50000, status: 'PENDING', requestDate: '2025-03-12', requestedBy: 'Metro Cellular Care' },
  { id: 'FTX-9002', transactionId: 'FTX-9002', franchiseMsisdn: '9845099999', amount: 25000, status: 'APPROVED', requestDate: '2025-03-11', requestedBy: 'Apex Telecom Agency' },
  { id: 'FTX-9003', transactionId: 'FTX-9003', franchiseMsisdn: '9822012345', amount: 15000, status: 'REJECTED', requestDate: '2025-03-09', requestedBy: 'Sunrise Mobile World' },
];

export let mockMnpList = [
  { id: 'MNP-101', msisdn: '9845012345', donorOperator: 'Airtel', recipientOperator: 'BSNL', portingDate: '2025-01-15', status: 'COMPLETED' },
  { id: 'MNP-102', msisdn: '9811012345', donorOperator: 'Jio', recipientOperator: 'BSNL', portingDate: '2025-02-20', status: 'IN_PROGRESS' },
];

export let mockNumberSeries = [
  { id: 'NS-001', series: '94400', circleId: 1, circleName: 'Delhi Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 7850 },
  { id: 'NS-002', series: '94401', circleId: 4, circleName: 'Karnataka Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 9200 },
  { id: 'NS-003', series: '94402', circleId: 2, circleName: 'UP Circle', operatorId: 'BSNL', totalNumbers: 10000, activeCount: 6400 },
];

function wrap<T>(data: T, message = 'Success') {
  return HttpResponse.json({ status: 'SUCCESS', message, data });
}

function createRoute(
  method: 'get' | 'post' | 'put' | 'delete',
  paths: string[],
  handler: any
) {
  return paths.flatMap(p => [
    (http as any)[method](BASE + p, handler),
    (http as any)[method]('http://localhost:3000' + p, handler),
    (http as any)[method]('https://ui.example.com' + p, handler),
    (http as any)[method](p, handler),
  ]);
}

export const handlers = [
  // Masterdata & DB APIs
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/zones', '/masterdata-db-api/zones'], () => wrap(mockZones)),
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/circles', '/masterdata-db-api/circles'], () => wrap(mockCircles)),
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/zonebasedcircles', '/masterdata-db-api/zonebasedcircles'], ({ request }: any) => {
    const url = new URL(request.url);
    const zoneId = Number(url.searchParams.get('zoneId'));
    return wrap(zoneId ? mockCircles.filter(c => c.zoneId === zoneId) : mockCircles);
  }),
  ...createRoute('get', ['/scm-user-api/scm-user-api/getCirclesInfo', '/scm-user-api/getCirclesInfo'], () => wrap(mockCircles)),
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/ssas', '/masterdata-db-api/ssas'], ({ request }: any) => {
    const url = new URL(request.url);
    const circleId = Number(url.searchParams.get('circleId'));
    return wrap(circleId ? mockSSAs.filter(s => s.circleId === circleId) : mockSSAs);
  }),
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/dealerType', '/masterdata-db-api/dealerType'], () => wrap([
    { id: 'Retailer', name: 'Retailer' },
    { id: 'Franchise', name: 'Franchise' },
    { id: 'SubFranchise', name: 'Sub Franchise' },
    { id: 'FOS', name: 'Feet On Street (FOS)' },
  ])),
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/getCategory', '/masterdata-db-api/getCategory'], () => wrap([
    { id: 1, name: 'Category A' },
    { id: 2, name: 'Category B' },
    { id: 3, name: 'Category C' },
  ])),
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/getCategoryByDealer/:dealerType', '/masterdata-db-api/getCategoryByDealer/:dealerType'], () => wrap([
    { id: 1, name: 'Category A' },
    { id: 2, name: 'Category B' },
  ])),

  // OTP Verification System
  ...createRoute('post', ['/scm-db-api/masterdata-db-api/sendOtp', '/masterdata-db-api/sendOtp'], async () => {
    return wrap({ message: 'OTP sent successfully' });
  }),
  ...createRoute('post', ['/scm-db-api/masterdata-db-api/validateOtp', '/masterdata-db-api/validateOtp'], ({ request }: any) => {
    const url = new URL(request.url);
    const otp = url.searchParams.get('otp');
    if (otp === '9999') {
      return HttpResponse.json({ status: 'ERROR', message: 'Invalid OTP entered', data: null }, { status: 400 });
    }
    return wrap({ valid: true, message: 'OTP verified successfully' });
  }),

  // Users Management APIs
  ...createRoute('get', ['/scm-user-api/scm-user-api/users', '/scm-user-api/users'], () => wrap(mockUsers)),
  ...createRoute('get', ['/scm-user-api/scm-user-api/fetchusername', '/scm-user-api/fetchusername'], () => wrap(mockUsers.map(u => u.username))),
  ...createRoute('get', ['/scm-user-api/scm-user-api/getUser/:username', '/scm-user-api/getUser/:username'], ({ params }: any) => {
    const user = mockUsers.find(u => u.username === params.username) || mockUsers[0];
    return wrap(user);
  }),
  ...createRoute('get', ['/scm-user-api/scm-user-api/getUserwithHrmsIdandUsername', '/scm-user-api/getUserwithHrmsIdandUsername'], ({ request }: any) => {
    const url = new URL(request.url);
    const hrmsId = url.searchParams.get('hrmsId');
    const username = url.searchParams.get('username');
    const user = mockUsers.find(u => (hrmsId && u.hrmsId === hrmsId) || (username && u.username === username)) || mockUsers[0];
    return wrap(user);
  }),
  ...createRoute('post', ['/scm-user-api/scm-user-api/usercreation', '/scm-user-api/usercreation'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newUser = {
      userId: `USR-${100 + mockUsers.length}`,
      hrmsId: body.hrmsId || `HRMS${100 + mockUsers.length}`,
      username: body.username || `user_${Date.now()}`,
      mobileNumber: body.mobileNumber || body.mobile || '9999999999',
      firstName: body.firstName || 'New',
      lastName: body.lastName || 'User',
      address: body.address || 'Address',
      status: body.status !== undefined ? Number(body.status) : 1,
      roleId: Number(body.roleId) || 2,
      roleName: body.roleName || 'Operator',
      ssaId: Number(body.ssaId) || 1,
      circleId: Number(body.circleId) || 1,
      zoneId: Number(body.zoneId) || 1,
      dob: body.dob || '1995-01-01',
      loginStatus: '0',
      permissions: body.permissions || mockUsers[0].permissions,
    };
    mockUsers = [newUser, ...mockUsers];
    return wrap({ message: 'User created successfully', userId: newUser.userId, user: newUser });
  }),
  ...createRoute('post', ['/scm-user-api/scm-user-api/modifyUser', '/scm-user-api/modifyUser'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockUsers = mockUsers.map(u => (u.username === body.username || u.hrmsId === body.hrmsId ? { ...u, ...body } : u));
    return wrap({ message: 'User updated successfully' });
  }),
  ...createRoute('get', ['/scm-user-api/scm-user-api/getUserPermissionwithHrmsIdandUsername', '/scm-user-api/getUserPermissionwithHrmsIdandUsername'], ({ request }: any) => {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const user = mockUsers.find(u => u.username === username) || mockUsers[0];
    return wrap(user.permissions);
  }),
  ...createRoute('post', ['/scm-user-api/scm-user-api/modifyPermissions', '/scm-user-api/modifyPermissions'], async ({ request }: any) => {
    const url = new URL(request.url);
    const guiUser = url.searchParams.get('guiUser');
    const body = await request.json() as any;
    mockUsers = mockUsers.map(u => (u.username === guiUser ? { ...u, permissions: { ...u.permissions, ...body } } : u));
    return wrap({ message: 'Permissions updated successfully' });
  }),
  ...createRoute('get', ['/scm-user-api/scm-user-api/userStatusCheck', '/scm-user-api/userStatusCheck'], ({ request }: any) => {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const user = mockUsers.find(u => u.username === username);
    return wrap({ status: user?.status ?? 1 });
  }),
  ...createRoute('post', ['/scm-user-api/scm-user-api/userStatusChangewithHrmsIdandUsername', '/scm-user-api/userStatusChangewithHrmsIdandUsername'], ({ request }: any) => {
    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const status = Number(url.searchParams.get('status'));
    mockUsers = mockUsers.map(u => (u.username === username ? { ...u, status } : u));
    return wrap({ message: 'Status updated successfully', status });
  }),
  ...createRoute('post', ['/scm-user-api/scm-user-api/changePassword', '/scm-user-api/changePassword'], () => wrap({ message: 'Password changed successfully' })),
  ...createRoute('get', ['/scm-user-api/scm-user-api/scmlogout', '/scm-user-api/scmlogout'], () => wrap({ message: 'Logged out successfully' })),

  // Dealers Management APIs
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/dealerList', '/scm-dealer-api/dealerList'], () => wrap(mockDealers)),
  ...createRoute('post', ['/scm-dealer-api/scm-dealer-api/createDealer', '/scm-dealer-api/createDealer'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newDealer = {
      msisdn: body.msisdn || '9876500000',
      name: body.name || 'New Dealer',
      dealerType: body.dealerType || 'Retailer',
      category: body.category || 'Category A',
      circleId: Number(body.circleId) || 1,
      ssaId: Number(body.ssaId) || 1,
      status: 'ACTIVE',
      panId: body.panId || '',
      aadharId: body.aadharId || '',
      franchiseMsisdn: body.franchiseMsisdn || '',
      subFranchiseMsisdn: body.subFranchiseMsisdn || '',
    };
    mockDealers = [newDealer, ...mockDealers];
    return wrap({ message: 'Dealer registered successfully', dealer: newDealer });
  }),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/fetchDealer', '/scm-dealer-api/fetchDealer'], ({ request }: any) => {
    const url = new URL(request.url);
    const mobile = url.searchParams.get('mobile');
    const dealer = mockDealers.find(d => d.msisdn === mobile) || mockDealers[0];
    return wrap(dealer);
  }),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/fetchDealerData', '/scm-dealer-api/fetchDealerData'], ({ request }: any) => {
    const url = new URL(request.url);
    const msisdn = url.searchParams.get('msisdn');
    const dealer = mockDealers.find(d => d.msisdn === msisdn) || mockDealers[0];
    return wrap(dealer);
  }),
  ...createRoute('post', ['/scm-dealer-api/scm-dealer-api/updateDealer', '/scm-dealer-api/updateDealer'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockDealers = mockDealers.map(d => (d.msisdn === body.msisdn ? { ...d, ...body } : d));
    return wrap({ message: 'Dealer information updated successfully' });
  }),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/checkDealerByPan', '/scm-dealer-api/checkDealerByPan'], ({ request }: any) => {
    const url = new URL(request.url);
    const pan = url.searchParams.get('panId') || url.searchParams.get('panNumber');
    const exists = mockDealers.some(d => d.panId && d.panId.toLowerCase() === (pan || '').toLowerCase());
    return wrap({ exists });
  }),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/checkDealerByAadhar', '/scm-dealer-api/checkDealerByAadhar'], ({ request }: any) => {
    const url = new URL(request.url);
    const aadhar = url.searchParams.get('aadharId') || url.searchParams.get('aadharNumber');
    const exists = mockDealers.some(d => d.aadharId && d.aadharId === aadhar);
    return wrap({ exists });
  }),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/dealer/:msisdn', '/scm-dealer-api/dealer/:msisdn'], ({ params }: any) => {
    const dealer = mockDealers.find(d => d.msisdn === params.msisdn) || mockDealers[0];
    return wrap(dealer);
  }),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/dealerStatusCheck', '/scm-dealer-api/dealerStatusCheck'], () => wrap({ status: 'ACTIVE' })),
  ...createRoute('post', ['/scm-dealer-api/scm-dealer-api/dealerStatusChange', '/scm-dealer-api/dealerStatusChange'], ({ request }: any) => {
    const url = new URL(request.url);
    const msisdn = url.searchParams.get('msisdn');
    const status = url.searchParams.get('status') || 'ACTIVE';
    mockDealers = mockDealers.map(d => (d.msisdn === msisdn ? { ...d, status } : d));
    return wrap({ message: 'Dealer status updated', status });
  }),
  ...createRoute('post', ['/scm-dealer-api/scm-dealer-api/purgeDealer', '/scm-dealer-api/purgeDealer'], ({ request }: any) => {
    const url = new URL(request.url);
    const msisdn = url.searchParams.get('msisdn');
    mockDealers = mockDealers.filter(d => d.msisdn !== msisdn);
    return wrap({ message: 'Dealer purged' });
  }),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/dealerWithMobile', '/scm-dealer-api/dealerWithMobile'], ({ request }: any) => {
    const url = new URL(request.url);
    const msisdn = url.searchParams.get('msisdn');
    const dealer = mockDealers.find(d => d.msisdn === msisdn) || mockDealers[0];
    return wrap(dealer);
  }),
  ...createRoute('post', ['/scm-dealer-api/scm-dealer-api/changeDealerHierarchy', '/scm-dealer-api/changeDealerHierarchy'], ({ request }: any) => {
    const url = new URL(request.url);
    const srcMsisdn = url.searchParams.get('srcMsisdn');
    const parentMsisdn = url.searchParams.get('parentMsisdn');
    mockDealers = mockDealers.map(d => {
      if (d.msisdn === srcMsisdn) {
        return { ...d, franchiseMsisdn: parentMsisdn || '' };
      }
      return d;
    });
    return wrap({ message: 'Hierarchy updated successfully' });
  }),
  ...createRoute('put', ['/scm-dealer-api/scm-dealer-api/resetMpin', '/scm-dealer-api/resetMpin'], () => wrap({ message: 'MPIN reset successfully' })),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/franchise', '/scm-dealer-api/franchise'], () => wrap({ msisdn: '9811012345', name: 'Metro Cellular Care' })),
  ...createRoute('get', ['/scm-dealer-api/scm-dealer-api/subFranchise', '/scm-dealer-api/subFranchise'], () => wrap({ msisdn: '9822012345', name: 'Sunrise Mobile World' })),

  // Commission Management APIs
  ...createRoute('post', ['/scm-plans-api/scm-product-api/saveCommissionConfig', '/scm-product-api/saveCommissionConfig'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newConfig = {
      id: mockCommissions.length + 1,
      configId: `COM-00${mockCommissions.length + 1}`,
      category: body.type ? `Prepaid ${body.type}` : 'Standard Commission',
      categoryId: body.categoryId || 1,
      circleId: body.circleId || 1,
      circleName: 'Delhi Circle',
      commissionRate: body.commissionRate || '4.0%',
      bonus: body.bonus || '₹0',
      status: 'ACTIVE',
      type: body.type || 'FRC',
      commissionType: body.commissionType || body.type || 'FRC',
      updatedDate: new Date().toISOString().split('T')[0],
    };
    mockCommissions = [newConfig, ...mockCommissions];
    return wrap({ message: 'Commission rule saved successfully', config: newConfig });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/savemultipleCommissionConfig', '/scm-product-api/savemultipleCommissionConfig'], async () => {
    return wrap({ message: 'Multiple commission rules saved successfully' });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/postpaidCommissionConfig', '/scm-product-api/postpaidCommissionConfig'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newConfig = {
      id: mockCommissions.length + 1,
      configId: `COM-00${mockCommissions.length + 1}`,
      category: 'Postpaid Plan',
      categoryId: body.categoryId || 1,
      circleId: body.circleId || 1,
      circleName: 'Delhi Circle',
      commissionRate: body.commissionRate || '₹100 / activation',
      bonus: body.bonus || '₹50',
      status: 'ACTIVE',
      type: 'POSTPAID',
      commissionType: 'POSTPAID',
      updatedDate: new Date().toISOString().split('T')[0],
    };
    mockCommissions = [newConfig, ...mockCommissions];
    return wrap({ message: 'Postpaid commission saved', config: newConfig });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/landlineCommissionConfig', '/scm-product-api/landlineCommissionConfig'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newConfig = {
      id: mockCommissions.length + 1,
      configId: `COM-00${mockCommissions.length + 1}`,
      category: 'Landline Broadband',
      categoryId: body.categoryId || 1,
      circleId: body.circleId || 1,
      circleName: 'UP Circle',
      commissionRate: body.commissionRate || '₹200 / installation',
      bonus: body.bonus || '₹100',
      status: 'ACTIVE',
      type: 'LANDLINE',
      commissionType: 'LANDLINE',
      updatedDate: new Date().toISOString().split('T')[0],
    };
    mockCommissions = [newConfig, ...mockCommissions];
    return wrap({ message: 'Landline commission saved', config: newConfig });
  }),
  ...createRoute('get', ['/scm-plans-api/scm-product-api/fetchCommission', '/scm-product-api/fetchCommission'], () => wrap(mockCommissions.filter(c => c.type === 'FRC' || !c.type))),
  ...createRoute('get', ['/scm-plans-api/scm-product-api/fetchPrepaidOTFCommission', '/scm-product-api/fetchPrepaidOTFCommission'], () => wrap(mockCommissions.filter(c => c.type === 'OTF'))),
  ...createRoute('get', ['/scm-plans-api/scm-product-api/fetchPostpaidCommission', '/scm-product-api/fetchPostpaidCommission'], () => wrap(mockCommissions.filter(c => c.type === 'POSTPAID'))),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/fetchLandlineCommission', '/scm-product-api/fetchLandlineCommission'], () => wrap(mockCommissions.filter(c => c.type === 'LANDLINE'))),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/updateCommissionConfig', '/scm-product-api/updateCommissionConfig'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockCommissions = mockCommissions.map(c => (c.id === body.id || c.configId === body.configId ? { ...c, ...body } : c));
    return wrap({ message: 'Commission rule updated' });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/updatePostpaidCommission', '/scm-product-api/updatePostpaidCommission'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockCommissions = mockCommissions.map(c => (c.id === body.id ? { ...c, ...body } : c));
    return wrap({ message: 'Postpaid commission updated' });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/updateLandlineCommission', '/scm-product-api/updateLandlineCommission'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockCommissions = mockCommissions.map(c => (c.id === body.id ? { ...c, ...body } : c));
    return wrap({ message: 'Landline commission updated' });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/deleteCommissionConfig', '/scm-product-api/deleteCommissionConfig'], ({ request }: any) => {
    const url = new URL(request.url);
    const commissionId = url.searchParams.get('commissionId');
    mockCommissions = mockCommissions.filter(c => String(c.id) !== commissionId && c.configId !== commissionId);
    return wrap({ message: 'Commission rule deleted' });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/deletePostpaidCommission', '/scm-product-api/deletePostpaidCommission'], ({ request }: any) => {
    const url = new URL(request.url);
    const commissionId = url.searchParams.get('commissionId');
    mockCommissions = mockCommissions.filter(c => String(c.id) !== commissionId && c.configId !== commissionId);
    return wrap({ message: 'Postpaid commission deleted' });
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/deleteLandlineCommission', '/scm-product-api/deleteLandlineCommission'], ({ request }: any) => {
    const url = new URL(request.url);
    const commissionId = url.searchParams.get('commissionId');
    mockCommissions = mockCommissions.filter(c => String(c.id) !== commissionId && c.configId !== commissionId);
    return wrap({ message: 'Landline commission deleted' });
  }),

  // Plans Management APIs
  ...createRoute('get', ['/scm-plans-api/scm-product-api/getplans', '/scm-product-api/getplans'], () => wrap(mockPlans)),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/addplan', '/scm-product-api/addplan'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newPlan = {
      sno: 100 + mockPlans.length + 1,
      operator: body.operator || 'BSNL',
      denomination: Number(body.denomination) || 299,
      talkvalue: Number(body.talkvalue) || 150,
      country: 'IN',
      startDate: body.startDate || '2025-01-01',
      endDate: body.endDate || '2026-12-31',
      planType: body.planType || 'Prepaid 4G',
      description: body.description || 'Data and Voice Bundle',
      tabName: body.tabName || 'Prepaid',
      circleId: Number(body.circleId) || 1,
      validity: Number(body.validity) || 30,
      fromDate: body.startDate || '2025-01-01',
      toDate: body.endDate || '2026-12-31',
    };
    mockPlans = [newPlan, ...mockPlans];
    return wrap({ message: 'Plan added successfully', plan: newPlan });
  }),
  ...createRoute('put', ['/scm-plans-api/scm-product-api/updateplan/:sno', '/scm-product-api/updateplan/:sno'], async ({ params, request }: any) => {
    const body = await request.json() as any;
    mockPlans = mockPlans.map(p => (String(p.sno) === String(params.sno) ? { ...p, ...body } : p));
    return wrap({ message: 'Plan updated successfully' });
  }),
  ...createRoute('delete', ['/scm-plans-api/scm-product-api/deleteplan/:sno', '/scm-product-api/deleteplan/:sno'], ({ params }: any) => {
    mockPlans = mockPlans.filter(p => String(p.sno) !== String(params.sno));
    return wrap({ message: 'Plan deleted successfully' });
  }),
  ...createRoute('get', ['/scm-plans-api/scm-product-api/rechargePlan', '/scm-product-api/rechargePlan'], ({ request }: any) => {
    const url = new URL(request.url);
    const price = Number(url.searchParams.get('price'));
    const plan = mockPlans.find(p => p.denomination === price) || mockPlans[0];
    return wrap(plan);
  }),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/saveDenomination', '/scm-product-api/saveDenomination'], () => wrap({ message: 'Denomination configured successfully' })),
  ...createRoute('post', ['/scm-plans-api/scm-product-api/saveMultipleDenominations', '/scm-product-api/saveMultipleDenominations'], () => wrap({ message: 'Zone denominations saved successfully' })),

  // MNP APIs
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/findMnpData', '/masterdata-db-api/findMnpData'], ({ request }: any) => {
    const url = new URL(request.url);
    const msisdn = url.searchParams.get('msisdn');
    if (msisdn) {
      const record = mockMnpList.find(m => m.msisdn === msisdn);
      if (record) return wrap(record);
    }
    return wrap(mockMnpList);
  }),
  ...createRoute('post', ['/scm-db-api/masterdata-db-api/savemnp', '/masterdata-db-api/savemnp'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newMnp = {
      id: `MNP-${100 + mockMnpList.length + 1}`,
      msisdn: body.msisdn || '9876512345',
      donorOperator: body.donorOperator || 'Airtel',
      recipientOperator: body.recipientOperator || 'BSNL',
      portingDate: body.portingDate || new Date().toISOString().split('T')[0],
      status: 'IN_PROGRESS',
    };
    mockMnpList = [newMnp, ...mockMnpList];
    return wrap({ message: 'MNP record saved', record: newMnp });
  }),
  ...createRoute('post', ['/scm-db-api/masterdata-db-api/modifyMnpData', '/masterdata-db-api/modifyMnpData'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockMnpList = mockMnpList.map(m => (m.msisdn === body.msisdn || m.id === body.id ? { ...m, ...body } : m));
    return wrap({ message: 'MNP record modified' });
  }),
  ...createRoute('post', ['/scm-db-api/masterdata-db-api/deleteMnp', '/masterdata-db-api/deleteMnp'], ({ request }: any) => {
    const url = new URL(request.url);
    const msisdn = url.searchParams.get('msisdn');
    mockMnpList = mockMnpList.filter(m => m.msisdn !== msisdn);
    return wrap({ message: 'MNP record deleted' });
  }),
  ...createRoute('delete', ['/scm-db-api/masterdata-db-api/deleteMnp', '/masterdata-db-api/deleteMnp'], ({ request }: any) => {
    const url = new URL(request.url);
    const msisdn = url.searchParams.get('msisdn');
    mockMnpList = mockMnpList.filter(m => m.msisdn !== msisdn);
    return wrap({ message: 'MNP record deleted' });
  }),

  // Number Series APIs
  ...createRoute('get', ['/scm-db-api/masterdata-db-api/getnumberseries', '/masterdata-db-api/getnumberseries'], ({ request }: any) => {
    const url = new URL(request.url);
    const series = url.searchParams.get('series');
    if (series) {
      return wrap(mockNumberSeries.filter(s => s.series.includes(series)));
    }
    return wrap(mockNumberSeries);
  }),
  ...createRoute('post', ['/scm-db-api/masterdata-db-api/addnumberseries', '/masterdata-db-api/addnumberseries'], async ({ request }: any) => {
    const body = await request.json() as any;
    const newSeries = {
      id: `NS-00${mockNumberSeries.length + 1}`,
      series: body.series || '94403',
      circleId: Number(body.circleId) || 1,
      circleName: 'Delhi Circle',
      operatorId: 'BSNL',
      totalNumbers: 10000,
      activeCount: 0,
    };
    mockNumberSeries = [newSeries, ...mockNumberSeries];
    return wrap({ message: 'Number series registered', series: newSeries });
  }),
  ...createRoute('post', ['/scm-db-api/masterdata-db-api/saveNumberSeries', '/masterdata-db-api/saveNumberSeries'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockNumberSeries = mockNumberSeries.map(s => (s.series === body.series ? { ...s, ...body } : s));
    return wrap({ message: 'Number series saved' });
  }),
  ...createRoute('put', ['/scm-db-api/masterdata-db-api/editnumberseries', '/masterdata-db-api/editnumberseries'], async ({ request }: any) => {
    const body = await request.json() as any;
    mockNumberSeries = mockNumberSeries.map(s => (s.series === body.series ? { ...s, ...body } : s));
    return wrap({ message: 'Number series updated' });
  }),
  ...createRoute('delete', ['/scm-db-api/masterdata-db-api/purgenumberseries', '/masterdata-db-api/purgenumberseries'], ({ request }: any) => {
    const url = new URL(request.url);
    const series = url.searchParams.get('series');
    mockNumberSeries = mockNumberSeries.filter(s => s.series !== series);
    return wrap({ message: 'Number series purged' });
  }),

  // Franchise & Wallet Transactions
  ...createRoute('get', ['/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalanceTransactions', '/scm-franchise-gui/franchiseAddBalanceTransactions'], () => wrap(mockFranchiseTransactions)),
  ...createRoute('post', ['/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalance/approve', '/scm-franchise-gui/franchiseAddBalance/approve'], async ({ request }: any) => {
    const body = await request.json() as any;
    const targetId = body.transactionId || (body.fabSeqList && body.fabSeqList[0]);
    mockFranchiseTransactions = mockFranchiseTransactions.map(t =>
      (t.id === targetId || t.transactionId === targetId ? { ...t, status: 'APPROVED' } : t)
    );
    return wrap({ message: 'Balance top-up request approved' });
  }),
  ...createRoute('post', ['/scmfmis-reports-api/scm-franchise-gui/franchiseAddBalance/reject', '/scm-franchise-gui/franchiseAddBalance/reject'], async ({ request }: any) => {
    const body = await request.json() as any;
    const targetId = body.transactionId || (body.fabSeqList && body.fabSeqList[0]);
    mockFranchiseTransactions = mockFranchiseTransactions.map(t =>
      (t.id === targetId || t.transactionId === targetId ? { ...t, status: 'REJECTED' } : t)
    );
    return wrap({ message: 'Balance top-up request rejected' });
  }),
  ...createRoute('post', ['/scm-stock-api/stock-api/walletAdjustment', '/stock-api/walletAdjustment'], async ({ request }: any) => {
    const body = await request.json() as any;
    return wrap({ message: 'Wallet balance adjusted successfully', newBalance: 45000, msisdn: body.msisdn || body.dlr_msisdn, amount: body.amount || body.adjustment_amount });
  }),
];
