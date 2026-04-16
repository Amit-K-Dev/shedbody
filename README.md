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
        └── 📁(auth)
            └── 📁auth
                └── 📁callback
                    ├── route.js
            └── 📁login
                ├── page.js
            └── 📁signup
                ├── page.js
            ├── layout.js
        └── 📁(dashboard)
            └── 📁dashboard
                ├── page.js
            └── 📁plans
                ├── page.js
            └── 📁profile
                ├── page.js
            └── 📁start
                ├── page.js
            ├── layout.js
        └── 📁(public)
            └── 📁[category]
                └── 📁[slug]
                    ├── og-image.js
                    ├── page.js
                ├── page.js
            └── 📁about
                ├── page.js
            └── 📁advertising-policy
                ├── page.js
            └── 📁articles
                ├── page.js
            └── 📁calculators
                └── 📁bmi
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
        ├── ads.txt
        ├── apple-icon.png
        ├── favicon-16x16.png
        ├── favicon-32x32.png
        ├── favicon.ico
        ├── globals.css
        ├── icon.png
        ├── layout.js
        ├── og-image.png
        ├── robots.js
        ├── shedbody-logo-black.png
        ├── shedbody-logo-white.png
        ├── sitemap.js
    └── 📁components
        └── 📁calculator
            ├── CalculatorEngine.jsx
        └── 📁dashboard
            ├── Badges.jsx
            ├── PremiumAddWeight.jsx
            ├── PremiumBMI.jsx
            ├── PremiumChart.jsx
            ├── PremiumHeader.jsx
            ├── PremiumInsights.jsx
            ├── PremiumSetGoal.jsx
            ├── ReminderBanner.jsx
            ├── ReminderSettings.jsx
            ├── StatCards.jsx
        └── 📁icons
            ├── FacebookIcon.jsx
            ├── GoogleIcon.jsx
            ├── LinkedInIcon.jsx
            ├── XIcon.jsx
        └── 📁layout
            ├── Footer.jsx
            ├── Header.jsx
            ├── MobileNav.jsx
            ├── Sidebar.jsx
            ├── Topbar.jsx
        └── 📁ui
            ├── Input.jsx
            ├── MotionWrapper.jsx
            ├── PasswordInput.jsx
            ├── Skeleton.jsx
            ├── SocialIcon.jsx
            ├── toaster.jsx
            ├── use-toast.jsx
        ├── BackToTop.jsx
        ├── Breadcrumbs.jsx
        ├── ExpertInline.jsx
        ├── InlineRelatedArticles.jsx
        ├── LogoutButton.jsx
        ├── Pagination.jsx
        ├── PostCard.jsx
        ├── ReadingProgress.jsx
        ├── SearchBar.jsx
        ├── SearchPosts.jsx
        ├── SortFilter.jsx
        ├── SourcesToggle.jsx
        ├── TableOfContents.jsx
        ├── UserAvatar.jsx
        ├── ViewTracker.jsx
    └── 📁data
        ├── diet.jsx
        ├── workout.jsx
    └── 📁lib
        └── 📁actions
            ├── logout.jsx
        └── 📁ai
            ├── generateInsights.jsx
        └── 📁auth
            ├── getUser.jsx
            ├── userDisplay.js
        └── 📁calculations
            ├── bmi.jsx
            ├── index.jsx
        └── 📁calculators
            ├── bmi.jsx
        └── 📁dashboard
            ├── getDashboardData.jsx
            ├── getProfileData.jsx
            ├── getStreak.jsx
            ├── getWeightData.jsx
        └── 📁gamification
            ├── addXP.jsx
            ├── checkBadges.jsx
        └── 📁streak
            ├── updateStreak.jsx
        └── 📁supabase
            ├── client.js
            ├── server.js
        └── 📁utils
            ├── date.jsx
        ├── contentParser.jsx
        ├── contentParserOld.js
        ├── expertMapping.jsx
        ├── experts.jsx
        ├── getExpert.jsx
        ├── getExpertForPost.jsx
        ├── posts.jsx
        ├── schema.js
        ├── storage.js
        ├── supabase.js
    └── 📁public
        └── 📁experts
            ├── anjali-kumari.png
        ├── android-chrome-192x192.png
        ├── android-chrome-512x512.png
        ├── file.svg
        ├── food-table.jpg
        ├── globe.svg
        ├── hero-section.jpg
        ├── newsletter-sign-up.svg
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
    ├── forms.json
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
