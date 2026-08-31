import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { Toast, ToastService } from '@rdpms/core/services';

@Component({
  selector: 'toasts-component',
  imports: [NgbToastModule],
  template: `
    @for (toast of toastService.toasts(); track toast) {
      <ngb-toast
        class="mb-2 custom-toast"
        [class]="toast.classname"
        [class.paused]="toast.isPaused"
        [autohide]="!toast.isPaused"
        [delay]="toast.delay || 1000"
        (mouseenter)="toast.isPaused = true"
        (mouseleave)="toast.isPaused = false"
        (hidden)="toastService.remove(toast)"
      >
        <div
          class="d-flex justify-content-between align-items-start p-2"
          [class.text-white]="isDarkBg(toast.classname)"
          [class.text-dark]="!isDarkBg(toast.classname)"
        >
          <span class="text-wrap text-break">{{ toast.text }}</span>

          @if (toast.showClose !== false) {
            <button
              type="button"
              class="btn-close ms-2 flex-shrink-0"
              [class.btn-close-white]="isDarkBg(toast.classname)"
              (click)="toastService.remove(toast)"
            ></button>
          }
        </div>

        @if (toast.showProgress) {
          <div class="toast-progress">
            <div
              class="progress-fill"
              [class.bg-white-50]="isDarkBg(toast.classname)"
              [class.bg-dark-50]="!isDarkBg(toast.classname)"
              [style.animation-duration]="(toast.delay || 5000) + 'ms'"
            ></div>
          </div>
        }
      </ngb-toast>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        /* top: 56px !important; 
        right: 2rem !important; */
        z-index: 1200;
        max-height: calc(100vh - 10px);
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-gutter: stable; 
      }
      .custom-toast {
        position: relative;
        overflow: hidden;
        padding-bottom: 4px;
      }
      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 4px;
      }

      .custom-toast.paused .progress-fill { 
        animation-play-state: paused; 
      }
        
      .progress-fill {
        width: 100%;
        height: 100%;
        animation: shrink linear forwards;
      }
      .bg-dark-50 {
        background: rgba(0, 0, 0, 0.2) !important;
      }
      .bg-white-50 {
        background: rgba(255, 255, 255, 0.7) !important;
      }
      @keyframes shrink {
        from { width: 100%; }
        to { width: 0%; }
      }
    `,
  ],
  host: {
    class: 'toast-container position-fixed top-0 end-0 p-2 pe-1',
    style: 'z-index: 1200;', //if not worked use inside styles: host
  },
})
export class ToastComponent {

  protected toastService = inject(ToastService);
  
  isDarkBg(classname: string | undefined): boolean {
    if (!classname) return false;
    // These backgrounds require light (white) text/buttons
    const darkBackgrounds = ['bg-success', 'bg-danger', 'bg-primary', 'bg-dark'];
    return darkBackgrounds.some((bg) => classname?.includes(bg));
  }
}
