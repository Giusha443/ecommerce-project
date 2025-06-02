// src/app/models/product.model.ts
const TWO_DIGITS = 2;
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: ProductPrice;
  slug: string;
  attributes: Attribute[];
}

export interface Attribute {
  name: string;
  value: string | number | { key: string; label: string };
}

export interface ProductCard {
  id: string;
  name: string;
  description: string;
  image: string;
  price: ProductPrice;
  slug: string;
  attributes: ProductAttribute[];
}

export interface ProductPrice {
  original: PriceValue;
  discounted?: PriceValue;
  hasDiscount: boolean;
}

export interface PriceValue {
  centAmount: number;
  currencyCode: string;
  fractionDigits: number;
  formatted: string;
}

export interface ProductAttribute {
  name: string;
  value: string | string[] | number;
  type: 'text' | 'enum' | 'number' | 'boolean' | 'color' | 'size';
}

export interface ProductFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  brands?: string[];
  colors?: string[];
  types?: string[];
  categories?: string[];
  searchQuery?: string;
  produstType?: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

export interface FilterGroup {
  name: string;
  type: 'checkbox' | 'range' | 'color';
  options: FilterOption[];
}

export interface ProductListParams {
  limit?: number;
  offset?: number;
  sort?: string;
  filters?: ProductFilters;
  search?: string;
}

// Enhanced ProductResponse interface (extends your existing one)
export interface EnhancedProductResponse {
  limit: number;
  offset: number;
  count: number;
  total: number;
  results: ProductCard[];
  facets?: Record<
    string,
    {
      type: string;
      dataType: string;
      missing: number;
      total: number;
      other: number;
      terms: {
        term: string;
        count: number;
      }[];
    }
  >;
}

// Utility functions for price formatting
export class PriceFormatter {
  public static formatPrice(centAmount: number, currencyCode: string, fractionDigits = TWO_DIGITS): string {
    const CENTS = 10;
    const amount = centAmount / Math.pow(CENTS, fractionDigits);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }

  public static createPriceValue(centAmount: number, currencyCode: string, fractionDigits = TWO_DIGITS): PriceValue {
    return {
      centAmount,
      currencyCode,
      fractionDigits,
      formatted: this.formatPrice(centAmount, currencyCode, fractionDigits),
    };
  }
}
