import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAddressEditDialogComponent } from './app-address-edit-dialog.component';

describe('AppAddressEditDialogComponent', () => {
  let component: AppAddressEditDialogComponent;
  let fixture: ComponentFixture<AppAddressEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAddressEditDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppAddressEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
