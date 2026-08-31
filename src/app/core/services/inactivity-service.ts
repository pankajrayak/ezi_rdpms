import { inject, Service } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@rdpms/services';

@Service()
export class InactivityService {

  private router = inject(Router);
  private authService = inject(AuthService);
  
  private timerId: any = null;
  private readonly TIMEOUT_MS = 30 * 60 * 1000; // 30 Minutes in ms
  
  constructor(){
    this.startTracking();
  }

  private startTracking() {
    this.resetTimer();
    const activityEvents = ['click', 'scroll', 'keydown', 'mousemove'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, () => this.resetTimer(), { passive: true });
    });
  }

  private resetTimer() {
    if(this.timerId) {
      clearTimeout(this.timerId);
    }

    this.timerId = setTimeout(() => {
      this.logoutUser();
    }, this.TIMEOUT_MS);
  }

  private logoutUser() {
    this.stopTracking();
    this.authService.logout(null);
    
    this.router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
  }

  public stopTracking() {
    if(this.timerId) {
      clearTimeout(this.timerId);
    }
    
    // Clean up event listeners to avoid memory leaks
    const activityEvents = ['click', 'scroll', 'keydown', 'mousemove'];
    activityEvents.forEach(event => {
      window.removeEventListener(event, () => this.resetTimer());
    });
  }

}
