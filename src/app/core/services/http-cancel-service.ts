import { inject, OnDestroy, Service } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subject, filter } from 'rxjs';

@Service()
export class HttpCancelService implements OnDestroy {
  private router = inject(Router);
  private cancelRequests$ = new Subject<void>();

  constructor(){
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => this.cancelPendingRequests());
  }

  onCancelRequests() {
    return this.cancelRequests$.asObservable();
  }

  cancelPendingRequests() {
    this.cancelRequests$.next();
  }

  ngOnDestroy() {
    this.cancelRequests$.complete();
  }
}