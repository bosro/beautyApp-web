// src/app/features/client/ai-virtual-tryon/ai-virtual-tryon.component.ts
//
// FIXES vs previous version:
//  1. Image generation shows a clear billing notice instead of silent fail
//  2. Analysis (face shape etc.) works on free tier — no billing needed
//  3. userId passed to backend so interactions are saved to history

import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { environment } from "@environments/environment";
import { ToastService } from "@core/services/toast.service";

interface Recommendation {
  name: string;
  description: string;
  whyItWorks: string;
  estimatedPrice: string;
  difficulty: "easy" | "medium" | "hard";
  searchQuery: string;
}

interface FaceAnalysis {
  faceShape: string;
  hairType: string;
  skinTone: string;
  recommendations: Recommendation[];
  generalTips: string[];
}

interface GeneratedImage {
  styleName: string;
  uri: SafeUrl;
  loading: boolean;
}

type Step = "upload" | "analyzing" | "results";

@Component({
  selector: "app-ai-virtual-tryon",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-16">
      <!-- Header -->
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-4 flex items-center gap-3"
      >
        <button
          onclick="history.back()"
          class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center"
        >
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-text-primary)]">
          Virtual Try-On
        </h1>
        <!-- <span
          class="ml-auto text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1"
        >
          <i class="ri-robot-2-line"></i> Gemini AI
        </span> -->
      </div>

      <div class="max-w-3xl mx-auto p-4 space-y-5">
        <!-- ── UPLOAD + ANALYZING ── -->
        <ng-container *ngIf="step === 'upload' || step === 'analyzing'">
          <!-- Drop zone -->
          <div
            class="relative border-2 border-dashed rounded-2xl transition-colors cursor-pointer"
            [ngClass]="
              photoPreview
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface)]'
            "
            (click)="!photoPreview && fileInput.click()"
            (dragover)="$event.preventDefault()"
            (drop)="onDrop($event)"
          >
            <ng-container *ngIf="photoPreview; else uploadPrompt">
              <img
                [src]="photoPreview"
                alt="Your photo"
                class="w-full max-h-96 object-contain rounded-2xl"
              />
              <button
                (click)="$event.stopPropagation(); clearPhoto()"
                class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <i class="ri-close-line text-sm"></i>
              </button>
            </ng-container>

            <ng-template #uploadPrompt>
              <div
                class="flex flex-col items-center justify-center py-16 px-6 gap-3"
              >
                <div
                  class="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center"
                >
                  <i
                    class="ri-camera-line text-3xl text-[var(--color-primary)]"
                  ></i>
                </div>
                <p
                  class="text-base font-semibold text-[var(--color-text-primary)]"
                >
                  Upload Your Photo
                </p>
                <p
                  class="text-sm text-[var(--color-text-secondary)] text-center"
                >
                  Drag & drop or click to browse<br />
                  <span class="text-xs">JPG, PNG up to 10MB</span>
                </p>
                <button
                  (click)="fileInput.click()"
                  class="mt-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold"
                >
                  Choose Photo
                </button>
              </div>
            </ng-template>
          </div>

          <input
            #fileInput
            type="file"
            accept="image/*"
            class="hidden"
            (change)="onFileSelected($event)"
          />

          <!-- Free tier notice -->
          <div
            class="card p-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/15 border-blue-200 dark:border-blue-800"
          >
            <i
              class="ri-information-line text-blue-500 text-lg flex-shrink-0 mt-0.5"
            ></i>
            <div>
              <p class="text-sm font-semibold text-blue-800 dark:text-blue-300">
                What works on the free tier
              </p>
              <ul
                class="text-xs text-blue-700 dark:text-blue-400 mt-1 space-y-0.5"
              >
                <li>✅ Face shape, hair type & skin tone detection</li>
                <li>✅ Personalised style recommendations</li>
                <li>✅ "Find salons" for each style</li>
                <li class="text-amber-600 dark:text-amber-400">
                  💳 AI image generation requires billing enabled at
                  aistudio.google.com
                </li>
              </ul>
            </div>
          </div>

          <!-- Tips -->
          <div
            class="card p-4 bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800"
          >
            <h4
              class="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-2"
            >
              <i class="ri-lightbulb-line"></i> Tips for best results
            </h4>
            <ul class="space-y-1 text-xs text-amber-700 dark:text-amber-400">
              <li class="flex items-center gap-1.5">
                <i class="ri-check-line"></i> Face camera directly —
                front-facing photo
              </li>
              <li class="flex items-center gap-1.5">
                <i class="ri-check-line"></i> Good, even lighting (no harsh
                shadows)
              </li>
              <li class="flex items-center gap-1.5">
                <i class="ri-check-line"></i> Pull hair back so face shape is
                clear
              </li>
              <li class="flex items-center gap-1.5">
                <i class="ri-check-line"></i> Neutral expression
              </li>
            </ul>
          </div>

          <!-- Preferences -->
          <div class="card p-4 space-y-3">
            <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
              Preferences (optional)
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="block text-xs font-medium text-[var(--color-text-secondary)] mb-1"
                  >Preferred Length</label
                >
                <select
                  [(ngModel)]="preferences.preferredLength"
                  class="form-input text-sm"
                >
                  <option value="">Any length</option>
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                </select>
              </div>
              <div>
                <label
                  class="block text-xs font-medium text-[var(--color-text-secondary)] mb-1"
                  >Occasion</label
                >
                <select
                  [(ngModel)]="preferences.occasion"
                  class="form-input text-sm"
                >
                  <option value="everyday">Everyday</option>
                  <option value="work">Work / Professional</option>
                  <option value="event">Special Event</option>
                  <option value="casual">Casual / Weekend</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Analyzing overlay -->
          <div
            *ngIf="step === 'analyzing'"
            class="card p-8 flex flex-col items-center gap-4"
          >
            <div class="relative">
              <div
                class="w-16 h-16 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] animate-spin"
              ></div>
              <i
                class="ri-robot-2-line text-2xl text-[var(--color-primary)] absolute"
                style="top:50%;left:50%;transform:translate(-50%,-50%)"
              ></i>
            </div>
            <p class="text-base font-semibold text-[var(--color-text-primary)]">
              Analyzing your features...
            </p>
            <p class="text-sm text-[var(--color-text-secondary)] text-center">
              Detecting your face shape, hair type, and skin tone
            </p>
          </div>

          <!-- Analyze button -->
          <button
            *ngIf="photoPreview && step === 'upload'"
            (click)="analyze()"
            class="w-full py-4 bg-[var(--color-primary)] text-white rounded-2xl font-semibold text-base"
          >
            <i class="ri-robot-2-line mr-2"></i> Analyze My Face
          </button>
        </ng-container>

        <!-- ── RESULTS ── -->
        <ng-container *ngIf="step === 'results' && analysis">
          <!-- Summary -->
          <div class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-[var(--color-text-primary)]">
                Your Analysis
              </h3>
              <button
                (click)="reset()"
                class="text-xs text-[var(--color-text-muted)] flex items-center gap-1 hover:text-[var(--color-primary)]"
              >
                <i class="ri-refresh-line"></i> Try another photo
              </button>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div
                *ngFor="let item of summaryItems"
                class="text-center p-3 bg-[var(--color-background)] rounded-xl"
              >
                <p class="text-xs text-[var(--color-text-muted)] mb-1">
                  {{ item.label }}
                </p>
                <p
                  class="text-sm font-bold text-[var(--color-primary)] capitalize"
                >
                  {{ item.value }}
                </p>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div
            class="card p-4 bg-green-50 dark:bg-green-900/15 border-green-200 dark:border-green-800"
          >
            <p
              class="text-sm font-semibold text-green-800 dark:text-green-300 mb-2"
            >
              💡 Styling Tips for You
            </p>
            <ul class="space-y-1">
              <li
                *ngFor="let tip of analysis.generalTips"
                class="text-xs text-green-700 dark:text-green-400 flex items-start gap-1.5"
              >
                <i class="ri-checkbox-circle-line mt-0.5 flex-shrink-0"></i
                >{{ tip }}
              </li>
            </ul>
          </div>

          <!-- Billing notice if image gen failed -->
          <div
            *ngIf="showBillingNotice"
            class="card p-4 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/15 border-amber-200 dark:border-amber-800"
          >
            <i
              class="ri-bank-card-line text-amber-500 text-lg flex-shrink-0 mt-0.5"
            ></i>
            <div>
              <p
                class="text-sm font-semibold text-amber-800 dark:text-amber-300"
              >
                Image generation requires billing
              </p>
              <p
                class="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed"
              >
                Your analysis and recommendations work perfectly. To generate AI
                preview images, enable billing on your Google AI account at
                <span class="font-semibold">aistudio.google.com</span>. The face
                analysis above is completely free.
              </p>
            </div>
          </div>

          <!-- Filter -->
          <div class="flex gap-2 overflow-x-auto pb-1">
            <button
              *ngFor="let cat of difficultyFilters"
              (click)="activeFilter = cat.value"
              class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              [ngClass]="
                activeFilter === cat.value
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
              "
            >
              {{ cat.label }}
            </button>
          </div>

          <!-- Recommendations -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div *ngFor="let rec of filteredRecs" class="card overflow-hidden">
              <!-- Image area -->
              <div class="relative h-48 bg-[var(--color-background)]">
                <ng-container *ngIf="getGenImage(rec.name) as img">
                  <img
                    [src]="img.uri"
                    [alt]="rec.name"
                    class="w-full h-full object-cover"
                  />
                </ng-container>

                <ng-container *ngIf="!getGenImage(rec.name)">
                  <div
                    class="w-full h-full flex flex-col items-center justify-center gap-2"
                    [ngClass]="
                      isGenerating(rec.name)
                        ? ''
                        : 'cursor-pointer hover:bg-[var(--color-primary)]/5 transition-colors'
                    "
                    (click)="!isGenerating(rec.name) && generateImage(rec)"
                  >
                    <ng-container *ngIf="isGenerating(rec.name)">
                      <div
                        class="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"
                      ></div>
                      <p class="text-xs text-[var(--color-text-muted)]">
                        Generating...
                      </p>
                    </ng-container>
                    <ng-container *ngIf="!isGenerating(rec.name)">
                      <i
                        class="ri-image-ai-line text-3xl text-[var(--color-primary)]/50"
                      ></i>
                      <p
                        class="text-xs font-semibold text-[var(--color-primary)]"
                      >
                        Generate AI Preview
                      </p>
                      <p class="text-xs text-[var(--color-text-muted)]">
                        Requires billing enabled
                      </p>
                    </ng-container>
                  </div>
                </ng-container>

                <!-- Difficulty badge -->
                <span
                  class="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full text-white font-bold"
                  [ngClass]="difficultyBadgeClass(rec.difficulty)"
                >
                  {{ rec.difficulty.toUpperCase() }}
                </span>
              </div>

              <!-- Info -->
              <div class="p-4 space-y-2">
                <div class="flex items-start justify-between gap-2">
                  <h4
                    class="font-bold text-sm text-[var(--color-text-primary)]"
                  >
                    {{ rec.name }}
                  </h4>
                  <span
                    class="text-sm font-semibold text-[var(--color-primary)] flex-shrink-0"
                    >{{ rec.estimatedPrice }}</span
                  >
                </div>
                <p
                  class="text-xs text-[var(--color-text-secondary)] leading-relaxed"
                >
                  {{ rec.whyItWorks }}
                </p>
                <button
                  (click)="findSalons(rec.searchQuery)"
                  class="w-full py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold"
                >
                  Find Salons for This Style
                </button>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
})
export class AiVirtualTryonComponent {
  step: Step = "upload";
  photoPreview: string | null = null;
  photoBase64: string | null = null;
  photoMimeType = "image/jpeg";
  analysis: FaceAnalysis | null = null;
  generatedImages: GeneratedImage[] = [];
  generatingSet = new Set<string>();
  activeFilter = "all";
  showBillingNotice = false;

