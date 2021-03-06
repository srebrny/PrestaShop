/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */
require('module-alias/register');

const {expect} = require('chai');

const helper = require('@utils/helpers');
const loginCommon = require('@commonTests/loginBO');

// Import pages
const LoginPage = require('@pages/BO/login');
const DashboardPage = require('@pages/BO/dashboard');
const TaxesPage = require('@pages/BO/international/taxes');
const AddTaxPage = require('@pages/BO/international/taxes/add');
const TaxFaker = require('@data/faker/tax');

// Import test context
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_international_localization_taxes_CRUDTax';

let browserContext;
let page;
let numberOfTaxes = 0;
let createTaxData;
let editTaxData;

// Init objects needed
const init = async function () {
  return {
    loginPage: new LoginPage(page),
    dashboardPage: new DashboardPage(page),
    taxesPage: new TaxesPage(page),
    addTaxPage: new AddTaxPage(page),
  };
};
// Create, Update and Delete Tax in BO
describe('Create, Update and Delete Tax in BO', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);

    this.pageObjects = await init();

    createTaxData = await (new TaxFaker());
    editTaxData = await (new TaxFaker({enabled: 'No'}));
  });
  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });
  // Login into BO and go to Taxes page
  loginCommon.loginBO();

  it('should go to Taxes page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToTaxesPage', baseContext);

    await this.pageObjects.dashboardPage.goToSubMenu(
      this.pageObjects.dashboardPage.internationalParentLink,
      this.pageObjects.dashboardPage.taxesLink,
    );

    const pageTitle = await this.pageObjects.taxesPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.taxesPage.pageTitle);
  });

  it('should reset all filters', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFilterFirst', baseContext);

    numberOfTaxes = await this.pageObjects.taxesPage.resetAndGetNumberOfLines();
    await expect(numberOfTaxes).to.be.above(0);
  });

  // 1 : Create tax with data generated from faker
  describe('Create tax in BO', async () => {
    it('should go to add new tax page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToNewTax', baseContext);

      await this.pageObjects.taxesPage.goToAddNewTaxPage();
      const pageTitle = await this.pageObjects.addTaxPage.getPageTitle();
      await expect(pageTitle).to.contains(this.pageObjects.addTaxPage.pageTitleCreate);
    });

    it('should create Tax and check result', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'createTax', baseContext);

      const textResult = await this.pageObjects.addTaxPage.createEditTax(createTaxData);
      await expect(textResult).to.equal(this.pageObjects.addTaxPage.successfulCreationMessage);

      const numberOfTaxesAfterCreation = await this.pageObjects.taxesPage.getNumberOfElementInGrid();
      await expect(numberOfTaxesAfterCreation).to.be.equal(numberOfTaxes + 1);
    });
  });

  // 2 : Update Tax with data generated with faker
  describe('Update Tax Created', async () => {
    it('should go to tax page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToTaxPageToUpdate', baseContext);

      await this.pageObjects.taxesPage.goToSubMenu(
        this.pageObjects.taxesPage.internationalParentLink,
        this.pageObjects.taxesPage.taxesLink,
      );

      const pageTitle = await this.pageObjects.taxesPage.getPageTitle();
      await expect(pageTitle).to.contains(this.pageObjects.taxesPage.pageTitle);
    });

    it('should filter list by tax name', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterByNameToUpdate', baseContext);

      await this.pageObjects.taxesPage.filterTaxes(
        'input',
        'name',
        createTaxData.name,
      );

      const textName = await this.pageObjects.taxesPage.getTextColumnFromTableTaxes(1, 'name');
      await expect(textName).to.contains(createTaxData.name);
    });

    it('should filter list by tax rate', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterByRateToUpdate', baseContext);

      await this.pageObjects.taxesPage.filterTaxes(
        'input',
        'rate',
        createTaxData.rate,
      );

      const textRate = await this.pageObjects.taxesPage.getTextColumnFromTableTaxes(1, 'rate');
      await expect(textRate).to.contains(createTaxData.rate);
    });

    it('should go to edit tax page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToEditPage', baseContext);

      await this.pageObjects.taxesPage.goToEditTaxPage('1');
      const pageTitle = await this.pageObjects.addTaxPage.getPageTitle();
      await expect(pageTitle).to.contains(this.pageObjects.addTaxPage.pageTitleEdit);
    });

    it('should update tax', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'updateTax', baseContext);

      const textResult = await this.pageObjects.addTaxPage.createEditTax(editTaxData);
      await expect(textResult).to.equal(this.pageObjects.taxesPage.successfulUpdateMessage);
    });

    it('should reset all filters', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'resetAfterUpdate', baseContext);

      const numberOfTaxesAfterReset = await this.pageObjects.taxesPage.resetAndGetNumberOfLines();
      await expect(numberOfTaxesAfterReset).to.equal(numberOfTaxes + 1);
    });
  });

  // 3 : Delete Tax created from dropdown Menu
  describe('Delete Tax', async () => {
    it('should go to Taxes page', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'goToTaxPageToDelete', baseContext);

      await this.pageObjects.taxesPage.goToSubMenu(
        this.pageObjects.taxesPage.internationalParentLink,
        this.pageObjects.taxesPage.taxesLink,
      );

      const pageTitle = await this.pageObjects.taxesPage.getPageTitle();
      await expect(pageTitle).to.contains(this.pageObjects.taxesPage.pageTitle);
    });

    it('should filter list by Tax name', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterByNameToDelete', baseContext);

      await this.pageObjects.taxesPage.filterTaxes(
        'input',
        'name',
        editTaxData.name,
      );

      const textName = await this.pageObjects.taxesPage.getTextColumnFromTableTaxes(1, 'name');
      await expect(textName).to.contains(editTaxData.name);
    });

    it('should filter list by tax rate', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'filterByRateToDelete', baseContext);
      await this.pageObjects.taxesPage.filterTaxes(
        'input',
        'rate',
        editTaxData.rate,
      );
      const textRate = await this.pageObjects.taxesPage.getTextColumnFromTableTaxes(1, 'rate');
      await expect(textRate).to.contains(editTaxData.rate);
    });

    it('should delete Tax', async function () {
      await testContext.addContextItem(this, 'testIdentifier', 'deleteTax', baseContext);

      const textResult = await this.pageObjects.taxesPage.deleteTax('1');
      await expect(textResult).to.equal(this.pageObjects.taxesPage.successfulDeleteMessage);

      const numberOfTaxesAfterDelete = await this.pageObjects.taxesPage.resetAndGetNumberOfLines();
      await expect(numberOfTaxesAfterDelete).to.be.equal(numberOfTaxes);
    });
  });
});
