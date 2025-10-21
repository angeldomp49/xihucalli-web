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
    private router: Router
  ) {
  }

  ngOnInit(): void {

    this.loading = true;

    const provider = this.providerSelector.getProvider().value();

    if (!provider) {
      console.error('No identity provider selected');
      return;
    }

    provider.completeAuthentication()
      .subscribe(() => {
        this.xihucalliAuthService.performTokenExchange()
          .subscribe(tokenResponse => {
            console.log('Token exchange successful:', tokenResponse);
            this.router.navigate(['/keyring']);
          });
      });

  }

}
