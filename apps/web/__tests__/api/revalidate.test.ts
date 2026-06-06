/**
 * @jest-environment node
 */

// Mock next/cache before imports
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { POST } from '@/app/api/revalidate/route';
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

describe('POST /api/revalidate', () => {
  const SECRET = 'test_revalidation_secret';

  beforeEach(() => {
    process.env.REVALIDATION_SECRET = SECRET;
    (revalidatePath as jest.Mock).mockReset();
  });

  it('should revalidate path on valid secret header', async () => {
    const req = new NextRequest('http://localhost:3000/api/revalidate?path=/blog/my-post', {
      method: 'POST',
      headers: { 'x-revalidate-secret': SECRET },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.revalidated).toBe(true);
    expect(revalidatePath).toHaveBeenCalledWith('/blog/my-post');
  });

  it('should return 401 on wrong secret header', async () => {
    const req = new NextRequest('http://localhost:3000/api/revalidate?path=/blog/test', {
      method: 'POST',
      headers: { 'x-revalidate-secret': 'wrong' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should return 401 when secret header is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/revalidate?path=/blog/test', {
      method: 'POST',
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should reject a query-param secret (old contract no longer accepted)', async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/revalidate?secret=${SECRET}&path=/blog/test`,
      { method: 'POST' },
    );

    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('should return 400 when path is missing (valid secret)', async () => {
    const req = new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: { 'x-revalidate-secret': SECRET },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
