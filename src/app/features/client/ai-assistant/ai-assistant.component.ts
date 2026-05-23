// src/app/features/client/ai-assistant/ai-assistant.component.ts
// Web equivalent of ConversationalBookingScreen for Angular

import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "@environments/environment";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  quickReplies?: string[];
  isLoading?: boolean;
  generatedImages?: { styleName: string; uri: SafeUrl; description: string }[];
}

@Component({
  selector: "app-ai-assistant",
  standalone: false,
  template: `
    <div class="min-h-screen bg-[var(--color-background)] flex flex-col">
      <!-- Header -->
      <div
        class="sticky top-0 z-10 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3"
      >
        <button
          onclick="history.back()"
          class="w-9 h-9 rounded-full bg-[var(--color-background)] flex items-center justify-center"
        >
          <i class="ri-arrow-left-line text-[var(--color-text-primary)]"></i>
        </button>
        <div class="flex items-center gap-3 flex-1">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"
          >
            <i class="ri-robot-2-line text-blue-500 text-lg"></i>
          </div>
          <div>
            <p class="text-sm font-semibold text-[var(--color-text-primary)]">
              AI Beauty Assistant
            </p>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-green-400"></div>
              <!-- <p class="text-xs text-[var(--color-text-secondary)]">
                Online • Powered by Gemini
              </p> -->
                 <p class="text-xs text-[var(--color-text-secondary)]">
                Online
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div
        #messagesContainer
        class="flex-1 overflow-y-auto p-4 space-y-4"
        style="max-height: calc(100vh - 140px)"
      >
        <div *ngFor="let msg of messages" [id]="msg.id">
          <!-- Bot message -->
          <div *ngIf="msg.type === 'bot'" class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"
            >
              <i class="ri-robot-2-line text-blue-500 text-sm"></i>
            </div>
            <div class="max-w-[75%]">
              <div
                class="bg-[var(--color-surface)] rounded-2xl rounded-tl-sm px-4 py-3"
              >
                <div *ngIf="msg.isLoading" class="flex gap-1 py-1">
                  <div
                    class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style="animation-delay:0ms"
                  ></div>
                  <div
                    class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style="animation-delay:150ms"
                  ></div>
                  <div
                    class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                    style="animation-delay:300ms"
                  ></div>
                </div>
                <p
                  *ngIf="!msg.isLoading"
                  class="text-sm text-[var(--color-text-primary)] whitespace-pre-line leading-relaxed"
                >
                  {{ msg.content }}
                </p>
              </div>

              <!-- Generated images -->
              <div
                *ngIf="msg.generatedImages?.length"
                class="flex gap-3 mt-2 overflow-x-auto pb-2"
              >
                <div
                  *ngFor="let img of msg.generatedImages"
                  class="flex-shrink-0 w-36 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  (click)="navigateToSearch(img.styleName)"
                >
                  <img
                    [src]="img.uri"
                    [alt]="img.styleName"
                    class="w-full h-44 object-cover"
                  />
                  <div class="bg-black/70 px-2 py-1.5">
                    <p class="text-white text-xs font-semibold truncate">
                      {{ img.styleName }}
                    </p>
                    <p class="text-white/60 text-xs">Tap to find salons →</p>
                  </div>
                </div>
              </div>

              <!-- Quick replies -->
              <div
                *ngIf="msg.quickReplies?.length && !msg.isLoading"
                class="flex flex-wrap gap-2 mt-2"
              >
                <button
                  *ngFor="let reply of msg.quickReplies"
                  (click)="sendMessage(reply)"
                  class="text-xs px-3 py-1.5 rounded-full border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  {{ reply }}
                </button>
              </div>

              <p class="text-xs text-[var(--color-text-muted)] mt-1 ml-1">
                {{ msg.timestamp | date: "shortTime" }}
              </p>
            </div>
          </div>

          <!-- User message -->
          <div *ngIf="msg.type === 'user'" class="flex justify-end">
            <div class="max-w-[75%]">
              <div
                class="bg-[var(--color-primary)] rounded-2xl rounded-tr-sm px-4 py-3"
              >
                <p
                  class="text-sm text-white whitespace-pre-line leading-relaxed"
                >
                  {{ msg.content }}
                </p>
              </div>
              <p
                class="text-xs text-[var(--color-text-muted)] mt-1 text-right mr-1"
              >
                {{ msg.timestamp | date: "shortTime" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div
        class="sticky bottom-0 bg-white dark:bg-[var(--color-surface)] border-t border-[var(--color-border)] px-4 py-3"
      >
        <div class="flex items-end gap-3 max-w-3xl mx-auto">
          <div
            class="flex-1 bg-[var(--color-background)] rounded-2xl px-4 py-3 flex items-end gap-2"
          >
            <textarea
              [(ngModel)]="inputText"
              (keydown.enter)="onEnter($event)"
              placeholder="Describe your hairstyle or ask anything..."
              rows="1"
              class="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] resize-none outline-none max-h-28"
              [disabled]="isTyping"
            ></textarea>
          </div>
          <button
            (click)="sendMessage(inputText)"
            [disabled]="!inputText.trim() || isTyping"
            class="w-11 h-11 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            [ngClass]="
              inputText.trim() && !isTyping
                ? 'bg-[var(--color-primary)]'
                : 'bg-[var(--color-border)]'
            "
          >
            <i class="ri-send-plane-fill text-white"></i>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AiAssistantComponent implements OnInit, AfterViewChecked {
  @ViewChild("messagesContainer") private messagesContainer!: ElementRef;

  messages: Message[] = [];
  inputText = "";
  isTyping = false;
  private chatHistory: ChatMessage[] = [];
  private shouldScroll = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.messages = [
      {
        id: "1",
        type: "bot",
        content:
          "Hi! I'm your AI beauty assistant 👋\n\nI can help you book appointments, find salons, or show you hairstyle ideas. What would you like to do today?",
        timestamp: new Date(),
        quickReplies: [
          "Book an appointment",
          "Find salons near me",
          "Show me hairstyles",
          "Ask a question",
        ],
      },
    ];
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;

    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage(this.inputText);
    }
  }

  async sendMessage(text: string) {
    if (!text.trim() || this.isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      type: "user",
      content: text,
      timestamp: new Date(),
    };

    const typingId = `typing-${Date.now()}`;
    const typingMsg: Message = {
      id: typingId,
      type: "bot",
      content: "",
      timestamp: new Date(),
      isLoading: true,
    };

    this.messages = [...this.messages, userMsg, typingMsg];
    this.inputText = "";
    this.isTyping = true;
    this.shouldScroll = true;

    this.http
      .post<any>(`${environment.apiUrl}/ai/chat`, {
        message: text,
        history: this.chatHistory,
      })
      .subscribe({
        next: (res) => {
          const aiRes = res.data;
          const botMsgId = `b-${Date.now()}`;

          this.chatHistory = [
            ...this.chatHistory,
            { role: "user", content: text },
            { role: "model", content: aiRes.response },
          ];

          const botMsg: Message = {
            id: botMsgId,
            type: "bot",
            content: aiRes.response,
            timestamp: new Date(),
            quickReplies: aiRes.quickReplies,
          };

          this.messages = this.messages
            .filter((m) => m.id !== typingId)
            .concat(botMsg);

          this.isTyping = false;
          this.shouldScroll = true;

          // Generate images if user asked about hairstyles
          const wantsImages =
            /show|generate|hairstyle|style|braids|fade|curly|afro/i.test(text);
          if (wantsImages && text.length > 10) {
            this.generateImages(text, botMsgId);
          }
        },
        error: () => {
          this.messages = this.messages
            .filter((m) => m.id !== typingId)
            .concat({
              id: `err-${Date.now()}`,
              type: "bot",
              content:
                "Sorry, I'm having trouble connecting. Please try again.",
              timestamp: new Date(),
              quickReplies: ["Try again", "Find salons"],
            });
          this.isTyping = false;
          this.shouldScroll = true;
        },
      });
  }

  private generateImages(description: string, botMsgId: string) {
    this.http
      .post<any>(`${environment.apiUrl}/ai/generate-from-description`, {
        description,
      })
      .subscribe({
        next: (res) => {
          const images = res.data.images.map((img: any) => ({
            styleName: img.styleName,
            description: img.description,
            uri: this.sanitizer.bypassSecurityTrustUrl(
              `data:${img.mimeType};base64,${img.imageBase64}`,
            ),
          }));

          this.messages = this.messages.map((m) =>
            m.id === botMsgId ? { ...m, generatedImages: images } : m,
          );
          this.shouldScroll = true;
        },
        error: () => {}, // Images are bonus — silent fail
      });
  }

  navigateToSearch(query: string) {
    this.router.navigate(["/client/search"], { queryParams: { q: query } });
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
}




