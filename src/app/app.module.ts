import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { CanvasComponent } from './canvas/canvas.component';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { PixelTabComponent } from './pixel-tab/pixel-tab.component';
import * as fromApp from './store/app.reducer';
import * as fromRoot from './store/root.reducer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EffectsModule } from '@ngrx/effects';
import { PixelTabEffects } from './pixel-tab/store/pixel-tab.effects';
import { WithLoadingPipe } from './utils/with-loading.pipe';
import { HomepageComponent } from './homepage/homepage.component';
import { AppEffects } from './store/app.effects';

@NgModule({
  declarations: [
    AppComponent,
    ColorPickerComponent,
    CanvasComponent,
    PixelTabComponent,
    WithLoadingPipe,
    HomepageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerModule,
    HttpClientModule,
    EffectsModule.forRoot([PixelTabEffects, AppEffects]),
    StoreModule.forRoot(fromRoot.rootReducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
