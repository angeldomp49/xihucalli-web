import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../../../commons/spinner/spinner.component';
import {
  OpenIDIdentityProviderSelector
} from '../../../commons/session/authentication/identity_providers/OpenIDIdentityProviderSelector';
import {
  XihucalliAuthenticationService
} from '../../../commons/session/authentication/xihucalli/XihucalliAuthenticationService';
import {
  CognitoOpenIDAuthenticationService
} from '../../../commons/session/authentication/cognito_hosted_ui/CognitoOpenIDAuthenticationService';
import {
  GoogleOpenIDAuthenticationService
} from '../../../commons/session/authentication/google/GoogleOpenIDAuthenticationService';
import {IDENTITY_PROVIDER_COGNITO, IDENTITY_PROVIDER_GOOGLE} from '../../../commons/session/authentication/identity_providers/values';

@Component({
  selector: 'app-after-login-page',
  imports: [
    NgIf,
    SpinnerComponent
  ],
  templateUrl: './after-login-page.component.html',
  styleUrl: './after-login-page.component.scss'
})
export class AfterLoginPageComponent implements OnInit {

  public loading = false;

  public constructor(
    private providerSelector: OpenIDIdentityProviderSelector,
    private xihucalliAuthService: XihucalliAuthenticationService,
    private cognitoAuthService: CognitoOpenIDAuthenticationService,
    private googleAuthService: GoogleOpenIDAuthenticationService,
    private router: Router
  ) {
  }

  ngOnInit(): void {

    console.log("Started the after login page");

    this.loading = true;

    this.restoreProviderFromStorage();

    const provider = this.providerSelector.getProvider().value();

    if (!provider) {
      console.error('No identity provider selected');
      this.router.navigate(['/login-check']);
      return;
    }

    provider.completeAuthentication()
      .subscribe(() => {

        console.log("The login process will complete")

        this.xihucalliAuthService.performTokenExchange()
          .subscribe(tokenResponse => {
            console.log('Token exchange successful:', tokenResponse);
            this.router.navigate(['/keyring']);
          });
      });

  }

  private restoreProviderFromStorage(): void {
    const storedProviderName = this.providerSelector.getStoredProviderName().value();

    if (!storedProviderName) {
      return;
    }

    if (storedProviderName === IDENTITY_PROVIDER_COGNITO) {
      this.providerSelector.setProvider(this.cognitoAuthService);
    } else if (storedProviderName === IDENTITY_PROVIDER_GOOGLE) {
      this.providerSelector.setProvider(this.googleAuthService);
    }
  }

}
