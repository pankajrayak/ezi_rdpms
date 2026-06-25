import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { HttpResponse } from '@angular/common/http';
import { CACHE_TIME_MS, IS_CACHE_ENABLE } from '@rdpms/shared/utility';
import { catchError, Observable } from 'rxjs';
import { of, tap, throwError } from 'rxjs';

interface CacheEntry {
  response: HttpResponse<unknown>;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();

export const cachingInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>>  => {
    
    const cacheTime = request.context.get(CACHE_TIME_MS) ?? 1000 * 60 * 5;
    const isCacheEnable = request.context.get(IS_CACHE_ENABLE);
    const cacheKey = request.urlWithParams;
    
    const authHeader = request.headers.get('Authorization');
    const hasValidBearerToken = authHeader?.startsWith('Bearer ');

    if(isCacheEnable && request.method === 'GET' && hasValidBearerToken) {
        const cachedEntry = cache.get(cacheKey);
        const now = Date.now();
        
        if(cachedEntry) {
            if(now < cachedEntry.expiry){
                console.log(`%c[Cache Hit] Serving from cache: ${cacheKey}`, 'color: #00ff00; font-weight: bold;');
                return of(cachedEntry.response.clone());
            }
            console.log(`%c[Cache Expired] Invaliding stale cache for: ${cacheKey}`, 'color: #ff9900;');
            cache.delete(cacheKey); 
        }else {
            console.log(`%c[Cache Miss] Fetching from network: ${cacheKey}`, 'color: #00aeff;');
        }
        
        return next(request).pipe(
            tap((event) => {
                if(event instanceof HttpResponse) {
                    cache.set(request.urlWithParams, { response: event.clone(), expiry: Date.now() + cacheTime });
                }
            }),
            catchError((error) => {
                console.warn(`[Cache Error] Clearing entry for failed request: ${cacheKey}`);
                clearCache();
                return throwError(() => error);
            }),
        );
    }

    if(isCacheEnable &&  cacheTime > 0 && request.method === 'GET' && !hasValidBearerToken) {
        console.log(`%c[Cache Bypassed] Missing token header for: ${cacheKey}`, 'color: #ff3333;');
    }

    return next(request).pipe(
        catchError((error) => {
            clearCache();
            return throwError(() => error);
        }),
    );
}

export function clearCache() {
    cache.clear();
    console.log('%c[Cache Global] Entire cache wiped manually.', 'color: #ff0000; font-weight: bold;');
}