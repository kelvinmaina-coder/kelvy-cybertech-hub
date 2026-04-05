
-- Deals table (CRM pipeline)
CREATE TABLE IF NOT EXISTS public.deals (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'lead',
  probability INTEGER DEFAULT 0,
  close_date DATE,
  notes TEXT,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Interactions table (CRM activity log)
CREATE TABLE IF NOT EXISTS public.interactions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES public.clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT,
  ai_summary TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT DEFAULT 'mpesa',
  mpesa_ref TEXT,
  confirmed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id SERIAL PRIMARY KEY,
  category TEXT,
  amount NUMERIC DEFAULT 0,
  vendor TEXT,
  description TEXT,
  approved_by UUID,
  receipt_url TEXT,
  expense_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planning',
  budget NUMERIC DEFAULT 0,
  start_date DATE,
  deadline DATE,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tasks table (project management)
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  due_date DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Calls table (video/audio call history)
CREATE TABLE IF NOT EXISTS public.calls (
  id SERIAL PRIMARY KEY,
  caller_id UUID NOT NULL,
  receiver_id UUID,
  conversation_id INTEGER REFERENCES public.conversations(id) ON DELETE SET NULL,
  call_type TEXT DEFAULT 'audio',
  status TEXT DEFAULT 'initiated',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link TEXT,
  host_id UUID NOT NULL,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meeting participants
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rsvp_status TEXT DEFAULT 'pending',
  joined_at TIMESTAMPTZ,
  UNIQUE(meeting_id, user_id)
);

-- Push tokens for mobile notifications
CREATE TABLE IF NOT EXISTS public.push_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  device_type TEXT DEFAULT 'android',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used TIMESTAMPTZ
);

-- Enable RLS on all new tables
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Updated_at triggers
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS: Deals
CREATE POLICY "Super admin full deals" ON public.deals FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers manage deals" ON public.deals FOR ALL USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Clients view own deals" ON public.deals FOR SELECT USING (public.has_role(auth.uid(), 'client') AND client_id IN (SELECT id FROM public.clients WHERE created_by = auth.uid()));

-- RLS: Interactions
CREATE POLICY "Super admin full interactions" ON public.interactions FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers manage interactions" ON public.interactions FOR ALL USING (public.has_role(auth.uid(), 'manager'));

-- RLS: Payments
CREATE POLICY "Super admin full payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers manage payments" ON public.payments FOR ALL USING (public.has_role(auth.uid(), 'manager'));

-- RLS: Expenses
CREATE POLICY "Super admin full expenses" ON public.expenses FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers manage expenses" ON public.expenses FOR ALL USING (public.has_role(auth.uid(), 'manager'));

-- RLS: Projects
CREATE POLICY "Super admin full projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers manage projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Technicians view assigned tasks projects" ON public.projects FOR SELECT USING (public.has_role(auth.uid(), 'technician'));

-- RLS: Tasks
CREATE POLICY "Super admin full tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers manage tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Technicians manage assigned tasks" ON public.tasks FOR ALL USING (public.has_role(auth.uid(), 'technician'));

-- RLS: Calls
CREATE POLICY "Users see own calls" ON public.calls FOR SELECT USING (caller_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users create calls" ON public.calls FOR INSERT WITH CHECK (caller_id = auth.uid());
CREATE POLICY "Users update own calls" ON public.calls FOR UPDATE USING (caller_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Super admin full calls" ON public.calls FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: Meetings
CREATE POLICY "Users see meetings they host or participate in" ON public.meetings FOR SELECT USING (host_id = auth.uid() OR id IN (SELECT meeting_id FROM public.meeting_participants WHERE user_id = auth.uid()));
CREATE POLICY "Auth users create meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Hosts update meetings" ON public.meetings FOR UPDATE USING (host_id = auth.uid());
CREATE POLICY "Super admin full meetings" ON public.meetings FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: Meeting participants
CREATE POLICY "Users see own meeting participations" ON public.meeting_participants FOR SELECT USING (user_id = auth.uid() OR meeting_id IN (SELECT id FROM public.meetings WHERE host_id = auth.uid()));
CREATE POLICY "Meeting hosts manage participants" ON public.meeting_participants FOR ALL USING (meeting_id IN (SELECT id FROM public.meetings WHERE host_id = auth.uid()));
CREATE POLICY "Super admin full meeting_participants" ON public.meeting_participants FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: Push tokens
CREATE POLICY "Users manage own push tokens" ON public.push_tokens FOR ALL USING (user_id = auth.uid());

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.calls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
