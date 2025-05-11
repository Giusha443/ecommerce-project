import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderIconsComponent } from './header-icons.component';
import { provideRouter } from '@angular/router';

describe('HeaderIconsComponent', () => {
  let component: HeaderIconsComponent;
  let fixture: ComponentFixture<HeaderIconsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderIconsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
