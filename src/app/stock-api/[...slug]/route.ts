import { NextRequest } from 'next/server';
import { handleMockApiRequest } from '@/lib/mockApiRouter';

export async function GET(req: NextRequest) {
  return handleMockApiRequest(req);
}
export async function POST(req: NextRequest) {
  return handleMockApiRequest(req);
}
export async function PUT(req: NextRequest) {
  return handleMockApiRequest(req);
}
export async function DELETE(req: NextRequest) {
  return handleMockApiRequest(req);
}
