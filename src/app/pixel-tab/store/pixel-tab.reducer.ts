import { Action, createReducer, on } from '@ngrx/store';
import * as PixelTabActions from './pixel-tab.actions';

const initialState: State = {
  chosenColor: '#000000ff',
  brushSize: 1,
  pixelsToCommit: {},
  nftsInWallet: [],
  tokenPrice: 0,
  boardBuffer: new ArrayBuffer(0),
};

export interface State {
  chosenColor: string;
  brushSize: number;
  pixelsToCommit: { [key: number]: number };
  nftsInWallet: number[];
  tokenPrice: number;
  boardBuffer: ArrayBuffer;
}

const reducer = createReducer(
  initialState,
  on(PixelTabActions.colorPickerColorChanged, (state, action) => {
    return {
      ...state,
      chosenColor: action.color,
    };
  }),
  on(PixelTabActions.changeBrushSize, (state, action) => {
    return {
      ...state,
      brushSize: action.size,
    };
  }),
  on(PixelTabActions.addPixelsToCommit, (state, action) => {
    return {
      ...state,
      pixelsToCommit: {
        ...state.pixelsToCommit,
        ...action.pixels,
      },
    };
  }),
  on(PixelTabActions.commitPixelsSuccess, (state, action) => {
    return {
      ...state,
      pixelsToCommit: {},
    };
  }),
  on(PixelTabActions.getBoardBufferSuccess, (state, action) => {
    return {
      ...state,
      boardBuffer: action.boardBuffer,
      tokenPrice: action.boardBuffer.byteLength,
    };
  }),
  on(PixelTabActions.getNFTsInWalletSuccess, (state, action) => {
    return {
      ...state,
      nftsInWallet: action.nftsInWallet,
    };
  }),
  on(PixelTabActions.getTokenPriceSuccess, (state, action) => {
    return {
      ...state,
      tokenPrice: action.tokenPrice,
    };
  })
);

export function pixelTabReducer(state: State = initialState, action: Action) {
  return reducer(state, action);
}
