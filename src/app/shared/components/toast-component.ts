import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '@rdpms/core/services';

@Component({
  selector: 'toasts-component',
  imports: [NgbToastModule],
  template: `
    @for (toast of toastService.toasts(); track toast) {
      <ngb-toast
        class="mb-2 custom-toast"
        [class]="toast.classname"
        [autohide]="true"
        [delay]="toast.delay || 3000"
        (hidden)="toastService.remove(toast)"
      >
        <!-- {{toast.text}} -->
        <div
          class="d-flex justify-content-between align-items-start p-2"
          [class.text-white]="isDarkBg(toast.classname)"
          [class.text-dark]="!isDarkBg(toast.classname)"
        >
          <span>{{ toast.text }}</span>

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
      right: 15px !important; */
        z-index: 1200;
        max-height: calc(100vh - 50px);
        overflow-y: auto;
        &::-webkit-scrollbar {
          width: 6px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
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
    class: 'toast-container position-fixed top-0 end-0 p-3',
    style: 'z-index: 1200;', //if not worked use inside styles: host
  },
})
export class ToastComponent {
  toastService = inject(ToastService);

  isDarkBg(classname: string | undefined): boolean {
    if (!classname) return false;
    // These backgrounds require light (white) text/buttons
    const darkBackgrounds = ['bg-success', 'bg-danger', 'bg-primary', 'bg-dark'];
    return darkBackgrounds.some((bg) => classname?.includes(bg));
  }
}
