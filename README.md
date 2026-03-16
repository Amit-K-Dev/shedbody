# ShedBody

ShedBody is a modern **fitness and nutrition blog platform** built with **Next.js and Supabase**.  
It delivers SEO-optimized articles with dynamic rendering, structured data, and automatic OpenGraph images.

---

## Features

- Dynamic blog posts from Supabase database
- Category-based routing
- SEO-optimized article pages
- Automatic OpenGraph image generation
- JSON-LD structured data for articles
- Automatic sitemap generation
- Robots.txt generation
- Table of contents extraction
- Reading time calculation
- Inline related articles
- Responsive UI

---

## Tech Stack

- **Next.js (App Router)**
- **Supabase (PostgreSQL)**
- **Tailwind CSS**
- **Vercel (Deployment)**

---

## Project Structure

```
app/
 ├ [category]/[slug]     → Dynamic article pages
 ├ sitemap.js            → Automatic sitemap generation
 ├ robots.js             → Robots.txt generation
 ├ layout.js             → Root layout
 └ page.js               → Homepage

components/
 ├ Header.js
 ├ Breadcrumbs.js
 ├ TableOfContents.js
 ├ InlineRelatedArticles.js
 ├ ReadingProgress.js
 ├ SearchPosts.js
 └ PostCard.js

lib/
 ├ supabase.js           → Supabase client
 ├ posts.js              → Data fetching logic
 └ contentParser.js      → WordPress HTML cleanup & parsing
```

---

## Development

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Open in browser:

```
http://localhost:3000
```

---

## Deployment

The project is designed to deploy easily on **Vercel**.

Steps:

1. Push the project to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

---

## Author

**Amit Kumar**
