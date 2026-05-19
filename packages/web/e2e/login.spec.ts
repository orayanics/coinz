import { test, expect } from '@playwright/test'

/*
    Login E2E Module for Playwright
    1. Login with valid credentials
    2. Login with invalid credentials
    3. Login with empty fields
    4. Login with SQL injection attempt
*/

const VALID_ACCOUNT = {
  email: 'ipsum@sample.com',
  password: 'Admin123!',
}

const INVALID_ACCOUNT = {
  email: 'ipsum2@sample.com',
  password: 'Admin123!',
}

const EMPTY_ACCOUNT = {
  email: '',
  password: '',
}

const SQL_INJECTION_ACCOUNT = {
  email: "' OR '1'='1",
  password: "' OR '1'='1",
}

test('Login with valid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Account ID').fill(VALID_ACCOUNT.email)
  await page.getByLabel('Secure Pin').fill(VALID_ACCOUNT.password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.locator('p', { hasText: 'Dashboard' })).toBeVisible()
})

test('Login with invalid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Account ID').fill(INVALID_ACCOUNT.email)
  await page.getByLabel('Secure Pin').fill(INVALID_ACCOUNT.password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByRole('alert')).toContainText('Invalid credentials')
})

test('Login with empty fields', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Account ID').fill(EMPTY_ACCOUNT.email)
  await page.getByLabel('Secure Pin').fill(EMPTY_ACCOUNT.password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page.getByText('Invalid email address')).toBeVisible()
  await expect(page.getByText('Password is required')).toBeVisible()
})

test('Login with SQL injection attempt', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Account ID').fill(SQL_INJECTION_ACCOUNT.email)
  await page.getByLabel('Secure Pin').fill(SQL_INJECTION_ACCOUNT.password)
  await page.getByRole('button', { name: 'Login' }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByText('Dashboard')).toBeHidden()
})
