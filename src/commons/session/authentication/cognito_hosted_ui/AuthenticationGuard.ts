import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import {Injectable} from '@angular/core';
import {OpenIDAuthenticationService} from './OpenIDAuthenticationService';
import {take} from 'rxjs';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {

  public constructor(
    private router: Router,
    private openIDAuthenticationService: OpenIDAuthenticationService
  ) {
  }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {

      if(!environment.isAuthenticationEnabled){
        return true;
      }

      this.openIDAuthenticationService
        .setOnRedirectToLogin(() => {
          this.router.navigate([environment.loginEndpoint]);
        })

      return this.openIDAuthenticationService
        .performAuthCheck()
        .pipe(
        take(1)
      );
    }

}
