import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AuthLayoutComponent } from './auth-layout/auth-layout.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { BeauticianRegisterComponent } from './beautician-register/beautician-register.component';
import { BeauticianVerificationComponent } from './beautician-verification/beautician-verification.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'verify', component: VerificationComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'new-password', component: NewPasswordComponent },
      { path: 'beautician-register', component: BeauticianRegisterComponent },
      { path: 'beautician-verify', component: BeauticianVerificationComponent },
    ],
  },
];

@NgModule({
  declarations: [
    AuthLayoutComponent,
    LoginComponent,
    RegisterComponent,
    VerificationComponent,
    ForgotPasswordComponent,
    NewPasswordComponent,
    BeauticianRegisterComponent,
    BeauticianVerificationComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
