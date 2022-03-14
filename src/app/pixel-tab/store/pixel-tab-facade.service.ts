import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import * as fromRoot from '../../store/root.reducer';
import * as fromPixelTab from './pixel-tab.actions';

@Injectable({
  providedIn: 'root',
})
export class PixelTabFacadeService {
  constructor(private store: Store<fromRoot.AppState>) {}

  pixelTab$ = this.store.select('pixelTab');
  canvas$ = this.store.select('canvas');

  changeBrushSize(size: number) {
    this.store.dispatch(fromPixelTab.changeBrushSize({ size }));
  }

  getNftsInWallet() {
    this.store.dispatch(
      fromPixelTab.getNFTsInWallet({
        address: '0xbA215C04Cde654e218D7E5f7a40c3D227D6aA481',
      })
    );
  }

  getTokenPrice() {
    this.store.dispatch(
      fromPixelTab.getTokenPrice({
        tokenAddress: '0xb27adaffb9fea1801459a1a81b17218288c097cc',
      })
    );
  }

  commitPixels() {
    this.pixelTab$.pipe(take(1)).subscribe((state) => {
      this.store.dispatch(
        fromPixelTab.commitPixels({ pixels: state.pixelsToCommit })
      );
    });
  }

  getBoardBuffer() {
    this.store.dispatch(fromPixelTab.getBoardBuffer());
  }
}
