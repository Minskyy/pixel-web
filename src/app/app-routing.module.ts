import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { PixelTabComponent } from './pixel-tab/pixel-tab.component';

const routes: Routes = [
  { path: 'home', component: HomepageComponent },
  { path: 'pixel', component: PixelTabComponent },
  { path: '**', redirectTo: '/home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
