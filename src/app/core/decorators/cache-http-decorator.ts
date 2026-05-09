// To use decorators in your Angular project, 
// ensure experimentalDecorators is set to true in your tsconfig.json

import { Observable, shareReplay, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const cacheMap = new Map<string, { data: Observable<any>; expiry: number }>();


export function clearHttpRequestCache(): void {
    cacheMap.clear();
}   

export function HttpRequestCache(cacheTime: number = 5 * 60 * 1000) {

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value; 

        descriptor.value = function (...args: any[]) {

            const key = `${propertyKey}-${JSON.stringify(args)}`;
            const cached = cacheMap.get(key);

            if (cached && Date.now() < cached.expiry) {
                return cached.data;
            }

            const request$ = originalMethod.apply(this, args).pipe(
                shareReplay(1), 
                catchError(err => {
                cacheMap.delete(key); 
                return throwError(() => err);
                })
            );

            cacheMap.set(key, { data: request$, expiry: Date.now() + cacheTime });

            return request$;
        };

        return descriptor;
    };
}
