import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginCheckPageComponent} from './login-check-page.component';

describe('LoginChechPageComponent', () => {
  let component: LoginCheckPageComponent;
  let fixture: ComponentFixture<LoginCheckPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginCheckPageComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginCheckPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
