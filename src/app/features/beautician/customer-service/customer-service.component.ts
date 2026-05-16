import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface ContactMethod {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

@Component({
  selector: 'app-customer-service',
  template: `
    <div class="cs-page">
      <!-- Header -->
      <div class="cs-header">
        <button class="cs-back-btn" (click)="goBack()">
          <i class="ri-arrow-left-line"></i>
        </button>
        <h1 class="cs-title">Customer Service</h1>
        <div class="cs-spacer"></div>
      </div>

      <!-- Tabs -->
      <div class="cs-tabs">
        <button
          class="cs-tab"
          [class.active]="activeTab === 'contact'"
          (click)="activeTab = 'contact'"
        >Contact Us</button>
        <button
          class="cs-tab"
          [class.active]="activeTab === 'faq'"
          (click)="activeTab = 'faq'"
        >FAQ</button>
      </div>

      <div class="cs-scroll">

        <!-- ===== CONTACT TAB ===== -->
        <ng-container *ngIf="activeTab === 'contact'">

          <!-- Contact Methods -->
          <section class="cs-section">
            <h2 class="cs-section-title">Get in Touch</h2>
            <div class="cs-contact-grid">
              <button
                *ngFor="let m of contactMethods"
                class="cs-contact-card"
                (click)="m.action()"
              >
                <div class="cs-contact-icon-wrap">
                  <i [class]="m.icon"></i>
                </div>
                <p class="cs-contact-name">{{ m.title }}</p>
                <p class="cs-contact-sub">{{ m.subtitle }}</p>
              </button>
            </div>
          </section>

          <!-- Send Message -->
          <section class="cs-section">
            <h2 class="cs-section-title">Send Us a Message</h2>
            <div class="cs-message-card">
              <textarea
                class="cs-textarea"
                [(ngModel)]="message"
                placeholder="Describe your issue or question..."
                rows="5"
              ></textarea>
              <button class="cs-send-btn" (click)="handleSend()">
                <i class="ri-send-plane-line"></i>
                Send Message
              </button>
            </div>
          </section>

          <!-- Operating Hours -->
          <section class="cs-section">
            <h2 class="cs-section-title">Operating Hours</h2>
            <div class="cs-hours-card">
              <div class="cs-hours-row" *ngFor="let h of hours; let last = last" [class.last]="last">
                <span class="cs-hours-day">{{ h.day }}</span>
                <span class="cs-hours-time">{{ h.time }}</span>
              </div>
            </div>
          </section>

          <!-- Social -->
          <section class="cs-section">
            <h2 class="cs-section-title">Follow Us</h2>
            <div class="cs-social-row">
              <a *ngFor="let s of socials" [href]="s.url" target="_blank" class="cs-social-btn">
                <i [class]="s.icon"></i>
              </a>
            </div>
          </section>

        </ng-container>

        <!-- ===== FAQ TAB ===== -->
        <ng-container *ngIf="activeTab === 'faq'">
          <section class="cs-section">
            <h2 class="cs-section-title">Frequently Asked Questions</h2>
            <div class="cs-faq-list">
              <div
                *ngFor="let faq of faqs"
                class="cs-faq-card"
                [class.expanded]="expandedId === faq.id"
                (click)="toggleFAQ(faq.id)"
              >
                <div class="cs-faq-top">
                  <span class="cs-faq-badge">{{ faq.category }}</span>
                  <i class="ri-arrow-down-s-line cs-faq-chevron"></i>
                </div>
                <p class="cs-faq-question">{{ faq.question }}</p>
                <p class="cs-faq-answer" *ngIf="expandedId === faq.id">{{ faq.answer }}</p>
              </div>
            </div>
          </section>
        </ng-container>

        <!-- Help Banner -->
        <div class="cs-help-banner">
          <div class="cs-help-icon-wrap">
            <i class="ri-customer-service-2-line"></i>
          </div>
          <div class="cs-help-text">
            <p class="cs-help-title">Need More Help?</p>
            <p class="cs-help-sub">Visit our Help Center for detailed guides and tutorials</p>
          </div>
          <button class="cs-help-arrow">
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>

        <div style="height: 40px;"></div>
      </div>

      <!-- Success Toast -->
      <div class="cs-toast" [class.show]="showToast">
        <i class="ri-checkbox-circle-fill"></i>
        <span>Message sent! We'll respond within 24 hours.</span>
      </div>
    </div>
  `,
  styles: [`
    .cs-page {
      min-height: 100vh;
      background-color: var(--color-background);
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .cs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .cs-back-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background-color: var(--color-bg-secondary, #f5f5f5);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      color: var(--color-text-primary);
      transition: opacity 0.2s;
    }
    .cs-back-btn:hover { opacity: 0.7; }

    .cs-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      flex: 1;
      text-align: center;
    }
    .cs-spacer { width: 36px; }

    /* Tabs */
    .cs-tabs {
      display: flex;
      gap: 10px;
      padding: 14px 20px;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }

    .cs-tab {
      flex: 1;
      padding: 10px;
      border-radius: 10px;
      border: none;
      background-color: var(--color-bg-secondary, #f5f5f5);
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .cs-tab.active {
      background-color: var(--color-text-primary, #111);
      color: #fff;
    }

    /* Scroll */
    .cs-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 24px 20px;
      max-width: 760px;
      margin: 0 auto;
      width: 100%;
    }

    .cs-section {
      margin-bottom: 28px;
    }

    .cs-section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 14px;
    }

    /* Contact Grid */
    .cs-contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .cs-contact-card {
      background-color: var(--color-bg-secondary, #f8f8f8);
      border: none;
      border-radius: 14px;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
      text-align: center;
    }
    .cs-contact-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .cs-contact-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;
    }

    .cs-contact-icon-wrap i {
      font-size: 22px;
      color: var(--color-primary);
    }

    .cs-contact-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .cs-contact-sub {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    /* Message */
    .cs-message-card {
      background-color: var(--color-bg-secondary, #f8f8f8);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cs-textarea {
      width: 100%;
      border-radius: 10px;
      border: 1px solid var(--color-border, #e0e0e0);
      background-color: #fff;
      padding: 12px;
      font-size: 14px;
      color: var(--color-text-primary);
      resize: none;
      font-family: inherit;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }
    .cs-textarea:focus {
      border-color: var(--color-primary);
    }
    .cs-textarea::placeholder {
      color: var(--color-text-muted, #aaa);
    }

    .cs-send-btn {
      background-color: var(--color-primary);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 13px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: opacity 0.2s;
    }
    .cs-send-btn:hover { opacity: 0.87; }

    /* Hours */
    .cs-hours-card {
      background-color: var(--color-bg-secondary, #f8f8f8);
      border-radius: 14px;
      padding: 4px 16px;
      overflow: hidden;
    }

    .cs-hours-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid var(--color-border, #efefef);
    }
    .cs-hours-row.last { border-bottom: none; }

    .cs-hours-day {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .cs-hours-time {
      font-size: 14px;
      color: var(--color-text-secondary);
    }

    /* Social */
    .cs-social-row {
      display: flex;
      gap: 14px;
      justify-content: center;
    }

    .cs-social-btn {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: var(--color-bg-secondary, #f8f8f8);
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: transform 0.15s;
    }
    .cs-social-btn:hover { transform: scale(1.08); }
    .cs-social-btn i {
      font-size: 22px;
      color: var(--color-primary);
    }

    /* FAQ */
    .cs-faq-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .cs-faq-card {
      background-color: var(--color-bg-secondary, #f8f8f8);
      border-radius: 14px;
      padding: 14px 16px;
      cursor: pointer;
      transition: box-shadow 0.15s;
    }
    .cs-faq-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

    .cs-faq-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .cs-faq-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-primary);
      background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
      padding: 3px 9px;
      border-radius: 20px;
    }

    .cs-faq-chevron {
      font-size: 20px;
      color: var(--color-text-secondary);
      transition: transform 0.2s;
    }

    .cs-faq-card.expanded .cs-faq-chevron {
      transform: rotate(180deg);
    }

    .cs-faq-question {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 0;
      line-height: 1.5;
    }

    .cs-faq-answer {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.65;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--color-border, #e8e8e8);
    }

    /* Help Banner */
    .cs-help-banner {
      background-color: var(--color-primary);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 0;
    }

    .cs-help-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cs-help-icon-wrap i {
      font-size: 22px;
      color: #fff;
    }

    .cs-help-text { flex: 1; }

    .cs-help-title {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 3px;
    }
    .cs-help-sub {
      font-size: 12px;
      color: rgba(255,255,255,0.85);
    }

    .cs-help-arrow {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: rgba(255,255,255,0.2);
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .cs-help-arrow i {
      font-size: 18px;
      color: #fff;
    }

    /* Toast */
    .cs-toast {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background-color: #1B5E20;
      color: #fff;
      padding: 12px 20px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      opacity: 0;
      transition: all 0.3s;
      z-index: 100;
      white-space: nowrap;
    }
    .cs-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .cs-toast i { font-size: 18px; }
  `]
})
export class CustomerServiceComponent implements OnInit {
  activeTab: 'contact' | 'faq' = 'contact';
  message = '';
  expandedId: string | null = null;
  showToast = false;

  contactMethods: ContactMethod[] = [];

  hours = [
    { day: 'Monday – Friday', time: '8:00 AM – 8:00 PM' },
    { day: 'Saturday',        time: '9:00 AM – 6:00 PM' },
    { day: 'Sunday',          time: '10:00 AM – 4:00 PM' },
  ];

  socials = [
    { icon: 'ri-facebook-fill', url: 'https://facebook.com' },
    { icon: 'ri-twitter-x-fill', url: 'https://twitter.com' },
    { icon: 'ri-instagram-line', url: 'https://instagram.com' },
    { icon: 'ri-tiktok-fill', url: 'https://tiktok.com' },
  ];

  faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I book an appointment?',
      answer: "To book an appointment, browse salons in your area, select a service, choose your preferred date and time, and confirm your booking. You'll receive a confirmation notification.",
      category: 'Booking',
    },
    {
      id: '2',
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes, you can cancel or reschedule bookings from "My Bookings". Please note that cancellation policies vary by salon. Some may charge a fee for late cancellations.',
      category: 'Booking',
    },
    {
      id: '3',
      question: 'How do I leave a review?',
      answer: 'After your appointment, go to "My Bookings", select the completed booking, and tap "Leave a Review". Your feedback helps other users!',
      category: 'Reviews',
    },
    {
      id: '4',
      question: 'Are my personal details safe?',
      answer: 'Yes, all personal information is encrypted and stored securely. We never share your data with third parties without your consent.',
      category: 'Security',
    },
    {
      id: '5',
      question: 'How does the referral program work?',
      answer: 'Share your unique referral code with friends. When they sign up and complete their first booking, you both receive GHS 20 credit.',
      category: 'Rewards',
    },
    {
      id: '6',
      question: 'Can I change my profile information?',
      answer: 'Yes, go to Profile > Profile Settings to update your name, email, phone number, and profile picture.',
      category: 'Account',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.contactMethods = [
      { id: '1', title: 'Call Us',     subtitle: '+233 50 123 4567',       icon: 'ri-phone-line',          action: () => window.open('tel:+233501234567') },
      { id: '2', title: 'Email Us',    subtitle: 'support@beautyapp.com',  icon: 'ri-mail-line',           action: () => window.open('mailto:support@beautyapp.com') },
      { id: '3', title: 'WhatsApp',    subtitle: 'Chat with us',           icon: 'ri-whatsapp-line',       action: () => window.open('https://wa.me/233501234567') },
      { id: '4', title: 'Live Chat',   subtitle: 'Available 24/7',         icon: 'ri-chat-3-line',         action: () => this.showInfoToast() },
    ];
  }

  toggleFAQ(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  handleSend() {
    if (!this.message.trim()) return;
    this.message = '';
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }

  showInfoToast() {
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }

  goBack() { this.router.navigate(['/beautician/profile']); }
}