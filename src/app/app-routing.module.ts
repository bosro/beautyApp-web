// src/app/app-routing.module.ts  (UPDATED)

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {
  AuthGuard,
  GuestGuard,
  ClientGuard,
  BeauticianGuard,
  SettingsGuard,           // ← NEW
} from './core/guards/auth.guard';

const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Auth (public)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
    canActivate: [GuestGuard],
  },

  // Client section
  {
    path: 'client',
    loadChildren: () =>
      import('./features/client/client.module').then((m) => m.ClientModule),
    canActivate: [ClientGuard],
  },

  // Settings — shared by CUSTOMER and BEAUTICIAN
  {
    path: 'settings',
    loadChildren: () =>
      import('./features/settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [SettingsGuard],   // ← was ClientGuard; now allows both roles
  },

  // Beautician section
  {
    path: 'beautician',
    loadChildren: () =>
      import('./features/beautician/beautician.module').then((m) => m.BeauticianModule),
    canActivate: [BeauticianGuard],
  },

  // Catch-all
  { path: '**', redirectTo: '/auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}