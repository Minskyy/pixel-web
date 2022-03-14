import { ActionReducerMap } from '@ngrx/store';
import * as fromCanvas from '../canvas/store/canvas.reducer';
import * as fromApp from './app.reducer';
import * as fromPixelTab from '../pixel-tab/store/pixel-tab.reducer';

export interface AppState {
  canvas: fromCanvas.State;
  app: fromApp.State;
  pixelTab: fromPixelTab.State;
}

export const rootReducer: ActionReducerMap<AppState> = {
  canvas: fromCanvas.canvasReducer,
  app: fromApp.appReducer,
  pixelTab: fromPixelTab.pixelTabReducer,
};
