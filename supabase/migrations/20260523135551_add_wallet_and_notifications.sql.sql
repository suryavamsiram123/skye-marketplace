/*
  # Wallet and Notifications System

  ## Overview
  Adds wallet balance for simulated payments and notifications table for real-time alerts.

  ## New Tables

  ### wallets
  - user_id: Links to user profile
  - balance: Current wallet balance (simulated)
  - total_earned: Lifetime earnings
  - total_spent: Lifetime spending
  - created_at/updated_at: Timestamps

  ### wallet_transactions
  - Tracks all wallet transactions
  - Types: deposit, escrow_hold, escrow_release, payment
  - Links to gigs for escrow entries

  ### notifications
  - Real-time notifications for users
  - Types: new_gig, gig_match, escort_release, message
  - read status for UI

  ### sample_gigs
  - Sample/mock data for testing the browse page
  - Pre-populated gigs from various categories

  ## Changes to user_profiles
  - Add wallet_id foreign key

  ## Security
  - RLS enabled on all new tables
  - Users can only access their own wallet and notifications
*/

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  balance numeric(10,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned numeric(10,2) NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent numeric(10,2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'escrow_hold', 'escrow_release', 'payment', 'refund')),
  amount numeric(10,2) NOT NULL,
  description text NOT NULL DEFAULT '',
  gig_id uuid REFERENCES gigs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('new_gig', 'gig_match', 'escrow_release', 'message', 'payment', 'gig_accepted')),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  data jsonb DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sample gigs table (for browse feature)
CREATE TABLE IF NOT EXISTS sample_gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Other',
  pay_min numeric(10,2) NOT NULL DEFAULT 0,
  pay_max numeric(10,2) NOT NULL DEFAULT 0,
  campus_location text NOT NULL DEFAULT '',
  is_remote boolean NOT NULL DEFAULT false,
  poster_name text NOT NULL DEFAULT 'Anonymous',
  poster_avatar text,
  distance_mins integer NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sample_gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sample gigs"
  ON sample_gigs FOR SELECT
  TO authenticated
  USING (true);

-- Add notification preferences to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"new_gigs": true, "matches": true, "messages": true, "payments": true}'::jsonb;

-- Add wallet_id to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_id uuid REFERENCES wallets(id) ON DELETE SET NULL;

-- Add updated_at trigger for wallets
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_sample_gigs_category ON sample_gigs(category);
