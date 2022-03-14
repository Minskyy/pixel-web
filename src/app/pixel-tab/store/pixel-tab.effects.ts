import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import axios from 'axios';
import { concatMap, map, mergeMap, switchMap } from 'rxjs';
import { ContractService } from 'src/app/contract-service.service';
import { PixelTabFacadeService } from './pixel-tab-facade.service';
import * as fromPixelTab from './pixel-tab.actions';
import { BackendServiceService } from 'src/app/backend-service.service';

@Injectable()
export class PixelTabEffects {
  constructor(
    private actions$: Actions,
    private contractService: ContractService,
    private backendService: BackendServiceService,
    private pixelFacadeService: PixelTabFacadeService
  ) {}

  nftsInWallet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromPixelTab.getNFTsInWallet),
      switchMap((payload) =>
        this.contractService
          .getNftsInWallet(payload.address)
          .pipe(
            map((data) =>
              fromPixelTab.getNFTsInWalletSuccess({ nftsInWallet: data })
            )
          )
      )
    )
  );

  tokenPrice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromPixelTab.getTokenPrice),
      switchMap((payload) =>
        this.contractService
          .getTokenPrice(payload.tokenAddress)
          .pipe(
            map((tokenPrice) =>
              fromPixelTab.getTokenPriceSuccess({ tokenPrice: tokenPrice })
            )
          )
      )
    )
  );

  commitPixels$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromPixelTab.commitPixels),
      switchMap((payload) =>
        this.backendService
          .commitPixels(payload.pixels)
          .pipe(map(() => fromPixelTab.commitPixelsSuccess()))
      )
    )
  );

  getBoardBuffer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromPixelTab.getBoardBuffer),
      switchMap(() =>
        this.backendService.getBoardBuffer().pipe(
          map((boardBuffer) =>
            fromPixelTab.getBoardBufferSuccess({
              boardBuffer: boardBuffer,
            })
          )
        )
      )
    )
  );
}
