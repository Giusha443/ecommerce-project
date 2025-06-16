import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AddressEditDialogComponent } from './app-address-edit-dialog.component';
import { provideHttpClient } from '@angular/common/http';

describe('AppAddressEditDialogComponent', () => {
  let component: AddressEditDialogComponent;
  let fixture: ComponentFixture<AddressEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressEditDialogComponent, MatDialogModule],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { id: '123' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddressEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
