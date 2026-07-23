// public.module.ts
//
// The unauthenticated entry point of the app. No guard — anyone can land
// here and browse. Actions that need a session route to /auth/login.

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { PublicHomeComponent } from './public-home/public-home.component';
import { PublicSalonComponent } from './public-salon/public-salon.component';

const routes: Routes = [
  { path: '', component: PublicHomeComponent },
  { path: 'salon/:id', component: PublicSalonComponent },
];

@NgModule({
  declarations: [PublicHomeComponent, PublicSalonComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class PublicModule {}
