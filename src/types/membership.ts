
export interface MembershipPlan {
  id: number;
  name: string;
  paypal_plan_id: string | null;
  monthly_price: number;
  annual_price: number | null;
  features: any;
  highlight_color: string | null;
  is_popular: boolean;
}

export interface UserSubscription {
  plan_id: number;
  status: string;
  current_period_end: string;
}

export type BillingCycle = 'monthly' | 'annual';
