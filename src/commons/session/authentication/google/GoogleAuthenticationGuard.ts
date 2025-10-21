import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {Injectable} from '@angular/core';
import {GoogleOpenIDAuthenticationService} from './GoogleOpenIDAuthenticationService';
import {take} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthenticationGuard implements CanActivate {

  public constructor(
    private router: Router,
    private googleOpenIDAuthenticationService: GoogleOpenIDAuthenticationService
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {

    if (!environment.isAuthenticationEnabled) {
      return true;
    }

    this.googleOpenIDAuthenticationService
      .setOnRedirectToLogin(() => {
        this.router.navigate([environment.loginEndpoint]);
      })

    return this.googleOpenIDAuthenticationService
      .performAuthCheck()
      .pipe(
        take(1)
      );
  }

}

