import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/demo/');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('quality123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Product catalogue' })).toBeVisible();
}

test.describe('QualityMart customer journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('rejects invalid login with a clear message', async ({ page }) => {
    await page.getByLabel('Username').fill('wrong_user');
    await page.getByLabel('Password').fill('wrong_password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toHaveText('Username or password is incorrect.');
  });

  test('authenticates a valid customer', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Signed in as standard_user')).toBeVisible();
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(4);
  });

  test('filters products by search term', async ({ page }) => {
    await login(page);
    await page.getByLabel('Search products').fill('keyboard');
    await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'Trace Mechanical Keyboard' })).toBeVisible();
  });

  test('sorts products from lowest to highest price', async ({ page }) => {
    await login(page);
    await page.getByLabel('Sort products').selectOption('price-asc');
    const names = await page.locator('[data-testid="product-name"]').allTextContents();
    expect(names).toEqual(['Signal USB-C Hub', 'Trace Mechanical Keyboard', 'Precision Headphones', 'Pulse Fitness Watch']);
  });

  test('adds and removes an item from the cart', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Add Precision Headphones to cart' }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    await page.getByRole('button', { name: 'Open cart' }).click();
    await expect(page.locator('#cart-dialog').getByText('Precision Headphones', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Remove Precision Headphones' }).click();
    await expect(page.getByText('Your cart is empty.')).toBeVisible();
  });

  test('validates checkout contact details', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Add Signal USB-C Hub to cart' }).click();
    await page.getByRole('button', { name: 'Open cart' }).click();
    await page.getByRole('button', { name: 'Continue to checkout' }).click();
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(page.locator('#checkout-error')).toHaveText('Enter a valid email address.');
  });

  test('completes the checkout journey', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Add Pulse Fitness Watch to cart' }).click();
    await page.getByRole('button', { name: 'Open cart' }).click();
    await page.getByRole('button', { name: 'Continue to checkout' }).click();
    await page.getByLabel('Email address').fill('recruiter@example.com');
    await page.getByRole('button', { name: 'Place demo order' }).click();
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page.getByText('QP-DEMO-001')).toBeVisible();
  });
});
