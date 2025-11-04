import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { SpinnerComponent } from '../../../commons/spinner/spinner.component';
import { AuthCallbackParamsExtractor } from '../../../commons/session/authentication/utils/AuthCallbackParamsExtractor';
import { SessionManagementService } from '../../../commons/session/management/SessionManagementService';
import { AuthCallbackParams } from '../../../commons/session/authentication/types';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-callback-page',
  standalone: true,
  imports: [
    NgIf,
    SpinnerComponent
  ],
  templateUrl: './auth-callback-page.component.html',
  styleUrl: './auth-callback-page.component.scss'
})
export class AuthCallbackPageComponent implements OnInit {
  public loading = true;
  public errorMessage: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sessionManagement: SessionManagementService,
    private readonly paramsExtractor: AuthCallbackParamsExtractor
  ) {}

  ngOnInit(): void {
    this.processCallback();
  }

  private processCallback(): void {
    const params = this.paramsExtractor.extractCallbackParams(this.route);

    if (this.paramsExtractor.hasError(params)) {
      this.handleError(params);
      return;
    }

    if (this.paramsExtractor.isSuccess(params)) {
      this.handleAuthenticationSuccess(params);
      return;
    }

    if (this.paramsExtractor.requiresRegistration(params)) {
      this.handleRegistrationRequired(params);
      return;
    }

    if (this.paramsExtractor.requiresMatchingDecision(params)) {
      this.handleMatchingDecision(params);
      return;
    }

    this.handleUnknownState(params);
  }

  private handleError(params: AuthCallbackParams): void {
    this.loading = false;
    this.errorMessage = params.error || 'Authentication failed. Please try again.';

    setTimeout(() => {
      this.router.navigate(['/login-check']);
    }, 3000);
  }

  private handleAuthenticationSuccess(params: AuthCallbackParams): void {
    if (!params.token) {
      this.handleError({ error: 'No token received from server' });
      return;
    }
    this.sessionManagement.login(params.token);
    this.router.navigate([environment.homeEndpoint]);
  }

  private handleRegistrationRequired(params: AuthCallbackParams): void {
    if (!params.register_user_operation_id) {
      this.handleError({ error: 'Missing registration operation ID' });
      return;
    }

    this.router.navigate(['/register'], {
      queryParams: {
        operation_id: params.register_user_operation_id,
        operation_type: params.register_user_operation_type
      }
    });
  }

  private handleMatchingDecision(params: AuthCallbackParams): void {
    if (!params.register_user_operation_id) {
      this.handleError({ error: 'Missing registration operation ID' });
      return;
    }

    this.router.navigate(['/link-account'], {
      queryParams: {
        operation_id: params.register_user_operation_id,
        operation_type: params.register_user_operation_type,
        matching_display_name: params.matching_user_display_name
      }
    });
  }

  private handleUnknownState(params: AuthCallbackParams): void {
    console.error('Unknown authentication state:', params);
    this.handleError({ error: 'Unknown authentication state' });
  }
}

