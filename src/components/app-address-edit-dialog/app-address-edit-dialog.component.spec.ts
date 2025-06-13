import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressEditDialogComponent } from './app-address-edit-dialog.component';

describe('AppAddressEditDialogComponent', () => {
  let component: AddressEditDialogComponent;
  let fixture: ComponentFixture<AddressEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressEditDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
