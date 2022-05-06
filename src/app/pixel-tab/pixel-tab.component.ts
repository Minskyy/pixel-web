import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ContractService } from '../contract-service.service';
import * as fromRoot from '../store/root.reducer';
import { PixelTabFacadeService } from './store/pixel-tab-facade.service';
import * as fromPixelTab from './store/pixel-tab.reducer';
import * as fromCanvas from '../canvas/store/canvas.reducer';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-pixel-tab',
  templateUrl: './pixel-tab.component.html',
  styleUrls: ['./pixel-tab.component.scss'],
})
export class PixelTabComponent implements OnInit, OnDestroy {
  pixelTab$: Observable<fromPixelTab.State>;
  canvas$: Observable<fromCanvas.State>;

  nftPrice: string;

  tokenPrice: string;
  nftIDsInWallet: number[];

  pixelTabSub: Subscription;

  formSub: Subscription | undefined;

  clickedAreaIndex: number;
  drawModeEnabled: boolean;
  eraserMode: boolean;
  constructor(
    private contractService: ContractService,
    private pixelTabFacade: PixelTabFacadeService,
    public fb: FormBuilder
  ) {
    this.pixelTab$ = this.pixelTabFacade.pixelTab$;
    this.canvas$ = this.pixelTabFacade.canvas$;
  }

  brushSizeForm = this.fb.group({
    brushSize: '1',
  });

  toggleEraser() {
    this.eraserMode = !this.eraserMode;
  }

  ngOnDestroy(): void {
    this.pixelTabSub.unsubscribe();
    this.formSub?.unsubscribe();
  }
  ngOnInit(): void {
    this.formSub = this.brushSizeForm
      .get('brushSize')
      ?.valueChanges.subscribe((val) => {
        console.log('val', val);

        this.pixelTabFacade.changeBrushSize(parseInt(val));
      });

    this.pixelTabFacade.getNftsInWallet();

    this.pixelTabFacade.getTokenPrice();

    this.pixelTabSub = this.pixelTab$.subscribe((state) => {
      this.nftIDsInWallet = [1,2,3,4];
      // this.nftIDsInWallet = state.nftsInWallet;
      console.log('this', this.nftIDsInWallet);
      
      this.tokenPrice = state.tokenPrice.toFixed(3);
      this.nftPrice = (state.tokenPrice * 40).toFixed(3);
    });
  }
  /**
   * Sends the pixels to commit to the backend
   */
  commitPixels() {
    this.pixelTabFacade.commitPixels();
  }

  changeBrushSize(size: number) {
    this.pixelTabFacade.changeBrushSize(size);
  }

  // Blockchain methods
  burnNft() {
    this.canvas$.pipe(take(1)).subscribe((state) => {
      this.contractService.burn(state.clickedAreaIndex).then((res) => {
        console.log('res', res);
      });
    });
  }

  mintNft() {
    this.canvas$.pipe(take(1)).subscribe((state) => {
      this.contractService.mint(state.clickedAreaIndex).then((res) => {
        console.log('res', res);
      });
    });
  }
}
