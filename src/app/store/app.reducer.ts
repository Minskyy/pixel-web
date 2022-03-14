import { Action, createReducer, createSelector, on } from '@ngrx/store';
import * as AppActions from './app.actions';

const initialState: State = {
  connectedAccount: '',
  isLoading: true,
  nftIDs: [],
};

export interface State {
  connectedAccount: string;
  isLoading: boolean;
  nftIDs: number[];
}

const reducer = createReducer(
  initialState,
  on(AppActions.WalletConnected, (state, action) => {
    return {
      ...state,
      connectedAccount: action.address,
    };
  }),
  on(AppActions.getAccounts, (state, action) => {
    return {
      ...state,
      isLoading: true,
    };
  }),
  on(AppActions.getAccountsSuccess, (state, action) => {
    return {
      ...state,
      connectedAccount: action.address,
      isLoading: false,
    };
  })
);

export const selectConnectedAccount = (state: State) => state.connectedAccount;

export function appReducer(state: State = initialState, action: Action) {
  return reducer(state, action);
}
