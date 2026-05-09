import { Injectable, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Event as RouterEvent, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, map, Observable, tap } from 'rxjs';
import { HttpCancelService } from './http-cancel-service';

@Injectable({ providedIn: 'root' })
export class LoadingService {

  private httpCancelService = inject(HttpCancelService);
  
  private loadingSubject = new BehaviorSubject<Record<string, boolean>>({"global": false});
  public readonly loadingStates$ = this.loadingSubject.asObservable();

  constructor(private router: Router) {

    this.router.events.subscribe(event => {
      const isStarting = event instanceof NavigationStart;
      const isEnding = event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError;
      
      if(isEnding) { this.updateState('global', false); }
      if(isStarting) { this.updateState('global', true); }

      if(isStarting) { this.httpCancelService.cancelPendingRequests(); }
    });
  }

  isLoading(id: string): Observable<boolean> {
    return this.loadingStates$.pipe(map(states => !!states[id]), distinctUntilChanged() );
  }

  show(id: string = 'global') { this.updateState(id, true); }
  hide(id: string = 'global') { this.updateState(id, false); }

  private updateState(id: string, state: boolean) {
    const current = this.loadingSubject.getValue()
    this.loadingSubject.next({ ...current, [id]: state });
  }
}
