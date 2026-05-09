import { Injectable, signal } from '@angular/core';

export interface Toast{
  text: string;
  classname?: string;
  delay?: number;
  showClose?: boolean;
  showProgress?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(text: string, options: Partial<Toast> = {}){
    const toast: Toast = { text, ...options };
    this.toasts.update(t => [...t, toast]);
  }

  remove(toast: Toast){
    this.toasts.update(t => t.filter(x => x !== toast));
  }
}
