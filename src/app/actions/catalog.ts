"use server";

import { getPublishedProducts } from "@/lib/catalog-service";

export async function getCatalogAction() {
  return getPublishedProducts();
}