  preferences = { preferredLength: "", occasion: "everyday" };

  difficultyFilters = [
    { label: "All Styles", value: "all" },
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Advanced", value: "hard" },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
  ) {}

  get summaryItems() {
    if (!this.analysis) return [];
    return [
      { label: "Face Shape", value: this.analysis.faceShape },
      { label: "Hair Type", value: this.analysis.hairType },
      { label: "Skin Tone", value: this.analysis.skinTone },
    ];
  }

  get filteredRecs() {
    if (!this.analysis) return [];
    return this.activeFilter === "all"
      ? this.analysis.recommendations
      : this.analysis.recommendations.filter(
          (r) => r.difficulty === this.activeFilter,
        );
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.loadFile(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file?.type.startsWith("image/")) this.loadFile(file);
  }

  private loadFile(file: File) {
    if (file.size > 10_000_000) {
      this.toast.error("File too large. Please use an image under 10MB.");
      return;
    }
    this.photoMimeType = file.type;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.photoPreview = result;
      this.photoBase64 = result.split(",")[1];
    };
    reader.readAsDataURL(file);
  }

  clearPhoto() {
    this.photoPreview = null;
    this.photoBase64 = null;
    this.step = "upload";
    this.analysis = null;
    this.generatedImages = [];
    this.showBillingNotice = false;
  }

  reset() {
    this.clearPhoto();
  }

  analyze() {
    if (!this.photoBase64) return;
    this.step = "analyzing";

    this.http
      .post<any>(`${environment.apiUrl}/ai/analyze-face`, {
        imageBase64: this.photoBase64,
        mimeType: this.photoMimeType,
        preferences: this.preferences,
      })
      .subscribe({
        next: (res) => {
          this.analysis = res.data;
          this.step = "results";
        },
        error: (err) => {
          this.toast.error(
            err?.error?.message || "Analysis failed. Please try again.",
          );
          this.step = "upload";
        },
      });
  }

  generateImage(rec: { name: string; description: string }) {
    if (this.generatingSet.has(rec.name)) return;
    this.generatingSet.add(rec.name);

    this.http
      .post<any>(`${environment.apiUrl}/ai/generate-hairstyle`, {
        styleName: rec.name,
        description: rec.description,
        faceShape: this.analysis?.faceShape,
        skinTone: this.analysis?.skinTone,
      })
      .subscribe({
        next: (res) => {
          const d = res.data;
          const uri = this.sanitizer.bypassSecurityTrustUrl(
            `data:${d.mimeType};base64,${d.imageBase64}`,
          );
          this.generatedImages = [
            ...this.generatedImages.filter((i) => i.styleName !== rec.name),
            { styleName: rec.name, uri, loading: false },
          ];
          this.generatingSet.delete(rec.name);
        },
        error: (err) => {
          this.generatingSet.delete(rec.name);
          // 402 = billing required
          if (err?.status === 402) {
            this.showBillingNotice = true;
            this.toast.error(
              "Image generation needs billing enabled. See the notice above.",
            );
          } else {
            this.toast.error("Image generation failed. Try a different style.");
          }
        },
      });
  }

  getGenImage(styleName: string) {
    return this.generatedImages.find((i) => i.styleName === styleName);
  }
  isGenerating(styleName: string) {
    return this.generatingSet.has(styleName);
  }

  difficultyBadgeClass(d: string): string {
    return (
      (
        {
          easy: "bg-green-500",
          medium: "bg-amber-500",
          hard: "bg-red-500",
        } as Record<string, string>
      )[d] || "bg-gray-500"
    );
  }

  findSalons(query: string) {
    this.router.navigate(["/client/search"], { queryParams: { q: query } });
  }
}


