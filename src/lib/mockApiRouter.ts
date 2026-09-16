import { NextRequest, NextResponse } from 'next/server';
import {
  mockZones,
  mockCircles,
  mockSSAs,
  mockUsers as initialUsers,
  mockDealers as initialDealers,
  mockPlans as initialPlans,
  mockCommissions as initialCommissions,
  mockFranchiseTransactions as initialTransactions,
  mockMnpList as initialMnpList,
  mockNumberSeries as initialNumberSeries,
} from '../../tests/mocks/handlers';

let users = [...initialUsers];
let dealers = [...initialDealers];
let plans = [...initialPlans];
let commissions = [...initialCommissions];
let transactions = [...initialTransactions];
let mnpList = [...initialMnpList];
let numberSeries = [...initialNumberSeries];

function wrap(data: any, message = 'Success', status = 'SUCCESS') {
  return NextResponse.json({ status, message, data });
}

export async function handleMockApiRequest(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // 1. Master Data & Geographic Cascades
  if (pathname.includes('/zones')) {
    return wrap(mockZones);
  }
  if (pathname.includes('/zonebasedcircles')) {
    const zoneId = Number(url.searchParams.get('zoneId'));
    return wrap(zoneId ? mockCircles.filter(c => c.zoneId === zoneId) : mockCircles);
  }
  if (pathname.includes('/getCirclesInfo') || pathname.includes('/circles')) {
    return wrap(mockCircles);
  }
  if (pathname.includes('/ssas')) {
    const circleId = Number(url.searchParams.get('circleId'));
    return wrap(circleId ? mockSSAs.filter(s => s.circleId === circleId) : mockSSAs);
  }
  if (pathname.includes('/dealerType')) {
    return wrap([
      { id: 'Retailer', name: 'Retailer' },
      { id: 'Franchise', name: 'Franchise' },
      { id: 'SubFranchise', name: 'Sub Franchise' },
      { id: 'FOS', name: 'Feet On Street (FOS)' },
    ]);
  }
  if (pathname.includes('/getCategoryByDealer')) {
    return wrap([
      { id: 1, name: 'Telecom Store' },
      { id: 2, name: 'Exclusive Franchise' },
    ]);
  }
  if (pathname.includes('/getCategory')) {
    return wrap([
      { id: 1, name: 'Category A' },
      { id: 2, name: 'Category B' },
      { id: 3, name: 'Category C' },
    ]);
  }

  // 2. OTP Security APIs
  if (pathname.includes('/sendOtp')) {
    let body: any = {};
    try { body = await req.json(); } catch {}
    return wrap({
      message: `OTP dispatched to ${body.msisdn || 'registered phone'} for topic ${body.topic || 'verification'}.`,
    });
  }
  if (pathname.includes('/validateOtp')) {
    const otp = url.searchParams.get('otp');
    if (otp === '9999') {
      return NextResponse.json({ status: 'ERROR', message: 'Invalid OTP entered.', data: null }, { status: 400 });
    }
    return wrap({ valid: true, message: 'OTP verified successfully.' });
  }

  // 3. User Administration APIs
  if (pathname.includes('/fetchusername')) {
    const query = (url.searchParams.get('username') || '').toLowerCase();
    const matches = users
      .map(u => u.username)
      .filter(uname => uname.toLowerCase().includes(query));
    return wrap(matches);
  }
  if (pathname.includes('/getUserwithHrmsIdandUsername')) {
    const uname = url.searchParams.get('username');
    const user = users.find(u => u.username === uname) || users[0];
    return wrap(user);
  }
  if (pathname.includes('/getUserPermissionwithHrmsIdandUsername')) {
    const uname = url.searchParams.get('username');
    const user = users.find(u => u.username === uname) || users[0];
    return wrap(user.permissions);
  }
  if (pathname.includes('/userStatusCheck')) {
    const uname = url.searchParams.get('username');
    const user = users.find(u => u.username === uname) || users[0];
    return wrap({ status: user.status });
  }
  if (pathname.includes('/userStatusChangewithHrmsIdandUsername')) {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const idx = users.findIndex(u => u.username === body.username);
    if (idx !== -1) {
      users[idx] = { ...users[idx], status: Number(body.status) };
    }
    return wrap({ message: 'User status updated successfully.', status: body.status });
  }
  if (pathname.includes('/usercreation') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const newUser = {
      userId: `USR-${Date.now().toString().slice(-4)}`,
      hrmsId: body.hrmsId || 'HRMS999',
      username: body.username || 'new_user',
      mobileNumber: body.mobileNumber || '9876543210',
      firstName: body.firstName || 'New',
      lastName: body.lastName || 'User',
      address: body.address || 'Telecom City',
      status: 1,
      roleId: body.roleId || 1,
      roleName: 'Channel Admin',
      ssaId: body.ssaId || 1,
      circleId: body.circleId || 1,
      zoneId: body.zoneId || 1,
      dob: body.dob || '1995-01-01',
      loginStatus: '1',
      permissions: {
        dealerPermissions: true,
        walletPermissions: true,
        userPermissions: true,
        commissionPermissions: true,
        plansNumberpermissions: true,
        reportsPermissions: true,
      },
    };
    users.unshift(newUser as any);
    return wrap({ message: 'User onboarded successfully', userId: newUser.userId });
  }
  if (pathname.includes('/modifyUser') && method === 'POST') {
    return wrap({ message: 'User profile updated successfully.' });
  }
  if (pathname.includes('/modifyPermissions') && method === 'POST') {
    return wrap({ message: 'Permissions updated successfully.' });
  }
  if (pathname.includes('/changePassword') && method === 'POST') {
    return wrap({ message: 'Password updated successfully.' });
  }
  if (pathname.includes('/scmlogout')) {
    return wrap({ message: 'Logged out successfully.' });
  }
  if (pathname.includes('/users') && method === 'GET') {
    return wrap(users);
  }

  // 4. Commission Engine APIs
  if (pathname.includes('/savemultipleCommissionConfig') && method === 'POST') {
    let body: any = [];
    try { body = await req.json(); } catch {}
    const zoneId = Number(url.searchParams.get('zoneId')) || 0;
    if (Array.isArray(body)) {
      body.forEach((item: any) => {
        commissions.unshift({
          id: commissions.length + 1,
          configId: `COM-00${commissions.length + 1}`,
          category: item.commissionType ? `${item.commissionType} Zone ${zoneId} Rule` : 'Zone Commission Rule',
          commissionType: item.commissionType || 'FRC',
          type: item.commissionType || 'FRC',
          circleId: Number(item.circleId) || 1,
          circleName: mockCircles.find(c => c.id === Number(item.circleId))?.name || 'All Circles',
          categoryId: Number(item.categoryId) || 1,
          commissionRate: `${item.sellerCommission || '4.5'}%`,
          bonus: '₹0',
          status: 'ACTIVE',
          updatedDate: new Date().toISOString().split('T')[0],
        });
      });
    }
    return wrap({ message: 'Multiple commission rules configured for zone.' });
  }
  if (pathname.includes('/saveCommissionConfig') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const newRule = {
      id: commissions.length + 1,
      configId: `COM-00${commissions.length + 1}`,
      name: `Commission Rule ${commissions.length + 1}`,
      category: body.commissionType ? `${body.commissionType} Rule` : 'Prepaid FRC Rule',
      commissionType: body.commissionType || 'FRC',
      type: body.commissionType || 'FRC',
      circleId: Number(body.circleId) || 1,
      circleName: mockCircles.find(c => c.id === Number(body.circleId))?.name || 'Delhi Circle',
      categoryId: Number(body.categoryId) || 1,
      categoryName: 'Category A',
      sellerCommission: body.sellerCommission || 5.5,
      franchiseCommission: body.fraCommission || 2.0,
      subCommission: body.subCommission || 1.0,
      tdsRate: body.tds || 5.0,
      commissionRate: `${body.sellerCommission || '4.5'}%`,
      bonus: '₹0',
      status: 'ACTIVE',
      denomination: body.denomination || 199,
      minAmount: 10,
      maxAmount: 1000,
      updatedDate: new Date().toISOString().split('T')[0],
    };
    commissions.unshift(newRule);
    return wrap({ message: 'Commission configuration committed.', config: newRule });
  }
  if (pathname.includes('/postpaidCommissionConfig') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const newRule = {
      id: commissions.length + 1,
      configId: `COM-00${commissions.length + 1}`,
      name: `Postpaid Rule ${commissions.length + 1}`,
      category: 'Postpaid Activation Rule',
      commissionType: 'POSTPAID',
      type: 'POSTPAID',
      circleId: Number(body.circleId) || 1,
      circleName: mockCircles.find(c => c.id === Number(body.circleId))?.name || 'Delhi Circle',
      categoryId: Number(body.categoryId) || 1,
      categoryName: 'Category A',
      commissionRate: `${body.sellerCommission || '5.0'}%`,
      bonus: '₹50',
      status: 'ACTIVE',
      updatedDate: new Date().toISOString().split('T')[0],
    };
    commissions.unshift(newRule);
    return wrap({ message: 'Postpaid commission committed.', config: newRule });
  }
  if (pathname.includes('/landlineCommissionConfig') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const newRule = {
      id: commissions.length + 1,
      configId: `COM-00${commissions.length + 1}`,
      name: `Landline Rule ${commissions.length + 1}`,
      category: 'Landline & Fiber Rule',
      commissionType: 'LANDLINE',
      type: 'LANDLINE',
      circleId: Number(body.circleId) || 1,
      circleName: mockCircles.find(c => c.id === Number(body.circleId))?.name || 'Delhi Circle',
      categoryId: Number(body.categoryId) || 1,
      categoryName: 'Category A',
      commissionRate: `₹${body.sellerCommission || '150'} / installation`,
      bonus: '₹100',
      status: 'ACTIVE',
      updatedDate: new Date().toISOString().split('T')[0],
    };
    commissions.unshift(newRule);
    return wrap({ message: 'Landline commission committed.', config: newRule });
  }
  if (pathname.includes('/fetchPrepaidOTFCommission')) {
    return wrap(commissions.filter(c => c.type === 'OTF' || (c.category && c.category.includes('OTF')) || (c.commissionType && c.commissionType.includes('OTF'))));
  }
  if (pathname.includes('/fetchPostpaidCommission')) {
    return wrap(commissions.filter(c => c.type === 'POSTPAID' || (c.category && c.category.includes('Postpaid')) || (c.commissionType && c.commissionType.includes('Postpaid'))));
  }
  if (pathname.includes('/fetchLandlineCommission')) {
    return wrap(commissions.filter(c => c.type === 'LANDLINE' || (c.category && c.category.includes('Landline')) || (c.commissionType && c.commissionType.includes('Landline'))));
  }
  if (pathname.includes('/fetchCommission')) {
    return wrap(commissions.filter(c => c.type === 'FRC' || !c.type || (c.category && c.category.includes('FRC')) || (c.commissionType && c.commissionType.includes('FRC'))));
  }
  if (pathname.includes('/updateCommissionConfig') || pathname.includes('/updatePostpaidCommission') || pathname.includes('/updateLandlineCommission')) {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const targetId = body.id || body.configId;
    const idx = commissions.findIndex(c => c.id === targetId || c.configId === targetId);
    if (idx !== -1) {
      commissions[idx] = { ...commissions[idx], ...body };
    }
    return wrap({ message: 'Commission rule updated.' });
  }
  if (pathname.includes('/deleteCommissionConfig') || pathname.includes('/deletePostpaidCommission') || pathname.includes('/deleteLandlineCommission')) {
    const commissionId = url.searchParams.get('commissionId');
    if (commissionId) {
      commissions = commissions.filter(c => String(c.id) !== commissionId && c.configId !== commissionId);
    }
    return wrap({ message: 'Commission rule removed.' });
  }

  // 5. Dealer Management APIs
  if (pathname.includes('/checkDealerByPan')) {
    const pan = (url.searchParams.get('panId') || '').toUpperCase();
    const exists = dealers.some(d => (d as any).panNumber === pan || pan === 'ABCDE1234F');
    return wrap({ exists });
  }
  if (pathname.includes('/checkDealerByAadhar')) {
    const aadhar = url.searchParams.get('aadharId') || '';
    const exists = dealers.some(d => (d as any).aadharNumber === aadhar || aadhar === '123456789012');
    return wrap({ exists });
  }
  if (pathname.includes('/fetchDealerData') || pathname.includes('/fetchDealer')) {
    const msisdn = url.searchParams.get('msisdn') || url.searchParams.get('mobile');
    const d = dealers.find(x => x.msisdn === msisdn) || dealers[0];
    return wrap(d);
  }
  if (pathname.includes('/dealerStatusCheck')) {
    const msisdn = url.searchParams.get('msisdn');
    const d = dealers.find(x => x.msisdn === msisdn) || dealers[0];
    return wrap({ status: d.status });
  }
  if (pathname.includes('/dealerStatusChange') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const idx = dealers.findIndex(d => d.msisdn === body.msisdn);
    if (idx !== -1) {
      dealers[idx] = { ...dealers[idx], status: body.status };
    }
    return wrap({ message: 'Dealer status modified.' });
  }
  if (pathname.includes('/createDealer') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const newDealer = {
      id: `DLR-${Date.now().toString().slice(-4)}`,
      name: body.name || 'New Telecom Dealer',
      msisdn: body.msisdn || '9876543210',
      dealerType: body.dealerType || 'Retailer',
      outletCategory: 'Telecom Outlet',
      circle: 'Delhi Circle',
      circleId: body.circleId || 1,
      ssa: 'Delhi SSA',
      ssaId: body.ssaId || 1,
      zoneId: body.zoneId || 1,
      status: 'Active',
      parentDealerId: 'DLR-001',
      parentDealerName: 'Metro Telecom Care',
      onboardDate: new Date().toISOString().split('T')[0],
      panNumber: body.panNumber || 'ABCDE1234F',
      aadharNumber: body.aadharNumber || '123456789012',
    };
    dealers.unshift(newDealer as any);
    return wrap({ message: 'Dealer onboarded successfully', dealer: newDealer });
  }
  if (pathname.includes('/updateDealer') && method === 'POST') {
    return wrap({ message: 'Dealer updated.' });
  }
  if (pathname.includes('/purgeDealer') && method === 'POST') {
    return wrap({ message: 'Dealer purged.' });
  }
  if (pathname.includes('/changeDealerHierarchy') && method === 'POST') {
    return wrap({ message: 'Hierarchy updated.' });
  }
  if (pathname.includes('/resetMpin') && (method === 'POST' || method === 'PUT')) {
    return wrap({ message: 'MPIN reset dispatched to dealer.' });
  }
  if (pathname.includes('/franchise') && !pathname.includes('franchiseAddBalance')) {
    return wrap({ franchiseId: 'FRAN-100', franchiseName: 'Apex Telecom Franchise' });
  }
  if (pathname.includes('/subFranchise')) {
    return wrap({ subFranchiseId: 'SUB-200', subFranchiseName: 'East Sub Franchise' });
  }
  if (pathname.includes('/dealerList') && method === 'GET') {
    return wrap(dealers);
  }

  // 6. Plans, Denominations & Numbers APIs
  if (pathname.includes('/rechargePlan')) {
    const price = Number(url.searchParams.get('price'));
    const plan = plans.find(p => p.denomination === price) || plans[0];
    return wrap(plan);
  }
  if (pathname.includes('/addplan') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const newPlan = {
      id: `PLN-${Date.now().toString().slice(-4)}`,
      name: body.name || 'Unlimited 5G Pack',
      planType: body.planType || 'PREPAID',
      price: Number(body.price) || 299,
      validity: Number(body.validity) || 28,
      talktime: Number(body.talktime) || 0,
      data: body.data || '2GB/Day',
      sms: body.sms || '100/Day',
      description: body.description || 'Unlimited 5G Data with Free Calling',
      active: true,
      circleId: body.circleId || 1,
      circleName: 'Delhi Circle',
    };
    plans.unshift(newPlan as any);
    return wrap({ message: 'Plan created successfully.', plan: newPlan });
  }
  if (pathname.includes('/updateplan') && (method === 'PUT' || method === 'POST')) {
    return wrap({ message: 'Plan updated.' });
  }
  if (pathname.includes('/deleteplan') && method === 'DELETE') {
    return wrap({ message: 'Plan deleted.' });
  }
  if (pathname.includes('/saveMultipleDenominations') && method === 'POST') {
    return wrap({ message: 'Denominations configured for zone.' });
  }
  if (pathname.includes('/saveDenomination') && method === 'POST') {
    return wrap({ message: 'Denomination configured.' });
  }
  if (pathname.includes('/findMnpData')) {
    return wrap(mnpList);
  }
  if (pathname.includes('/savemnp') && method === 'POST') {
    return wrap({ message: 'MNP port-in recorded.' });
  }
  if (pathname.includes('/modifyMnpData') && method === 'POST') {
    return wrap({ message: 'MNP updated.' });
  }
  if (pathname.includes('/deleteMnp') && method === 'POST') {
    return wrap({ message: 'MNP record removed.' });
  }
  if (pathname.includes('/getnumberseries')) {
    return wrap(numberSeries);
  }
  if (pathname.includes('/addnumberseries') || pathname.includes('/saveNumberSeries')) {
    return wrap({ message: 'Number series allocated.' });
  }
  if (pathname.includes('/editnumberseries')) {
    return wrap({ message: 'Number series modified.' });
  }
  if (pathname.includes('/purgenumberseries')) {
    return wrap({ message: 'Number series purged.' });
  }
  if (pathname.includes('/getplans') && method === 'GET') {
    return wrap(plans);
  }

  // 7. Franchise Governance & Stock APIs
  if (pathname.includes('/franchiseAddBalanceTransactions')) {
    return wrap(transactions);
  }
  if (pathname.includes('/franchiseAddBalance/approve') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const idx = transactions.findIndex(t => t.id === body.transactionId);
    if (idx !== -1) {
      transactions[idx] = { ...transactions[idx], status: 'APPROVED' };
    }
    return wrap({ message: 'Franchise top-up balance approved and credited.' });
  }
  if (pathname.includes('/franchiseAddBalance/reject') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    const idx = transactions.findIndex(t => t.id === body.transactionId);
    if (idx !== -1) {
      transactions[idx] = { ...transactions[idx], status: 'REJECTED' };
    }
    return wrap({ message: 'Franchise balance request rejected.' });
  }
  if (pathname.includes('/walletAdjustment') && method === 'POST') {
    let body: any = {};
    try { body = await req.json(); } catch {}
    return wrap({ message: 'Wallet adjustment committed.', newBalance: 75000 });
  }

  return wrap([], 'Default fallback');
}
