import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ToastComponent } from "./components/toast/toast.component";
import { ConfirmModalComponent } from "./components/confirm-modal/confirm-modal.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { StarRatingComponent } from "./components/star-rating/star-rating.component";
import { EmptyStateComponent } from "./components/empty-state/empty-state.component";
import { ChangePasswordComponent } from "../features/settings/change-password/change-password.component";
import { PasswordSecurityComponent } from "../features/settings/password-security/password-security.component";
import { NotificationPreferencesComponent } from "../features/settings/notification-preferences/notification-preferences.component";
import { SettingsLayoutComponent } from "../features/settings/settings-layout/settings-layout.component";



@NgModule({
  declarations: [
    ToastComponent,
    ConfirmModalComponent,
    SpinnerComponent,
    StarRatingComponent,
    EmptyStateComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ToastComponent,
    ConfirmModalComponent,
    SpinnerComponent,
    StarRatingComponent,
    EmptyStateComponent,
  ],
})
export class SharedModule {}
