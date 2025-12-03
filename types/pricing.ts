export enum OrderInterval {
  Monthly = "month",
  Yearly = "year",
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  interval: OrderInterval;
  features: string[];
  popular?: boolean;
  credits: number;
  product_id?: string;
  product_name?: string;
  currency?: string;
  amount?: number;
  valid_months?: number;
} 