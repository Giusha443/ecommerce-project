// src/app/models/product.model.ts
export const TWO_DIGITS = 2;
export const TEN = 10;
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: ProductPrice;
  slug: string;
  attributes: Attribute[];
}

export interface AttributeType {
  name: string;
  value: string;
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
  facets?: Facets;
}

export type Facets = Record<
  string,
  {
    type: string;
    dataType: string;
    missing: number;
    total: number;
    other: number;
    terms: Term[];
  }
>;

export interface Term {
  term: string;
  count: number;
}
// Utility functions for price formatting
// Add this to your product.model.ts file - Updated PriceFormatter class

export class PriceFormatter {
  public static formatPrice(centAmount: number, currencyCode: string, fractionDigits = TWO_DIGITS): string {
    const amount = centAmount / Math.pow(TEN, fractionDigits);

    // Special formatting for Belarusian Ruble
    if (currencyCode === 'BYN') {
      return new Intl.NumberFormat('be-BY', {
        style: 'currency',
        currency: 'BYN',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(amount);
    }

    // Default formatting for other currencies
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  }

  public static createPriceValue(centAmount: number, currencyCode: string, fractionDigits = TWO_DIGITS): PriceValue {
    // Default to BYN if no currency provided
    const currency = currencyCode || 'BYN';

    return {
      centAmount,
      currencyCode: currency,
      fractionDigits,
      formatted: this.formatPrice(centAmount, currency, fractionDigits),
    };
  }
}
