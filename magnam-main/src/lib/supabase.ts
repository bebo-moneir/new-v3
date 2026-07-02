import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Role = 'student' | 'admin' | 'super_admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  banned: boolean;
  created_at: string;
};

export type Subject = {
  id: string;
  name: string;
  doctor: string;
  year: number;
  semester: number;
  description: string;
  created_at: string;
};

export type FileType = 'pdf' | 'pptx' | 'video' | 'audio' | 'image' | 'link';

export type Material = {
  id: string;
  subject_id: string;
  title: string;
  file_type: FileType;
  file_url: string;
  description: string;
  downloads: number;
  created_at: string;
};

export type SessionItem = Material;

export type SummaryCategory = 'doctor' | 'student' | 'mindmap' | 'final_review';

export type Summary = {
  id: string;
  subject_id: string;
  title: string;
  category: SummaryCategory;
  file_type: FileType;
  file_url: string;
  description: string;
  downloads: number;
  created_at: string;
};

export type ExamCategory = 'midterm' | 'final' | 'quiz' | 'previous' | 'model_answer';

export type Exam = {
  id: string;
  subject_id: string;
  title: string;
  category: ExamCategory;
  file_type: FileType;
  file_url: string;
  description: string;
  downloads: number;
  created_at: string;
};

export type QuestionType = 'mcq' | 'true_false' | 'essay' | 'fill_blank' | 'reason';

export type Question = {
  id: string;
  subject_id: string;
  question_type: QuestionType;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  created_at: string;
};

export type Comment = {
  id: string;
  material_id: string;
  user_id: string;
  body: string;
  rating: number;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

export type InviteCode = {
  id: string;
  code: string;
  role: 'student' | 'admin';
  created_by: string | null;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
};
