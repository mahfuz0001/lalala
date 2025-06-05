/*
  # Add Real-time Features for SafeStreets

  1. New Tables
    - distress_signals
      - Stores emergency distress signals with location and status
    - help_responses
      - Tracks who is responding to distress signals
    - user_stats
      - Stores user statistics and achievements
    - emergency_contacts
      - Stores user emergency contacts for SOS alerts

  2. Security
    - Enable RLS on all new tables
    - Add policies for real-time features
*/

-- Create distress_signals table if not exists
CREATE TABLE IF NOT EXISTS distress_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  location_lat double precision NOT NULL,
  location_lng double precision NOT NULL,
  location_address text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  description text,
  is_anonymous boolean DEFAULT false
);

-- Create help_responses table
CREATE TABLE IF NOT EXISTS help_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id uuid REFERENCES distress_signals(id) ON DELETE CASCADE,
  responder_id uuid REFERENCES auth.users(id),
  status text DEFAULT 'en_route',
  created_at timestamptz DEFAULT now(),
  arrived_at timestamptz,
  distance_traveled double precision
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  signals_sent integer DEFAULT 0,
  signals_responded integer DEFAULT 0,
  people_helped integer DEFAULT 0,
  distance_traveled double precision DEFAULT 0,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text NOT NULL,
  relationship text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, phone_number)
);

-- Enable RLS
ALTER TABLE distress_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Distress Signals Policies
CREATE POLICY "Users can create distress signals"
  ON distress_signals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view nearby active signals"
  ON distress_signals
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' AND
    calculate_distance(
      location_lat,
      location_lng,
      cast(current_setting('app.current_lat', true) as float),
      cast(current_setting('app.current_lng', true) as float)
    ) <= 500
  );

-- Help Responses Policies
CREATE POLICY "Users can respond to signals"
  ON help_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = responder_id);

CREATE POLICY "Users can view their responses"
  ON help_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = responder_id);

-- User Stats Policies
CREATE POLICY "Users can view their own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can update user stats"
  ON user_stats
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Emergency Contacts Policies
CREATE POLICY "Users can manage their emergency contacts"
  ON emergency_contacts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to send distress signal
CREATE OR REPLACE FUNCTION send_distress_signal(
  p_lat double precision,
  p_lng double precision,
  p_description text DEFAULT NULL,
  p_is_anonymous boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_signal_id uuid;
BEGIN
  -- Create distress signal
  INSERT INTO distress_signals (
    user_id,
    location_lat,
    location_lng,
    description,
    is_anonymous
  )
  VALUES (
    auth.uid(),
    p_lat,
    p_lng,
    p_description,
    p_is_anonymous
  )
  RETURNING id INTO v_signal_id;

  -- Update user stats
  INSERT INTO user_stats (user_id, signals_sent)
  VALUES (auth.uid(), 1)
  ON CONFLICT (user_id)
  DO UPDATE SET signals_sent = user_stats.signals_sent + 1;

  RETURN v_signal_id;
END;
$$;

-- Function to respond to distress signal
CREATE OR REPLACE FUNCTION respond_to_signal(
  p_signal_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_response_id uuid;
BEGIN
  -- Create help response
  INSERT INTO help_responses (
    signal_id,
    responder_id
  )
  VALUES (
    p_signal_id,
    auth.uid()
  )
  RETURNING id INTO v_response_id;

  -- Update user stats
  INSERT INTO user_stats (user_id, signals_responded)
  VALUES (auth.uid(), 1)
  ON CONFLICT (user_id)
  DO UPDATE SET signals_responded = user_stats.signals_responded + 1;

  -- Update signal status
  UPDATE distress_signals
  SET status = 'help_en_route'
  WHERE id = p_signal_id;

  RETURN v_response_id;
END;
$$;

-- Function to mark arrival at distress location
CREATE OR REPLACE FUNCTION mark_arrival_at_signal(
  p_response_id uuid,
  p_distance_traveled double precision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update help response
  UPDATE help_responses
  SET
    status = 'arrived',
    arrived_at = now(),
    distance_traveled = p_distance_traveled
  WHERE id = p_response_id;

  -- Update user stats
  UPDATE user_stats
  SET
    people_helped = people_helped + 1,
    distance_traveled = distance_traveled + p_distance_traveled
  WHERE user_id = auth.uid();
END;
$$;