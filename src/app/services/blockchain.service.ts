import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/takeWhile';

import { ApiService } from './api.service';
import { WalletService } from './wallet.service';
import { ConnectionError } from '../enums/connection-error.enum';
import { CoinService } from './coin.service';

export enum ProgressStates {
  Progress,
  Error,
  Restating,
}

export class ProgressEvent {
  state: ProgressStates;
  error?: ConnectionError;
  currentBlock?: number;
  highestBlock?: number;
}

@Injectable()
export class BlockchainService {
  private progressSubject: BehaviorSubject<ProgressEvent> = new BehaviorSubject<ProgressEvent>(null);
  private connectionsSubscription: Subscription;
  private readonly defaultPeriod = 90000;
  private readonly fastPeriod = 5000;

  get progress(): Observable<ProgressEvent> {
    return this.progressSubject.asObservable();
  }

  constructor (
    private apiService: ApiService,
    private walletService: WalletService,
    coinService: CoinService
  ) {
    coinService.currentCoin.subscribe(() => {
      this.startCheckingNode();
    });
  }

  lastBlock(): Observable<any> {
    return this.apiService.get('last_blocks', { num: 1 })
      .map(response => response.blocks[0]);
  }

  coinSupply(): Observable<any> {
    return this.apiService.get('coinSupply');
  }

  private startCheckingNode() {
    if (!!this.connectionsSubscription && !this.connectionsSubscription.closed) {
      this.connectionsSubscription.unsubscribe();
    }

    this.walletService.cancelPossibleBalanceRefresh();

    this.progressSubject.next({ state: ProgressStates.Restating });

    this.connectionsSubscription = this.checkConnectionState()
      .filter(status => !!status)
      .subscribe(
        () => this.checkBlockchainProgress(0),
        () => this.onLoadBlockchainError()
      );
  }

  private checkBlockchainProgress(delay: number) {
    this.connectionsSubscription = Observable.of(1)
      .delay(delay)
      .flatMap(() => this.getBlockchainProgress())
      .subscribe(
        (response: any) => this.onBlockchainProgress(response),
        () => this.onLoadBlockchainError()
      );
  }

  private getBlockchainProgress() {
    return this.apiService.get('blockchain/progress');
  }

  private onBlockchainProgress(response: any) {
    this.progressSubject.next({
      state: ProgressStates.Progress,
      currentBlock: response.current,
      highestBlock: response.highest
    });

    if (response.current !== response.highest) {
      this.checkBlockchainProgress(
        response.highest - response.current <= 5 ? this.fastPeriod : this.defaultPeriod
      );
    } else {
      this.walletService.loadBalances();
    }
  }

  private onLoadBlockchainError(error: ConnectionError = ConnectionError.UNAVAILABLE_BACKEND) {
    this.progressSubject.next({ state: ProgressStates.Error, error: error });
  }

  private checkConnectionState(): Observable<any> {
    return this.apiService.get('network/connections')
      .map((status: any) => {
        if (!status.connections || status.connections.length === 0) {
          this.onLoadBlockchainError(ConnectionError.NO_ACTIVE_CONNECTIONS);
          return null;
        }

        return status;
      });
  }
}
