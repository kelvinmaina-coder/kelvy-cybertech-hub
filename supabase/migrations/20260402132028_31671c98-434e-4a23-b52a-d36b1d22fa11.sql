
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'manager', 'security_analyst', 'technician', 'client', 'guest');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create clients table
CREATE TABLE public.clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  mpesa_number TEXT,
  address TEXT,
  contract_value DECIMAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  client_id INTEGER REFERENCES public.clients(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE,
  client_id INTEGER REFERENCES public.clients(id),
  amount DECIMAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  mpesa_ref TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scans table
CREATE TABLE public.scans (
  id SERIAL PRIMARY KEY,
  tool TEXT NOT NULL,
  target TEXT,
  args JSONB DEFAULT '{}',
  raw_output TEXT,
  ai_analysis TEXT,
  severity TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security_events table
CREATE TABLE public.security_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT,
  description TEXT,
  severity TEXT DEFAULT 'info',
  source_ip TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========== SECURITY DEFINER FUNCTION ==========
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ========== ENABLE RLS ==========
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- ========== PROFILES RLS ==========
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admin can do everything on profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Approved users can view other profiles" ON public.profiles
  FOR SELECT USING (
    approved = true
    AND (
      public.has_role(auth.uid(), 'manager')
      OR public.has_role(auth.uid(), 'security_analyst')
      OR public.has_role(auth.uid(), 'technician')
    )
  );

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========== USER_ROLES RLS ==========
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admin full access on roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- ========== CLIENTS RLS ==========
CREATE POLICY "Super admin full access on clients" ON public.clients
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can view and manage clients" ON public.clients
  FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can insert clients" ON public.clients
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update clients" ON public.clients
  FOR UPDATE USING (public.has_role(auth.uid(), 'manager'));

-- ========== TICKETS RLS ==========
CREATE POLICY "Super admin full access on tickets" ON public.tickets
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can manage tickets" ON public.tickets
  FOR ALL USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Technicians can view and update assigned tickets" ON public.tickets
  FOR SELECT USING (
    public.has_role(auth.uid(), 'technician')
  );

CREATE POLICY "Technicians can update tickets" ON public.tickets
  FOR UPDATE USING (public.has_role(auth.uid(), 'technician'));

CREATE POLICY "Technicians can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'technician'));

CREATE POLICY "Clients can view own tickets" ON public.tickets
  FOR SELECT USING (
    public.has_role(auth.uid(), 'client')
    AND created_by = auth.uid()
  );

CREATE POLICY "Clients can create tickets" ON public.tickets
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'client')
    AND created_by = auth.uid()
  );

-- ========== INVOICES RLS ==========
CREATE POLICY "Super admin full access on invoices" ON public.invoices
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Managers can manage invoices" ON public.invoices
  FOR ALL USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Clients can view own invoices" ON public.invoices
  FOR SELECT USING (
    public.has_role(auth.uid(), 'client')
    AND created_by = auth.uid()
  );

-- ========== SCANS RLS ==========
CREATE POLICY "Super admin full access on scans" ON public.scans
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Security analysts can manage scans" ON public.scans
  FOR ALL USING (public.has_role(auth.uid(), 'security_analyst'));

CREATE POLICY "Managers can view scans" ON public.scans
  FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Technicians can view scans" ON public.scans
  FOR SELECT USING (public.has_role(auth.uid(), 'technician'));

-- ========== SECURITY EVENTS RLS ==========
CREATE POLICY "Super admin full access on security_events" ON public.security_events
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Security analysts can manage events" ON public.security_events
  FOR ALL USING (public.has_role(auth.uid(), 'security_analyst'));

CREATE POLICY "Managers can view events" ON public.security_events
  FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- ========== TRIGGERS ==========

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, approved)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), false);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets, public.scans, public.security_events;

-- Indexes
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_assigned ON public.tickets(assigned_to);
CREATE INDEX idx_scans_tool ON public.scans(tool);
CREATE INDEX idx_scans_created_by ON public.scans(created_by);
CREATE INDEX idx_profiles_approved ON public.profiles(approved);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_clients_status ON public.clients(status);
