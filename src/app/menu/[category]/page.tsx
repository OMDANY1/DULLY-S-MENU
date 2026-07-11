import { notFound } from "next/navigation";
import { getMenuRepository } from "@/repositories/menu/factory";
import CategoryClientPage from "./CategoryClientPage";
import { isCategoryVisible } from "@/config/menuConfig";

export const revalidate = 3600; // Cache pages for 1 hour by default

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.category;

  const repo = getMenuRepository();
  const categories = await repo.getCategories();
  const category = categories.find((cat) => cat.id === categoryId);

  if (!category || !isCategoryVisible(category)) {
    notFound();
  }

  return <CategoryClientPage category={category} categories={categories} />;
}
