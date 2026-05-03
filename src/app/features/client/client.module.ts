import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ClientLayoutComponent } from './client-layout/client-layout.component';
import { HomeComponent } from './home/home.component';
import { DiscoverComponent } from './discover/discover.component';
import { BookingsComponent } from './bookings/bookings.component';
import { BookingDetailsComponent } from './booking-details/booking-details.component';
import { ProfileComponent } from './profile/profile.component';
import { SalonDetailsComponent } from './salon-details/salon-details.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ReferralComponent } from './referral/referral.component';
import { PromotionsComponent } from './promotions/promotions.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { WalletComponent } from './wallet/wallet.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'discover', component: DiscoverComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'bookings/:id', component: BookingDetailsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'salon/:id', component: SalonDetailsComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'referral', component: ReferralComponent },
      { path: 'promotions', component: PromotionsComponent },
      { path: 'search', component: SearchResultsComponent },
      { path: 'wallet', component: WalletComponent },
      { path: 'settings', component: SettingsComponent },
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
  ],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class ClientModule {}
