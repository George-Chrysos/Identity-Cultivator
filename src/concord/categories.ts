import type { Category } from "@/concord/types";

export type CategoryMeta = {
  id: Category;
  slug: string;
  label: string;
  description: string;
};

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "Cosmology",
    slug: "cosmology",
    label: "Cosmology",
    description:
      "The picture of the world this register assumes before any technique: three offices, two poles, one vessel, one axis, and a direction home.",
  },
  {
    id: "Energy Mechanics",
    slug: "energy-mechanics",
    label: "Energy Mechanics",
    description:
      "How Charge, Current, and Mind/Will behave, where they sit, how they circulate, and how one becomes another.",
  },
  {
    id: "Practices",
    slug: "practices",
    label: "Cultivation & Operations",
    description:
      "What the operator actually does: lay a foundation, seal the store, circulate, refine one real matter, and be still.",
  },
  {
    id: "Entities",
    slug: "entities",
    label: "Entities",
    description:
      "Roles the work keeps generating: the person who can tell the registers apart, and the resistance that answers at a gate.",
  },
];

const bySlug = new Map(CATEGORIES.map((category) => [category.slug, category]));
const byId = new Map(CATEGORIES.map((category) => [category.id, category]));

export function getCategoryBySlug(slug: string) {
  return bySlug.get(slug);
}

export function getCategoryMeta(id: Category) {
  const meta = byId.get(id);
  if (!meta) {
    throw new Error(`Unknown category ${id}`);
  }
  return meta;
}
