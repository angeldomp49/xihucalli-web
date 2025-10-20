import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../../../commons/spinner/spinner.component';
import {
  OpenIDAuthenticationService
} from '../../../commons/session/authentication/cognito_hosted_ui/OpenIDAuthenticationService';

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
    private openIDAuthenticationService: OpenIDAuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loading = true;

    this.openIDAuthenticationService
      .completeAuthenticationProcess()
      .subscribe( loginResponse => {
        console.log(loginResponse);
        this.router.navigate(['/keyring']);
      });

  }

}
