import { ContentBrowser } from '../components/ContentBrowser';
import { summaryCategoryLabels } from '../lib/helpers';

export function SummariesPage() {
  return (
    <ContentBrowser
      table="summaries"
      title="الملخصات"
      extraColumn="category"
      categoryLabels={summaryCategoryLabels}
    />
  );
}
