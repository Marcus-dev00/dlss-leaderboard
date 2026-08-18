-- =========================================================
-- 人数登记排行榜 (DLSS) - Supabase 数据库初始化脚本
-- 请在 Supabase 控制台的 SQL Editor 中粘贴并点击 "Run" 执行
-- =========================================================

-- 1. 创建员工档案表 profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text unique not null,
  created_at timestamptz default now() not null
);

-- 2. 创建人数提交流水表 submissions
create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null check (amount > 0),
  note text,
  created_at timestamptz default now() not null
);

-- 3. 创建索引以优化排行榜统计和时间范围查询
create index if not exists idx_submissions_user_id on public.submissions(user_id);
create index if not exists idx_submissions_created_at on public.submissions(created_at);

-- 4. 开启行级安全 (RLS)
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

-- 删除已存在的策略以支持幂等重复执行
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

drop policy if exists "Submissions are viewable by everyone" on public.submissions;
drop policy if exists "Users can insert their own submissions" on public.submissions;
drop policy if exists "Users can delete their own submissions" on public.submissions;

-- profiles 表策略
create policy "Profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- submissions 表策略
create policy "Submissions are viewable by everyone" 
  on public.submissions for select 
  using (true);

create policy "Users can insert their own submissions" 
  on public.submissions for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own submissions" 
  on public.submissions for delete 
  using (auth.uid() = user_id);

-- 5. 开启 Realtime 实时广播
-- 注意：如果该表已经加入发布，这行会自动忽略或重新确认
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'submissions'
  ) then
    alter publication supabase_realtime add table public.submissions;
  end if;
end $$;

-- 6. 创建实用的汇总视图 (可选辅助)
create or replace view public.leaderboard_all_time as
select 
  p.id as user_id,
  p.name,
  coalesce(sum(s.amount), 0)::integer as total_amount,
  count(s.id)::integer as submission_count,
  max(s.created_at) as last_submitted_at
from public.profiles p
left join public.submissions s on s.user_id = p.id
group by p.id, p.name
order by total_amount desc, p.name asc;
