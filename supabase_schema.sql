-- =========================================================
-- 人数登记排行榜 (DLSS) - 支持普通(8分/人) 与 OPP(10分/人) 积分体系
-- =========================================================

-- 1. 员工档案表 profiles
create table if not exists public.profiles (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  password_hash text,
  created_at timestamptz default now() not null
);

-- 2. 人数提交流水表 submissions（新增 type 渠道 与 points 积分字段）
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null check (amount > 0),
  type text default 'standard' not null, -- 'standard' (8分/人) 或 'opp' (10分/人)
  points integer not null default 0,
  note text,
  created_at timestamptz default now() not null
);

-- 自动为已存在的表补充字段（兼容已有数据）
alter table public.submissions add column if not exists type text default 'standard';
alter table public.submissions add column if not exists points integer default 0;

-- 自动为历史老数据补全积分
update public.submissions 
set points = amount * (case when type = 'opp' then 10 else 8 end)
where points is null or points = 0;

-- 3. 索引优化
create index if not exists idx_submissions_user_id on public.submissions(user_id);
create index if not exists idx_submissions_created_at on public.submissions(created_at);

-- 4. 开放访问策略
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

drop policy if exists "Profiles open access" on public.profiles;
create policy "Profiles open access" on public.profiles for all using (true) with check (true);

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

-- 6. 刷新接口缓存
notify pgrst, 'reload schema';
