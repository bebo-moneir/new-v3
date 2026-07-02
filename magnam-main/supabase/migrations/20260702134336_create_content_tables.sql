/*
# Create content tables and helper

1. Helper
- `is_admin()` — returns true if current user role is admin or super_admin.
2. New Tables
- subjects, materials, sessions, summaries, exams, questions, question_attempts,
  comments, favorites, notifications, announcements, visits.
3. Security
- RLS on all. Content tables: SELECT open to authenticated; write restricted to admin.
- comments: read all, write own. favorites/attempts/notifications: owner-scoped.
*/

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$;

-- ============ subjects ============
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  doctor text NOT NULL DEFAULT '',
  year smallint NOT NULL CHECK (year BETWEEN 1 AND 4),
  semester smallint NOT NULL CHECK (semester BETWEEN 1 AND 2),
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subjects_select_all" ON public.subjects;
CREATE POLICY "subjects_select_all" ON public.subjects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "subjects_admin_insert" ON public.subjects;
CREATE POLICY "subjects_admin_insert" ON public.subjects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "subjects_admin_update" ON public.subjects;
CREATE POLICY "subjects_admin_update" ON public.subjects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "subjects_admin_delete" ON public.subjects;
CREATE POLICY "subjects_admin_delete" ON public.subjects FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_subjects_year_semester ON public.subjects(year, semester);

-- ============ materials ============
CREATE TABLE IF NOT EXISTS public.materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf','pptx','video','audio','image','link')),
  file_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "materials_select_all" ON public.materials;
CREATE POLICY "materials_select_all" ON public.materials FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "materials_admin_insert" ON public.materials;
CREATE POLICY "materials_admin_insert" ON public.materials FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "materials_admin_update" ON public.materials;
CREATE POLICY "materials_admin_update" ON public.materials FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "materials_admin_delete" ON public.materials;
CREATE POLICY "materials_admin_delete" ON public.materials FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_materials_subject ON public.materials(subject_id);

-- ============ sessions ============
CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('pdf','pptx','video','audio','image','link')),
  file_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sessions_select_all" ON public.sessions;
CREATE POLICY "sessions_select_all" ON public.sessions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sessions_admin_insert" ON public.sessions;
CREATE POLICY "sessions_admin_insert" ON public.sessions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "sessions_admin_update" ON public.sessions;
CREATE POLICY "sessions_admin_update" ON public.sessions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "sessions_admin_delete" ON public.sessions;
CREATE POLICY "sessions_admin_delete" ON public.sessions FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON public.sessions(subject_id);

-- ============ summaries ============
CREATE TABLE IF NOT EXISTS public.summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('doctor','student','mindmap','final_review')),
  file_type text NOT NULL CHECK (file_type IN ('pdf','pptx','video','audio','image','link')),
  file_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "summaries_select_all" ON public.summaries;
CREATE POLICY "summaries_select_all" ON public.summaries FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "summaries_admin_insert" ON public.summaries;
CREATE POLICY "summaries_admin_insert" ON public.summaries FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "summaries_admin_update" ON public.summaries;
CREATE POLICY "summaries_admin_update" ON public.summaries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "summaries_admin_delete" ON public.summaries;
CREATE POLICY "summaries_admin_delete" ON public.summaries FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_summaries_subject ON public.summaries(subject_id);

-- ============ exams ============
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('midterm','final','quiz','previous','model_answer')),
  file_type text NOT NULL CHECK (file_type IN ('pdf','pptx','video','audio','image','link')),
  file_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  downloads integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exams_select_all" ON public.exams;
CREATE POLICY "exams_select_all" ON public.exams FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "exams_admin_insert" ON public.exams;
CREATE POLICY "exams_admin_insert" ON public.exams FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "exams_admin_update" ON public.exams;
CREATE POLICY "exams_admin_update" ON public.exams FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "exams_admin_delete" ON public.exams;
CREATE POLICY "exams_admin_delete" ON public.exams FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_exams_subject ON public.exams(subject_id);

-- ============ questions ============
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  question_type text NOT NULL CHECK (question_type IN ('mcq','true_false','essay','fill_blank','reason')),
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL DEFAULT '',
  explanation text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "questions_select_all" ON public.questions;
CREATE POLICY "questions_select_all" ON public.questions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "questions_admin_insert" ON public.questions;
CREATE POLICY "questions_admin_insert" ON public.questions FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "questions_admin_update" ON public.questions;
CREATE POLICY "questions_admin_update" ON public.questions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "questions_admin_delete" ON public.questions;
CREATE POLICY "questions_admin_delete" ON public.questions FOR DELETE TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);

-- ============ question_attempts ============
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_answer text NOT NULL DEFAULT '',
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attempts_select_own" ON public.question_attempts;
CREATE POLICY "attempts_select_own" ON public.question_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "attempts_insert_own" ON public.question_attempts;
CREATE POLICY "attempts_insert_own" ON public.question_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "attempts_delete_own" ON public.question_attempts;
CREATE POLICY "attempts_delete_own" ON public.question_attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.question_attempts(user_id);

-- ============ comments ============
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL DEFAULT '',
  rating smallint NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "comments_select_all" ON public.comments;
CREATE POLICY "comments_select_all" ON public.comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "comments_insert_own" ON public.comments;
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_comments_material ON public.comments(material_id);

-- ============ favorites ============
CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, material_id)
);
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "favorites_select_own" ON public.favorites;
CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites_insert_own" ON public.favorites;
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "favorites_delete_own" ON public.favorites;
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);

-- ============ notifications ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- ============ announcements ============
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "announcements_select_all" ON public.announcements;
CREATE POLICY "announcements_select_all" ON public.announcements FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "announcements_admin_insert" ON public.announcements;
CREATE POLICY "announcements_admin_insert" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "announcements_admin_update" ON public.announcements;
CREATE POLICY "announcements_admin_update" ON public.announcements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "announcements_admin_delete" ON public.announcements;
CREATE POLICY "announcements_admin_delete" ON public.announcements FOR DELETE TO authenticated USING (public.is_admin());

-- ============ visits ============
CREATE TABLE IF NOT EXISTS public.visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  path text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "visits_insert_auth" ON public.visits;
CREATE POLICY "visits_insert_auth" ON public.visits FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "visits_admin_select" ON public.visits;
CREATE POLICY "visits_admin_select" ON public.visits FOR SELECT TO authenticated USING (public.is_admin());
CREATE INDEX IF NOT EXISTS idx_visits_created ON public.visits(created_at);
