import { test, expect } from '@playwright/test'

/*
    Profile E2E Module for Playwright
    1. Update profile: name
    2. Update profile: invalid name
    3. Update profile: no input
*/

const VALID_ACCOUNT = {
  email: 'ipsum@sample.com',
  password: 'Admin123!',
}
const NEW_NAME = 'New Name'
const INVALID_NAME = '123InvalidName!@#'

const PASSWORDS = {
  old_valid: 'Admin123!',
  new_valid: 'Admin1234!',
  new_invalid: 'weakpass',
  conf_mismatch: 'Mismatch123!',
}

// Login before each test
// Redirect to profile page then click Update Profile button before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Account ID').fill(VALID_ACCOUNT.email)
  await page.getByLabel('Secure Pin').fill(VALID_ACCOUNT.password)

  await Promise.all([
    page.waitForURL('/app/dashboard'),
    page.getByRole('button', { name: 'Login' }).click(),
  ])

  await page.goto('/app/profile')

  const updateBtn = page.getByRole('button', { name: 'Update Profile' })
  await expect(updateBtn).toBeVisible()
  await updateBtn.click()
})

test.describe.serial('Profile Module', () => {
  test('Update profile: name', async ({ page }) => {
    await page.getByLabel('Name').fill(NEW_NAME)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.locator('p', { hasText: NEW_NAME })).toBeVisible()
  })

  test('Update profile: invalid name', async ({ page }) => {
    await page.getByLabel('Name').fill(INVALID_NAME)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Name can only contain letters and spaces')).toBeVisible()
  })

  test('Update profile: no input', async ({ page }) => {
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('alert')).toContainText('No valid fields provided to update')
  })
})
