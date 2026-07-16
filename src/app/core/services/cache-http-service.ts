import { HttpClient } from '@angular/common/http';
import { catchError, Observable, shareReplay, throwError } from 'rxjs';
import { inject, Service } from '@angular/core'; 

@Service()
export abstract class CacheHttpService {

  private readonly http =  inject(HttpClient);
  private readonly cacheTime = 5 * 60 * 1000;
  private cacheMap = new Map<string, { data: Observable<any>; expiry: number }>();

  protected getCached<T>(url: string, params: any = {}, observeResponse: boolean = false, cacheTime = this.cacheTime): Observable<T>{

    const key = `${url}-${JSON.stringify(params)}-${observeResponse}`;
    const cached = this.cacheMap.get(key);

    if(cached && Date.now() < cached.expiry){
      return cached.data;
    }

    const options = {
      params,
      observe: (observeResponse ? 'response' : 'body') as 'body'
    };

    const request$ = this.http.get<T>(url, options).pipe(
      shareReplay(1),
      catchError(error => {
        this.cacheMap.delete(key);
        return throwError(() => error);
      })
    );

    this.cacheMap.set(key, { data: request$, expiry: Date.now() + cacheTime} );
    
    return request$;
  }

  protected clearCached(): void{
    this.cacheMap.clear();
  }
  
}
