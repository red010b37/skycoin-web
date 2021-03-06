import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material';
import * as Bip39 from 'bip39';

import { WalletService } from '../../../../services/wallet.service';
import { DoubleButtonActive } from '../../../layout/double-button/double-button.component';
import { OnboardingDisclaimerComponent } from './onboarding-disclaimer/onboarding-disclaimer.component';
import { OnboardingSafeguardComponent } from './onboarding-safeguard/onboarding-safeguard.component';
import { CoinService } from '../../../../services/coin.service';
import { BaseCoin } from '../../../../coins/basecoin';
import { LanguageService } from '../../../../services/language.service';
import { openChangeLanguageModal } from '../../../../utils';

@Component({
  selector: 'app-onboarding-create-wallet',
  templateUrl: './onboarding-create-wallet.component.html',
  styleUrls: ['./onboarding-create-wallet.component.scss'],
})
export class OnboardingCreateWalletComponent implements OnInit {
  @ViewChild('create') createButton;

  showNewForm = true;
  form: FormGroup;
  doubleButtonActive = DoubleButtonActive.LeftButton;
  haveWallets = false;
  isWalletCreating = false;
  haveManyCoins: boolean;

  private currentCoin: BaseCoin;

  constructor(
    private dialog: MatDialog,
    private walletService: WalletService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private coinService: CoinService,
    private languageService: LanguageService
  ) { }

  ngOnInit() {
    this.existWallets();
    this.haveManyCoins = this.coinService.coins.length > 1;
    this.currentCoin = this.coinService.currentCoin.getValue();
    this.initForm();
  }

  changeForm(newState) {
    newState === DoubleButtonActive.RightButton ? this.showNewForm = false : this.showNewForm = true;
    this.initForm();
  }

  showLanguageModal() {
    setTimeout(() => {
      openChangeLanguageModal(this.dialog, true)
        .subscribe(response => {
          if (response) {
            this.languageService.changeLanguage(response);
          }
          this.showDisclaimer();
        });
    }, 0);
  }

  showDisclaimer() {
    this.dialog.open(OnboardingDisclaimerComponent, this.createDialogConfig(true));
  }

  showSafe() {
    this.dialog.open(OnboardingSafeguardComponent, this.createDialogConfig()).afterClosed().subscribe(result => {
      if (result) {
        this.createWallet();
      }
    });
  }

  loadWallet() {
    this.createWallet();
  }

  skip() {
    this.router.navigate(['/wallets']);
  }

  private existWallets() {
    this.walletService.haveWallets.first().subscribe(result => {
      if (!result) {
        this.haveWallets = false;
        this.showLanguageModal();
      } else {
        this.haveWallets = true;
      }
    });
  }

  private initForm() {
    this.form = this.formBuilder.group({
        label: new FormControl('', [ Validators.required ]),
        coin: new FormControl(this.currentCoin, [ Validators.required ]),
        seed: new FormControl('', [ Validators.required ]),
        confirm_seed: new FormControl()
      },
      {
        validator: this.showNewForm ? this.seedMatchValidator.bind(this) : null
      }
    );

    if (this.showNewForm) {
      this.generateSeed(128);
    }
  }

  private generateSeed(entropy: number) {
    this.form.controls.seed.setValue(Bip39.generateMnemonic(entropy));
  }

  private createWallet() {
    this.createButton.setLoading();
    this.isWalletCreating = true;
    const coinToCreate: BaseCoin = this.form.value.coin;

    this.walletService.create(this.form.value.label, this.form.value.seed, coinToCreate.id)
      .subscribe(
        () => this.onCreateSuccess(coinToCreate),
        (error) => this.onCreateError(error.message)
      );
  }

  private seedMatchValidator(g: FormGroup) {
    return g.get('seed').value === g.get('confirm_seed').value ? null : { NotEqual: true };
  }

  private onCreateSuccess(coin: BaseCoin) {
    this.createButton.setSuccess();
    this.skip();
    this.isWalletCreating = false;

    if (coin.id !== this.currentCoin.id) {
      this.coinService.changeCoin(coin);
    }
  }

  private onCreateError(errorMesasge: string) {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    this.snackBar.open(errorMesasge, null, config);

    this.createButton.setError(errorMesasge);
    this.isWalletCreating = false;
  }

  private createDialogConfig(disableClose = false) {
    const config = new MatDialogConfig();
    config.width = '450px';
    config.disableClose = disableClose;
    return config;
  }
}
