
-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'direct',
  name TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  muted BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  reply_to_id INTEGER REFERENCES public.messages(id),
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Message reads
CREATE TABLE IF NOT EXISTS public.message_reads (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- AI Chat history
CREATE TABLE IF NOT EXISTS public.chat_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  model TEXT,
  role TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notification preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  browser_enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  digest_frequency TEXT NOT NULL DEFAULT 'daily',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Broadcast notices
CREATE TABLE IF NOT EXISTS public.broadcast_notices (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  target_roles TEXT[],
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE public.broadcast_notices ENABLE ROW LEVEL SECURITY;

-- Dismissed notices
CREATE TABLE IF NOT EXISTS public.dismissed_notices (
  id SERIAL PRIMARY KEY,
  notice_id INTEGER NOT NULL REFERENCES public.broadcast_notices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);
ALTER TABLE public.dismissed_notices ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT,
  ip_address TEXT,
  details_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Security definer helpers to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.user_conversation_ids(_user_id UUID)
RETURNS SETOF INTEGER
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT conversation_id FROM public.conversation_participants WHERE user_id = _user_id;
$$;

-- RLS: conversations
CREATE POLICY "Users see own conversations" ON public.conversations FOR SELECT
  USING (id IN (SELECT public.user_conversation_ids(auth.uid())));
CREATE POLICY "Auth users create conversations" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Super admin full conversations" ON public.conversations FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: conversation_participants
CREATE POLICY "Users see participants in own convos" ON public.conversation_participants FOR SELECT
  USING (conversation_id IN (SELECT public.user_conversation_ids(auth.uid())));
CREATE POLICY "Auth users add participants" ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Super admin full participants" ON public.conversation_participants FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: messages
CREATE POLICY "Users see messages in own convos" ON public.messages FOR SELECT
  USING (conversation_id IN (SELECT public.user_conversation_ids(auth.uid())));
CREATE POLICY "Users send messages to own convos" ON public.messages FOR INSERT
  WITH CHECK (conversation_id IN (SELECT public.user_conversation_ids(auth.uid())) AND sender_id = auth.uid());
CREATE POLICY "Users edit own messages" ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());
CREATE POLICY "Super admin full messages" ON public.messages FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: message_reads
CREATE POLICY "Users manage own reads" ON public.message_reads FOR ALL
  USING (user_id = auth.uid());

-- RLS: chat_history
CREATE POLICY "Users see own chat history" ON public.chat_history FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users insert own chat history" ON public.chat_history FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Super admin full chat history" ON public.chat_history FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: notifications
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "System inserts notifications" ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Super admin full notifications" ON public.notifications FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: notification_preferences
CREATE POLICY "Users manage own prefs" ON public.notification_preferences FOR ALL
  USING (user_id = auth.uid());

-- RLS: broadcast_notices
CREATE POLICY "All auth users see active broadcasts" ON public.broadcast_notices FOR SELECT
  USING (auth.uid() IS NOT NULL AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Super admin manage broadcasts" ON public.broadcast_notices FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS: dismissed_notices
CREATE POLICY "Users manage own dismissed" ON public.dismissed_notices FOR ALL
  USING (user_id = auth.uid());

-- RLS: audit_logs
CREATE POLICY "Super admin view audit logs" ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Managers view audit logs" ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "System insert audit logs" ON public.audit_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_conv_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_chat_history_user ON public.chat_history(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id, created_at DESC);

-- Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_notices;
