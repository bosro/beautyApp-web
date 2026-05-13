import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms-conditions',
  template: `
    <div class="tc-page">
      <!-- Header -->
      <div class="tc-header">
        <button class="tc-back-btn" (click)="goBack()">
          <i class="ri-arrow-left-line"></i>
        </button>
        <h1 class="tc-title">Terms &amp; Conditions</h1>
        <div class="tc-spacer"></div>
      </div>

      <div class="tc-scroll">
        <!-- Banner -->
        <div class="tc-update-banner">
          <i class="ri-time-line"></i>
          <span>Last updated: December 30, 2024</span>
        </div>

        <!-- Content -->
        <div class="tc-content">

          <section class="tc-section">
            <h2 class="tc-section-title">1. Introduction</h2>
            <p class="tc-paragraph">
              Welcome to Beauty App. These Terms and Conditions govern your use of our mobile application
              and services. By accessing or using our app, you agree to be bound by these terms.
            </p>
            <p class="tc-paragraph">
              If you do not agree with any part of these terms, you may not use our services.
            </p>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">2. Account Registration</h2>
            <p class="tc-paragraph">
              To use certain features of our app, you must register for an account. You agree to:
            </p>
            <ul class="tc-list">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">3. Service Usage</h2>
            <p class="tc-paragraph">
              Beauty App provides a platform to connect users with beauty service providers. You agree to:
            </p>
            <ul class="tc-list">
              <li>Use the service only for lawful purposes</li>
              <li>Not interfere with or disrupt the service</li>
              <li>Not attempt to gain unauthorized access</li>
              <li>Respect the rights of other users and service providers</li>
            </ul>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">4. Bookings and Payments</h2>
            <h3 class="tc-sub-title">4.1 Making Bookings</h3>
            <p class="tc-paragraph">
              When you make a booking through our app, you enter into a direct contract with the service
              provider. Beauty App acts as an intermediary platform.
            </p>
            <h3 class="tc-sub-title">4.2 Payment Terms</h3>
            <p class="tc-paragraph">
              All payments must be made through the app using our secure payment system. Prices are displayed
              in Ghanaian Cedis (GHS) and include applicable taxes unless otherwise stated.
            </p>
            <h3 class="tc-sub-title">4.3 Cancellation Policy</h3>
            <p class="tc-paragraph">
              Cancellation terms vary by service provider. Please review the specific cancellation policy
              before making a booking. Late cancellations may result in charges.
            </p>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">5. User Content</h2>
            <p class="tc-paragraph">
              You retain ownership of content you submit to our app (reviews, photos, etc.). By submitting
              content, you grant us a worldwide, non-exclusive license to use, display, and distribute your
              content in connection with our services.
            </p>
            <p class="tc-paragraph">You agree that your content will not:</p>
            <ul class="tc-list">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Contain offensive or inappropriate material</li>
              <li>Include false or misleading information</li>
            </ul>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">6. Intellectual Property</h2>
            <p class="tc-paragraph">
              The Beauty App platform, including its software, design, text, graphics, and other content,
              is owned by us and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p class="tc-paragraph">
              You may not copy, modify, distribute, sell, or lease any part of our services without our
              written permission.
            </p>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">7. Limitation of Liability</h2>
            <p class="tc-paragraph">Beauty App is not liable for:</p>
            <ul class="tc-list">
              <li>The quality or outcome of services provided by beauty professionals</li>
              <li>Any disputes between users and service providers</li>
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of data or service interruptions</li>
            </ul>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">8. Termination</h2>
            <p class="tc-paragraph">
              We reserve the right to suspend or terminate your account at any time for violations of these
              terms or for any other reason at our discretion.
            </p>
            <p class="tc-paragraph">
              You may terminate your account at any time through the app settings.
            </p>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">9. Changes to Terms</h2>
            <p class="tc-paragraph">
              We may modify these Terms and Conditions at any time. We will notify you of significant
              changes through the app or via email. Your continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">10. Governing Law</h2>
            <p class="tc-paragraph">
              These Terms and Conditions are governed by the laws of Ghana. Any disputes arising from
              these terms shall be subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
          </section>

          <section class="tc-section">
            <h2 class="tc-section-title">11. Contact Us</h2>
            <p class="tc-paragraph">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div class="tc-contact-card">
              <div class="tc-contact-row">
                <i class="ri-mail-line"></i>
                <span>support&#64;beautyapp.com</span>
              </div>
              <div class="tc-contact-row">
                <i class="ri-phone-line"></i>
                <span>+233 50 123 4567</span>
              </div>
              <div class="tc-contact-row">
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
    .tc-page {
      min-height: 100vh;
      background-color: var(--color-background);
      display: flex;
      flex-direction: column;
    }

    .tc-header {
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

    .tc-back-btn {
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

    .tc-back-btn:hover { opacity: 0.7; }

    .tc-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-primary);
      flex: 1;
      text-align: center;
    }

    .tc-spacer { width: 36px; }

    .tc-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 24px 20px;
      max-width: 760px;
      margin: 0 auto;
      width: 100%;
    }

    .tc-update-banner {
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

    .tc-content { display: flex; flex-direction: column; }

    .tc-section {
      margin-bottom: 28px;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--color-border, #f0f0f0);
    }

    .tc-section:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .tc-section-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 12px;
    }

    .tc-sub-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .tc-paragraph {
      font-size: 14px;
      line-height: 1.7;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
    }

    .tc-list {
      list-style: none;
      padding: 0;
      margin: 0 0 12px 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .tc-list li {
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text-secondary);
      padding-left: 16px;
      position: relative;
    }

    .tc-list li::before {
      content: '•';
      position: absolute;
      left: 4px;
      color: var(--color-primary);
    }

    .tc-contact-card {
      background-color: var(--color-bg-secondary, #f8f8f8);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 8px;
    }

    .tc-contact-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: var(--color-text-primary);
    }

    .tc-contact-row i {
      font-size: 16px;
      color: var(--color-primary);
      flex-shrink: 0;
    }
  `]
})
export class TermsConditionsComponent {
  constructor(private router: Router) {}
  goBack() { this.router.navigate(['/client/settings']); }
}