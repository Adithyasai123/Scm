import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { handleMockApiRequest } from '@/lib/mockApiRouter';

describe('handleMockApiRequest - Commission Engine and Dropdown APIs', () => {
  it('successfully fetches Prepaid FRC commissions', async () => {
    const req = new NextRequest('http://localhost:3000/scm-plans-api/scm-product-api/fetchCommission');
    const res = await handleMockApiRequest(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('SUCCESS');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('successfully fetches Prepaid OTF commissions without crashing', async () => {
    const req = new NextRequest('http://localhost:3000/scm-plans-api/scm-product-api/fetchPrepaidOTFCommission');
    const res = await handleMockApiRequest(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('SUCCESS');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].category).toContain('OTF');
  });

  it('successfully fetches Postpaid commissions without crashing', async () => {
    const req = new NextRequest('http://localhost:3000/scm-plans-api/scm-product-api/fetchPostpaidCommission');
    const res = await handleMockApiRequest(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('SUCCESS');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].category).toContain('Postpaid');
  });

  it('successfully fetches Landline commissions without crashing', async () => {
    const req = new NextRequest('http://localhost:3000/scm-plans-api/scm-product-api/fetchLandlineCommission', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await handleMockApiRequest(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('SUCCESS');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeGreaterThan(0);
    expect(json.data[0].category).toContain('Landline');
  });

  it('saves and deletes commission configuration rules correctly', async () => {
    const newConfig = {
      circleId: '1',
      sellerCommission: '5.5',
      fraCommission: '2.0',
      subCommission: '1.0',
      tds: '5.0',
      denomination: '299',
      categoryId: '1',
      commissionType: 'Prepaid OTF',
    };
    const reqSave = new NextRequest('http://localhost:3000/scm-plans-api/scm-product-api/saveCommissionConfig', {
      method: 'POST',
      body: JSON.stringify(newConfig),
    });
    const resSave = await handleMockApiRequest(reqSave);
    const jsonSave = await resSave.json();
    expect(jsonSave.status).toBe('SUCCESS');
    expect(jsonSave.data.config.commissionRate).toBe('5.5%');

    const configId = jsonSave.data.config.configId;
    const reqDelete = new NextRequest(`http://localhost:3000/scm-plans-api/scm-product-api/deleteCommissionConfig?commissionId=${configId}`, {
      method: 'POST',
    });
    const resDelete = await handleMockApiRequest(reqDelete);
    const jsonDelete = await resDelete.json();
    expect(jsonDelete.status).toBe('SUCCESS');
  });

  it('returns zones, circles, and ssas for dropdown selectors', async () => {
    const reqZones = new NextRequest('http://localhost:3000/scm-db-api/masterdata-db-api/zones');
    const resZones = await handleMockApiRequest(reqZones);
    const jsonZones = await resZones.json();
    expect(jsonZones.data.length).toBeGreaterThan(0);

    const reqCircles = new NextRequest('http://localhost:3000/scm-db-api/masterdata-db-api/circles');
    const resCircles = await handleMockApiRequest(reqCircles);
    const jsonCircles = await resCircles.json();
    expect(jsonCircles.data.length).toBeGreaterThan(0);

    const reqSSAs = new NextRequest('http://localhost:3000/scm-db-api/masterdata-db-api/ssas?circleId=1');
    const resSSAs = await handleMockApiRequest(reqSSAs);
    const jsonSSAs = await resSSAs.json();
    expect(jsonSSAs.data.length).toBeGreaterThan(0);
    expect(jsonSSAs.data[0].circleId).toBe(1);
  });
});
