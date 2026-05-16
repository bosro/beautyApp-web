import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";

import { BeauticianLayoutComponent } from "./beautician-layout/beautician-layout.component";
import { BeauticianDashboardComponent } from "./dashboard/dashboard.component";
import { BeauticianBookingsComponent } from "./bookings/bookings.component";
import { BeauticianServicesComponent } from "./services/services.component";
import { AddEditServiceComponent } from "./add-edit-service/add-edit-service.component";
import { ScheduleComponent } from "./schedule/schedule.component";
import { EarningsComponent } from "./earnings/earnings.component";
import { BeauticianReviewsComponent } from "./reviews/reviews.component";
import { ClientsComponent } from "./clients/clients.component";
import { BeauticianProfileComponent } from "./profile/profile.component";
import { BusinessProfileComponent } from "./business-profile/business-profile.component";
import { BookingDetailsComponent } from "./booking-details/booking-details.component";
import { ClientDetailsComponent } from "./client-details/client-details.component";
import { PrivacyPolicyComponent } from "./privacy-policy/privacy-policy.component";
import { TermsConditionsComponent } from "./terms-conditions/terms-conditions.component";
import { CustomerServiceComponent } from "./customer-service/customer-service.component";
import { BeauticianVerificationComponent } from './beautician-verification/beautician-verification.component';

const routes: Routes = [
  {
    path: "",
    component: BeauticianLayoutComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: BeauticianDashboardComponent },
      { path: "bookings", component: BeauticianBookingsComponent },
      { path: "schedule", component: ScheduleComponent },
      { path: "earnings", component: EarningsComponent },
      { path: "reviews", component: BeauticianReviewsComponent },
      { path: "clients", component: ClientsComponent },
      { path: "profile", component: BeauticianProfileComponent },
      { path: "business-profile", component: BusinessProfileComponent },
      { path: "privacy-policy", component: PrivacyPolicyComponent },
      { path: "terms", component: TermsConditionsComponent },
      { path: "support", component: CustomerServiceComponent },
      { path: "services", component: BeauticianServicesComponent },
      { path: "services/add", component: AddEditServiceComponent },
      { path: "services/edit/:id", component: AddEditServiceComponent },
      { path: "clients/:id", component: ClientDetailsComponent },
      { path: "bookings/:id", component: BookingDetailsComponent },
    ],
  },
];

@NgModule({
  declarations: [
    BeauticianLayoutComponent,
    BeauticianDashboardComponent,
    BeauticianBookingsComponent,
    BeauticianServicesComponent,
    AddEditServiceComponent,
    ScheduleComponent,
    EarningsComponent,
    BeauticianReviewsComponent,
    ClientsComponent,
    BeauticianProfileComponent,
    BusinessProfileComponent,
    BookingDetailsComponent,
    ClientDetailsComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    CustomerServiceComponent,
    BeauticianVerificationComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class BeauticianModule {}
