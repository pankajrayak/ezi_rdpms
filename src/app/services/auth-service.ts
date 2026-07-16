import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Service()
export class AuthService {

  router = inject(Router);
  http = inject(HttpClient);
  
  login(credentials: any): Observable<any> {
    return this.http.post('api/login', credentials);
  }

  logout(){
    this.router.navigate(['/login']);
  }

  currentUser(){
    return {user:'manish', role: 'admin'};
  }
}
