// src/app/features/settings/settings.module.ts
// Keep YOUR existing structure — just add the 3 new component declarations

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← ADD: needed for [(ngModel)] in the new components
import { SharedModule } from '@shared/shared.module';
import { RouterModule, Routes } from '@angular/router';

// Existing
import { SettingsLayoutComponent } from './settings-layout/settings-layout.component';

// New components from the previous output
import { NotificationPreferencesComponent } from './notification-preferences/notification-preferences.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { PasswordSecurityComponent } from './password-security/password-security.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsLayoutComponent,
    children: [
      { path: '', redirectTo: 'change-password', pathMatch: 'full' },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'security', component: PasswordSecurityComponent },
      { path: 'notifications', component: NotificationPreferencesComponent },
    ],
  },
];

@NgModule({
  declarations: [
    SettingsLayoutComponent,
    NotificationPreferencesComponent,
    ChangePasswordComponent,
    PasswordSecurityComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,       // ← ADD: required for [(ngModel)] in the new components
    RouterModule.forChild(routes),
    SharedModule,
  ],
})
export class SettingsModule {}