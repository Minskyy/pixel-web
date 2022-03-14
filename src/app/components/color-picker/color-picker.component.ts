import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ColorPickerComponent as cPicker } from '@syncfusion/ej2-angular-inputs';
import * as fromRoot from '../../store/root.reducer';
import * as fromPixelTab from '../../pixel-tab/store/pixel-tab.actions';

@Component({
  selector: 'app-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit, AfterViewInit {
  constructor(private store: Store<fromRoot.AppState>) {}
  ngAfterViewInit(): void {
    // TO DO -> move to color picker component?
    this.colorPicker.registerOnChange((color) => {
      this.store.dispatch(
        fromPixelTab.colorPickerColorChanged({ color: color })
      );
    });
  }

  @ViewChild(cPicker) colorPicker: cPicker;
  value: string = '#000000ff';

  ngOnInit(): void {}
}
