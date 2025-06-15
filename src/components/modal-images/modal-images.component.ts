import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogContent, MatDialogActions, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export interface DialogData {
  images: string[];
}

@Component({
  selector: 'app-modal-images',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './modal-images.component.html',
  styleUrl: './modal-images.component.scss',
})
export class ModalImagesComponent {
  public readonly dialogRef = inject(MatDialogRef<ModalImagesComponent>);
  public readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  public images = this.data.images;
  public currentImage = this.images[0];

  public onNoClick(): void {
    this.dialogRef.close();
  }
  public onChoseImage(id: number): void {
    this.currentImage = this.images[id];
  }
}
