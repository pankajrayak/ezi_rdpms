import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { clearHttpRequestCache } from '@rdpms/core/decorators';

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
    return {user:'manish', role: 'admin'};
  }
}
