-- Data Analytics Rebuild Tables

-- Revenue Analytics
CREATE TABLE IF NOT EXISTS public.analytics_revenue (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  amount DECIMAL,
  client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL,
  service_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scan Analytics
CREATE TABLE IF NOT EXISTS public.analytics_scans (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  tool TEXT,
  target TEXT,
  severity TEXT,
  duration_seconds INTEGER,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Analytics
CREATE TABLE IF NOT EXISTS public.analytics_activity (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_activity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Super admin full revenue" ON public.analytics_revenue FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers view revenue" ON public.analytics_revenue FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Super admin full scans" ON public.analytics_scans FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers view scans" ON public.analytics_scans FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Super admin full activity" ON public.analytics_activity FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers view activity" ON public.analytics_activity FOR SELECT USING (public.has_role(auth.uid(), 'manager'));
