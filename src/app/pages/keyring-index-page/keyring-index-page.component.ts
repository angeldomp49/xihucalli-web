import {Component, OnInit} from '@angular/core';
import {KeyringType} from './KeyringType';
import {KeyringHttpClient} from './KeyringHttpClient';
import {NgForOf, NgIf} from '@angular/common';
import {KeyringNewFormComponent} from './keyring-new-form/keyring-new-form.component';

@Component({
  selector: 'app-keyring-index-page',
  imports: [
    NgForOf,
    KeyringNewFormComponent,
    NgIf
  ],
  templateUrl: './keyring-index-page.component.html',
  styleUrl: './keyring-index-page.component.scss'
})
export class KeyringIndexPageComponent implements OnInit {

  protected keyringsList: KeyringType[] = [];
  public showModal: boolean = false;

  public constructor(private keyringHttpClient: KeyringHttpClient) {}

  ngOnInit(): void {
        this.keyringHttpClient
          .getAllKeyrings()
          .subscribe( (result: KeyringType[]) => {
            this.keyringsList = result;
          } );
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

}
