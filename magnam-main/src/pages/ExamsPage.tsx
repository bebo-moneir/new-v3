import { ContentBrowser } from '../components/ContentBrowser';
import { examCategoryLabels } from '../lib/helpers';

export function ExamsPage() {
  return (
    <ContentBrowser
      table="exams"
      title="الامتحانات"
      extraColumn="category"
      categoryLabels={examCategoryLabels}
    />
  );
}
