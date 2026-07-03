import { inject, NgZone, ResourceRef, Signal } from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, tap, throwError } from 'rxjs';

export interface RxResourceConfigOptions<T, P> {
  params: () => P | undefined | null;
  stream: (request: { params: NonNullable<P> }) => Observable<T>;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
}

export function debounceResource<T, K extends keyof T>(sourceSignal: Signal<T>, key: K, time: number = 400): Signal<T[K]>{
  return toSignal(
    toObservable(sourceSignal).pipe(
      debounceTime(time),
      distinctUntilChanged(),
      map((state) => state[key])
    ), 
    { initialValue: sourceSignal()[key] }
  );
}

export function createRxResource<T, P>(options: RxResourceConfigOptions<T, P>): ResourceRef<T | undefined> {
  const zone = inject(NgZone);

  return rxResource({
    params: options.params,
    stream: ({ params }) => options.stream({ params: params as NonNullable<P> }).pipe(
      tap({ next: (data) => 
        options.onSuccess?.(data)
      }),
      catchError(err => { 
        options.onError?.(err); 
        return throwError(() => err); 
      })
    )
  });
}
