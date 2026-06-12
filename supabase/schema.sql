-- ============================================================
-- AUTHOR MANAGEMENT SYSTEM — DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  phone_number  TEXT,
  address       TEXT,
  profile_picture TEXT,
  role          TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('author', 'admin')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Author Balances ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.author_balances (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id   UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance     NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Balance Transactions ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.balance_transactions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount           NUMERIC(12, 2) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'adjustment')),
  notes            TEXT,
  created_by       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Storage bucket for avatars ─────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ── Trigger: auto-create profile + balance on signup ───────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'author'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.author_balances (author_id, balance)
  VALUES (NEW.id, 0.00)
  ON CONFLICT (author_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Helper: updated_at auto-update ────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_balances_updated_at ON public.author_balances;
CREATE TRIGGER set_balances_updated_at
  BEFORE UPDATE ON public.author_balances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Admin helper function (SECURITY DEFINER bypasses RLS) ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;
