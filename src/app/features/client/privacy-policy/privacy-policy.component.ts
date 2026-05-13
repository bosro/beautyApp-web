import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  template: `
    <div class="pp-page">
      <!-- Header -->
      <div class="pp-header">
        <button class="pp-back-btn" (click)="goBack()">
          <i class="ri-arrow-left-line"></i>
        </button>
        <h1 class="pp-title">Privacy Policy</h1>
        <div class="pp-spacer"></div>
      </div>

      <div class="pp-scroll">
        <!-- Banner -->
        <div class="pp-update-banner">
          <i class="ri-time-line"></i>
          <span>Last updated: December 30, 2024</span>
        </div>

        <!-- Content -->
        <div class="pp-content">

          <section class="pp-section">
            <h2 class="pp-section-title">1. Introduction</h2>
            <p class="pp-paragraph">
              At Beauty App, we respect your privacy and are committed to protecting your personal data.
              This Privacy Policy explains how we collect, use, store, and protect your information when
              you use our mobile application.
            </p>
            <p class="pp-paragraph">
              By using Beauty App, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">2. Information We Collect</h2>

            <h3 class="pp-sub-title">2.1 Personal Information</h3>
            <p class="pp-paragraph">When you register and use our app, we may collect:</p>
            <ul class="pp-list">
              <li>Name and contact information</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Profile picture</li>
              <li>Payment information</li>
              <li>Booking history</li>
            </ul>

            <h3 class="pp-sub-title">2.2 Location Data</h3>
            <p class="pp-paragraph">
              We collect your location data to show nearby salons and provide location-based services.
              You can control location permissions through your device settings.
            </p>

            <h3 class="pp-sub-title">2.3 Usage Data</h3>
            <p class="pp-paragraph">We automatically collect information about how you use our app, including:</p>
            <ul class="pp-list">
              <li>Device information</li>
              <li>IP address</li>
              <li>App usage statistics</li>
              <li>Search queries</li>
              <li>Crash reports</li>
            </ul>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">3. How We Use Your Information</h2>
            <p class="pp-paragraph">We use your information to:</p>
            <ul class="pp-list">
              <li>Provide and maintain our services</li>
              <li>Process your bookings and payments</li>
              <li>Send you notifications and updates</li>
              <li>Improve our app and user experience</li>
              <li>Provide customer support</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">4. Sharing Your Information</h2>
            <p class="pp-paragraph">We may share your information with:</p>

            <h3 class="pp-sub-title">4.1 Service Providers</h3>
            <p class="pp-paragraph">
              We share necessary information with beauty professionals to facilitate your bookings.
            </p>

            <h3 class="pp-sub-title">4.2 Payment Processors</h3>
            <p class="pp-paragraph">
              Payment information is shared with secure payment processors to complete transactions.
            </p>

            <h3 class="pp-sub-title">4.3 Analytics Services</h3>
            <p class="pp-paragraph">
              We use third-party analytics services to understand app usage and improve our services.
            </p>

            <h3 class="pp-sub-title">4.4 Legal Requirements</h3>
            <p class="pp-paragraph">
              We may disclose your information if required by law or to protect our rights and safety.
            </p>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">5. Data Security</h2>
            <p class="pp-paragraph">
              We implement appropriate security measures to protect your personal information, including:
            </p>
            <ul class="pp-list">
              <li>Encryption of sensitive data</li>
              <li>Secure data storage</li>
              <li>Regular security audits</li>
              <li>Access controls</li>
            </ul>
            <p class="pp-paragraph">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">6. Your Rights</h2>
            <p class="pp-paragraph">You have the right to:</p>
            <ul class="pp-list">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Export your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">7. Data Retention</h2>
            <p class="pp-paragraph">
              We retain your personal information for as long as necessary to provide our services and comply
              with legal obligations. When you delete your account, we will delete or anonymize your personal
              data within 30 days.
            </p>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">8. Children's Privacy</h2>
            <p class="pp-paragraph">
              Our services are not intended for children under 18. We do not knowingly collect personal
              information from children. If you believe we have collected information from a child, please
              contact us immediately.
            </p>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">9. Cookies and Tracking</h2>
            <p class="pp-paragraph">
              We use cookies and similar tracking technologies to improve your experience. You can control
              cookie preferences through your device settings.
            </p>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">10. Changes to This Policy</h2>
            <p class="pp-paragraph">
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              through the app or via email. The updated policy will be effective immediately upon posting.
            </p>
          </section>

          <section class="pp-section">
            <h2 class="pp-section-title">11. Contact Us</h2>
            <p class="pp-paragraph">
              If you have questions about this Privacy Policy or want to exercise your rights, please contact us:
            </p>
            <div class="pp-contact-card">
              <div class="pp-contact-row">
                <i class="ri-mail-line"></i>
                <span>privacy&#64;beautyapp.com</span>
              </div>
              <div class="pp-contact-row">
                <i class="ri-phone-line"></i>
                <span>+233 50 123 4567</span>
              </div>
              <div class="pp-contact-row">
                <i class="ri-map-pin-line"></i>
                <span>Accra, Greater Accra, Ghana</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .pp-page {
      min-height: 100vh;
      background-color: var(--color-background);
      display: flex;
      flex-direction: column;
    }

    .pp-header {
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

    .pp-back-btn {
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

    .pp-back-btn:hover { opacity: 0.7; }

    .pp-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      flex: 1;
      text-align: center;
    }

    .pp-spacer { width: 36px; }

    .pp-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 24px 20px;
      max-width: 760px;
      margin: 0 auto;
      width: 100%;
    }

    .pp-update-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #E3F2FD;
      color: #1976D2;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 28px;
    }

    .pp-content { display: flex; flex-direction: column; gap: 0; }

    .pp-section {
      margin-bottom: 28px;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--color-border, #f0f0f0);
    }

    .pp-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .pp-section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 12px;
    }

    .pp-sub-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .pp-paragraph {
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    .pp-list {
      list-style: none;
      padding: 0;
      margin: 0 0 12px 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pp-list li {
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text-secondary);
      padding-left: 16px;
      position: relative;
    }

    .pp-list li::before {
      content: '•';
      position: absolute;
      left: 4px;
      color: var(--color-primary);
    }

    .pp-contact-card {
      background-color: var(--color-bg-secondary, #f8f8f8);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }

    .pp-contact-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: var(--color-text-primary);
    }

    .pp-contact-row i {
      font-size: 16px;
      color: var(--color-primary);
      flex-shrink: 0;
    }
  `]
})
export class PrivacyPolicyComponent {
  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/client/settings']); }
}