import { Component, EventEmitter, Output } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {KeyringHttpClient} from '../KeyringHttpClient';

@Component({
  selector: 'app-keyring-new-form',
  templateUrl: './keyring-new-form.component.html',
  styleUrl: './keyring-new-form.component.scss',
  imports: [
    FormsModule
  ],
  standalone: true
})
export class KeyringNewFormComponent {
  @Output() closeModal = new EventEmitter<void>();

  public title = '';
  public username = '';
  public password = '';
  public passwordConfirmation = '';
  public url = '';
  public description = '';

  public constructor(private keyringHttpClient: KeyringHttpClient) {}

  onBackgroundClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-background')) {
      this.closeModal.emit();
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onSubmit() {

    if(this.password != this.passwordConfirmation) {
      alert('Passwords don\'t match');
      return;
    }

    const keyring = {
      id: "0",
      title: this.title,
      username: this.username,
      password: this.password,
      url: this.url,
      description: this.description
    }

    this.keyringHttpClient
      .registerNewKeyring(keyring)
      .subscribe( (response) => {
        this.closeModal.emit();
      } );

  }
}
