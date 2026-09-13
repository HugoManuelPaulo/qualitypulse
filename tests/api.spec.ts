import { test, expect } from '@playwright/test';

test.describe('Product and order API', () => {
  test('health endpoint exposes service status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok', service: 'qualitypulse' });
  });

  test('product catalogue returns a valid collection', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.count).toBe(4);
    expect(body.products).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1, name: expect.any(String), price: expect.any(Number) })
    ]));
  });

  test('unknown product returns a controlled 404', async ({ request }) => {
    const response = await request.get('/api/products/999');
    expect(response.status()).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: 'Product not found' });
  });

  test('order validation rejects incomplete payloads', async ({ request }) => {
    const response = await request.post('/api/orders', { data: { items: [] } });
    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: expect.stringContaining('required') });
  });

  test('valid order is confirmed with a traceable id', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: { email: 'qa@example.com', items: [{ productId: 1, quantity: 1 }] }
    });
    expect(response.status()).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      orderId: expect.stringMatching(/^QP-/),
      status: 'confirmed',
      itemCount: 1
    });
  });
});
