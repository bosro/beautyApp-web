// onboarding.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OnboardingGuard } from '../../core/guards/auth.guard';

import { OnboardingComponent } from './onboarding.component';

const routes: Routes = [
  { path: '', component: OnboardingComponent, canActivate: [OnboardingGuard] },
];

@NgModule({
  declarations: [OnboardingComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class OnboardingModule {}
