import { Service, inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';
import { HttpCancelService } from '@rdpms/core/services';

@Service()
export class LoadingService {

  private router = inject(Router);
  private httpCancelService = inject(HttpCancelService);
  
  private loadingSubject = new BehaviorSubject<Record<string, boolean>>({"global": false});
  public readonly loadingStates$ = this.loadingSubject.asObservable();

  constructor() {
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
