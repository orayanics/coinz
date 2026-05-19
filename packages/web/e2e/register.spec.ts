import { test, expect } from '@playwright/test'

/*
    Register E2E Module for Playwright
    1. Register with valid credentials
    2. Register with empty fields
    3. Register with invalid email
    4. Register with weak password
    5. Register with existing email
*/

function randomEmail(str: string): string {
  const randomString = Math.random().toString(36).substring(2, 10)
  return `${str}+${randomString}@sample.com`
}

function randomName(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz '
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result.trim()
}

const VALID_ACCOUNT = {
  name: randomName(10),
  email: randomEmail('ipsum'),
  password: 'Admin123!',
}

const INVALID_EMAIL_ACCOUNT = {
  name: randomName(10),
  email: 'invalid-email',
  password: 'Admin123!',
}

const WEAK_PASSWORD_ACCOUNT = {
  name: randomName(10),
  email: randomEmail('ipsum'),
  password: 'weakpassword',
}

const EXISTING_EMAIL_ACCOUNT = {
  name: randomName(10),
  email: 'ipsum@sample.com',
  password: 'Admin123!',
}

const LABELS = {
  name: 'Account Name',
  email: 'Account ID',
  password: 'Secure Pin',
}

test('Register with valid credentials', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(LABELS.name).fill(VALID_ACCOUNT.name)
  await page.getByLabel(LABELS.email).fill(VALID_ACCOUNT.email)
  await page.getByLabel(LABELS.password).fill(VALID_ACCOUNT.password)
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page.locator('p', { hasText: 'Access your digital wallet' })).toBeVisible()
})

test('Register with empty fields', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(LABELS.email).fill('')
  await page.getByLabel(LABELS.name).fill('')
  await page.getByLabel(LABELS.password).fill('')
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page.getByText('Name must be at least 2 characters')).toBeVisible()
  await expect(page.getByText('Invalid email address')).toBeVisible()
  await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
})

test('Register with invalid email', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(LABELS.name).fill(INVALID_EMAIL_ACCOUNT.name)
  await page.getByLabel(LABELS.email).fill(INVALID_EMAIL_ACCOUNT.email)
  await page.getByLabel(LABELS.password).fill(INVALID_EMAIL_ACCOUNT.password)
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page.getByText('Invalid email address')).toBeVisible()
})

test('Register with weak password', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(LABELS.name).fill(WEAK_PASSWORD_ACCOUNT.name)
  await page.getByLabel(LABELS.email).fill(WEAK_PASSWORD_ACCOUNT.email)
  await page.getByLabel(LABELS.password).fill(WEAK_PASSWORD_ACCOUNT.password)
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(
    page.getByText('Password must contain uppercase, lowercase, number, and special character'),
  ).toBeVisible()
})

test('Register with existing email', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel(LABELS.name).fill(EXISTING_EMAIL_ACCOUNT.name)
  await page.getByLabel(LABELS.email).fill(EXISTING_EMAIL_ACCOUNT.email)
  await page.getByLabel(LABELS.password).fill(EXISTING_EMAIL_ACCOUNT.password)
  await page.getByRole('button', { name: 'Register' }).click()
  await expect(page.getByRole('alert')).toContainText('Choose a valid email')
})
