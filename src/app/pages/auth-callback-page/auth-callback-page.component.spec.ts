import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthCallbackPageComponent } from './auth-callback-page.component';
describe('AuthCallbackPageComponent', () => {
  let component: AuthCallbackPageComponent;
  let fixture: ComponentFixture<AuthCallbackPageComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthCallbackPageComponent]
    })
    .compileComponents();
    fixture = TestBed.createComponent(AuthCallbackPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
