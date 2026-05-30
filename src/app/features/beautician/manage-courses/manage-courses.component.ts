// manage-courses.component.ts
// Route: /beautician/courses
// Beautician manages their courses (ebooks, videos, audio).

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ToastService } from '@core/services/toast.service';

type CourseType = 'VIDEO' | 'EBOOK' | 'AUDIO';

@Component({
  selector: 'app-manage-courses',
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] pb-28">

      <!-- Header -->
      <div class="sticky top-0 z-20 bg-[var(--color-surface)]/95 backdrop-blur-md
                  border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
        <button (click)="router.navigate(['/beautician/settings'])"
          class="w-9 h-9 flex items-center justify-center rounded-full
                 hover:bg-[var(--color-background)] transition-colors">
          <i class="ri-arrow-left-line text-lg text-[var(--color-text-primary)]"></i>
        </button>
        <h1 class="flex-1 text-base font-bold text-[var(--color-text-primary)] tracking-tight">
          My Courses
        </h1>
        <button (click)="openForm()" class="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-1.5">
          <i class="ri-add-line text-base"></i> Add Course
        </button>
      </div>

      <!-- Loading skeleton -->
      <div *ngIf="loading" class="p-4 space-y-3 max-w-2xl mx-auto">
        <div class="skeleton h-28 rounded-2xl" *ngFor="let i of [1,2,3]"></div>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && courses.length === 0"
        class="p-8 text-center max-w-md mx-auto mt-8">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style="background: color-mix(in srgb, var(--color-primary) 10%, transparent)">
          <i class="ri-play-circle-line text-4xl" style="color: var(--color-primary)"></i>
        </div>
        <h2 class="text-lg font-bold text-[var(--color-text-primary)] mb-2">No courses yet</h2>
        <p class="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
          Share your expertise — sell video tutorials, ebooks, or audio guides
          directly to your clients.
        </p>
        <button (click)="openForm()" class="btn-primary px-8">
          Create your first course
        </button>
      </div>

      <!-- Course list -->
      <div *ngIf="!loading && courses.length > 0"
        class="p-4 max-w-2xl mx-auto space-y-3">

        <div *ngFor="let c of courses"
          class="rounded-2xl border overflow-hidden transition-all"
          style="background: var(--color-surface); border-color: var(--color-border)">

          <div class="flex gap-3 p-3">
            <!-- Thumbnail -->
            <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative"
              style="background: var(--color-background)">
              <img *ngIf="c.thumbnail" [src]="c.thumbnail" [alt]="c.title"
                class="w-full h-full object-cover"/>
              <div *ngIf="!c.thumbnail"
                class="w-full h-full flex items-center justify-center">
                <i [class]="typeIcon(c.type) + ' text-2xl'"
                  style="color: var(--color-text-placeholder)"></i>
              </div>
              <!-- Type badge -->
              <div class="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white"
                [style.background]="typeColor(c.type)">
                {{ c.type }}
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-2">
                <p class="text-sm font-bold text-[var(--color-text-primary)] leading-tight flex-1 truncate">
                  {{ c.title }}
                </p>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  [ngClass]="c.isPublished
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'">
                  {{ c.isPublished ? 'Live' : 'Draft' }}
                </span>
              </div>

              <p class="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                {{ c.description || 'No description' }}
              </p>

              <div class="flex items-center gap-3 mt-2">
                <span class="text-sm font-bold" style="color: var(--color-primary)">
                  {{ c.accessType === 'FREE' ? 'Free' : 'GH₵' + (c.price | number:'1.2-2') }}
                </span>
                <span class="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <i class="ri-download-line"></i>{{ c._count?.purchases || 0 }} sales
                </span>
                <span *ngIf="c.duration" class="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                  <i class="ri-time-line"></i>{{ c.duration }}
                </span>
              </div>
            </div>
          </div>

          <!-- Action bar -->
          <div class="flex items-center border-t px-3 py-2 gap-2"
            style="border-color: var(--color-border); background: var(--color-background)">

            <!-- File upload indicator -->
            <div class="flex-1">
              <span *ngIf="!c.fileUrl"
                class="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                <i class="ri-upload-cloud-line"></i> Upload file to publish
              </span>
              <span *ngIf="c.fileUrl"
                class="text-[11px] font-semibold text-green-600 flex items-center gap-1">
                <i class="ri-checkbox-circle-line"></i> File uploaded
              </span>
            </div>

            <!-- Upload file button -->
            <label class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold
                          cursor-pointer transition-colors"
              style="background: color-mix(in srgb, var(--color-primary) 10%, transparent);
                     color: var(--color-primary)">
              <i class="ri-upload-2-line"></i> Upload
              <input type="file" class="hidden"
                [accept]="fileAccept(c.type)"
                (change)="uploadFile(c, $event)"/>
            </label>

            <!-- Publish toggle -->
            <button (click)="togglePublish(c)"
              [disabled]="toggling[c.id]"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              [ngClass]="c.isPublished
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20'
                : 'bg-green-100 text-green-700 dark:bg-green-900/20'">
              <i [class]="c.isPublished ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
              {{ c.isPublished ? 'Unpublish' : 'Publish' }}
            </button>

            <!-- Edit -->
            <button (click)="openForm(c)"
              class="w-8 h-8 flex items-center justify-center rounded-xl
                     bg-[var(--color-surface)] border border-[var(--color-border)]">
              <i class="ri-edit-line text-sm text-[var(--color-text-secondary)]"></i>
            </button>

            <!-- Delete -->
            <button (click)="confirmDelete(c)"
              class="w-8 h-8 flex items-center justify-center rounded-xl
                     bg-[var(--color-surface)] border border-[var(--color-border)]">
              <i class="ri-delete-bin-line text-sm text-red-500"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ════════════════════════════════════════
           ADD / EDIT BOTTOM SHEET
      ════════════════════════════════════════ -->
      <div *ngIf="showForm"
        class="fixed inset-0 z-50 flex items-end justify-center lg:items-center"
        style="background: rgba(0,0,0,0.5)">
        <div (click)="$event.stopPropagation()"
          class="w-full max-w-lg bg-[var(--color-surface)] rounded-t-3xl lg:rounded-3xl
                 max-h-[94vh] overflow-y-auto shadow-2xl">

          <!-- Sheet header -->
          <div class="flex items-center justify-between px-5 pt-5 pb-4 sticky top-0
                      bg-[var(--color-surface)] border-b border-[var(--color-border)] z-10">
            <h2 class="text-base font-bold text-[var(--color-text-primary)]">
              {{ editingCourse ? 'Edit Course' : 'New Course' }}
            </h2>
            <button (click)="closeForm()"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-background)]">
              <i class="ri-close-line text-base text-[var(--color-text-primary)]"></i>
            </button>
          </div>

          <form [formGroup]="courseForm" (ngSubmit)="saveCourse()" class="p-5 space-y-4">

            <!-- Thumbnail upload -->
            <div class="relative h-36 rounded-2xl overflow-hidden cursor-pointer group"
              style="background: color-mix(in srgb, var(--color-primary) 5%, transparent)">
              <img *ngIf="thumbPreview" [src]="thumbPreview" class="w-full h-full object-cover"/>
              <div *ngIf="!thumbPreview"
                class="w-full h-full flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <i class="ri-image-add-line text-2xl" style="color: var(--color-primary)"></i>
                <p class="text-xs font-semibold" style="color: var(--color-primary)">
                  Upload thumbnail (optional)
                </p>
              </div>
              <div *ngIf="thumbPreview"
                class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                       transition-opacity flex items-center justify-center">
                <span class="px-3 py-1.5 bg-white/90 rounded-xl text-xs font-semibold text-gray-800">
                  Change
                </span>
              </div>
              <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer"
                (change)="onThumbChange($event)"/>
            </div>

            <!-- Course type -->
            <div>
              <label class="course-label">Course Type *</label>
              <div class="grid grid-cols-3 gap-2">
                <button *ngFor="let t of courseTypes" type="button"
                  (click)="courseForm.patchValue({ type: t.value })"
                  class="flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all"
                  [ngClass]="courseForm.get('type')?.value === t.value
                    ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-background)]'">
                  <i [class]="t.icon + ' text-xl'"
                    [style.color]="courseForm.get('type')?.value === t.value
                      ? 'var(--color-primary)' : 'var(--color-text-muted)'"></i>
                  <span class="text-xs font-bold"
                    [style.color]="courseForm.get('type')?.value === t.value
                      ? 'var(--color-primary)' : 'var(--color-text-secondary)'">
                    {{ t.label }}
                  </span>
                </button>
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="course-label">Title *</label>
              <input formControlName="title" type="text" class="form-input rounded-xl"
                placeholder="e.g. Professional Hair Braiding Masterclass"/>
            </div>

            <!-- Description -->
            <div>
              <label class="course-label">Description</label>
              <textarea formControlName="description" rows="3"
                class="form-input resize-none rounded-xl"
                placeholder="What will students learn from this course?"></textarea>
            </div>

            <!-- Access type -->
            <div>
              <label class="course-label">Access</label>
              <div class="flex gap-3">
                <button *ngFor="let a of accessTypes" type="button"
                  (click)="courseForm.patchValue({ accessType: a.value })"
                  class="flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all"
                  [ngClass]="courseForm.get('accessType')?.value === a.value
                    ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text-secondary)]'">
                  {{ a.label }}
                </button>
              </div>
            </div>

            <!-- Price (shown only if PAID) -->
            <div *ngIf="courseForm.get('accessType')?.value === 'PAID'">
              <label class="course-label">Price (GH₵) *</label>
              <input formControlName="price" type="number" class="form-input rounded-xl"
                placeholder="0.00" min="0.01" step="0.01"/>
            </div>

            <!-- Duration (video/audio) -->
            <div *ngIf="courseForm.get('type')?.value !== 'EBOOK'">
              <label class="course-label">Duration</label>
              <input formControlName="duration" type="text" class="form-input rounded-xl"
                placeholder="e.g. 1h 45m"/>
            </div>

            <!-- Page count (ebook) -->
            <div *ngIf="courseForm.get('type')?.value === 'EBOOK'">
              <label class="course-label">Page Count</label>
              <input formControlName="pageCount" type="number" class="form-input rounded-xl"
                placeholder="e.g. 80"/>
            </div>

            <!-- Submit -->
            <button type="submit"
              [disabled]="saving || courseForm.invalid"
              class="btn-primary w-full py-4 rounded-2xl flex items-center justify-center
                     gap-2 font-bold text-sm disabled:opacity-50">
              <i *ngIf="saving" class="ri-loader-4-line animate-spin"></i>
              <i *ngIf="!saving" [class]="editingCourse ? 'ri-save-line' : 'ri-add-circle-line'"></i>
              {{ saving ? 'Saving…' : editingCourse ? 'Update Course' : 'Create Course' }}
            </button>

          </form>
        </div>
      </div>

      <!-- Delete confirm -->
      <app-confirm-modal
        *ngIf="showDeleteModal"
        title="Delete Course"
        [message]="'Delete &quot;' + (deletingCourse?.title || '') + '&quot;? All purchases will lose access.'"
        confirmText="Delete"
        type="error"
        [loading]="deleting"
        (confirmed)="deleteCourse()"
        (cancelled)="showDeleteModal = false">
      </app-confirm-modal>

    </div>
  `,
  styles: [`
    .course-label {
      display: block;
      font-size: 11px; font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase; letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .skeleton {
      background: linear-gradient(90deg,
        var(--color-border) 25%,
        color-mix(in srgb, var(--color-border) 60%, transparent) 50%,
        var(--color-border) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `],
})
export class ManageCoursesComponent implements OnInit {
  courses: any[] = [];
  loading  = true;
  saving   = false;
  deleting = false;
  showForm        = false;
  showDeleteModal = false;
  editingCourse: any  = null;
  deletingCourse: any = null;
  thumbFile: File | null    = null;
  thumbPreview: string | null = null;
  toggling: Record<string, boolean> = {};
  courseForm!: FormGroup;

  courseTypes = [
    { label: 'Video',  value: 'VIDEO', icon: 'ri-video-line'     },
    { label: 'Ebook',  value: 'EBOOK', icon: 'ri-book-2-line'    },
    { label: 'Audio',  value: 'AUDIO', icon: 'ri-headphone-line' },
  ];
  accessTypes = [
    { label: 'Paid',  value: 'PAID' },
    { label: 'Free',  value: 'FREE' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadCourses();
  }

  private buildForm(data?: any) {
    this.courseForm = this.fb.group({
      title:       [data?.title       || '', Validators.required],
      description: [data?.description || ''],
      type:        [data?.type        || 'VIDEO', Validators.required],
      accessType:  [data?.accessType  || 'PAID'],
      price:       [data?.price       ?? null],
      duration:    [data?.duration    || ''],
      pageCount:   [data?.pageCount   || null],
    });
  }

  loadCourses() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/courses/my/list`).subscribe({
      next: (res) => { this.courses = res.data?.courses || []; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  openForm(course?: any) {
    this.editingCourse = course || null;
    this.thumbPreview  = course?.thumbnail || null;
    this.thumbFile     = null;
    this.buildForm(course);
    this.showForm = true;
  }

  closeForm() {
    this.showForm      = false;
    this.editingCourse = null;
    this.thumbPreview  = null;
    this.thumbFile     = null;
  }

  onThumbChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.thumbFile = file;
    const r = new FileReader();
    r.onload = (e) => this.thumbPreview = e.target?.result as string;
    r.readAsDataURL(file);
  }

  saveCourse() {
    if (this.courseForm.invalid) return;
    this.saving = true;
    const body = this.courseForm.getRawValue();
    if (body.accessType === 'FREE') body.price = 0;

    const req = this.editingCourse
      ? this.http.put<any>(`${environment.apiUrl}/courses/${this.editingCourse.id}`, body)
      : this.http.post<any>(`${environment.apiUrl}/courses`, body);

    req.subscribe({
      next: (res) => {
        const courseId = res.data?.course?.id || this.editingCourse?.id;
        if (this.thumbFile && courseId) {
          const fd = new FormData();
          fd.append('thumbnail', this.thumbFile);
          this.http.post(`${environment.apiUrl}/courses/${courseId}/thumbnail`, fd).subscribe({
            next: () => this.finishSave(),
            error: () => { this.toast.error('Saved but thumbnail upload failed'); this.finishSave(); },
          });
        } else {
          this.finishSave();
        }
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'Save failed');
      },
    });
  }

  private finishSave() {
    this.saving = false;
    this.toast.success(this.editingCourse ? 'Course updated!' : 'Course created!');
    this.closeForm();
    this.loadCourses();
  }

  uploadFile(course: any, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    this.http.post(`${environment.apiUrl}/courses/${course.id}/file`, fd).subscribe({
      next: () => {
        course.fileUrl = 'uploaded';
        this.toast.success('File uploaded successfully!');
      },
      error: (err) => this.toast.error(err.error?.message || 'Upload failed'),
    });
  }

  togglePublish(course: any) {
    if (!course.fileUrl && !course.isPublished) {
      this.toast.error('Please upload the course file before publishing');
      return;
    }
    this.toggling = { ...this.toggling, [course.id]: true };
    this.http.patch(`${environment.apiUrl}/courses/${course.id}/publish`, {}).subscribe({
      next: (res: any) => {
        course.isPublished = res.data?.course?.isPublished ?? !course.isPublished;
        this.toggling = { ...this.toggling, [course.id]: false };
        this.toast.success(course.isPublished ? 'Course is now live!' : 'Course unpublished');
      },
      error: (err) => {
        this.toggling = { ...this.toggling, [course.id]: false };
        this.toast.error(err.error?.message || 'Failed to update');
      },
    });
  }

  confirmDelete(course: any) {
    this.deletingCourse = course;
    this.showDeleteModal = true;
  }

  deleteCourse() {
    if (!this.deletingCourse) return;
    this.deleting = true;
    this.http.delete(`${environment.apiUrl}/courses/${this.deletingCourse.id}`).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== this.deletingCourse.id);
        this.deleting = false;
        this.showDeleteModal = false;
        this.deletingCourse = null;
        this.toast.success('Course deleted');
      },
      error: () => { this.deleting = false; this.toast.error('Delete failed'); },
    });
  }

  typeIcon(type: CourseType): string {
    return { VIDEO: 'ri-video-line', EBOOK: 'ri-book-2-line', AUDIO: 'ri-headphone-line' }[type] || 'ri-file-line';
  }

  typeColor(type: CourseType): string {
    return { VIDEO: '#7C3AED', EBOOK: '#0EA5E9', AUDIO: '#F59E0B' }[type] || '#71717A';
  }

  fileAccept(type: CourseType): string {
    return { VIDEO: 'video/*', EBOOK: 'application/pdf', AUDIO: 'audio/*' }[type] || '*';
  }
}