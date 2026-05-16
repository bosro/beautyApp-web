import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "@shared/shared.module";
import { RouterModule, Routes } from "@angular/router";
import { NotificationPreferencesComponent } from "./notification-preferences/notification-preferences.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { PasswordSecurityComponent } from "./password-security/password-security.component";
import { SettingsLayoutComponent } from "./settings-layout/settings-layout.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsLayoutComponent,
    children: [
      { path: "", redirectTo: "change-password", pathMatch: "full" },
      { path: "change-password", component: ChangePasswordComponent },
      { path: "password-security", component: PasswordSecurityComponent },
      {
        path: "notification-preferences",
        component: NotificationPreferencesComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class SettingsModule {}
