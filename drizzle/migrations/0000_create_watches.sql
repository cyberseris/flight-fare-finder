CREATE TABLE public.watches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin TEXT NOT NULL DEFAULT 'TPE',
  destination TEXT NOT NULL,
  destination_name TEXT NOT NULL DEFAULT '',
  target_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.watches TO authenticated;
GRANT ALL ON public.watches TO service_role;

ALTER TABLE public.watches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own watches"
  ON public.watches FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watches"
  ON public.watches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watches"
  ON public.watches FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watches"
  ON public.watches FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX watches_user_id_idx ON public.watches (user_id);