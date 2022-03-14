import { createAction, props } from '@ngrx/store';

export const WalletConnected = createAction(
  '[APP] Wallet Connected',
  props<{ address: string }>()
);

export const getAccounts = createAction('[APP] Get Accounts');
export const getAccountsLoading = createAction('[APP] Get Accounts Loading');

export const getAccountsSuccess = createAction(
  '[APP] Get Accounts Success',
  props<{ address: string }>()
);
