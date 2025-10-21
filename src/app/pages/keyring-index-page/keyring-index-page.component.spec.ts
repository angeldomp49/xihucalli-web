import {ComponentFixture, TestBed} from '@angular/core/testing';

import {KeyringIndexPageComponent} from './keyring-index-page.component';

describe('KeyringIndexPageComponent', () => {
  let component: KeyringIndexPageComponent;
  let fixture: ComponentFixture<KeyringIndexPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyringIndexPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(KeyringIndexPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
