-- =========================================================
-- 人数登记排行榜 (DLSS) - 原生数据库极速认证方案
-- 彻底绕过 Supabase Auth 邮箱发信限制，100% 免疫 rate limit
-- =========================================================

-- 1. 创建/更新员工档案表 profiles
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  password_hash text,
  created_at timestamptz default now() not null
);

-- 如果表已存在但没有 password_hash，则自动补充该字段
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'password_hash'
  ) then
    alter table public.profiles add column password_hash text;
  end if;
end $$;

-- 2. 创建人数提交流水表 submissions
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null check (amount > 0),
  note text,
  created_at timestamptz default now() not null
);

-- 3. 创建索引
create index if not exists idx_submissions_user_id on public.submissions(user_id);
create index if not exists idx_submissions_created_at on public.submissions(created_at);

-- 4. 开启行级安全 (RLS) 并配置全量畅通访问策略
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Profiles open access" on public.profiles;

create policy "Profiles open access" on public.profiles for all using (true) with check (true);

drop policy if exists "Submissions are viewable by everyone" on public.submissions;
drop policy if exists "Users can insert their own submissions" on public.submissions;
drop policy if exists "Users can delete their own submissions" on public.submissions;
drop policy if exists "Submissions open access" on public.submissions;

create policy "Submissions open access" on public.submissions for all using (true) with check (true);

-- 5. 开启 Realtime 实时广播
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'submissions'
  ) then
    alter publication supabase_realtime add table public.submissions;
  end if;
end $$;
