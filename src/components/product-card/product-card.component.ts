// src/app/components/product-card/product-card.component.ts

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductAttribute, ProductCard } from '../../models/product.model';
import { MatButton } from '@angular/material/button';

const PRODUCT_DESCRIPTION_LENGTH_IN_CHARS = 80;
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButton],
  template: `
    <article class="product-card" [routerLink]="['/product', product.id]">
      <div class="product-card__image-container">
        <img
          class="product-card__image"
          [src]="product.image"
          [alt]="product.name"
          (error)="onImageError($event)"
          loading="lazy" />
        <div class="product-card__overlay" *ngIf="product.price.hasDiscount">
          <span class="product-card__discount-badge">Sale</span>
        </div>
      </div>

      <div class="product-card__content">
        <h3 class="product-card__name">{{ product.name }}</h3>
        <p class="product-card__description">{{ getShortDescription }}</p>

        <div class="product-card__price">
          <span
            class="product-card__price-current"
            [class.product-card__price-current--discounted]="product.price.hasDiscount">
            {{ product.price.hasDiscount ? product.price.discounted?.formatted : product.price.original.formatted }}
          </span>
          <span class="product-card__price-original" *ngIf="product.price.hasDiscount">
            {{ product.price.original.formatted }}
          </span>
        </div>

        <div class="product-card__attributes" *ngIf="getVisibleAttributes.length > 0">
          @for (attr of getVisibleAttributes; track $index) {
            <span [class]="'product-card__attribute--' + attr.type">
              {{ attr.name }}: {{ getAttributeDisplayValue(attr) }}
            </span>
          }
        </div>
      </div>

      <div class="product-card__actions">
        <button
          mat-flat-button
          class="product-card__button product-card__button--primary"
          (click)="onViewDetails($event)"
          type="button">
          View Details
        </button>
      </div>
    </article>
  `,
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent {
  @Input() public product!: ProductCard;
  @Output() public cardClick = new EventEmitter<ProductCard>();
  @Output() public viewDetails = new EventEmitter<ProductCard>();

  public onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = './assets/placeholder-product.jpg';
  }

  public get getShortDescription(): string {
    if (!this.product.description) return '';
    return this.product.description.length > PRODUCT_DESCRIPTION_LENGTH_IN_CHARS
      ? this.product.description.substring(0, PRODUCT_DESCRIPTION_LENGTH_IN_CHARS) + '...'
      : this.product.description;
  }

  public get getVisibleAttributes(): ProductAttribute[] {
    return this.product.attributes
      .filter(attr => ['brand', 'color', 'size'].includes(attr.name.toLowerCase()))
      .slice(0, 1 + 1 + 1);
  }

  public getAttributeDisplayValue(attr: ProductAttribute): string {
    if (Array.isArray(attr.value)) {
      return attr.value.join(', ');
    }
    return String(attr.value);
  }

  public onViewDetails(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.viewDetails.emit(this.product);
  }
}
