# ShedBody

[![Next.js](https://img.shields.io/badge/Next.js-Black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

**ShedBody** is a modern, high-performance fitness and nutrition platform built with Next.js (App Router) and Supabase. It is designed to deliver evidence-based health articles, dynamic fitness calculators, and a personalized user dashboard with advanced gamification.

The platform is strictly engineered to adhere to **Google's E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness)** guidelines, featuring verified expert profiles, technical SEO optimizations, and structured JSON-LD schemas.

---

## Core Features

### Advanced SEO & Content Delivery

- **E-E-A-T Compliant:** Dedicated expert profiles (`/experts/[id]`) and Scientific Review Board implementation.
- **Dynamic Sitemaps:** Automated generic sitemap and a 48-hour recency **Google News Sitemap** with Edge caching.
- **Bulletproof Metadata:** Regex-based fallback extraction for titles, excerpts, and images to prevent missing OG tags.
- **Structured Data:** Automated JSON-LD generation for Articles, Organizations, and Person (Expert) schemas.
- **Zero-Dependency Assets:** Custom-built SVGs for brand icons (X, LinkedIn, Facebook, WhatsApp) to strictly minimize bundle size.

### 🔐 User Experience & Dashboard

- **Authentication:** Secure login and signup flows powered by Supabase Auth.
- **Personalized Dashboard:** Track weight, BMI, and fitness goals with premium charts and insights.
- **Gamification:** Integrated Streak tracking, XP system, and unlockable Badges for user retention.
- **Smart Calculators:** Dynamic BMI calculator and progress trackers.

### Architecture & Performance

- **Server-Side Rendering (SSR):** Optimized data fetching with Next.js Server Components.
- **Robust Error Handling:** Resilient Supabase fetch logic with case-insensitive slug matching and fallback states.
- **Tailwind Styling:** Fully responsive, highly customized, and accessible UI.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Database & Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React & Custom SVGs
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

Make sure you have Node.js installed along with a Supabase project set up.

### 1. Clone the repository

> git clone https://github.com/your-username/shedbody.git
> cd shedbody

### 2. Install dependencies

> npm install

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

> NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
> NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

### 4. Run the development server

> npm run dev

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 📂 Project Structure

<details>
<summary><b>Click to expand the full directory tree</b></summary>
<pre>
└── shedbody
    ├── app
    │   ├── (auth)          # Login, Signup, Callback
    │   ├── (dashboard)     # User Dashboard, Plans, Profile
    │   ├── (public)        # Articles, Calculators, Policies, Experts
    │   └── api             # REST APIs (Contact, Posts, Progress, Streak)
    ├── components
    │   ├── calculator      # BMI Engine
    │   ├── dashboard       # Premium Charts, Badges, StatCards
    │   ├── icons           # Zero-dependency custom SVGs
    │   ├── layout          # Headers, Footers, Navigation
    │   └── ui              # Reusable UI components
    ├── data                # Static data (Diet, Workouts)
    ├── lib
    │   ├── actions         # Server Actions
    │   ├── auth            # User verification
    │   ├── calculations    # Math engines
    │   ├── gamification    # XP and Badge logic
    │   ├── supabase        # Client & Server initializers
    │   └── utils           # Helper functions & SEO Schemas
    ├── public              # Static assets, Expert avatars
    └── scripts             # Utility scripts
</pre>
</details>

---

## Deployment

The project is fully optimized for **Vercel**.

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Vercel Environment Variables.
4. Click **Deploy**.

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](./LICENSE) and [NOTICE](./NOTICE) files for more details.

## ✍️ Author

**Amit Kumar**
