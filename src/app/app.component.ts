import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ContractService } from './contract-service.service';
import * as fromRoot from './store/root.reducer';
import * as fromApp from './store/app.actions';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { selectConnectedAccount } from './store/app.reducer';
import { Location } from '@angular/common';
declare let window: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  connectedAccount: string;
  connectedAccountObs: Observable<string> = this.store.select(
    (state) => state.app.connectedAccount
  );
  obs: Observable<string>;
  isLoading: boolean;
  activeId: any = '/home';
  pathSub: Subscription;

  async onClickConnect() {
    const address = await this.contractService.openMetamask();

    this.store.dispatch(fromApp.getAccounts());
  }
  constructor(
    private contractService: ContractService,
    private store: Store<fromRoot.AppState>,
    private location: Location
  ) {}
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.location.onUrlChange((url) => {
      this.activeId = url;
    });

    const ethereum = window.ethereum;

    if (typeof ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
    }
    this.store.dispatch(fromApp.getAccounts());

    this.obs = this.store.select((state) => state.app.connectedAccount);
    this.store.select('app').subscribe((state) => {
      this.connectedAccount = state.connectedAccount;
    });

    this.store.select('app').subscribe((state) => {
      this.isLoading = state.isLoading;
    });
  }
  title = 'bsc-place';

  get path() {
    return this.location.path();
  }
}
