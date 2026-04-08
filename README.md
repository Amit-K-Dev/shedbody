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
└── 📁shedbody
    └── 📁app
        └── 📁(dashboard)
            └── 📁calculators
                └── 📁bmi
                    ├── page.js
            └── 📁dashboard
                ├── page.js
            └── 📁progress
                ├── page.js
            └── 📁start
                ├── page.js
            ├── layout.js
        └── 📁(public)
            └── 📁[category]
                └── 📁[slug]
                    ├── opengraph-image.js
                    ├── page.js
                ├── page.js
            └── 📁about
                ├── page.js
            └── 📁advertising-policy
                ├── page.js
            └── 📁articles
                ├── page.js
            └── 📁cookies-policy
                ├── page.js
            └── 📁editorial-process
                ├── page.js
            └── 📁gdpr-privacy-policy
                ├── page.js
            └── 📁pages
                └── 📁[slug]
                    ├── page.js
            └── 📁plans
                ├── page.js
            └── 📁privacy-policy
                ├── page.js
            └── 📁scientific-review-board
                ├── ExpertSection.js
                ├── faqData.js
                ├── FAQSection.js
                ├── page.js
                ├── TrustSection.js
            └── 📁terms-of-use
                ├── page.js
            ├── layout.js
            ├── page.js
        └── 📁api
            └── 📁plan
                ├── route.js
            └── 📁posts
                ├── route.js
            └── 📁progress
                ├── route.js
            └── 📁streak
                ├── route.js
            └── 📁view
                ├── route.js
            └── 📁xp
                ├── route.js
        └── 📁auth
            └── 📁callback
                ├── route.js
        └── 📁login
            ├── page.js
        ├── apple-icon.png
        ├── favicon-16x16.png
        ├── favicon-32x32.png
        ├── favicon.ico
        ├── globals.css
        ├── icon.png
        ├── layout.js
        ├── robots.js
        ├── sitemap.js
    └── 📁components
        └── 📁calculator
            ├── CalculatorEngine.js
        └── 📁dashboard
            ├── AddWeightForm.js
            ├── Badges.js
            ├── BMIChart.js
            ├── Insights.js
            ├── LevelCard.js
            ├── ReminderBanner.js
            ├── ReminderSettings.js
            ├── SetGoal.js
            ├── StreakCard.js
            ├── WeightChart.js
        └── 📁layout
            ├── Footer.js
            ├── Header.js
            ├── MobileNav.js
            ├── Sidebar.js
            ├── Topbar.js
        └── 📁ui
            ├── MotionWrapper.js
            ├── Skeleton.js
            ├── toaster.js
            ├── use-toast.js
        ├── BackToTop.js
        ├── Breadcrumbs.js
        ├── ExpertInline.js
        ├── InlineRelatedArticles.js
        ├── LogoutButton.js
        ├── Pagination.js
        ├── PostCard.js
        ├── ReadingProgress.js
        ├── SearchBar.js
        ├── SearchPosts.js
        ├── SortFilter.js
        ├── SourcesToggle.js
        ├── TableOfContents.js
        ├── ViewTracker.js
    └── 📁data
        ├── diet.js
        ├── workout.js
    └── 📁lib
        └── 📁actions
            ├── logout.js
        └── 📁ai
            ├── generateInsights.js
        └── 📁auth
            ├── getUser.js
        └── 📁calculations
            ├── bmi.js
            ├── index.js
        └── 📁calculators
            ├── bmi.js
        └── 📁dashboard
            ├── getDashboardData.js
            ├── getStreak.js
            ├── getWeightData.js
        └── 📁gamification
            ├── addXP.js
            ├── checkBadges.js
        └── 📁streak
            ├── updateStreak.js
        └── 📁supabase
            ├── client.js
            ├── server.js
        └── 📁utils
            ├── date.js
        ├── contentParser.js
        ├── expertMapping.js
        ├── experts.js
        ├── getExpert.js
        ├── getExpertForPost.js
        ├── posts.js
        ├── schema.js
        ├── storage.js
        ├── supabase.js
    └── 📁public
        ├── android-chrome-192x192.png
        ├── android-chrome-512x512.png
        ├── file.svg
        ├── globe.svg
        ├── next.svg
        ├── site.webmanifest
        ├── vercel.svg
        ├── window.svg
    └── 📁scripts
        ├── upload.js
    ├── .env.local
    ├── .eslintignore
    ├── .gitignore
    ├── eslint.config.mjs
    ├── jsconfig.json
    ├── next.config.mjs
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── proxy.js
    └── README.md
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
