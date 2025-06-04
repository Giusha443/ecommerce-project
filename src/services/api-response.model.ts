import { Attribute } from '../models/product.model';

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
  results: ProductData[];
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

export type AddressType = Record<'id' | 'city' | 'country' | 'postalCode' | 'streetName', string>;

export interface ProfileResponse {
  id: string;
  version: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: {
    clientId: string;
    isPlatformClient: boolean;
  };
  createdBy: {
    clientId: string;
    isPlatformClient: boolean;
  };
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  dateOfBirth: string;
  addresses: AddressType[];
  defaultBillingAddressId: string;
  defaultShippingAddressId: string;
  shippingAddressIds: string[];
  billingAddressIds: string[];
  isEmailVerified: boolean;
  stores: [];
  authenticationMode: string;
}

export interface ProductData {
  id: string;
  key: string;
  categories: {
    id: string;
    typeId: string;
  }[];
  description: Record<string, string>;
  masterVariant: ProductVariant;
  name: Record<string, string>;
  slug: Record<string, string>;
  variants: ProductVariant[];
  searchKeywords?: Record<string, unknown>;
}

export interface ProductVariant {
  attributes: Attribute[];
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
    discounted: {
      value: {
        type: string;
        fractionDigits: number;
        centAmount: number;
        currencyCode: string;
      };
    };
  }[];
  sku?: string;
}

export interface BaseResource {
  id: string;
  version: number;
  createdAt: string;
  lastModifiedAt: string;
  createdBy?: ClientLogging;
  lastModifiedBy?: ClientLogging;
}

export interface ClientLogging {
  clientId: string;
  isPlatformClient: boolean;
}

export interface Address {
  country: string;
  city: string;
  streetName: string;
}

export interface Customer extends BaseResource {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  addresses: Address[];
  billingAddressIds?: string[];
  shippingAddressIds?: string[];
  customerGroupAssignments?: unknown[];
  authenticationMode: 'Password' | 'ExternalAuth';
  isEmailVerified: boolean;
  key?: string;
  lastMessageSequenceNumber: number;
  versionModifiedAt: string;
  stores?: unknown[];
}
export interface CustomerProps {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  addresses: Address[];
  key?: string;
}

export interface Introspect {
  active: boolean;
  scope?: string;
  exp?: number;
  client_id?: string;
}
