import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '@rdpms/services';
import { schema, required, form, apply, disabled, FormField, FormRoot } from '@angular/forms/signals';

export type LoginFormModel = {
  email: string;
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

  readonly formModel: LoginFormModel = { email: '', password: '' };
  readonly model = signal(this.formModel);

  readonly formSchema = schema<LoginFormModel>((fieldPath) => {
    required(fieldPath.email, { message: 'required field' });
    required(fieldPath.password, { message: 'required field' });
  });

  readonly f = form(this.model, (s) => {
    apply(s, this.formSchema);
    disabled(s, { when: () => this.f().submitting() });
  }, {
    submission: {
      action: async (formInstance) => {
        const payload = formInstance().value();
        try {
          await firstValueFrom(this.authService.login(payload));
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

  constructor(){
    this.checkAndLogout();
  }

  async checkAndLogout() {
    if(this.authService.isLoggedIn()) {
      const user = this.authService.user();
      const payload = { email: user.email };
      try {
        await firstValueFrom(this.authService.logout(payload));
      }catch(error) {
        console.error("Logout API failed:", error);
      }
    }
  }

  navigateToReturnUrl() {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/user';
    this.router.navigateByUrl(returnUrl);
  }
}
