// ============================================================
// beautician-verification.component.ts  —  Enhanced UI
// ============================================================

import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

interface Document {
  id: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
interface VerificationStatus {
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  verifiedAt: string | null;
  rejectionReason: string | null;
  documents: Document[];
  missingDocs: string[];
  allUploaded: boolean;
  submittable: boolean;
}
type DocKey = "ghana_card_front" | "ghana_card_back" | "selfie_with_id";

@Component({
  selector: "app-beautician-verification",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-32">
      <!-- ── Header ── -->
      <div
        class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3"
      >
        <button
          onclick="history.back()"
          class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[var(--color-background)] transition-colors"
        >
          <i
            class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"
          ></i>
        </button>
        <h1
          class="text-base font-bold text-[var(--color-text-primary)] tracking-tight"
        >
          Account Verification
        </h1>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-28 rounded-2xl"></div>
        <div class="skeleton h-48 rounded-2xl"></div>
        <div class="skeleton h-52 rounded-2xl"></div>
      </div>

      <div *ngIf="!loading" class="p-4 max-w-2xl mx-auto space-y-4 pb-8">
        <!-- Status Banner -->
        <div
          [ngClass]="statusBannerClass()"
          class="rounded-2xl p-5 flex items-start gap-4"
        >
          <div
            class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            [ngClass]="statusIconBg()"
          >
            <i [class]="statusIcon()" class="text-xl"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold text-base" [ngClass]="statusTextClass()">
              {{ statusTitle() }}
            </h2>
            <p
              class="text-sm mt-1 leading-relaxed"
              [ngClass]="statusTextClass()"
              style="opacity: 0.8"
            >
              {{ statusDescription() }}
            </p>
            <div
              *ngIf="status?.rejectionReason"
              class="mt-3 flex items-start gap-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 px-3 py-2.5 rounded-xl"
            >
              <i class="ri-error-warning-line flex-shrink-0 mt-0.5"></i>
              <span>{{ status!.rejectionReason }}</span>
            </div>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="card rounded-2xl p-4">
          <h3
            class="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider opacity-60 mb-4"
          >
            Verification Steps
          </h3>
          <div class="space-y-3">
            <div
              *ngFor="let step of steps; let i = index"
              class="flex items-center gap-3"
            >
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all"
                [ngClass]="stepClass(step.docType)"
              >
                <i
                  *ngIf="getDocStatus(step.docType) === 'approved'"
                  class="ri-check-line text-sm"
                ></i>
                <i
                  *ngIf="getDocStatus(step.docType) === 'rejected'"
                  class="ri-close-line text-sm"
                ></i>
                <span
                  *ngIf="
                    !getDocStatus(step.docType) ||
                    getDocStatus(step.docType) === 'pending'
                  "
                  >{{ i + 1 }}</span
                >
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm font-semibold text-[var(--color-text-primary)]"
                >
                  {{ step.label }}
                </p>
                <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {{ step.hint }}
                </p>
              </div>
              <span
                class="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0"
                [ngClass]="docStatusChip(step.docType)"
              >
                {{ getDocStatusLabel(step.docType) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Document Upload Cards -->
        <div
          *ngIf="status?.verificationStatus !== 'APPROVED'"
          class="space-y-3"
        >
          <h3 class="text-sm font-bold text-[var(--color-text-primary)] px-1">
            Upload Documents
          </h3>

          <div
            *ngFor="let step of steps"
            class="card rounded-2xl p-4 space-y-3"
          >
            <!-- Header -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <p class="font-bold text-sm text-[var(--color-text-primary)]">
                  {{ step.label }}
                </p>
                <p class="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {{ step.hint }}
                </p>
              </div>
              <span
                class="text-xs px-2.5 py-1 rounded-lg font-semibold flex-shrink-0"
                [ngClass]="docStatusChip(step.docType)"
              >
                {{ getDocStatusLabel(step.docType) }}
              </span>
            </div>

            <!-- Existing doc preview -->
            <div
              *ngIf="getDoc(step.docType)"
              class="relative rounded-2xl overflow-hidden border border-[var(--color-border)]"
            >
              <img
                [src]="getDoc(step.docType)!.fileUrl"
                [alt]="step.label"
                class="w-full h-36 object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3"
              >
                <span
                  class="text-xs px-2.5 py-1 rounded-lg font-semibold"
                  [ngClass]="docStatusChip(step.docType)"
                >
                  {{ getDocStatusLabel(step.docType) }}
                </span>
              </div>
            </div>

            <!-- File picker zone -->
            <label
              class="flex flex-col items-center justify-center gap-2 w-full py-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:border-[var(--color-primary)]"
              [ngClass]="
                previews[step.docType]
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-primary)]/3'
              "
            >
              <ng-container *ngIf="!previews[step.docType]">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)"
                >
                  <i
                    class="ri-upload-cloud-2-line text-xl text-[var(--color-primary)]"
                  ></i>
                </div>
                <span class="text-sm font-semibold text-[var(--color-primary)]">
                  {{
                    getDoc(step.docType) ? "Replace document" : "Upload photo"
                  }}
                </span>
                <span class="text-xs text-[var(--color-text-muted)]"
                  >JPG, PNG or PDF</span
                >
              </ng-container>
              <ng-container *ngIf="previews[step.docType]">
                <img
                  [src]="previews[step.docType]"
                  class="w-28 h-20 object-cover rounded-xl border-2 border-[var(--color-primary)]/30"
                />
                <span class="text-xs text-[var(--color-text-secondary)] mt-1">{{
                  fileNames[step.docType]
                }}</span>
              </ng-container>
              <input
                type="file"
                accept="image/*,application/pdf"
                class="hidden"
                (change)="onFileSelected($event, step.docType)"
              />
            </label>

            <!-- Upload button -->
            <button
              *ngIf="selectedFiles[step.docType]"
              (click)="uploadDoc(step.docType)"
              [disabled]="uploading[step.docType]"
              class="btn-primary w-full py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <i *ngIf="!uploading[step.docType]" class="ri-upload-line"></i>
              <i
                *ngIf="uploading[step.docType]"
                class="ri-loader-4-line animate-spin"
              ></i>
              {{
                uploading[step.docType]
                  ? "Uploading…"
                  : "Upload " + step.shortLabel
              }}
            </button>
          </div>
        </div>

        <!-- Approved state -->
        <div
          *ngIf="status?.verificationStatus === 'APPROVED'"
          class="card rounded-2xl p-8 text-center space-y-4"
        >
          <div
            class="w-20 h-20 rounded-3xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"
          >
            <i class="ri-shield-check-fill text-4xl text-green-500"></i>
          </div>
          <div>
            <h3 class="font-bold text-xl text-[var(--color-text-primary)]">
              Fully Verified ✓
            </h3>
            <p
              class="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed"
            >
              Your account was verified on
              {{ status!.verifiedAt | date: "MMMM d, y" }}.<br />You can now
              receive bookings from clients.
            </p>
          </div>
        </div>

        <!-- Requirements info -->
        <div
          class="rounded-2xl p-4 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800"
        >
          <h4
            class="font-bold text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3"
          >
            <i class="ri-information-line text-base"></i> Document Requirements
          </h4>
          <ul class="space-y-2 text-xs text-amber-700 dark:text-amber-400">
            <li class="flex items-start gap-2">
              <i
                class="ri-checkbox-circle-line mt-0.5 flex-shrink-0 text-sm"
              ></i>
              Ghana Card — both front and back clearly visible
            </li>
            <li class="flex items-start gap-2">
              <i
                class="ri-checkbox-circle-line mt-0.5 flex-shrink-0 text-sm"
              ></i>
              Selfie holding your Ghana Card next to your face
            </li>
            <li class="flex items-start gap-2">
              <i
                class="ri-checkbox-circle-line mt-0.5 flex-shrink-0 text-sm"
              ></i>
              Documents must be valid and not expired
            </li>
            <li class="flex items-start gap-2">
              <i
                class="ri-checkbox-circle-line mt-0.5 flex-shrink-0 text-sm"
              ></i>
              Images should be clear and well-lit
            </li>
            <li class="flex items-start gap-2">
              <i class="ri-time-line mt-0.5 flex-shrink-0 text-sm"></i> Review
              typically takes 2–3 business days
            </li>
          </ul>
        </div>

        <!-- Submit button -->
        <button
          *ngIf="
            status?.submittable && status?.verificationStatus !== 'APPROVED'
          "
          (click)="submitForReview()"
          [disabled]="submitting"
          class="btn-primary w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <i *ngIf="!submitting" class="ri-send-plane-line text-base"></i>
          <i
            *ngIf="submitting"
            class="ri-loader-4-line animate-spin text-base"
          ></i>
          {{ submitting ? "Submitting for Review…" : "Submit for Review" }}
        </button>
      </div>
    </div>
  `,
})
export class BeauticianVerificationComponent implements OnInit {
  status: VerificationStatus | null = null;
  loading = true;
  submitting = false;
  selectedFiles: Partial<Record<DocKey, File>> = {};
  previews: Partial<Record<DocKey, string>> = {};
  fileNames: Partial<Record<DocKey, string>> = {};
  uploading: Partial<Record<DocKey, boolean>> = {};

  steps: {
    docType: DocKey;
    label: string;
    shortLabel: string;
    hint: string;
  }[] = [
    {
      docType: "ghana_card_front",
      label: "Ghana Card — Front",
      shortLabel: "Front",
      hint: "Clear photo of the front of your Ghana National ID",
    },
    {
      docType: "ghana_card_back",
      label: "Ghana Card — Back",
      shortLabel: "Back",
      hint: "Clear photo of the back of your Ghana National ID",
    },
    {
      docType: "selfie_with_id",
      label: "Selfie with Ghana Card",
      shortLabel: "Selfie",
      hint: "Hold your Ghana Card next to your face clearly",
    },
  ];

  constructor(
    private http: HttpClient,
    private toast: ToastService,
  ) {}
  ngOnInit() {
    this.loadStatus();
  }

  loadStatus() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/verification/status`).subscribe({
      next: (res) => {
        this.status = res.data; // ← confirm res.data has verificationStatus: 'APPROVED'
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onFileSelected(event: Event, docType: DocKey) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFiles[docType] = file;
    this.fileNames[docType] = file.name;
    const reader = new FileReader();
    reader.onload = (e) =>
      (this.previews[docType] = e.target?.result as string);
    reader.readAsDataURL(file);
  }

  uploadDoc(docType: DocKey) {
    const file = this.selectedFiles[docType];
    if (!file) return;
    this.uploading[docType] = true;
    const fd = new FormData();
    fd.append("document", file);
    fd.append("documentType", docType);
    this.http
      .post<any>(`${environment.apiUrl}/verification/upload`, fd)
      .subscribe({
        next: () => {
          this.uploading[docType] = false;
          this.selectedFiles[docType] = undefined;
          this.previews[docType] = undefined;
          this.toast.success("Document uploaded!");
          this.loadStatus();
        },
        error: (err) => {
          this.uploading[docType] = false;
          this.toast.error(err?.error?.message || "Upload failed");
        },
      });
  }

  submitForReview() {
    this.submitting = true;
    this.http
      .post<any>(`${environment.apiUrl}/verification/submit`, {})
      .subscribe({
        next: (res) => {
          this.submitting = false;
          this.toast.success(res.message || "Submitted for review!");
          this.loadStatus();
        },
        error: (err) => {
          this.submitting = false;
          this.toast.error(err?.error?.message || "Submission failed");
        },
      });
  }

  getDoc(docType: DocKey): Document | undefined {
    return this.status?.documents.find((d) => d.type === docType);
  }
  getDocStatus(docType: DocKey): string | null {
    return this.getDoc(docType)?.status ?? null;
  }
  getDocStatusLabel(docType: DocKey): string {
    const s = this.getDocStatus(docType);
    if (!s) return "Not uploaded";
    return (
      { pending: "Under Review", approved: "Approved", rejected: "Rejected" }[
        s
      ] ?? s
    );
  }
  docStatusChip(docType: DocKey): string {
    const s = this.getDocStatus(docType);
    if (!s)
      return "bg-[var(--color-background)] text-[var(--color-text-muted)]";
    return (
      {
        pending:
          "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        approved:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
        rejected:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      }[s] ?? ""
    );
  }
  stepClass(docType: DocKey): string {
    const s = this.getDocStatus(docType);
    if (s === "approved") return "bg-green-500 text-white";
    if (s === "rejected") return "bg-red-500 text-white";
    if (s === "pending") return "bg-amber-400 text-white";
    return "bg-[var(--color-background)] border-2 border-[var(--color-border)] text-[var(--color-text-muted)]";
  }
  statusBannerClass(): string {
    const s = this.status?.verificationStatus;
    if (s === "APPROVED")
      return "bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800";
    if (s === "REJECTED")
      return "bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800";
    return "bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800";
  }
  statusTextClass(): string {
    const s = this.status?.verificationStatus;
    if (s === "APPROVED") return "text-green-800 dark:text-green-300";
    if (s === "REJECTED") return "text-red-800 dark:text-red-300";
    return "text-amber-800 dark:text-amber-300";
  }
  statusIconBg(): string {
    const s = this.status?.verificationStatus;
    if (s === "APPROVED") return "bg-green-100 dark:bg-green-900/30";
    if (s === "REJECTED") return "bg-red-100 dark:bg-red-900/30";
    return "bg-amber-100 dark:bg-amber-900/30";
  }
  statusIcon(): string {
    const s = this.status?.verificationStatus;
    if (s === "APPROVED") return "ri-shield-check-fill text-green-500";
    if (s === "REJECTED") return "ri-shield-cross-fill text-red-500";
    return "ri-time-fill text-amber-500";
  }
  statusTitle(): string {
    const s = this.status?.verificationStatus;
    if (s === "APPROVED") return "Account Verified ✓";
    if (s === "REJECTED") return "Verification Rejected";
    if (this.status?.allUploaded) return "Under Review";
    return "Verification Required";
  }
  statusDescription(): string {
    const s = this.status?.verificationStatus;
    if (s === "APPROVED")
      return "You are fully verified and can receive bookings from customers.";
    if (s === "REJECTED")
      return "Your verification was rejected. Please review the reason and resubmit your documents.";
    if (this.status?.allUploaded)
      return "Your documents have been submitted and are under review. This typically takes 2–3 business days.";
    return `Please upload the required documents to get verified. ${this.status?.missingDocs.length ?? 0} document(s) remaining.`;
  }
}
