import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  openPancakeSwap() {
    window.open(
      'https://pancakeswap.finance/swap?outputCurrency=0x1f8a1efbf6247139fb9cbdb9d4dea34e3d18c20a',
      '_blank'
    );
  }
}
