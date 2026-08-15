/** Firestore data models. Collections: programs, members, blogs, videos, enquiries, settings. */

export type WithId = { id: string };

export type ProgramDoc = WithId & {
  title: string;
  description: string;
  ageGroup: string;
  days: string;
  startTime: string;
  endTime: string;
  maxChildren: number;
  status: "active" | "inactive";
  image: string;
  activities: string[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MemberDoc = WithId & {
  name: string;
  age: number;
  program: string;
  status: "active" | "inactive";
  joinedDate: string;
  image: string;
  /** Only members explicitly marked public may ever be shown on the website. */
  isPublic: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogDoc = WithId & {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  imageAlt: string;
  isPublished: boolean;
  publishedDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type VideoDoc = WithId & {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EnquiryDoc = WithId & {
  name: string;
  email: string;
  phone: string;
  childAge: string;
  area: string;
  program: string;
  preferredContact: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt?: string;
};

/** settings/site — single source of truth for editable global information. */
export type SiteSettings = {
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  days?: string;
  startTime?: string;
  endTime?: string;
  ageGroup?: string;
  maxChildren?: number;
  closed?: string;
  mapEmbedUrl?: string;
  facebook?: string;
  instagram?: string;
  updatedAt?: string;
};
