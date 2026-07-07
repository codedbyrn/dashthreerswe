export interface Product {
  id: string;
  site_id: string;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean;
  product_img: string | null;
  created_at: string;
}

export interface CreateProductInput {
  name: string;
  price?: number;
  description?: string;
  is_active?: boolean;
  product_img?: string | null;
}

export type UpdateProductInput = Partial<CreateProductInput>;
