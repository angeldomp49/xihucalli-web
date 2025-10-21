import {Observable} from 'rxjs';
import {Optional} from '../../../Optional';

export interface OpenIDIdentityProvider {

  login(): void;

  logout(): void;

  completeAuthentication(): Observable<void>;

  performSessionValidityCheck(): Observable<boolean>;

  readAccessToken(): Observable<Optional<string|null>>;

  getIdentityProviderName(): string;

}
