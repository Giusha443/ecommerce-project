// src/app/services/filter.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProductFilters } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private readonly defaultFilters: ProductFilters = {
    priceRange: undefined,
    brands: [],
    colors: [],
    sizes: [],
    categories: [],
    searchQuery: '',
  };

  private filtersSubject = new BehaviorSubject<ProductFilters>(this.defaultFilters);
  private activeFiltersCountSubject = new BehaviorSubject<number>(0);

  public filters$ = this.filtersSubject.asObservable();
  public activeFiltersCount$ = this.activeFiltersCountSubject.asObservable();

  public getFilters(): ProductFilters {
    return this.filtersSubject.value;
  }

  public updateFilters(filters: Partial<ProductFilters>): void {
    const currentFilters = this.filtersSubject.value;
    const newFilters = { ...currentFilters, ...filters };
    this.filtersSubject.next(newFilters);
    this.updateActiveFiltersCount(newFilters);
  }

  public setPriceRange(min: number, max: number): void {
    this.updateFilters({
      priceRange: { min, max },
    });
  }

  public addBrand(brand: string): void {
    const currentFilters = this.filtersSubject.value;
    const brands = [...(currentFilters.brands || [])];
    if (!brands.includes(brand)) {
      brands.push(brand);
      this.updateFilters({ brands });
    }
  }

  public removeBrand(brand: string): void {
    const currentFilters = this.filtersSubject.value;
    const brands = (currentFilters.brands || []).filter(b => b !== brand);
    this.updateFilters({ brands });
  }

  public toggleBrand(brand: string): void {
    const currentFilters = this.filtersSubject.value;
    const brands = currentFilters.brands || [];

    if (brands.includes(brand)) {
      this.removeBrand(brand);
    } else {
      this.addBrand(brand);
    }
  }

  public addColor(color: string): void {
    const currentFilters = this.filtersSubject.value;
    const colors = [...(currentFilters.colors || [])];
    if (!colors.includes(color)) {
      colors.push(color);
      this.updateFilters({ colors });
    }
  }

  public removeColor(color: string): void {
    const currentFilters = this.filtersSubject.value;
    const colors = (currentFilters.colors || []).filter(c => c !== color);
    this.updateFilters({ colors });
  }

  public toggleColor(color: string): void {
    const currentFilters = this.filtersSubject.value;
    const colors = currentFilters.colors || [];

    if (colors.includes(color)) {
      this.removeColor(color);
    } else {
      this.addColor(color);
    }
  }

  public addSize(size: string): void {
    const currentFilters = this.filtersSubject.value;
    const sizes = [...(currentFilters.sizes || [])];
    if (!sizes.includes(size)) {
      sizes.push(size);
      this.updateFilters({ sizes });
    }
  }

  public removeSize(size: string): void {
    const currentFilters = this.filtersSubject.value;
    const sizes = (currentFilters.sizes || []).filter(s => s !== size);
    this.updateFilters({ sizes });
  }

  public toggleSize(size: string): void {
    const currentFilters = this.filtersSubject.value;
    const sizes = currentFilters.sizes || [];

    if (sizes.includes(size)) {
      this.removeSize(size);
    } else {
      this.addSize(size);
    }
  }

  public addCategory(category: string): void {
    const currentFilters = this.filtersSubject.value;
    const categories = [...(currentFilters.categories || [])];
    if (!categories.includes(category)) {
      categories.push(category);
      this.updateFilters({ categories });
    }
  }

  public removeCategory(category: string): void {
    const currentFilters = this.filtersSubject.value;
    const categories = (currentFilters.categories || []).filter(c => c !== category);
    this.updateFilters({ categories });
  }

  public toggleCategory(category: string): void {
    const currentFilters = this.filtersSubject.value;
    const categories = currentFilters.categories || [];

    if (categories.includes(category)) {
      this.removeCategory(category);
    } else {
      this.addCategory(category);
    }
  }

  public setSearchQuery(query: string): void {
    this.updateFilters({ searchQuery: query });
  }

  public clearFilters(): void {
    this.filtersSubject.next(this.defaultFilters);
    this.activeFiltersCountSubject.next(0);
  }

  public clearSpecificFilter(filterType: keyof ProductFilters): void {
    const currentFilters = this.filtersSubject.value;
    const newFilters = { ...currentFilters };

    switch (filterType) {
      case 'priceRange':
        newFilters.priceRange = undefined;
        break;
      case 'brands':
        newFilters.brands = [];
        break;
      case 'colors':
        newFilters.colors = [];
        break;
      case 'sizes':
        newFilters.sizes = [];
        break;
      case 'categories':
        newFilters.categories = [];
        break;
      case 'searchQuery':
        newFilters.searchQuery = '';
        break;
    }

    this.filtersSubject.next(newFilters);
    this.updateActiveFiltersCount(newFilters);
  }

  public hasActiveFilters(): boolean {
    return this.activeFiltersCountSubject.value > 0;
  }

  public getActiveFiltersList(): string[] {
    const filters = this.filtersSubject.value;
    const activeFilters: string[] = [];

    if (filters.priceRange) {
      activeFilters.push(`Price: $${filters.priceRange.min} - $${filters.priceRange.max}`);
    }

    if (filters.brands && filters.brands.length > 0) {
      activeFilters.push(...filters.brands.map(brand => `Brand: ${brand}`));
    }

    if (filters.colors && filters.colors.length > 0) {
      activeFilters.push(...filters.colors.map(color => `Color: ${color}`));
    }

    if (filters.sizes && filters.sizes.length > 0) {
      activeFilters.push(...filters.sizes.map(size => `Size: ${size}`));
    }

    if (filters.categories && filters.categories.length > 0) {
      activeFilters.push(...filters.categories.map(cat => `Category: ${cat}`));
    }

    if (filters.searchQuery) {
      activeFilters.push(`Search: "${filters.searchQuery}"`);
    }

    return activeFilters;
  }

  private updateActiveFiltersCount(filters: ProductFilters): void {
    let count = 0;

    if (filters.priceRange) count++;
    if (filters.brands && filters.brands.length > 0) count += filters.brands.length;
    if (filters.colors && filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes && filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.categories && filters.categories.length > 0) count += filters.categories.length;
    if (filters.searchQuery && filters.searchQuery.trim()) count++;

    this.activeFiltersCountSubject.next(count);
  }
}
