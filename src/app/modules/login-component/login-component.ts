import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@rdpms/core/services';

@Component({
  selector: 'login-component',
  imports: [CommonModule, ReactiveFormsModule,],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  
  sessionExpired = signal(false);

  loginForm: FormGroup = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(){
    if(this.route.snapshot.queryParams['reason'] === 'session-expired'){
      this.sessionExpired.set(true);
    }
  }

  get form() { return this.loginForm.controls; }
  get usernameCtrl() { return this.form['username']; }
  get passwordCtrl() { return this.form['password']; }

  onSubmit() {
    if(!this.loginForm.valid) {
      this.loginForm.markAllAsTouched(); 
      return;
    }
    this.routeChange(); return;

    this.loginForm.disable();
    const payload = this.loginForm.getRawValue();

    this.authService.login(payload).pipe(
      finalize(() => this.loginForm.enable() ),
    ).subscribe({
      next: (res) => {
        console.log('successfull', res);
        this.routeChange()
      },
      error: (err) => console.error('failed', err)
    })
  }

  routeChange(){
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/user';
    this.router.navigateByUrl(returnUrl);
  }

}
