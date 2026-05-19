import { test, expect } from '@playwright/test'

/*
    Password E2E Module for Playwright
    1. Update password: valid password (old, new, conf)
    2. Update password: invalid password (old, new, conf)
    3. Update password: password mismatch (old, new, conf)
    4. Update password: same as old password (old, new, conf)
*/

const PASSWORDS = {
  new_invalid: 'weakpass',
  conf_mismatch: 'Mismatch123!',
  new_suffix: '!1A',
}

const PASSWORD = 'Admin123!'

const PROJECT_ACCOUNTS: Record<string, { email: string; password: string }> = {
  chromium: {
    email: 'ipsum+7wya0rle@sample.com',
    password: PASSWORD,
  },
  firefox: {
    email: 'ipsum+hqzs84i9@sample.com',
    password: PASSWORD,
  },
  webkit: {
    email: 'ipsum+f768lp9g@sample.com',
    password: PASSWORD,
  },
}

const getAccountForProject = (projectName: string) => {
  const account = PROJECT_ACCOUNTS[projectName]

  if (!account || !account.email || !account.password) {
    throw new Error(
      `Missing credentials for ${projectName}. Set PW_${projectName.toUpperCase()}_EMAIL and PW_${projectName.toUpperCase()}_PASSWORD.`,
    )
  }

  return account
}

test.describe.serial('Password Module', () => {
  let account: { email: string; password: string }

  // Login before each test
  // Redirect to profile page then click Update Profile button before each test
  test.beforeEach(async ({ page }, testInfo) => {
    account = getAccountForProject(testInfo.project.name)

    await page.goto('/login')

    await page.getByLabel('Account ID').fill(account.email)
    await page.getByLabel('Secure Pin').fill(account.password)

    await Promise.all([
      page.waitForURL('/app/dashboard'),
      page.getByRole('button', { name: 'Login' }).click(),
    ])

    await page.goto('/app/profile')

    const updateBtn = page.getByRole('button', { name: 'Update Profile' })
    await expect(updateBtn).toBeVisible()
    await updateBtn.click()
  })

  test('Update password: valid password', async ({ page }) => {
    const nextPassword = `${account.password}${PASSWORDS.new_suffix}`

    await page.getByLabel('Old Password').fill(account.password)
    await page.getByLabel('New Password', { exact: true }).fill(nextPassword)
    await page.getByLabel('Confirm New Password', { exact: true }).fill(nextPassword)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('alert')).toContainText('Profile updated successfully')
    await page.getByLabel('Old Password').fill(nextPassword)
    await page.getByLabel('New Password', { exact: true }).fill(account.password)
    await page.getByLabel('Confirm New Password', { exact: true }).fill(account.password)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('alert')).toContainText('Profile updated successfully')
  })

  test('Update password: invalid password', async ({ page }) => {
    await page.getByLabel('Old Password').fill(account.password)
    await page.getByLabel('New Password', { exact: true }).fill(PASSWORDS.new_invalid)
    await page.getByLabel('Confirm New Password', { exact: true }).fill(PASSWORDS.new_invalid)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(
      page.getByText('Password must include 1 uppercase, 1 number and 1 special character'),
    ).toBeVisible()
  })

  test('Update password: password mismatch', async ({ page }) => {
    const nextPassword = `${account.password}${PASSWORDS.new_suffix}`

    await page.getByLabel('Old Password').fill(account.password)
    await page.getByLabel('New Password', { exact: true }).fill(nextPassword)
    await page.getByLabel('Confirm New Password', { exact: true }).fill(PASSWORDS.conf_mismatch)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('Update password: same as old password', async ({ page }) => {
    await page.getByLabel('Old Password').fill(account.password)
    await page.getByLabel('New Password', { exact: true }).fill(account.password)
    await page.getByLabel('Confirm New Password', { exact: true }).fill(account.password)
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('alert')).toContainText(
      'New password cannot be the same as the current password',
    )
  })
})
