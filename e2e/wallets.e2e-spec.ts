import { browser } from 'protractor';

import { WalletsPage } from './wallets.po';

describe('Wallets', () => {
  let page: WalletsPage;

  beforeAll(async() => {
    await browser.executeScript(
      `window.localStorage.setItem(\'wallets\',
      JSON.stringify([{"label":"Test wallet","addresses":
      [{"address":"2EzqAbuLosF47Vm418kYo2rnMgt6XgGaA1Z"}]}]) );`);

    page = new WalletsPage();
    await page.navigateTo();
  });

  afterAll(() => {
    browser.executeScript('window.localStorage.clear();');
  });

  it('should display title', () => {
    expect<any>(page.getHeaderText()).toEqual('Wallets');
  });

  it('should show create wallet', () => {
    expect<any>(page.showAddWallet()).toEqual(true);
  });

  it('should validate create wallet, seed mismatch', () => {
    expect<any>(page.createWalletCheckValidationSeed()).toEqual(false);
  });

  it('should validate create wallet, empty label', () => {
    expect<any>(page.createWalletCheckValidationLabel()).toEqual(false);
  });

  it('should create wallet', () => {
    expect<any>(page.createWallet()).toEqual(true);
  });

  it('should show load wallet', () => {
    expect<any>(page.showLoadWallet()).toEqual(true);
  });

  it('should validate load wallet, seed', () => {
    expect<any>(page.loadWalletCheckValidationSeed()).toEqual(false);
  });

  it('should validate load wallet, empty label', () => {
    expect<any>(page.loadWalletCheckValidationLabel()).toEqual(false);
  });

  it('should load wallet', () => {
    expect<any>(page.loadWallet()).toEqual(true);
  });

  it('should expand wallet', () => {
    expect<any>(page.expandWallet()).toEqual(true);
  });

  it('should show wallet QR modal', () => {
    expect<any>(page.showQrDialog()).toEqual(true);
  });

  it('should hide wallet QR modal', () => {
    expect<any>(page.hideQrDialog()).toEqual(false);
  });

  it('should add address to wallet', () => {
    expect<any>(page.addAddress()).toEqual(true);
  });

  it('should hide empty address', () => {
    expect<any>(page.hideEmptyAddress()).toEqual(0);
  });

  it('should show empty address', () => {
    expect<any>(page.showEmptyAddress()).toEqual(true);
  });

  it('should show change wallet name modal', () => {
    expect<any>(page.showChangeWalletName()).toEqual(true);
  });

  it('should change wallet name', () => {
    expect<any>(page.changeWalletName()).toEqual(true);
  });

  it('should display price information', () => {
    expect<any>(page.showPriceInformation()).toEqual(true);
  });

  it('should decrypt wallet', async() => {
    await page.navigateTo();
    expect<any>(page.canUnlock()).toEqual(true);
  });
});
