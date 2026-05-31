create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  site_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.stores enable row level security;

create policy "stores_select_public"
  on public.stores
  for select
  using (true);

-- Demo policy: allows the mock admin screen to update the sample store with the anon key.
-- For real delivery, replace this with Supabase Auth based owner policies.
create policy "stores_insert_demo"
  on public.stores
  for insert
  with check (slug = 'suifu');

create policy "stores_update_demo"
  on public.stores
  for update
  using (slug = 'suifu')
  with check (slug = 'suifu');
