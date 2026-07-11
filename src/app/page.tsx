import { getMenuRepository } from "@/repositories/menu/factory";
import HomeClientPage from "./HomeClientPage";

export const revalidate = 3600; // Cache for 1 hour by default

export default async function Home() {
  const repo = getMenuRepository();
  const categories = await repo.getCategories();

  return <HomeClientPage categories={categories} />;
}
