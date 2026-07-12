import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '@rdpms/services';
import { schema, required, form, apply, disabled, FormField, FormRoot } from '@angular/forms/signals';

export type LoginFormModel = {
  username: string;
  password: string;
}

@Component({
  selector: 'login-component',
  imports: [CommonModule, FormRoot, FormField],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  readonly formModel: LoginFormModel = {
    username: '',
    password: '',
  };

  readonly formSchema = schema<LoginFormModel>((fieldPath) => {
    required(fieldPath.username, { message: 'required field' });
    required(fieldPath.password, { message: 'required field' });
  });

  readonly model = signal(this.formModel);
  
  readonly f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, { when: () => this.f().submitting() });
  }, {
    submission: {
      action: async (formInstance) => {
        const payload = formInstance().value();
        try {
          const response = await firstValueFrom(this.authService.login(payload));
          console.log('Login successful! User details:', response);
          this.navigateToReturnUrl();
        } catch (error) {
          this.navigateToReturnUrl();
          console.log("failed:", error);
        }
      },
    }
  });

  readonly isSessionExpired = computed(() => 
    this.route.snapshot.queryParams['reason'] === 'session-expired'
  );

  navigateToReturnUrl() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/user';
    this.router.navigateByUrl(returnUrl);
  }
}
