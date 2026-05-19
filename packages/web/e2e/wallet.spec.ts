import { test, expect, Page, Locator } from '@playwright/test'

const VALID_ACCOUNT = {
  email: 'ipsum@sample.com',
  password: 'Admin123!',
}

const WALLET_COLOR_SELECTOR = 'div.grid button'

// Helper function to perform login before tests that require authentication
const login = async (page: Page) => {
  await page.goto('/login')
  await page.getByLabel('Account ID').fill(VALID_ACCOUNT.email)
  await page.getByLabel('Secure Pin').fill(VALID_ACCOUNT.password)
  await Promise.all([
    page.waitForURL('/app/dashboard'),
    page.getByRole('button', { name: 'Login' }).click(),
  ])
}

// Helper functions to interact with the wallet and wallet item modals
const openWalletsPage = async (page: Page) => {
  await page.goto('/app/wallets')
  await expect(page.locator('button', { hasText: 'Add Wallet' })).toBeVisible()
}

const openCreateWalletModal = async (page: Page) => {
  await page.getByRole('button', { name: 'Add Wallet' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Wallet' })
  await expect(dialog).toBeVisible()
  return dialog
}

const openUpdateWalletModal = async (page: Page) => {
  await page.getByRole('button', { name: 'Edit Wallet' }).click()
  const dialog = page.getByRole('dialog', { name: 'Update Wallet' })
  await expect(dialog).toBeVisible()
  return dialog
}

const openDeleteWalletModal = async (page: Page) => {
  await page.getByRole('button', { name: 'Delete Wallet' }).click()
  const dialog = page.getByRole('dialog', { name: 'Delete Wallet' })
  await expect(dialog).toBeVisible()
  return dialog
}

const selectFirstWalletColor = async (dialog: Locator) => {
  await dialog.locator(WALLET_COLOR_SELECTOR).first().click()
}

const openCreateItemModal = async (page: Page) => {
  await page.getByRole('button', { name: 'Add Item' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Wallet Item' })
  await expect(dialog).toBeVisible()
  return dialog
}

const openUpdateItemModal = async (row: Locator) => {
  await row.locator('button.btn-square').first().click()
  const dialog = row.page().getByRole('dialog', { name: 'Update Wallet Item' })
  await expect(dialog).toBeVisible()
  return dialog
}

const openDeleteItemModal = async (row: Locator) => {
  const buttons = row.locator('button.btn-square')
  await buttons.nth(1).click()
  const dialog = row.page().getByRole('dialog', { name: 'Delete Wallet Item' })
  await expect(dialog).toBeVisible()
  return dialog
}

// Cleanup function to delete created wallets and items after tests run
// This ensures that test data does not persist and affect future test runs
const cleanupWallet = async (page: Page, walletLabel: string, itemNotes: string[]) => {
  await openWalletsPage(page)

  const searchInput = page.getByPlaceholder('Search wallets...')
  await searchInput.fill(walletLabel)

  const walletLink = page.getByRole('link', { name: new RegExp(walletLabel) })
  if ((await walletLink.count()) === 0) return

  await walletLink.first().click()
  await expect(page).toHaveURL(/\/app\/wallets\//)

  for (const note of itemNotes) {
    const row = page.locator('tbody tr', { has: page.getByText(note) })
    if ((await row.count()) === 0) continue

    const dialog = await openDeleteItemModal(row.first())
    await dialog.getByRole('button', { name: 'Delete' }).click()
    await expect(dialog).toBeHidden()
  }

  const deleteDialog = await openDeleteWalletModal(page)
  await deleteDialog.getByRole('button', { name: 'Delete' }).click()
  await expect(page).toHaveURL('/app/wallets')
}

test.describe.serial('Wallets and Wallet Items', () => {
  const timestamp = Date.now()
  const walletName = `E2E Wallet ${timestamp}`
  const updatedWalletName = `Udated ${timestamp}`
  const walletItemNote = `E2E Item ${timestamp}`
  const updatedWalletItemNote = `Item Updated ${timestamp}`

  test.beforeEach(async ({ page }) => {
    await login(page)
    await openWalletsPage(page)
  })

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage()
    await login(page)
    await cleanupWallet(page, updatedWalletName, [updatedWalletItemNote, walletItemNote])
    await cleanupWallet(page, walletName, [updatedWalletItemNote, walletItemNote])
    await page.close()
  })

  test('opens add wallet modal', async ({ page }) => {
    const dialog = await openCreateWalletModal(page)
    await expect(dialog.getByText('Add Wallet')).toBeVisible()
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toBeHidden()
  })

  test('shows validation errors when creating wallet with invalid data', async ({ page }) => {
    const dialog = await openCreateWalletModal(page)

    await dialog.getByRole('button', { name: 'Create' }).click()

    await expect(dialog.getByText('Name is required')).toBeVisible()
    await expect(dialog.getByText('Color must be one of the allowed wallet colors')).toBeVisible()
  })

  test('creates a wallet with valid data', async ({ page }) => {
    const dialog = await openCreateWalletModal(page)

    await dialog.getByPlaceholder('e.g. Daily Expenses').fill(walletName)
    await dialog.locator('input[type="number"]').fill('500')
    await selectFirstWalletColor(dialog)
    await dialog.getByRole('button', { name: 'Create' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByText(walletName)).toBeVisible()
  })

  test('search filters wallets and updates query params', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search wallets...')
    await searchInput.fill(walletName)
    await page.waitForURL((url) => url.searchParams.get('search') === walletName)
    await expect(page.getByText(walletName)).toBeVisible()
  })

  test('sort options update query params', async ({ page }) => {
    const selects = page.locator('select')
    await selects.first().selectOption('updated_at')
    await expect(page).toHaveURL(/sortBy=updated_at/)

    await selects.nth(1).selectOption('asc')
    await expect(page).toHaveURL(/sort=asc/)
  })

  test('navigates to wallet detail from list', async ({ page }) => {
    const walletCard = page.getByText(walletName).first()
    await walletCard.click()
    await expect(page).toHaveURL(/\/app\/wallets\//)
  })

  test('updates wallet details', async ({ page }) => {
    await page.getByText(walletName).first().click()

    const dialog = await openUpdateWalletModal(page)
    await dialog.getByPlaceholder('e.g. Daily Expenses').fill(updatedWalletName)
    await dialog.locator('input[type="number"]').fill('750')
    await selectFirstWalletColor(dialog)
    await dialog.getByRole('button', { name: 'Update' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByText(updatedWalletName)).toBeVisible()
  })

  test('creates a wallet item with valid data', async ({ page }) => {
    await page.getByText(updatedWalletName).first().click()

    const dialog = await openCreateItemModal(page)
    await dialog.getByRole('button', { name: 'Expense' }).click()
    await dialog.locator('input[type="number"]').fill('25')
    await dialog.getByPlaceholder('e.g. Bought groceries').fill(walletItemNote)
    await dialog.locator('input[type="date"]').fill('2024-01-02')
    await dialog.getByRole('button', { name: 'Add' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByText(walletItemNote)).toBeVisible()
  })

  test('shows validation errors when adding a wallet item with invalid data', async ({ page }) => {
    await page.getByText(updatedWalletName).first().click()

    const dialog = await openCreateItemModal(page)
    await dialog.locator('input[type="number"]').fill('0')
    await dialog.getByRole('button', { name: 'Add' }).click()

    await expect(dialog.getByText('Amount must be greater than 0')).toBeVisible()
  })

  test('updates a wallet item', async ({ page }) => {
    await page.getByText(updatedWalletName).first().click()
    const row = page.locator('tbody tr', { hasText: walletItemNote })
    const dialog = await openUpdateItemModal(row)

    await dialog.getByPlaceholder('e.g. Bought groceries').fill(updatedWalletItemNote)
    await dialog.locator('input[type="number"]').fill('30')
    await dialog.getByRole('button', { name: 'Update' }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByText(updatedWalletItemNote)).toBeVisible()
  })

  test('deletes a wallet item', async ({ page }) => {
    await page.getByText(updatedWalletName).first().click()
    const row = page.locator('tbody tr', { hasText: updatedWalletItemNote })
    const dialog = await openDeleteItemModal(row)

    await dialog.getByRole('button', { name: 'Delete' }).click()
    await expect(dialog).toBeHidden()
    await expect(page.getByText(updatedWalletItemNote)).toBeHidden()
  })

  test('filters wallet items and updates query params', async ({ page }) => {
    await page.getByText(updatedWalletName).first().click()

    await page.getByRole('button', { name: 'Expense' }).click()
    await expect(page).toHaveURL(/filter=EXPENSE/)

    await page.getByRole('button', { name: 'Income' }).click()
    await expect(page).toHaveURL(/filter=INCOME/)

    const sortSelect = page.locator('select').first()
    await sortSelect.selectOption('asc')
    await expect(page).toHaveURL(/sort=asc/)
  })

  test('deletes the wallet', async ({ page }) => {
    await page.getByText(updatedWalletName).first().click()

    const dialog = await openDeleteWalletModal(page)
    await dialog.getByRole('button', { name: 'Delete' }).click()

    await expect(page).toHaveURL('/app/wallets')
    await expect(page.getByText(updatedWalletName)).toBeHidden()
  })
})
