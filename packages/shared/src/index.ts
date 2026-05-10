export const roles = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export const publishStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type Role = (typeof roles)[number];
export type PublishStatus = (typeof publishStatuses)[number];

export type SeoFields = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
};
