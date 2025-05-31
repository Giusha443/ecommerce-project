// src/app/pages/catalog/catalog.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, combineLatest } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { FilterService } from '../../services/filter.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { ProductCard, ProductFilters } from '../../models/product.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, SearchBarComponent, ProductFiltersComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  public products: ProductCard[] = [];
  public loading = false;
  public totalProducts = 0;
  public currentPage = 1;
  public itemsPerPage = 20;
  public totalPages = 0;
  public sortBy = 'name.en-US asc';
  public showFilters = false;
  public searchQuery = '';
  public activeFiltersCount = 0;
  public noResults = false;

  // Sort options
  public sortOptions = [
    { value: 'name.en-US asc', label: 'Name A-Z' },
    { value: 'name.en-US desc', label: 'Name Z-A' },
    { value: 'price asc', label: 'Price Low to High' },
    { value: 'price desc', label: 'Price High to Low' },
    { value: 'createdAt desc', label: 'Newest First' },
    { value: 'createdAt asc', label: 'Oldest First' },
  ];

  constructor(
    private productService: ProductService,
    private filterService: FilterService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.initializeSubscriptions();
    this.loadProducts();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSubscriptions(): void {
    // Subscribe to loading state
    this.productService.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => (this.loading = loading));

    // Subscribe to products
    this.productService.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.products = products;
      this.noResults = products.length === 0 && !this.loading;
    });

    // Subscribe to total count
    this.productService.total$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      this.totalProducts = total;
      this.totalPages = Math.ceil(total / this.itemsPerPage);
    });

    // Subscribe to active filters count
    this.filterService.activeFiltersCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => (this.activeFiltersCount = count));

    // Subscribe to filter changes and reload products
    this.filterService.filters$
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  public loadProducts(): void {
    const filters = this.filterService.getFilters();
    const offset = (this.currentPage - 1) * this.itemsPerPage;

    this.productService
      .getProducts({
        limit: this.itemsPerPage,
        offset,
        sort: this.sortBy,
        filters,
        search: filters.searchQuery,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public onSearch(query: string): void {
    this.searchQuery = query;
    this.filterService.setSearchQuery(query);
  }

  public onSortChange(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  public onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public onProductClick(product: ProductCard): void {
    this.router.navigate(['/product', product.slug]);
  }

  public onViewDetails(product: ProductCard): void {
    this.router.navigate(['/product', product.slug]);
  }

  public toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  public clearAllFilters(): void {
    this.filterService.clearFilters();
  }

  public getPaginationPages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  public getResultsText(): string {
    if (this.totalProducts === 0) return 'No products found';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalProducts);
    return `Showing ${start}-${end} of ${this.totalProducts} products`;
  }
  // Add this method to your CatalogComponent class
  public trackByProductId(index: number, product: ProductCard): string | number {
    return product.id || product.slug || index;
  }
}
