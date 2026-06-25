import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, startWith, Subscription, switchMap, throttleTime, timer } from 'rxjs';
import { AuthService } from '@rdpms/services';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {

  private ngZone = inject(NgZone);
  private router = inject(Router);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID); // Inject Platform ID
  
  
  private timeoutId?: Subscription;
  private readonly TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes in ms
  
  constructor(){
    // Only start tracking if we are in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.initInactivityListener();
    }
  }

  private initInactivityListener(){
    const activity$ = merge(
      fromEvent(window, 'click'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'mousemove'),
    ).pipe(throttleTime(2000));

    this.ngZone.runOutsideAngular(() => {
        this.timeoutId = activity$.pipe(
          startWith(null),
          switchMap(() => timer(this.TIMEOUT_MS))
        ).subscribe(() => {
          this.ngZone.run(() => this.logoutUser());
        });
    });
  }

  private logoutUser(){
    this.authService.logout();
    this.stopTracking();
    this.router.navigate(['/login'], {queryParams: {reason: 'session-exprired'} });
  }

  stopTracking(){
    this.timeoutId?.unsubscribe();
  }

}
