// src/app/pages/catalog/catalog.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { FilterService } from '../../services/filter.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { ProductFiltersComponent } from '../../components/product-filters/product-filters.component';
import { ProductCard, ProductFilters } from '../../models/product.model';

const ITEMS_PER_PAGE = 10;
const TIMEOUT_BEFORE_SEARCH_REQUEST = 300;

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
  public itemsPerPage = ITEMS_PER_PAGE;
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
    this.productService.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.loading = loading;
    });

    // Subscribe to products
    this.productService.products$.pipe(takeUntil(this.destroy$)).subscribe(products => {
      this.products = products;
      this.noResults = products.length === 0 && !this.loading;
    });

    // Subscribe to total count
    this.productService.total$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      this.totalProducts = total;
      this.totalPages = Math.ceil(total / this.itemsPerPage);

      // Reset to page 1 if current page exceeds total pages
      if (this.currentPage > this.totalPages && this.totalPages > 0) {
        this.currentPage = 1;
      }
    });

    // Subscribe to active filters count
    this.filterService.activeFiltersCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.activeFiltersCount = count;
    });

    // Subscribe to filter changes and reload products
    this.filterService.filters$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(TIMEOUT_BEFORE_SEARCH_REQUEST),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(filters => {
        this.searchQuery = filters.searchQuery || '';
        this.resetToFirstPage();
        this.loadProducts();
      });
  }

  public loadProducts(): void {
    const filters = this.filterService.getFilters();
    const offset = (this.currentPage - 1) * this.itemsPerPage;

    // Enhanced sorting logic
    let sortParam = this.sortBy;

    // Adjust sort parameter format based on your API requirements
    if (this.sortBy === 'price desc') {
      sortParam = 'price desc';
    } else if (this.sortBy === 'price asc') {
      sortParam = 'price asc';
    }

    this.productService
      .getProducts({
        limit: this.itemsPerPage,
        offset,
        sort: sortParam,
        filters,
        search: filters.searchQuery,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Success handling if needed
        },
        error: error => {
          console.error('Error loading products:', error);
          this.noResults = true;
        },
      });
  }

  public onSearch(query: string): void {
    this.searchQuery = query;
    this.filterService.setSearchQuery(query);
    // Filter service subscription will handle the reload
  }

  public onSortChange(): void {
    console.log('Sort changed to:', this.sortBy);
    this.resetToFirstPage();
    this.loadProducts();
  }

  public onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
      // Scroll to top smoothly
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
    // This will trigger the filter subscription and reload products
  }

  public onFiltersClose(): void {
    this.showFilters = false;
  }

  private resetToFirstPage(): void {
    this.currentPage = 1;
  }

  // Enhanced pagination logic
  public get getPaginationPages(): number[] {
    const pages: number[] = [];
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 4) {
        pages.push(-1); // Ellipsis indicator
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push(-1); // Ellipsis indicator
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  }

  public get getResultsText(): string {
    if (this.totalProducts === 0) {
      return this.searchQuery || this.activeFiltersCount > 0
        ? 'No products found matching your criteria'
        : 'No products found';
    }

    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalProducts);
    return `Showing ${start}-${end} of ${this.totalProducts} products`;
  }

  public trackByProductId(index: number, product: ProductCard): string | number {
    return product.id || product.slug || index;
  }

  // Navigation methods for pagination
  public goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.onPageChange(1);
    }
  }

  public goToLastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.onPageChange(this.totalPages);
    }
  }

  public goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  public goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  public get canGoToPrevious(): boolean {
    return this.currentPage > 1;
  }

  public get canGoToNext(): boolean {
    return this.currentPage < this.totalPages;
  }
}
