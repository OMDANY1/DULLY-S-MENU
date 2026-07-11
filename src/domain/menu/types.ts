export interface MenuSize {
  id?: string;
  label: string;
  code?: string;
  price: number;
  calories: number | null;
  calorieNote?: string | null;
  oz?: number | null;
  image: string | null;
}

export interface MenuItem {
  id: string;
  num: string | null;
  name: string;
  arabicName: string;
  category: string;
  sizes: MenuSize[];
  image: string | null;
  dairyMilk?: string | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  displayName: string;
  arabicName: string;
  description: string;
  items: MenuItem[];
  visibility: "standard" | "ipad";
}

export interface MenuSettings {
  menuMode: "standard" | "ipad";
  publicationStatus: string;
  maintenanceMessage?: string | null;
}
