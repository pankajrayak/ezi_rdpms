import { inject, NgZone, ResourceRef } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

export interface RxResourceConfigOptions<T, P> {
  params: () => P | undefined | null;
  stream: (request: { params: NonNullable<P> }) => Observable<T>;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
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
