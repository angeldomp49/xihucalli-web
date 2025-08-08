import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {OpenIDAuthenticationService} from '../../../commons/session/authentication/OpenIDAuthenticationService';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../../../commons/spinner/spinner.component';
import {environment} from '../../../environments/environment';

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
      .subscribe( isAuthenticated => {

        if(isAuthenticated){
          this.router.navigate([environment.homeEndpoint]);
        }

      } );
  }

  public startLogin() {
    this.loading = true;
    this.openIDAuthenticationService.login();
  }
}
