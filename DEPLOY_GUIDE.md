# suifu-ramen-lp Deployment Guide

This guide assumes the new production flow:

```txt
GitHub
↓
Vercel
↓
Supabase
```

The old `files-mentioned-by-the-user-works` Vercel project can be abandoned. Create a new Vercel project named `suifu-ramen-lp` from the GitHub repository.

## 1. GitHub Repository

Recommended repository name:

```txt
suifu-ramen-lp
```

Local Git setup:

```bash
git init
git add .
git commit -m "Initial suifu ramen LP"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/suifu-ramen-lp.git
git push -u origin main
```

Do not commit:

- `.env`
- `.vercel/`
- `node_modules/`
- `dist/`

These are already covered by `.gitignore`.

## 2. Supabase Setup

In Supabase SQL Editor, run these files in order:

```sql
-- 1
supabase/schema.sql

-- 2
supabase/seed.sql
```

Confirm the seed row exists:

```sql
select slug, name, updated_at, site_data->'shopStatus' as shop_status
from public.stores
where slug = 'suifu';
```

Expected:

- `slug = suifu`
- `site_data` contains the LP content
- `updated_at` changes after saving from `/owner-demo`

## 3. Vercel Project

Create a new project in Vercel:

```txt
Project Name: suifu-ramen-lp
Framework: Vite
```

Build settings:

```txt
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Environment Variables:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxx
```

Set them for:

- Production
- Preview

After setting environment variables, redeploy from Vercel.

## 4. Routes

The app is a Vite SPA. `vercel.json` rewrites these routes to `index.html`:

```txt
/             Public LP
/proposal     Proposal page
/owner-demo   Admin demo
```

## 5. Production Verification

Open:

```txt
https://YOUR_VERCEL_DOMAIN/owner-demo
```

Login with the demo button.

The admin header must show one of:

- `クラウド保存中`
- `ローカル保存中`
- `Supabase環境変数未設定`

If Supabase is configured correctly, it should show:

```txt
クラウド保存中
```

Click `表示内容を保存`.

Open DevTools Console. Expected logs:

```txt
SAVE BUTTON CLICKED
SAVE START
SUPABASE UPDATE suifu
SAVE SUCCESS
```

Then check Supabase:

```sql
select slug, updated_at
from public.stores
where slug = 'suifu';
```

`updated_at` should change.

## 6. Failure Signals

If the app cannot save to Supabase, it must not show success.

Expected failure UI:

```txt
Supabase保存失敗: {error.message}
```

Expected Console error:

```txt
Supabase save failed: ...
```

Common causes:

- Vercel environment variables are missing
- Vercel was not redeployed after setting environment variables
- `supabase/seed.sql` was not executed
- `stores.slug = 'suifu'` does not exist
- Supabase URL or anon key is from a different project

## 7. Local Check

```bash
npm install
cp .env.example .env
npm run build
npm run preview
```

If `.env` still contains placeholder values, `/owner-demo` should show:

```txt
Supabase環境変数未設定
ローカル保存中
```

That is expected locally until real Supabase keys are set.
