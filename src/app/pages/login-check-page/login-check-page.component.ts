import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../../../commons/spinner/spinner.component';
import {environment} from '../../../environments/environment';
import {
  OpenIDAuthenticationService
} from '../../../commons/session/authentication/cognito_hosted_ui/OpenIDAuthenticationService';

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
    private openIDAuthenticationService: OpenIDAuthenticationService
  ){}

  ngOnInit() {

    if(!environment.isAuthenticationEnabled){
      this.router.navigate([environment.homeEndpoint]);
      console.log("Authentication is disabled");
      return;
    }

    this.openIDAuthenticationService
      .performAuthCheck()
      .subscribe( (isAuthenticated: boolean) => {

        if(isAuthenticated){
          this.router.navigate([environment.homeEndpoint]);
        }

      } );
  }

  public startLoginWithCognito() {
    this.loading = true;
    this.openIDAuthenticationService.login();
  }

  public startLoginWithGoogle() {
    this.loading = true;
  }

  public startLoginWithFacebook() {
    this.loading = true;
  }

}
