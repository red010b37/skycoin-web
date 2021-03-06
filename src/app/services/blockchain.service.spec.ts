import { TestBed, inject } from '@angular/core/testing';

import { BlockchainService } from './blockchain.service';
import { ApiService } from './api.service';
import { WalletService } from './wallet.service';
import { MockApiService, MockWalletService, MockCoinService } from '../utils/test-mocks';
import { CoinService } from './coin.service';

describe('BlockchainService', () => {
  let service: BlockchainService;
  let apiService: ApiService;
  let walletService: WalletService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BlockchainService,
        { provide: ApiService, useClass: MockApiService },
        { provide: WalletService, useClass: MockWalletService },
        { provide: CoinService, useClass: MockCoinService }
      ]
    });
  });

  beforeEach(inject([BlockchainService, ApiService, WalletService], (serv, mockApiService, mockWalletService) => {
    service = serv;
    apiService = mockApiService;
    walletService = mockWalletService;
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
