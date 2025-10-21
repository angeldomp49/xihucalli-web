import {Injectable} from '@angular/core';
import {Optional} from '../../../Optional';
import {OpenIDIdentityProvider} from './OpenIDIdentityProvider';

@Injectable({
  providedIn: 'root'
})
export class OpenIDIdentityProviderSelector {

  private currentProvider: Optional<OpenIDIdentityProvider | null> = Optional.empty();

  public setProvider(provider: OpenIDIdentityProvider): void {
    this.currentProvider = Optional.of(provider);
  }

  public getProvider(): Optional<OpenIDIdentityProvider | null> {
    return this.currentProvider;
  }

  public clearProvider(): void {
    this.currentProvider = Optional.empty();
  }

  public hasProvider(): boolean {
    return this.currentProvider.isPresent();
  }

}
