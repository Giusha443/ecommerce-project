// src/app/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { environment } from '../environments/environment.development';
import { ProductResponse } from './api-response.model';
import {
  ProductCard,
  ProductFilters,
  EnhancedProductResponse,
  ProductListParams,
  PriceFormatter,
  ProductAttribute,
  FilterGroup,
  FilterOption,
} from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly productsUrl = `${environment.apiUrl}/${environment.projectKey}/product-projections/search`;
  private readonly categoriesUrl = `${environment.apiUrl}/${environment.projectKey}/categories`;

  private productsSubject = new BehaviorSubject<ProductCard[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private totalSubject = new BehaviorSubject<number>(0);
  private filtersSubject = new BehaviorSubject<FilterGroup[]>([]);

  public products$ = this.productsSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public total$ = this.totalSubject.asObservable();
  public filters$ = this.filtersSubject.asObservable();

  constructor(private http: HttpClient) {}

  public getProducts(params: ProductListParams = {}): Observable<EnhancedProductResponse> {
    this.loadingSubject.next(true);

    let httpParams = new HttpParams();

    if (params.search) {
      httpParams = httpParams.set('name.en-US', params.search);
    }

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }

    // Apply filters
    if (params.filters) {
      httpParams = this.applyFilters(httpParams, params.filters);
    }

    return this.http.get<any>(this.productsUrl, { params: httpParams }).pipe(
      map(response => this.transformResponse(response)),
      catchError(error => {
        console.error('Error fetching products:', error);
        this.loadingSubject.next(false);
        return of({ limit: 0, offset: 0, count: 0, total: 0, results: [] });
      })
    );
  }

  public searchProducts(query: string, limit = 20): Observable<ProductCard[]> {
    return this.getProducts({ search: query, limit }).pipe(map(response => response.results));
  }

  public getProductById(id: string): Observable<ProductCard | null> {
    const url = `${environment.apiUrl}/${environment.projectKey}/product-projections/${id}`;
    return this.http.get<any>(url).pipe(
      map(response => this.transformProduct(response)),
      catchError(error => {
        console.error('Error fetching product:', error);
        return of(null);
      })
    );
  }

  public getProductBySlug(slug: string): Observable<ProductCard | null> {
    const params = new HttpParams().set('where', `slug(en="${slug}")`).set('staged', 'false');

    return this.http.get<any>(this.productsUrl.replace('/search', ''), { params }).pipe(
      map(response => (response.results?.[0] ? this.transformProduct(response.results[0]) : null)),
      catchError(error => {
        console.error('Error fetching product by slug:', error);
        return of(null);
      })
    );
  }

  private applyFilters(params: HttpParams, filters: ProductFilters): HttpParams {
    const filterExpressions: string[] = [];

    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filterExpressions.push(`variants.price.centAmount:range(${min * 100} to ${max * 100})`);
    }

    if (filters.brands && filters.brands.length > 0) {
      const brandFilter = filters.brands.map(brand => `"${brand}"`).join(',');
      filterExpressions.push(`variants.attributes.brand:${brandFilter}`);
    }

    if (filters.colors && filters.colors.length > 0) {
      const colorFilter = filters.colors.map(color => `"${color}"`).join(',');
      filterExpressions.push(`variants.attributes.color.key:${colorFilter}`);
    }

    if (filters.sizes && filters.sizes.length > 0) {
      const sizeFilter = filters.sizes.map(size => `"${size}"`).join(',');
      filterExpressions.push(`variants.attributes.size:${sizeFilter}`);
    }

    if (filters.categories && filters.categories.length > 0) {
      const categoryFilter = filters.categories.map(cat => `"${cat}"`).join(',');
      filterExpressions.push(`categories.id:${categoryFilter}`);
    }

    if (filterExpressions.length > 0) {
      params = params.set('filter', filterExpressions.join(' and '));
    }

    return params;
  }

  private transformResponse(response: any): EnhancedProductResponse {
    const products = response.results?.map((item: any) => this.transformProduct(item)) || [];

    this.productsSubject.next(products);
    this.totalSubject.next(response.total || 0);
    this.loadingSubject.next(false);

    // Transform facets to filter groups
    if (response.facets) {
      const filterGroups = this.transformFacetsToFilters(response.facets);
      this.filtersSubject.next(filterGroups);
    }

    return {
      limit: response.limit || 0,
      offset: response.offset || 0,
      count: response.count || 0,
      total: response.total || 0,
      results: products,
      facets: response.facets,
    };
  }

  private transformProduct(item: any): ProductCard {
    const masterVariant = item.masterVariant || {};
    const name = item.name?.en || item.name?.['en-US'] || 'Unknown Product';
    const description = item.description?.en || item.description?.['en-US'] || '';

    // Get first available image
    const image = masterVariant.images?.[0]?.url || '/assets/placeholder-product.jpg';

    // Transform price
    const price = this.transformPrice(masterVariant);

    // Transform attributes
    const attributes = this.transformAttributes(masterVariant.attributes || []);

    // Generate slug from name if not available
    const slug = item.slug?.en || item.slug?.['en-US'] || this.generateSlug(name);

    return {
      id: item.id,
      name,
      description,
      image,
      price,
      slug,
      attributes,
    };
  }

  private transformPrice(variant: any): any {
    const prices = variant.prices || [];
    if (prices.length === 0) {
      return {
        original: PriceFormatter.createPriceValue(0, 'USD'),
        hasDiscount: false,
      };
    }

    const price = prices[0];
    const originalPrice = PriceFormatter.createPriceValue(
      price.value.centAmount,
      price.value.currencyCode,
      price.value.fractionDigits
    );

    // Check for discounted price
    if (price.discounted) {
      const discountedPrice = PriceFormatter.createPriceValue(
        price.discounted.value.centAmount,
        price.discounted.value.currencyCode,
        price.discounted.value.fractionDigits
      );

      return {
        original: originalPrice,
        discounted: discountedPrice,
        hasDiscount: true,
      };
    }

    return {
      original: originalPrice,
      hasDiscount: false,
    };
  }

  private transformAttributes(attributes: any[]): ProductAttribute[] {
    return attributes.map(attr => ({
      name: attr.name,
      value: attr.value,
      type: this.getAttributeType(attr.name, attr.value),
    }));
  }

  private getAttributeType(name: string, value: any): ProductAttribute['type'] {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('color')) return 'color';
    if (lowerName.includes('size')) return 'size';
    if (lowerName.includes('brand')) return 'text';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'enum';
    return 'text';
  }

  private transformFacetsToFilters(facets: any): FilterGroup[] {
    const filterGroups: FilterGroup[] = [];

    Object.keys(facets).forEach(key => {
      const facet = facets[key];
      if (facet.terms && facet.terms.length > 0) {
        const options: FilterOption[] = facet.terms.map((term: any) => ({
          value: term.term,
          label: term.term,
          count: term.count,
        }));

        let name = key.replace('variants.attributes.', '').replace('.key', '');
        name = name.charAt(0).toUpperCase() + name.slice(1);

        filterGroups.push({
          name,
          type: key.includes('color') ? 'color' : 'checkbox',
          options,
        });
      }
    });

    return filterGroups;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
