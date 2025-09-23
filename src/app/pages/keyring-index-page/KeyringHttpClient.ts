import {Injectable} from '@angular/core';
import {ApiHttpClient} from '../../../commons/http/ApiHttpClient';
import {KeyringType} from './KeyringType';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyringHttpClient{

  private readonly keyringsURL = "/keyring";
  private readonly registerKeyringURL = "/password-register";
  private readonly getPasswordUrl = "/password";

  public constructor(private apiHttpClient: ApiHttpClient) {}

  public getAllKeyrings(): Observable<KeyringType[]>{

    return new Observable(observer => {
      this.apiHttpClient
        .getRequestToResource(this.keyringsURL)
        .subscribe( flatResponse => {
          observer.next(flatResponse);
        } );
    });

  }

  public registerNewKeyring(keyring: KeyringType): Observable<any>{

    return this.apiHttpClient
      .postToResource(this.registerKeyringURL, JSON.stringify(keyring));
  }

  public getPasswordForKeyring(keyringId: string): Observable<any>{
    return this.apiHttpClient
      .getRequestToResource(this.getPasswordUrl+"/"+keyringId)
  }

}
