# Author Management System — Deployment Guide

## Stack
- **Frontend / Backend**: Next.js 14 (App Router)
- **Database + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Storage**: Supabase Storage (avatars bucket)
- **Hosting**: Vercel

---

## 1. Supabase Setup

### 1.1 Create a project
1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 1.2 Run the database schema
In your Supabase project → SQL Editor → **New query**:
1. Paste the contents of `supabase/schema.sql` → Run
2. Paste the contents of `supabase/rls_policies.sql` → Run

### 1.3 Disable email confirmation (recommended for internal systems)
1. Go to Authentication → Settings → Email Auth
2. Toggle **off** "Confirm email" (allows immediate login after registration)

### 1.4 Create your first Admin
After registering via `/register` or directly in Supabase Auth:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```
Then log in at `/admin/login`.

---

## 2. Local Development

```bash
# Clone / navigate to the project
cd author-management-system

# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

```bash
npm run dev
# Open http://localhost:3000
```

---

## 3. Vercel Deployment

### 3.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — Author Management System"
git remote add origin https://github.com/YOUR_ORG/author-management-system.git
git push -u origin main
```

### 3.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select your repository
3. Framework: **Next.js** (auto-detected)
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
5. Click **Deploy**

---

## 4. Routes

| Route | Description |
|-------|-------------|
| `/login` | Author login |
| `/register` | Author registration |
| `/dashboard` | Author main dashboard |
| `/dashboard/profile` | Edit profile + upload avatar |
| `/dashboard/account` | View account info (balance is read-only) |
| `/dashboard/notifications` | View notifications |
| `/dashboard/support` | Support / FAQ |
| `/admin/login` | Admin login (separate) |
| `/admin/dashboard` | Admin overview stats |
| `/admin/dashboard/authors` | Author management (edit/suspend/delete) |
| `/admin/dashboard/balance` | Balance manager + transaction log |

---

## 5. User Roles

| Feature | Author | Admin |
|---------|--------|-------|
| View own profile | ✅ | ✅ |
| Edit own profile | ✅ | ✅ |
| View own balance | ✅ (read-only) | ✅ |
| Modify any balance | ❌ | ✅ |
| View all authors | ❌ | ✅ |
| Delete authors | ❌ | ✅ |
| Suspend accounts | ❌ | ✅ |
| Send notifications | ❌ | ✅ (auto on balance update) |

---

## 6. Design System

| Token | Value |
|-------|-------|
| Primary Background | `#0F172A` (slate-900) |
| Secondary Background | `#1E293B` (slate-800) |
| Accent / Gold | `#F59E0B` (amber-500) |
| Text Primary | `#FFFFFF` |
| Text Muted | `#94A3B8` (slate-400) |

---

## 7. Security Notes

- All tables have **Row Level Security (RLS)** enabled
- Authors can only read/write their own rows
- Admins use a `is_admin()` SECURITY DEFINER function to bypass RLS safely
- Balance updates can **only** be performed by admin role
- Profile picture uploads are stored in Supabase Storage under `avatars/{userId}/`
- Passwords are managed by Supabase Auth (bcrypt, never exposed)

---

## 8. IDE — Anti Gravity
This project uses standard Next.js tooling. Open the project folder in Anti Gravity
and ensure you have the Node.js LSP / ESLint extensions installed for best DX.
