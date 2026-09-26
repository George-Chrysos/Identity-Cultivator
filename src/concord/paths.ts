export const CONCORD_HOME = "/concord";
export const MATRIX_PATH = "/concord/matrix";

export function conceptPath(id: string) {
  return `/concord/concepts/${id}`;
}

export function categoryPath(slug: string) {
  return `/concord/category/${slug}`;
}
