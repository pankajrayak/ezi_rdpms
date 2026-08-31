import { HttpClient } from '@angular/common/http';
import { computed, HostListener, inject, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_ENDPOINT } from '@rdpms/shared/utility';
import { JwtHelperService } from '@auth0/angular-jwt';

@Service()
export class AuthService {

  private http = inject(HttpClient);
  private contextPath = API_ENDPOINT.BACKEND_PREFIX;
  private jwtHelperService: JwtHelperService = new JwtHelperService();

  private currentToken = (() => {
    const token = sessionStorage.getItem('rdpms_token');
    if(token){ sessionStorage.removeItem('rdpms_token') };
    return token;
  })();

  readonly token = signal<string | null>(this.currentToken);

  readonly user = computed(() => {
    const token = this.token();
    if(!token || this.jwtHelperService.isTokenExpired(token)) return null;

    return this.jwtHelperService.decodeToken(token);
  });

  readonly isLoggedIn = computed(() => !!this.user());

  readonly isAdmin = computed(() => {
    const user = this.user();
    return user?.role?.includes('admin') ?? false;
  });

  constructor() {
    window.addEventListener('beforeunload', () => {
      const token = this.token();
      if(token && this.isLoggedIn()) { 
        sessionStorage.setItem('rdpms_token', token); 
      }
    });
  }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.contextPath}/auth/login`, payload).pipe(
      tap((response: any) => { 
        this.token.set(response.data);
      })
    );
  }

  logout(payload: any){
    this.token.set(null); sessionStorage.clear();
    return this.http.post(`${this.contextPath}/auth/logout`, payload).pipe(
      tap(() => { this.token.set(null); sessionStorage.clear(); })
    );
  }
}
