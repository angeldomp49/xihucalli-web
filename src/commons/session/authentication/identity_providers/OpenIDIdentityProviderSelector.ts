import {Injectable} from '@angular/core';
import {Optional} from '../../../Optional';
import {OpenIDIdentityProvider} from './OpenIDIdentityProvider';

@Injectable({
  providedIn: 'root'
})
export class OpenIDIdentityProviderSelector {

  private readonly SELECTED_PROVIDER_STORAGE_KEY = 'SELECTED_IDENTITY_PROVIDER_NAME';

  private currentProvider: Optional<OpenIDIdentityProvider | null> = Optional.empty();

  public setProvider(provider: OpenIDIdentityProvider): void {
    this.currentProvider = Optional.of(provider);
    localStorage.setItem(this.SELECTED_PROVIDER_STORAGE_KEY, provider.getIdentityProviderName());
  }

  public getProvider(): Optional<OpenIDIdentityProvider | null> {
    return this.currentProvider;
  }

  public getStoredProviderName(): Optional<string | null> {
    const storedName = localStorage.getItem(this.SELECTED_PROVIDER_STORAGE_KEY);
    return Optional.of(storedName);
  }

  public clearProvider(): void {
    this.currentProvider = Optional.empty();
    localStorage.removeItem(this.SELECTED_PROVIDER_STORAGE_KEY);
  }

  public hasProvider(): boolean {
    return this.currentProvider.isPresent();
  }

  public hasStoredProviderName(): boolean {
    return localStorage.getItem(this.SELECTED_PROVIDER_STORAGE_KEY) !== null;
  }

}
