import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../../../commons/spinner/spinner.component';
import {environment} from '../../../environments/environment';
import {
  CognitoOpenIDAuthenticationService
} from '../../../commons/session/authentication/cognito_hosted_ui/CognitoOpenIDAuthenticationService';
import {
  GoogleOpenIDAuthenticationService
} from '../../../commons/session/authentication/google/GoogleOpenIDAuthenticationService';
import {
  OpenIDIdentityProviderSelector
} from '../../../commons/session/authentication/identity_providers/OpenIDIdentityProviderSelector';
import {ApiHttpClient} from '../../../commons/http/ApiHttpClient';

@Component({
  selector: 'app-login-chech-page',
  imports: [
    NgIf,
    SpinnerComponent
  ],
  templateUrl: './login-check-page.component.html',
  styleUrl: './login-check-page.component.scss'
})
export class LoginCheckPageComponent implements OnInit {

  public loading = false;

  public constructor(
    private router: Router,
    private cognitoAuthenticationService: CognitoOpenIDAuthenticationService,
    private googleAuthenticationService: GoogleOpenIDAuthenticationService,
    private providerSelector: OpenIDIdentityProviderSelector,
    private apiHttpClient: ApiHttpClient
  ) {
  }

  ngOnInit() {

    if (!environment.isAuthenticationEnabled) {
      this.router.navigate([environment.homeEndpoint]);
      console.log("Authentication is disabled");
      return;
    }

    const provider = this.providerSelector.getProvider();
    const providerValue = provider.value();

    if(providerValue === null){
      return;
    }

    providerValue.performSessionValidityCheck()
        .subscribe((isAuthenticated: boolean) => {

          if (isAuthenticated) {
            this.router.navigate([environment.homeEndpoint]);
          }

        });

  }

  public startLoginWithCognito() {
    this.loading = true;
    this.providerSelector.setProvider(this.cognitoAuthenticationService);
    this.cognitoAuthenticationService.login();
  }

  public startLoginWithGoogle() {
    this.loading = true;
    this.providerSelector.setProvider(this.googleAuthenticationService);
    this.googleAuthenticationService.login();
  }

  public startLoginWithFacebook() {
    this.loading = true;
  }

  public startServerAuth(){

    console.log("Starting server auth");

    this.loading = true;

    const providerInstance = this.providerSelector.getProvider().value();
    let providerName: string | null = null;

    if (providerInstance) {
      providerName = providerInstance.getIdentityProviderName();
    } else if (this.providerSelector.hasStoredProviderName()) {
      const stored = this.providerSelector.getStoredProviderName().value();
      providerName = stored ? stored : null;
    }

    providerName = "GOOGLE";

    const providerParam = providerName;
    const redirectUrl = environment.remoteHostname + "/after-login";

    this.apiHttpClient
      .getRequestToResource(`/user/auth/initiate?provider=${providerParam}&redirect_url=${redirectUrl}`)
      .subscribe(
        (response: any) => {
          const authorizationUrl = response?.message?.authorization_url || response?.message?.authorizationUrl || response?.authorization_url || response?.authorizationUrl;
          if (authorizationUrl) {
            window.location.href = authorizationUrl;
            return;
          }
          this.loading = false;
        },
        () => this.loading = false
      );

  }

}
