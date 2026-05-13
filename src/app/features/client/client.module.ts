import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../../shared/shared.module";

import { ClientLayoutComponent } from "./client-layout/client-layout.component";
import { HomeComponent } from "./home/home.component";
import { DiscoverComponent } from "./discover/discover.component";
import { BookingsComponent } from "./bookings/bookings.component";
import { BookingDetailsComponent } from "./booking-details/booking-details.component";
import { ProfileComponent } from "./profile/profile.component";
import { SalonDetailsComponent } from "./salon-details/salon-details.component";
import { FavoritesComponent } from "./favorites/favorites.component";
import { NotificationsComponent } from "./notifications/notifications.component";
import { ReferralComponent } from "./referral/referral.component";
import { PromotionsComponent } from "./promotions/promotions.component";
import { SearchResultsComponent } from "./search-results/search-results.component";
import { WalletComponent } from "./wallet/wallet.component";
import { SettingsComponent } from "./settings/settings.component";
import { ProfileSettingsComponent } from "./profile-settings/profile-settings.component";
import { MapComponent } from "./map/map.component";
import { BookAppointmentComponent } from "./book-appointment/book-appointment.component";
import { LeaveReviewComponent } from "./leave-review/leave-review.component";
import { BookingSuccessComponent } from "./booking-success/booking-success.component";
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsConditionsComponent } from './terms-conditions/terms-conditions.component';
import { CustomerServiceComponent } from './customer-service/customer-service.component';

const routes: Routes = [
  {
    path: "",
    component: ClientLayoutComponent,
    children: [
      { path: "", redirectTo: "home", pathMatch: "full" },
      { path: "home", component: HomeComponent },
      { path: "discover", component: DiscoverComponent },
      { path: "bookings", component: BookingsComponent },
      { path: "bookings/:id", component: BookingDetailsComponent },
      { path: "profile", component: ProfileComponent },
      { path: "salon/:id", component: SalonDetailsComponent },
      { path: "favorites", component: FavoritesComponent },
      { path: "notifications", component: NotificationsComponent },
      { path: "referral", component: ReferralComponent },
      { path: "promotions", component: PromotionsComponent },
      { path: "search", component: SearchResultsComponent },
      { path: "wallet", component: WalletComponent },
      { path: "settings", component: SettingsComponent },
      { path: "map", component: MapComponent },
      { path: "booking-success", component: BookingSuccessComponent },
      { path: "privacy-policy", component: PrivacyPolicyComponent },
      { path: "terms", component: TermsConditionsComponent },
      { path: "support", component: CustomerServiceComponent },
      { path: "book-appointment/:id", component: BookAppointmentComponent },
      { path: "review/:id", component: LeaveReviewComponent },
    ],
  },
];

@NgModule({
  declarations: [
    ClientLayoutComponent,
    HomeComponent,
    DiscoverComponent,
    BookingsComponent,
    BookingDetailsComponent,
    ProfileComponent,
    SalonDetailsComponent,
    FavoritesComponent,
    NotificationsComponent,
    ReferralComponent,
    PromotionsComponent,
    SearchResultsComponent,
    WalletComponent,
    SettingsComponent,
    ProfileSettingsComponent,
    MapComponent,
    BookAppointmentComponent,
    LeaveReviewComponent,
    BookingSuccessComponent,
    PrivacyPolicyComponent,
    TermsConditionsComponent,
    CustomerServiceComponent,
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ClientModule {}
