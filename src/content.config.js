import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const fontCards = defineCollection({
  loader: file('src/data/new-font-cards.json'),
  schema: z.object({
    modifier: z.string().optional(),
    defaultOpenOnMobile: z.boolean(),
    link: z.string(),
    title: z.string(),
    filterCategory: z.string(),
    category: z.string(),
    categoryDetails: z.string().optional(),
    format: z.string(),
    styles: z.string(),
    languages: z.string(),
    typefaces: z.string(),
    price: z.string(),
    tags: z.array(z.string()),
    picture: z.string(),
  }),
});

const banners = defineCollection({
  loader: file('src/data/banners.json'),
  schema: z.object({
    modifier: z.string().optional(),
    link: z.string(),
    title: z.string(),
    category: z.string(),
    countAll: z.string(),
    countNew: z.string().optional(),
  }),
});

const catalogSections = defineCollection({
  loader: file('src/data/catalog-section-cards.json'),
  schema: z.object({
    title: z.string(),
    link: z.string(),
    img: z.string(),
    countAll: z.string(),
    countNew: z.string().optional(),
  }),
});

export const collections = { fontCards, banners, catalogSections };
