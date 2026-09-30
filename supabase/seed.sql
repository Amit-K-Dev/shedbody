INSERT INTO public.posts (id, title, slug, content, excerpt, published_at, category, views, status, seo_title, seo_desc)
VALUES 
(1, 'Getting Started with ShedBody', 'getting-started', 'Welcome to ShedBody! This platform is designed to help you track and manage your fitness journey.', 'Welcome to ShedBody.', now(), 'General', 0, 'published', 'Getting Started', 'Welcome post'),
(2, 'Nutrition 101', 'nutrition-101', 'Nutrition is the most important part of your fitness journey.', 'Learn the basics of nutrition.', now(), 'Nutrition', 0, 'published', 'Nutrition 101', 'Basics of nutrition')
ON CONFLICT DO NOTHING;
