import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorHandlerService implements ErrorHandler {

  private ngZone = inject(NgZone);
  private platformId = inject(PLATFORM_ID); // Inject Platform ID
  private toastService = inject(ToastService);

  handleError(error: any): void {
    let message = error.message ?? error.toString();

    if(error instanceof HttpErrorResponse){
      if(typeof error.error === 'string'){
        message = error.error;
      }else if(error.error?.message){
        message = error.error.message;
      }else{
        message = `Backend returned code ${error.status}`;
      }
    }

    this.toastService.show(message, { classname: 'bg-danger text-light', delay: 5000 })

    // if(isPlatformBrowser(this.platformId)) {
    //   this.ngZone.run(() => {
    //     this.toastService.show(message, { classname: 'bg-danger text-light', delay: 5000 })
    //   });
    // }

  }
}
