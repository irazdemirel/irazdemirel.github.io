import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Blog: src/content/blog/<slug>.md
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    // öğrenme | proje | kitap | dizi | film | tiyatro | konser
    tag: z.string(),
    draft: z.boolean().default(false),
    medium: z.string().url().optional(),
    // Kültür sayfası için (kitap/film/dizi/tiyatro/konser yazılarında):
    creator: z.string().optional(), // yazar, yönetmen, sanatçı
    cover: z.string().optional(), // public/ altındaki kapak/afiş görseli
    color: z.string().optional(), // kitap sırtı / afiş rengi (ör. "#3b5b4f")
  }),
});

// Projeler: src/content/projeler/<slug>.md
const projeler = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projeler' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    status: z.string(), // ör. "Devam ediyor", "Tamamlandı"
    stack: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    cover: z.string().optional(), // public/ altındaki görsel yolu
    order: z.number().default(100),
    draft: z.boolean().default(false),
    // true = kart görünür ama tıklanmaz, "Çok yakında" yazar, detay sayfası oluşmaz
    comingSoon: z.boolean().default(false),
  }),
});

export const collections = { blog, projeler };
