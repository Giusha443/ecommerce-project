// src/app/components/product-filters/product-filters.component.ts

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { FilterService } from '../../services/filter.service';
import { ProductService } from '../../services/product.service';
import { ProductFilters, FilterGroup, FilterOption } from '../../models/product.model';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container" [class.mobile-open]="isOpen">
      <!-- Mobile backdrop -->
      <!-- <div class="mobile-backdrop" [class.active]="isOpen" (click)="closeFilters()"></div> -->

      <!-- Filters content -->
      <div class="filters-content">
        <!-- Filters Header -->
        <div class="filters-header">
          <!-- <h3 class="filters-title">Filters</h3> -->
          <div class="filters-actions">
            <span *ngIf="activeFiltersCount > 0" class="active-count"> {{ activeFiltersCount }} active </span>
            <button *ngIf="activeFiltersCount > 0" (click)="clearAllFilters()" class="clear-all-btn" type="button">
              Clear All
            </button>
            <!-- <button class="close-btn mobile-only" (click)="closeFilters()" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button> -->
          </div>
        </div>

        <!-- Active Filters -->
        <div *ngIf="activeFiltersList.length > 0" class="active-filters">
          <h4 class="active-filters-title">Active Filters:</h4>
          <div class="active-filters-list">
            @for (filter of activeFiltersList; track $index) {
              <span class="active-filter-tag">
                {{ filter }}
                <button (click)="removeActiveFilter(filter)" class="remove-filter-btn" type="button">×</button>
              </span>
            }
          </div>
        </div>

        <!-- Price Range Filter -->
        <div class="filter-group">
          <h4 class="filter-group-title">Price Range</h4>
          <div class="price-range-inputs">
            <div class="price-input-group">
              <label for="minPrice">Min</label>
              <input
                id="minPrice"
                type="number"
                [(ngModel)]="priceRange.min"
                (blur)="updatePriceRange()"
                placeholder="0"
                min="0"
                class="price-input" />
            </div>
            <div class="price-separator">-</div>
            <div class="price-input-group">
              <label for="maxPrice">Max</label>
              <input
                id="maxPrice"
                type="number"
                [(ngModel)]="priceRange.max"
                (blur)="updatePriceRange()"
                placeholder="1000"
                min="0"
                class="price-input" />
            </div>
          </div>
        </div>

        <!-- UNUSED? Dynamic Filter Groups -->
        <div *ngFor="let group of availableFilters; trackBy: trackByFilterGroup" class="filter-group">
          <h4 class="filter-group-title">{{ group.name }}</h4>

          <!-- Color Filters -->
          <div *ngIf="group.type === 'color'" class="color-options">
            <div
              tabindex="0"
              (keyup.enter)="toggleColor(option.value)"
              *ngFor="let option of group.options; trackBy: trackByFilterOption"
              class="color-option"
              [class.selected]="isColorSelected(option.value)"
              (click)="toggleColor(option.value)">
              <div class="color-swatch" [style.background-color]="getColorValue(option.value)"></div>
              <span class="color-label">{{ option.label }}</span>
              <span class="option-count">({{ option.count }})</span>
            </div>
          </div>

          <!-- Checkbox Filters -->
          <div *ngIf="group.type === 'checkbox'" class="checkbox-options">
            <label *ngFor="let option of group.options; trackBy: trackByFilterOption" class="checkbox-option">
              <input
                type="checkbox"
                [checked]="isOptionSelected(group.name, option.value)"
                (change)="toggleOption(group.name, option.value)"
                class="checkbox-input" />
              <span class="checkbox-label">{{ option.label }}</span>
              <span class="option-count">({{ option.count }})</span>
            </label>
          </div>
        </div>

        <div class="filter-group" *ngIf="!hasApiFilters">
          <h4 class="filter-group-title">Types</h4>
          <div class="radio-options">
            @for (type of commonTypes; track $index) {
              <label class="radio-option">
                <input
                  type="radio"
                  name="productType"
                  [value]="type"
                  [checked]="currentFilters.types?.includes(type) || false"
                  (change)="toggleType(type)"
                  class="radio-input" />
                <span class="radio-label">{{ type }}</span>
              </label>
            }
          </div>
        </div>

        <!-- Manual Filter Groups (for cases where API doesn't provide facets) -->
        <div class="filter-group" *ngIf="!hasApiFilters">
          <h4 class="filter-group-title">Brands</h4>
          <div class="checkbox-options">
            @for (brand of commonCategoty; track $index) {
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  [checked]="currentFilters.brands?.includes(brand) || false"
                  (change)="toggleCategory(brand)"
                  class="checkbox-input" />
                <span class="checkbox-label">{{ brand }}</span>
              </label>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      /* Mobile backdrop */
      .mobile-backdrop {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .mobile-backdrop.active {
        opacity: 1;
      }

      .filters-container {
        position: relative;
      }

      .filters-content {
        background: white;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        height: fit-content;
        // max-height: calc(100vh - 200px);
      }

      .filters-header {
        // display: flex;
        // justify-content: space-between;
        // align-items: center;
        // margin-bottom: 20px;
        // padding-bottom: 16px;
        // border-bottom: 1px solid #e1e5e9;
      }

      .filters-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .active-count {
        font-size: 14px;
        color: #007bff;
        font-weight: 500;
      }

      .clear-all-btn {
        background: none;
        border: 1px solid #dc3545;
        color: #dc3545;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .clear-all-btn:hover {
        background: #dc3545;
        color: white;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: none;
      }

      .close-btn svg {
        width: 20px;
        height: 20px;
        stroke: #666;
      }

      .mobile-only {
        display: none;
      }

      .active-filters {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;
      }

      .active-filters-title {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 500;
        color: #666;
      }

      .active-filters-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .active-filter-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #007bff;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      .remove-filter-btn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        padding: 0;
        margin-left: 4px;
      }

      .filter-group {
        margin-bottom: 24px;
      }

      .filter-group:last-child {
        margin-bottom: 0;
      }

      .filter-group-title {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      .price-range-inputs {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .price-input-group {
        flex: 1;
      }

      .price-input-group label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .price-input {
        width: 100%;
        padding: 8px 8px;
        border: 1px solid #e1e5e9;
        border-radius: 4px;
        font-size: 14px;
      }

      .price-input:focus {
        outline: none;
        border-color: #007bff;
      }

      .price-separator {
        color: #666;
        font-weight: 500;
      }

      .color-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .color-option:hover {
        background-color: #f8f9fa;
      }

      .color-option.selected {
        background-color: #e3f2fd;
        border: 1px solid #007bff;
      }

      .color-swatch {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #ddd;
        flex-shrink: 0;
      }

      .color-label {
        flex: 1;
        font-size: 14px;
      }

      .option-count {
        font-size: 12px;
        color: #666;
      }

      .checkbox-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .checkbox-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 0;
      }

      .checkbox-input {
        margin: 0;
      }

      .checkbox-label {
        flex: 1;
        font-size: 14px;
      }

      .radio-options {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .radio-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 4px 0;
      }

      .radio-input {
        margin: 0;
      }

      .radio-label {
        font-size: 14px;
      }

      .size-options {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .size-option {
        padding: 8px 12px;
        border: 1px solid #e1e5e9;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .size-option:hover {
        border-color: #007bff;
      }

      .size-option.selected {
        background: #007bff;
        color: white;
        border-color: #007bff;
      }

      /* Mobile Styles */
      @media (max-width: 768px) {
        // .mobile-backdrop {
        //   display: block;
        // }

        .filters-container {
          // position: fixed;
          // top: 0;
          // left: 0;
          // right: 0;
          // bottom: 0;
          // z-index: 1000;
          // transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .filters-container.mobile-open {
          transform: translateX(0);
        }

        .filters-content {
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
          position: relative;
          z-index: 1001;
        }

        .mobile-only {
          display: block !important;
        }

        .close-btn {
          display: flex !important;
        }
      }
    `,
  ],
})
export class ProductFiltersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() public isOpen = false;
  @Output() public closeEvent = new EventEmitter<void>();

  public currentFilters: ProductFilters = {
    priceRange: undefined,
    brands: [],
    colors: [],
    types: [],
    categories: [],
    searchQuery: '',
  };

  public priceRange = {
    min: null as number | null,
    max: null as number | null,
  };

  public activeFiltersCount = 0;
  public activeFiltersList: string[] = [];
  public availableFilters: FilterGroup[] = [];
  public hasApiFilters = false;

  // Fallback options when API doesn't provide facets
  public commonCategoty = ['Desktop processor', 'Mobile processor'];
  public commonTypes = ['Memory', 'CPU', 'Components'];

  constructor(
    private filterService: FilterService,
    private productService: ProductService
  ) {}

  public ngOnInit(): void {
    this.initializeSubscriptions();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions(): void {
    // Subscribe to current filters
    this.filterService.filters$.pipe(takeUntil(this.destroy$)).subscribe(filters => {
      this.currentFilters = filters;
      this.syncPriceRange();
    });

    // Subscribe to active filters count
    this.filterService.activeFiltersCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => (this.activeFiltersCount = count));

    // Subscribe to active filters list
    this.filterService.filters$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.activeFiltersList = this.filterService.getActiveFiltersList();
    });

    // Subscribe to available filters from API
    this.productService.filters$.pipe(takeUntil(this.destroy$)).subscribe(filters => {
      this.availableFilters = filters;
      this.hasApiFilters = filters.length > 0;
    });
  }

  private syncPriceRange(): void {
    if (this.currentFilters.priceRange) {
      this.priceRange.min = this.currentFilters.priceRange.min;
      this.priceRange.max = this.currentFilters.priceRange.max;
    } else {
      this.priceRange.min = null;
      this.priceRange.max = null;
    }
  }

  public updatePriceRange(): void {
    console.log('price', this.priceRange.min, this.priceRange.max);

    if (this.priceRange.min !== null && this.priceRange.max !== null) {
      if (this.priceRange.min <= this.priceRange.max) {
        this.filterService.setPriceRange(this.priceRange.min, this.priceRange.max);
      }
    } else if (this.priceRange.min === null && this.priceRange.max === null) {
      this.filterService.clearSpecificFilter('priceRange');
    }
  }

  public toggleBrand(brand: string): void {
    this.filterService.toggleCategory(brand);
  }

  public toggleColor(color: string): void {
    this.filterService.toggleColor(color);
  }

  public toggleType(size: string): void {
    this.filterService.toggleType(size);
  }

  public toggleCategory(category: string): void {
    this.filterService.toggleCategory(category);
  }

  public toggleOption(groupName: string, value: string): void {
    const lowerGroupName = groupName.toLowerCase();

    if (lowerGroupName.includes('brand')) {
      this.toggleBrand(value);
    } else if (lowerGroupName.includes('color')) {
      this.toggleColor(value);
    } else if (lowerGroupName.includes('size')) {
      this.toggleType(value);
    } else if (lowerGroupName.includes('categor')) {
      this.toggleCategory(value);
    }
  }

  public isColorSelected(color: string): boolean {
    return this.currentFilters.colors?.includes(color) || false;
  }

  public isOptionSelected(groupName: string, value: string): boolean {
    const lowerGroupName = groupName.toLowerCase();

    if (lowerGroupName.includes('brand')) {
      return this.currentFilters.brands?.includes(value) || false;
    } else if (lowerGroupName.includes('color')) {
      return this.currentFilters.colors?.includes(value) || false;
    } else if (lowerGroupName.includes('size')) {
      return this.currentFilters.types?.includes(value) || false;
    } else if (lowerGroupName.includes('categor')) {
      return this.currentFilters.categories?.includes(value) || false;
    }

    return false;
  }

  public getColorValue(colorName: string): string {
    // Map common color names to hex values
    const colorMap: Record<string, string> = {
      red: '#ff0000',
      blue: '#0000ff',
      green: '#00ff00',
      black: '#000000',
      white: '#ffffff',
      gray: '#808080',
      grey: '#808080',
      yellow: '#ffff00',
      orange: '#ffa500',
      purple: '#800080',
      pink: '#ffc0cb',
      brown: '#a52a2a',
      navy: '#000080',
      teal: '#008080',
      lime: '#00ff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      silver: '#c0c0c0',
      gold: '#ffd700',
      maroon: '#800000',
    };

    return colorMap[colorName.toLowerCase()] || '#cccccc';
  }

  public clearAllFilters(): void {
    this.filterService.clearFilters();
  }

  public removeActiveFilter(filterText: string): void {
    // Parse the filter text to determine which filter to remove
    if (filterText.startsWith('Price:')) {
      this.filterService.clearSpecificFilter('priceRange');
    } else if (filterText.startsWith('Brand:')) {
      const brand = filterText.replace('Brand: ', '');
      this.filterService.removeBrand(brand);
    } else if (filterText.startsWith('Color:')) {
      const color = filterText.replace('Color: ', '');
      this.filterService.removeColor(color);
    } else if (filterText.startsWith('Size:')) {
      const size = filterText.replace('Size: ', '');
      this.filterService.removeSize(size);
    } else if (filterText.startsWith('Category:')) {
      const category = filterText.replace('Category: ', '');
      this.filterService.removeCategory(category);
    } else if (filterText.startsWith('Search:')) {
      this.filterService.clearSpecificFilter('searchQuery');
    }
  }

  public closeFilters(): void {
    this.closeEvent.emit();
  }

  public trackByFilterGroup(index: number, group: FilterGroup): string {
    return group.name;
  }

  public trackByFilterOption(index: number, option: FilterOption): string {
    return option.value;
  }
}
