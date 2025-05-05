export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

export interface ProductResponse {
  limit: number;
  offset: number;
  count: number;
  total: number;
  results: {
    id: string;
    masterData: {
      current: ProductData;
      hasStagedChanges: boolean;
      published: boolean;
      staged: ProductData;
    };
    productType: {
      id: string;
      typeId: string;
    };
    taxCategory?: {
      id: string;
      typeId: string;
    };
    version: number;
    createdAt: string;
    lastModifiedAt: string;
  }[];
}

interface ProductData {
  categories: {
    id: string;
    typeId: string;
  }[];
  description: Record<string, string>;
  masterVariant: ProductVariant;
  name: Record<string, string>;
  slug: Record<string, string>;
  variants: ProductVariant[];
  searchKeywords: Record<string, unknown>;
}

interface ProductVariant {
  attributes: unknown[];
  id: number;
  images?: {
    dimensions: {
      h: number;
      w: number;
    };
    url: string;
  }[];
  prices?: {
    value: {
      type: string;
      fractionDigits: number;
      centAmount: number;
      currencyCode: string;
    };
    id: string;
  }[];
  sku?: string;
}
