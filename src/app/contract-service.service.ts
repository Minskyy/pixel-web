import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AxiosError } from 'axios';
import Web3 from 'web3';
import { contract_abi, contract_address } from '../app/abis/abis';
import * as fromRoot from './store/root.reducer';
import * as fromApp from './store/app.actions';
import { HttpClient } from '@angular/common/http';
import { defer, from } from 'rxjs';
import { AbiItem } from 'web3-utils';

declare const window: any;

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  window: any;
  // web3 = new Web3(
  //   new Web3.providers.HttpProvider(
  //     'https://rinkeby.infura.io/v3/6cde5294a4c743bf8cdfe89b3cec465e'
  //   )
  // );
  web3 = new Web3(window.ethereum);

  constructor(
    private store: Store<fromRoot.AppState>,
    private http: HttpClient
  ) {}

  public mint = async (index: number) => {
    try {
      const contract = new this.web3.eth.Contract(
        contract_abi as AbiItem[],
        contract_address
      );

      const token = await contract.methods
        .buyNftArea(index)
        .send({ from: '0xba215c04cde654e218d7e5f7a40c3d227d6aa481' });
      return token;
    } catch (error) {
      console.log(error);
    }
  };

  public burn = async (index: number) => {
    console.log('BURN', index);

    try {
      const contract = new this.web3.eth.Contract(
        contract_abi as AbiItem[],
        contract_address
      );
      const token = await contract.methods
        .burn(index)
        .send({ from: '0xba215c04cde654e218d7e5f7a40c3d227d6aa481' });
      return token;
    } catch (error) {
      const errorMessage = error;
      console.log(errorMessage);
    }
  };

  public getAccounts = () => {
    return defer(() => from(this.web3.eth.getAccounts()));
  };

  public getNftsInWallet = (address: string) => {
    return this.http.get<number[]>(`/board/getNftsInWallet/${address}`);
  };

  public getTokenPrice = (tokenAddress: string) => {
    return this.http.get<number>(`/board/getTokenPrice/${tokenAddress}`);
  };

  public openMetamask = async () => {
    window.web3 = new Web3(window.ethereum);

    try {
      const addresses = await window.ethereum.enable();
      this.store.dispatch(fromApp.WalletConnected({ address: addresses[0] }));
      return addresses[0];
    } catch (e) {
      return false;
    }
  };
}
