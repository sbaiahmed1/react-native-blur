import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    platforms: z.array(z.enum(['ios', 'android'])).optional(),
    badge: z.string().optional(),
  }),
});

export const collections = { docs };
