import { test, expect, Page } from '@playwright/test'

const VALID_ACCOUNT = {
  email: 'ipsum@sample.com',
  password: 'Admin123!',
}

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

const getOverviewFilters = (page: Page) => {
  return page
    .locator('div.grid')
    .filter({ has: page.getByText('Show archived') })
    .first()
}

const getWalletFilters = (page: Page) => {
  return page.locator('#wallet-list-section')
}

const getWalletListCards = (page: Page) => {
  return page.locator('div.grid.grid-rows-5').locator('div.card')
}

const getPerWalletFilters = (page: Page) => {
  return page.locator('#per-wallet-section + *')
}

test.describe.serial('Dashboard Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(getWalletFilters(page).getByText('Wallets')).toBeVisible()
  })

  test('filters months, years, and archived wallets', async ({ page }) => {
    const overviewFilters = getOverviewFilters(page)
    const selects = overviewFilters.locator('select')
    const monthSelect = selects.first()
    const yearSelect = selects.nth(1)
    const currentYear = new Date().getFullYear()

    await monthSelect.selectOption('3')
    await expect(page).toHaveURL(/month=3/)

    await yearSelect.selectOption(String(currentYear))
    await expect(page).toHaveURL(new RegExp(`year=${currentYear}`))

    const archivedCheckbox = overviewFilters.locator('input[type="checkbox"]')
    await archivedCheckbox.check()
    await expect(page).toHaveURL(/include_archived=true/)
  })

  test('shows overview stats totals', async ({ page }) => {
    const totalBalance = page.getByText('Total Balance').locator('..')
    const totalIncome = page.getByText('Total Income').locator('..')
    const totalExpenses = page.getByText('Total Expenses').locator('..')

    await expect(totalBalance).toContainText(/\d/)
    await expect(totalIncome).toContainText(/\d/)
    await expect(totalExpenses).toContainText(/\d/)
  })

  test('renders wallet overview list with name and balance', async ({ page }) => {
    const walletCard = getWalletListCards(page).first()
    await expect(walletCard).toBeVisible()
    await expect(walletCard).toContainText('Balance')
  })

  test('paginates wallet overview list', async ({ page }) => {
    const paginationButtons = page.locator('button.join-item')
    const nextButton = paginationButtons.nth(2)
    await expect(nextButton).toBeVisible()
    await expect(nextButton).toBeEnabled()

    await nextButton.click()
    await expect(page).toHaveURL(/page=2/)

    const prevButton = paginationButtons.first()
    await prevButton.click()
    await expect(page).toHaveURL(/page=1/)
  })

  test('filters wallet overview by sort and direction', async ({ page }) => {
    const walletFilters = getWalletFilters(page)
    const selects = walletFilters.locator('select')
    const sortBySelect = selects.first()
    const sortSelect = selects.nth(1)

    await sortBySelect.selectOption('name')
    await expect(page).toHaveURL(/sortBy=name/)

    await sortSelect.selectOption('asc')
    await expect(page).toHaveURL(/sort=asc/)
  })

  test('displays per-wallet stats and transactions after selection', async ({ page }) => {
    const walletCard = getWalletListCards(page).first()
    await walletCard.click()

    await expect(page.locator('#per-wallet-section')).toBeVisible()
    const perWalletStats = page
      .locator('#per-wallet-section')
      .locator('xpath=following::*[contains(@class, "stats")]')

    const netStats = perWalletStats.first()
    await expect(netStats.getByText('Balance')).toBeVisible()
    await expect(netStats.getByText('Income')).toBeVisible()
    await expect(netStats.getByText('Expense')).toBeVisible()
    await expect(netStats.getByText('Net')).toBeVisible()

    const transactionStats = perWalletStats.nth(1)
    await expect(transactionStats.getByText('Avg Transaction')).toBeVisible()
    await expect(transactionStats.getByText('Largest')).toBeVisible()
    await expect(transactionStats.getByText('Smallest')).toBeVisible()
  })

  test('filters per-wallet by month, year, type, and granularity', async ({ page }) => {
    const walletCard = getWalletListCards(page).first()
    await walletCard.click()

    const perWalletFilters = getPerWalletFilters(page)
    await expect(perWalletFilters).toBeVisible()
    const selects = perWalletFilters.locator('select')
    const monthSelect = selects.first()
    const yearSelect = selects.nth(1)
    const typeSelect = selects.nth(2)
    const granularitySelect = selects.nth(3)
    const currentYear = new Date().getFullYear()

    await monthSelect.selectOption('2')
    await expect(page).toHaveURL(/month=2/)

    await yearSelect.selectOption(String(currentYear))
    await expect(page).toHaveURL(new RegExp(`year=${currentYear}`))

    await typeSelect.selectOption('EXPENSE')
    await expect(page).toHaveURL(/type=EXPENSE/)

    await granularitySelect.selectOption('week')
    await expect(page).toHaveURL(/granularity=week/)
  })

  test('shows the per-wallet section after selection', async ({ page }) => {
    const walletCard = getWalletListCards(page).first()
    await walletCard.click()

    await expect(page.locator('#per-wallet-section')).toBeVisible()
    await expect(page.getByText('Select a wallet')).toBeHidden()
  })
})
