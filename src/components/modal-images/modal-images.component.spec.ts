import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImagesComponent } from './modal-images.component';

describe('ModalImagesComponent', () => {
  let component: ModalImagesComponent;
  let fixture: ComponentFixture<ModalImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
