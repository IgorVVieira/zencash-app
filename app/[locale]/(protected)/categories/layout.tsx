import { CategoryProvider } from '../../../lib/category-context';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <CategoryProvider>{children}</CategoryProvider>;
}
