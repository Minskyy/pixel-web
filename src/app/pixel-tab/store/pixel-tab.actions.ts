import { createAction, props } from '@ngrx/store';

export const CanvasClicked = createAction(
  '[PIXEL-TAB] Commit Pixels',
  props<{ pixelobj: { [key: number]: number } }>()
);

export const getNFTsInWallet = createAction(
  '[PIXEL-TAB] Get NFTs in Wallet',
  props<{ address: string }>()
);
export const getNFTsInWalletSuccess = createAction(
  '[PIXEL-TAB] Get NFTs in Wallet Success',
  props<{ nftsInWallet: number[] }>()
);

export const getTokenPrice = createAction(
  '[PIXEL-TAB] Get Token Price',
  props<{ tokenAddress: string }>()
);

export const getTokenPriceSuccess = createAction(
  '[PIXEL-TAB] Get Token Price Success',
  props<{ tokenPrice: number }>()
);

export const getNFTsInWalletStart = createAction(
  '[PIXEL-TAB] Get NFTs in Wallet - Start',
  props<{ address: string }>()
);

export const colorPickerColorChanged = createAction(
  '[PIXEL-TAB] Color Changed',
  props<{ color: string }>()
);

export const changeBrushSize = createAction(
  '[PIXEL-TAB] Change Brush Size',
  props<{ size: number }>()
);

export const addPixelsToCommit = createAction(
  '[PIXEL-TAB] Add Pixels to Commit',
  props<{ pixels: { [key: number]: number } }>()
);

export const commitPixels = createAction(
  '[PIXEL-TAB] Commit Pixels',
  props<{ pixels: { [key: number]: number } }>()
);

export const commitPixelsSuccess = createAction(
  '[PIXEL-TAB] Commit Pixels Success'
);

export const getBoardBuffer = createAction('[PIXEL-TAB] Get Board Buffer');

export const getBoardBufferSuccess = createAction(
  '[PIXEL-TAB] Get Board Buffer Success',
  props<{ boardBuffer: ArrayBuffer }>()
);
