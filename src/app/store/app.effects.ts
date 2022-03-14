import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatMap, map, mergeMap, switchMap } from 'rxjs';
import { ContractService } from 'src/app/contract-service.service';
import * as fromApp from './app.actions';

@Injectable()
export class AppEffects {
  constructor(
    private actions$: Actions,
    private contractService: ContractService
  ) {}

  getAccounts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromApp.getAccounts),
      switchMap(() =>
        this.contractService
          .getAccounts()
          .pipe(
            map((addresses) =>
              fromApp.getAccountsSuccess({ address: addresses[0] })
            )
          )
      )
    )
  );
}
