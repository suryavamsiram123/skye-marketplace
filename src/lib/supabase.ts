import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  user_id: string;
  name: string;
  role: 'poster' | 'finder' | 'both';
  campus_location: string;
  max_walk_time_mins: 10 | 20 | 40;
  pay_min: number;
  pay_max: number;
  skills_interests: string[];
  onboarding_complete: boolean;
  avatar_url: string | null;
  bio: string;
  latitude: number | null;
  longitude: number | null;
  skills: string[];
  availability: 'flexible' | 'mornings' | 'afternoons' | 'evenings' | 'weekends_only';
  created_at: string;
  updated_at: string;
};

export type Gig = {
  id: string;
  user_id: string;
  type: 'post' | 'search';
  title: string;
  content: string;
  category: string;
  pay_min: number;
  pay_max: number;
  currency: string;
  campus_location: string;
  is_remote: boolean;
  poster_name: string;
  status: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  escrow_held: boolean;
  escrow_amount: number;
  escrow_released: boolean;
  webhook_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type GigMatch = {
  id: string;
  gig_id: string;
  user_id: string;
  matched_user_name: string;
  matched_user_id: string;
  match_score: number;
  title: string;
  category: string;
  pay_min: number;
  pay_max: number;
  campus_location: string;
  walk_time_mins: number;
  description: string;
  decision: 'accepted' | 'rejected' | null;
  escrow_status: 'pending' | 'held' | 'released' | 'disputed';
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: 'user' | 'agent';
  content: string;
  message_type: 'text' | 'match_cards' | 'status' | 'error' | 'telemetry';
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
};

export type WalletTransaction = {
  id: string;
  wallet_id: string;
  user_id: string;
  type: 'deposit' | 'escrow_hold' | 'escrow_release' | 'payment' | 'refund';
  amount: number;
  description: string;
  gig_id: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'new_gig' | 'gig_match' | 'escrow_release' | 'message' | 'payment' | 'gig_accepted';
  title: string;
  content: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export type SampleGig = {
  id: string;
  title: string;
  description: string;
  category: string;
  pay_min: number;
  pay_max: number;
  campus_location: string;
  is_remote: boolean;
  poster_name: string;
  poster_avatar: string | null;
  distance_mins: number;
  created_at: string;
};
