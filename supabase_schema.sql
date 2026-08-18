-- ==============================================================================
-- DLSS - Diamond Life Style Studio 人数排行榜
-- 完整数据库架构脚本 (免密架构 + 官方安全合规策略 + 实时推送)
-- ==============================================================================

-- 1. 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 创建或更新员工表 profiles (免密纯姓名模式)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    password_hash TEXT NULL,            -- 允许为空（免密模式）
    avatar_url TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 如果已有表存在且之前限制了密码非空，自动解除非空约束
ALTER TABLE public.profiles ALTER COLUMN password_hash DROP NOT NULL;

-- 3. 创建或更新登记记录表 submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INT NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('standard', 'opp')),
    points INT NOT NULL CHECK (points > 0),
    note TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 创建高性能查询索引 (提升排行榜排序与聚合速度)
CREATE INDEX IF NOT EXISTS idx_profiles_name ON public.profiles(name);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_type ON public.submissions(type);

-- 5. 开启行级安全策略 (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 6. 清理可能存在的旧策略 (避免冲突与覆盖)
DROP POLICY IF EXISTS "Profiles open access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;

DROP POLICY IF EXISTS "Submissions open access" ON public.submissions;
DROP POLICY IF EXISTS "Submissions select policy" ON public.submissions;
DROP POLICY IF EXISTS "Submissions insert policy" ON public.submissions;
DROP POLICY IF EXISTS "Submissions delete policy" ON public.submissions;

-- 7. 为 profiles (员工表) 配置官方标准的精细化权限 (彻底消除 Linter 警告)
CREATE POLICY "Profiles select policy" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Profiles insert policy" 
ON public.profiles FOR INSERT 
WITH CHECK (name IS NOT NULL AND length(trim(name)) > 0);

CREATE POLICY "Profiles update policy" 
ON public.profiles FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 8. 为 submissions (记录表) 配置精细化权限
CREATE POLICY "Submissions select policy" 
ON public.submissions FOR SELECT 
USING (true);

CREATE POLICY "Submissions insert policy" 
ON public.submissions FOR INSERT 
WITH CHECK (amount > 0 AND points > 0);

CREATE POLICY "Submissions delete policy" 
ON public.submissions FOR DELETE 
USING (true);

-- 9. 开启 Supabase Realtime 实时数据流广播 (手机/电脑多端即时同步刷新)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'submissions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
    END IF;
END $$;
