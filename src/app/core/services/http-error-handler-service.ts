import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Service } from '@angular/core';
import { ToastService } from '@rdpms/core/services';

@Service()
export class HttpErrorHandlerService implements ErrorHandler {

  private toastService = inject(ToastService);

  handleError(err: any): void {
    const error = err?.cause ? err.cause : err;

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
  }
}
