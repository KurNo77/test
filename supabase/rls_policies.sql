-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ── Enable RLS on all tables ───────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── Drop existing policies (safe re-run) ──────────────────
DROP POLICY IF EXISTS "profiles_select_own"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin"         ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self"          ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"           ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin"         ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_admin"         ON public.profiles;

DROP POLICY IF EXISTS "balances_select_own"           ON public.author_balances;
DROP POLICY IF EXISTS "balances_select_admin"         ON public.author_balances;
DROP POLICY IF EXISTS "balances_insert_self"          ON public.author_balances;
DROP POLICY IF EXISTS "balances_insert_admin"         ON public.author_balances;
DROP POLICY IF EXISTS "balances_update_admin"         ON public.author_balances;

DROP POLICY IF EXISTS "transactions_select_own"       ON public.balance_transactions;
DROP POLICY IF EXISTS "transactions_select_admin"     ON public.balance_transactions;
DROP POLICY IF EXISTS "transactions_insert_admin"     ON public.balance_transactions;

DROP POLICY IF EXISTS "notifications_select_own"      ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own"      ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_admin"    ON public.notifications;

-- ── PROFILES policies ──────────────────────────────────────
-- Authors see only their own row; admins see all
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users insert their own profile during registration
CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Authors update their own profile (role & status columns are protected by app logic)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE
  USING (public.is_admin());

-- ── AUTHOR_BALANCES policies ───────────────────────────────
-- Authors view own balance; admins view all
CREATE POLICY "balances_select_own"
  ON public.author_balances FOR SELECT
  USING (author_id = auth.uid() OR public.is_admin());

-- System trigger inserts on registration; authors can also seed their own
CREATE POLICY "balances_insert_self"
  ON public.author_balances FOR INSERT
  WITH CHECK (author_id = auth.uid() OR public.is_admin());

-- Only admins update balances
CREATE POLICY "balances_update_admin"
  ON public.author_balances FOR UPDATE
  USING (public.is_admin());

-- ── BALANCE_TRANSACTIONS policies ─────────────────────────
-- Authors see own transactions; admins see all
CREATE POLICY "transactions_select_own"
  ON public.balance_transactions FOR SELECT
  USING (author_id = auth.uid() OR public.is_admin());

-- Only admins insert transactions
CREATE POLICY "transactions_insert_admin"
  ON public.balance_transactions FOR INSERT
  WITH CHECK (public.is_admin());

-- ── NOTIFICATIONS policies ─────────────────────────────────
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Admins insert notifications; system can also insert via service role
CREATE POLICY "notifications_insert_admin"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- ── STORAGE policies ───────────────────────────────────────
DROP POLICY IF EXISTS "avatar_upload"  ON storage.objects;
DROP POLICY IF EXISTS "avatar_read"    ON storage.objects;
DROP POLICY IF EXISTS "avatar_update"  ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete"  ON storage.objects;

CREATE POLICY "avatar_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "avatar_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatar_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
  );

CREATE POLICY "avatar_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND auth.uid() IS NOT NULL
  );

-- ============================================================
-- TO CREATE YOUR FIRST ADMIN
-- After registering a user account via the app, run:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE email = 'your-admin-email@example.com';
--
-- Then log in at /admin/login with that account.
-- ============================================================
