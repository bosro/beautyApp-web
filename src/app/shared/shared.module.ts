import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ToastComponent } from "./components/toast/toast.component";
import { ConfirmModalComponent } from "./components/confirm-modal/confirm-modal.component";
import { SpinnerComponent } from "./components/spinner/spinner.component";
import { StarRatingComponent } from "./components/star-rating/star-rating.component";
import { EmptyStateComponent } from "./components/empty-state/empty-state.component";

const COMPONENTS = [];

@NgModule({
  declarations: [
    ToastComponent,
    ConfirmModalComponent,
    SpinnerComponent,
    StarRatingComponent,
    EmptyStateComponent,
  ],
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
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
