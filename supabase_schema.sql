-- WhaDesk Database Schema Reference

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'agent', -- 'admin' or 'agent'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. Contacts Table
CREATE TABLE public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contacts are viewable by authenticated users" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Contacts can be updated by authenticated users" ON public.contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Contacts can be inserted by authenticated users" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Chats Table
CREATE TABLE public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'open', -- 'open', 'snoozed', 'resolved'
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  unread_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chats viewable by authenticated" ON public.chats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Chats updatable by authenticated" ON public.chats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Chats insertable by authenticated" ON public.chats FOR INSERT TO authenticated WITH CHECK (true);

-- 4. Messages Table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'agent', 'customer', 'note'
  sender_id UUID REFERENCES public.profiles(id), -- Only for agents/notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages viewable by authenticated" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Messages insertable by authenticated" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Quick Replies Table
CREATE TABLE public.quick_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shortcut TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.quick_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quick_replies_select" ON public.quick_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "quick_replies_admin_all" ON public.quick_replies FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- 6. Trigger for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();