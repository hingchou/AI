export interface PricingItem {
  id?: string;           // 添加 id 属性
  title: string;
  description?: string;
  price: number;  // 确保是数字类型
  original_price?: number;  // 确保是数字类型
  interval?: string;
  features: string[];
  popular?: boolean;
  group?: string;
  product_id?: string;
  product_name?: string;
  credits?: number;
  currency?: string;
  amount?: number;
  cn_amount?: number;
  valid_months?: number;
}

export interface Pricing {
  name: string;
  title: string;
  description: string;
  disabled?: boolean;
  groups?: Array<{
    name: string;
    title: string;
    label?: string;
  }>;
  items?: PricingItem[];
} 