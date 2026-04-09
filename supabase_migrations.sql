-- Update profiles for online status
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- User presence tracking
CREATE TABLE IF NOT EXISTS user_presence (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'offline',
  last_seen TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Calls table (enhance existing)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT FALSE;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS participants JSONB;

-- Group call participants
CREATE TABLE IF NOT EXISTS group_call_participants (
  id SERIAL PRIMARY KEY,
  call_id INTEGER REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP,
  left_at TIMESTAMP,
  had_raised_hand BOOLEAN DEFAULT FALSE,
  was_speaker BOOLEAN DEFAULT FALSE
);

-- Phone verifications table
CREATE TABLE IF NOT EXISTS phone_verifications (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Automation logs table
CREATE TABLE IF NOT EXISTS automation_logs (
  id SERIAL PRIMARY KEY,
  task_name TEXT NOT NULL,
  status TEXT,
  output TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_presence
CREATE POLICY "Users can see all presence" ON user_presence FOR SELECT USING (true);
CREATE POLICY "Users can insert own presence" ON user_presence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presence" ON user_presence FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for group_call_participants
CREATE POLICY "Users can see group call participants" ON group_call_participants FOR SELECT USING (true);
CREATE POLICY "Users can insert group call participants" ON group_call_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own group call participation" ON group_call_participants FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for phone_verifications
-- Allow anonymous users or anyone to verify phones via API/Edge functions, so keeping it permissive for inserts
CREATE POLICY "Anyone can insert phone verifications" ON phone_verifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can select phone verifications" ON phone_verifications FOR SELECT USING (true);
CREATE POLICY "Anyone can update phone verifications" ON phone_verifications FOR UPDATE USING (true);

-- RLS Policies for automation_logs
-- Only admins/technicians might need policy, but keeping simple for now
CREATE POLICY "Users can see automation logs" ON automation_logs FOR SELECT USING (true);
CREATE POLICY "System can insert automation logs" ON automation_logs FOR INSERT WITH CHECK (true);

-- Ensure Calls policies allow listing all my calls
-- (Assuming there is a policy for select on calls already, adding if missing)
-- CREATE POLICY "Users can view their own calls" ON calls FOR SELECT USING (caller_id = auth.uid() OR receiver_id = auth.uid());

-- Domain visits tracking
CREATE TABLE IF NOT EXISTS domain_visits (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  domain_slug TEXT,
  visited_at TIMESTAMP DEFAULT NOW()
);

-- User preferences for dashboard layout
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dashboard_layout JSONB DEFAULT '{"order": ["cybersecurity", "networking", "software-dev", "data-analytics", "ai-ml", "cloud-devops", "mobile", "business", "team"]}';

-- RLS Policies for domain_visits
ALTER TABLE domain_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can track their own domain visits" ON domain_visits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own domain visits" ON domain_visits FOR SELECT USING (auth.uid() = user_id);
