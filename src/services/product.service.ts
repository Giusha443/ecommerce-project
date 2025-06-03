// src/app/services/product.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { environment } from '../environments/environment.development';
import { ProductData, ProductResponse, ProductVariant } from './api-response.model';
import {
  ProductCard,
  ProductFilters,
  EnhancedProductResponse,
  ProductListParams,
  PriceFormatter,
  ProductAttribute,
  FilterGroup,
  FilterOption,
  Product,
  PriceValue,
  Facets,
  Term,
  Attribute,
} from '../models/product.model';

const categorYID = {
  'Desktop processor': '626a7a37-2aed-4319-9917-4ca2dd7cd481',
  'Mobile processor': 'a0aba9ce-2bd2-4d05-9bdc-f7a31394898c',
};
const productTypeID = {
  CPU: 'f11c0cfb-9064-4620-a61b-7749637258ab',
  Memory: '34c47124-b50a-489f-85d3-f0455feb1da7',
  Components: '3fd8ee84-2a63-46cf-946b-7e2893e0728f',
};

import { ITEMS_PER_PAGE } from '../pages/catalog/catalog.component';
const ONEHUNDRED = 100;
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly productsUrl = `${environment.apiUrl}/${environment.projectKey}/product-projections/search`;
  private readonly categoriesUrl = `${environment.apiUrl}/${environment.projectKey}/categories`;

  private productsSubject = new BehaviorSubject<ProductCard[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public totalSubject = new BehaviorSubject<number>(0);
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
      httpParams = httpParams.set('text.en-US', params.search);
    }

    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }
    if (params.offset) {
      httpParams = httpParams.set('offset', params.offset);
    }

    // Apply filters
    if (params.filters) {
      httpParams = this.applyFilters(httpParams, params.filters);
    }
    console.log('getProducts', params);

    return this.http.get<ProductResponse>(this.productsUrl, { params: httpParams }).pipe(
      map(response => {
        console.log(response);
        return this.transformResponse(response);
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        this.loadingSubject.next(false);
        return of({ limit: 0, offset: 0, count: 0, total: 0, results: [] });
      })
    );
  }

  public searchProducts(query: string, limit = ITEMS_PER_PAGE): Observable<ProductCard[]> {
    console.log('searchProducts', query);

    return this.getProducts({ search: query, limit }).pipe(map(response => response.results));
  }

  public checkProductProjectionExistById(id: string): Observable<boolean | HttpResponse<Response>> {
    const url = `${environment.apiUrl}/${environment.projectKey}/product-projections/${id}`;
    return this.http.head<Response>(url, { observe: 'response' }).pipe(
      catchError(() => {
        return of(false);
      })
    );
  }

  public getProductById(id: string): Observable<Product | null> {
    const url = `${environment.apiUrl}/${environment.projectKey}/product-projections/${id}`;
    return this.http.get<ProductData>(url).pipe(
      map(response => this.transformDataToProduct(response)),
      catchError(error => {
        console.error('Error fetching product:', error);
        return of(null);
      })
    );
  }

  public getProductBySlug(slug: string): Observable<ProductCard | null> {
    const params = new HttpParams().set('where', `slug(en="${slug}")`).set('staged', 'false');

    return this.http.get<ProductResponse>(this.productsUrl.replace('/search', ''), { params }).pipe(
      map(response => (response.results?.[0] ? this.transformProduct(response.results[0]) : null)),
      catchError(error => {
        console.error('Error fetching product by slug:', error);
        return of(null);
      })
    );
  }

  private applyFilters(params: HttpParams, filters: ProductFilters): HttpParams {
    const filterExpressions: string[] = [];
    console.log('applyFilters', params, filters);

    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filterExpressions.push(`variants.price.centAmount:range(${min * ONEHUNDRED} to ${max * ONEHUNDRED})`);
    }

    if (filters.brands && filters.brands.length > 0) {
      const brandFilter = filters.brands.map(brand => `"${brand}"`).join(',');
      filterExpressions.push(`variants.attributes.brand:${brandFilter}`);
    }

    if (filters.colors && filters.colors.length > 0) {
      const colorFilter = filters.colors.map(color => `"${color}"`).join(',');
      filterExpressions.push(`variants.attributes.color.key:${colorFilter}`);
    }

    if (filters.types?.length) {
      filters.types.forEach(cat => {
        const typeId = productTypeID[cat as keyof typeof productTypeID];
        if (typeId) {
          filterExpressions.push(`productType.id:"${typeId}"`);
        }
      });
    }
    if (filters.categories?.length) {
      filters.categories.forEach(cat => {
        const categoryId = categorYID[cat as keyof typeof categorYID];
        if (categoryId) {
          filterExpressions.push(`categories.id:"${categoryId}"`);
        }
      });
    }

    if (filterExpressions.length > 0) {
      filterExpressions.forEach(filter => {
        params = params.append('filter', filter);
      });
    }
    return params;
  }

  private transformResponse(response: ProductResponse): EnhancedProductResponse {
    const products = response.results?.map(item => this.transformProduct(item)) || [];

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

  private transformProduct(item: ProductData): ProductCard {
    const masterVariant = item.masterVariant || {};
    const name = item.name?.['en'] || item.name?.['en-US'] || 'Unknown Product';
    const description = item.description?.['en'] || item.description?.['en-US'] || '';

    // Get first available image
    const image = masterVariant.images?.[0]?.url || '/assets/placeholder-product.jpg';

    // Transform price
    const price = this.transformPrice(masterVariant);

    // Transform attributes
    const attributes = this.transformAttributes(masterVariant.attributes || []);

    // Generate slug from name if not available
    const slug = item.slug?.['en'] || item.slug?.['en-US'] || this.generateSlug(name);

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

  private transformDataToProduct(data: ProductData): Product {
    const masterVariant = data.masterVariant;
    const name = data.name?.['en-US'] || 'Unnamed product';
    const description = data.description?.['en-US'] || 'no description given';

    const images = masterVariant.images?.length ? masterVariant.images?.map(image => image.url) : [];
    const price = this.transformPrice(masterVariant);
    const attributes = masterVariant.attributes ? masterVariant.attributes : [];
    const slug = data.slug?.['en-US'];

    return {
      id: data.id,
      name,
      description,
      attributes,
      slug,
      price,
      images,
    };
  }

  private transformPrice(variant: ProductVariant): {
    original: PriceValue;
    discounted?: PriceValue;
    hasDiscount: boolean;
  } {
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

  private transformAttributes(attributes: Attribute[]): ProductAttribute[] {
    return attributes.map(attr => ({
      name: attr.name,
      value: attr.value,
      type: this.getAttributeType(attr.name, attr.value),
    })) as ProductAttribute[];
  }

  private getAttributeType(
    name: string,
    value: string | number | { key: string; label: string }
  ): ProductAttribute['type'] {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('color')) return 'color';
    if (lowerName.includes('size')) return 'size';
    if (lowerName.includes('brand')) return 'text';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (Array.isArray(value)) return 'enum';
    if (typeof value === 'object') return 'text';
    return 'text';
  }

  private transformFacetsToFilters(facets: Facets): FilterGroup[] {
    const filterGroups: FilterGroup[] = [];

    Object.keys(facets).forEach(key => {
      const facet = facets[key];
      if (facet.terms && facet.terms.length > 0) {
        const options: FilterOption[] = facet.terms.map((term: Term) => ({
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
