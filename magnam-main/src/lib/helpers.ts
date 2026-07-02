import {
  FileText, Presentation, Video, Music, Image, Link2,
  type LucideIcon,
} from 'lucide-react';
import type { FileType } from './supabase';

export const fileTypeMeta: Record<FileType, { label: string; icon: LucideIcon; color: string }> = {
  pdf: { label: 'PDF', icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-950/40' },
  pptx: { label: 'PowerPoint', icon: Presentation, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
  video: { label: 'فيديو', icon: Video, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  audio: { label: 'صوت', icon: Music, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  image: { label: 'صورة', icon: Image, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  link: { label: 'رابط', icon: Link2, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
};

export const yearLabels: Record<number, string> = {
  1: 'الفرقة الأولى',
  2: 'الفرقة الثانية',
  3: 'الفرقة الثالثة',
  4: 'الفرقة الرابعة',
};

export const semesterLabels: Record<number, string> = {
  1: 'ترم أول',
  2: 'ترم ثاني',
};

export const summaryCategoryLabels: Record<string, string> = {
  doctor: 'ملخصات الدكاترة',
  student: 'ملخصات الطلبة',
  mindmap: 'خرائط ذهنية',
  final_review: 'مراجعات نهائية',
};

export const examCategoryLabels: Record<string, string> = {
  midterm: 'Midterm',
  final: 'Final',
  quiz: 'Quiz',
  previous: 'سنوات سابقة',
  model_answer: 'إجابات نموذجية',
};

export const questionTypeLabels: Record<string, string> = {
  mcq: 'اختيار من متعدد',
  true_false: 'صح أو خطأ',
  essay: 'مقال',
  fill_blank: 'أكمل الفراغ',
  reason: 'علل',
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
