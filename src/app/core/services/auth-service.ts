import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { clearHttpRequestCache } from '../decorators/cache-http-decorator';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  router = inject(Router);
  http = inject(HttpClient);
  
  login(credentials: any): Observable<any> {
    return this.http.post('api/login', credentials);
  }

  logout(){
    clearHttpRequestCache();
    this.router.navigate(['/login']);
  }

  currentUser(){
    return null;
  }
}
