import { Option } from 'commander';

export const VALID_PRODUCT_TYPES = ['subscription', 'one_time'] as const;
export type ProductType = typeof VALID_PRODUCT_TYPES[number];

export interface Product {
  id: string;
  store_identifier?: string;
  type: ProductType;
  app_id?: string;
  display_name?: string;
}

export interface ProductUpdateBody {
  display_name?: string;
  store_identifier?: string;
  app_id?: string;
  type?: ProductType;
}

export interface ProductCreateOptions {
  storeIdentifier: string;
  displayName?: string;
  appId: string;
  type: ProductType;
}

export function validateProductType(type: string): asserts type is ProductType {
  if (!(VALID_PRODUCT_TYPES as readonly string[]).includes(type)) {
    throw new Error(
      `Invalid product type: ${type}. Must be either 'subscription' or 'one_time'.`,
    );
  }
}
