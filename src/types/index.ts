export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_status: "active" | "inactive" | "lapsed";
  subscription_tier: "monthly" | "yearly" | null;
  renewal_date: string | null;
  charity_id: string | null;
  charity_percentage: number;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
}

export interface Charity {
  id: string; name: string; description: string;
  image_url: string | null; website_url: string | null;
  featured: boolean; created_at: string;
}

export interface GolfScore {
  id: string; user_id: string; score: number; date: string; created_at: string;
}

export interface Draw {
  id: string; draw_date: string; winning_numbers: number[];
  status: "pending" | "simulated" | "published";
  total_prize_pool: number; created_at: string;
}

export interface Winner {
  id: string; draw_id: string; user_id: string;
  match_type: "3-match" | "4-match" | "5-match";
  prize_amount: number; proof_url: string | null;
  status: "pending" | "verified" | "paid" | "rejected";
  created_at: string;
}