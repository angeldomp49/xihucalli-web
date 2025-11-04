import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkAccountPageComponent } from './link-account-page.component';

describe('LinkAccountPageComponent', () => {
  let component: LinkAccountPageComponent;
  let fixture: ComponentFixture<LinkAccountPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkAccountPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinkAccountPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
