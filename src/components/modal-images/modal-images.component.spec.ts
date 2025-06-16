import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ModalImagesComponent } from './modal-images.component';
import { provideHttpClient } from '@angular/common/http';

describe('ModalImagesComponent', () => {
  let component: ModalImagesComponent;
  let fixture: ComponentFixture<ModalImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImagesComponent, MatDialogModule],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { images: [''] } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
