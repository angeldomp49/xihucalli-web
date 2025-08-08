import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyringNewFormComponent } from './keyring-new-form.component';

describe('KeyringNewFormComponent', () => {
  let component: KeyringNewFormComponent;
  let fixture: ComponentFixture<KeyringNewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyringNewFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyringNewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
