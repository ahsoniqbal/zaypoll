START TRANSACTION;

-- =====================================================
-- Main topics
-- =====================================================

INSERT INTO topics (
    name,
    slug,
    parent_id,
    icon_url,
    is_trending,
    is_active,
    sort_order
)
VALUES
    ('News',               'news',              NULL, '/icons/topics/news.svg',              FALSE, TRUE, 1),
    ('Politics',           'politics',          NULL, '/icons/topics/politics.svg',          FALSE, TRUE, 2),
    ('Sports',             'sports',            NULL, '/icons/topics/sports.svg',            FALSE, TRUE, 3),
    ('Technology',         'technology',        NULL, '/icons/topics/technology.svg',        FALSE, TRUE, 4),
    ('Entertainment',      'entertainment',     NULL, '/icons/topics/entertainment.svg',     FALSE, TRUE, 5),
    ('Business & Finance', 'business-finance',  NULL, '/icons/topics/business-finance.svg',  FALSE, TRUE, 6),
    ('Science',            'science',           NULL, '/icons/topics/science.svg',           FALSE, TRUE, 7),
    ('Health & Fitness',   'health-fitness',    NULL, '/icons/topics/health-fitness.svg',    FALSE, TRUE, 8),
    ('Lifestyle',          'lifestyle',         NULL, '/icons/topics/lifestyle.svg',         FALSE, TRUE, 9),
    ('Education',          'education',         NULL, '/icons/topics/education.svg',         FALSE, TRUE, 10),
    ('Gaming',             'gaming',            NULL, '/icons/topics/gaming.svg',            FALSE, TRUE, 11),
    ('Food & Travel',      'food-travel',       NULL, '/icons/topics/food-travel.svg',       FALSE, TRUE, 12),
    ('Society & Culture',  'society-culture',   NULL, '/icons/topics/society-culture.svg',   FALSE, TRUE, 13);


-- =====================================================
-- Subtopics
-- Icons are NULL because only main topics use icons
-- =====================================================

INSERT INTO topics (
    name,
    slug,
    parent_id,
    icon_url,
    is_trending,
    is_active,
    sort_order
)
SELECT
    child.name,
    child.slug,
    parent.id,
    NULL,
    FALSE,
    TRUE,
    child.sort_order
FROM (
    -- News
    SELECT 'World News' AS name, 'world-news' AS slug, 'news' AS parent_slug, 1 AS sort_order
    UNION ALL SELECT 'Local News', 'local-news', 'news', 2
    UNION ALL SELECT 'Breaking News', 'breaking-news', 'news', 3
    UNION ALL SELECT 'Current Affairs', 'current-affairs', 'news', 4
    UNION ALL SELECT 'Weather', 'weather', 'news', 5

    -- Politics
    UNION ALL SELECT 'Pakistan Politics', 'pakistan-politics', 'politics', 1
    UNION ALL SELECT 'World Politics', 'world-politics', 'politics', 2
    UNION ALL SELECT 'Elections', 'elections', 'politics', 3
    UNION ALL SELECT 'Government', 'government', 'politics', 4
    UNION ALL SELECT 'Public Policy', 'public-policy', 'politics', 5
    UNION ALL SELECT 'International Relations', 'international-relations', 'politics', 6

    -- Sports
    UNION ALL SELECT 'Cricket', 'cricket', 'sports', 1
    UNION ALL SELECT 'Football', 'football', 'sports', 2
    UNION ALL SELECT 'Formula 1', 'formula-1', 'sports', 3
    UNION ALL SELECT 'Tennis', 'tennis', 'sports', 4
    UNION ALL SELECT 'Basketball', 'basketball', 'sports', 5
    UNION ALL SELECT 'Combat Sports', 'combat-sports', 'sports', 6
    UNION ALL SELECT 'Other Sports', 'other-sports', 'sports', 7

    -- Technology
    UNION ALL SELECT 'Artificial Intelligence', 'artificial-intelligence', 'technology', 1
    UNION ALL SELECT 'Programming', 'programming', 'technology', 2
    UNION ALL SELECT 'Web Development', 'web-development', 'technology', 3
    UNION ALL SELECT 'Mobile Technology', 'mobile-technology', 'technology', 4
    UNION ALL SELECT 'Cybersecurity', 'cybersecurity', 'technology', 5
    UNION ALL SELECT 'Gadgets', 'gadgets', 'technology', 6
    UNION ALL SELECT 'Cryptocurrency', 'cryptocurrency', 'technology', 7

    -- Entertainment
    UNION ALL SELECT 'Movies', 'movies', 'entertainment', 1
    UNION ALL SELECT 'Television', 'television', 'entertainment', 2
    UNION ALL SELECT 'Music', 'music', 'entertainment', 3
    UNION ALL SELECT 'Celebrities', 'celebrities', 'entertainment', 4
    UNION ALL SELECT 'Streaming', 'streaming', 'entertainment', 5
    UNION ALL SELECT 'Comedy', 'comedy', 'entertainment', 6
    UNION ALL SELECT 'Digital Creators', 'digital-creators', 'entertainment', 7

    -- Business & Finance
    UNION ALL SELECT 'Business', 'business', 'business-finance', 1
    UNION ALL SELECT 'Personal Finance', 'personal-finance', 'business-finance', 2
    UNION ALL SELECT 'Investing', 'investing', 'business-finance', 3
    UNION ALL SELECT 'Stock Market', 'stock-market', 'business-finance', 4
    UNION ALL SELECT 'Startups', 'startups', 'business-finance', 5
    UNION ALL SELECT 'Economy', 'economy', 'business-finance', 6
    UNION ALL SELECT 'Careers', 'careers', 'business-finance', 7

    -- Science
    UNION ALL SELECT 'Space & Astronomy', 'space-astronomy', 'science', 1
    UNION ALL SELECT 'Physics', 'physics', 'science', 2
    UNION ALL SELECT 'Biology', 'biology', 'science', 3
    UNION ALL SELECT 'Environment', 'environment', 'science', 4
    UNION ALL SELECT 'Climate Change', 'climate-change', 'science', 5
    UNION ALL SELECT 'Scientific Discoveries', 'scientific-discoveries', 'science', 6

    -- Health & Fitness
    UNION ALL SELECT 'Fitness', 'fitness', 'health-fitness', 1
    UNION ALL SELECT 'Nutrition', 'nutrition', 'health-fitness', 2
    UNION ALL SELECT 'Mental Health', 'mental-health', 'health-fitness', 3
    UNION ALL SELECT 'Healthcare', 'healthcare', 'health-fitness', 4
    UNION ALL SELECT 'Weight Loss', 'weight-loss', 'health-fitness', 5
    UNION ALL SELECT 'Strength Training', 'strength-training', 'health-fitness', 6
    UNION ALL SELECT 'Wellness', 'wellness', 'health-fitness', 7

    -- Lifestyle
    UNION ALL SELECT 'Fashion', 'fashion', 'lifestyle', 1
    UNION ALL SELECT 'Beauty', 'beauty', 'lifestyle', 2
    UNION ALL SELECT 'Relationships', 'relationships', 'lifestyle', 3
    UNION ALL SELECT 'Parenting', 'parenting', 'lifestyle', 4
    UNION ALL SELECT 'Home & Living', 'home-living', 'lifestyle', 5
    UNION ALL SELECT 'Personal Development', 'personal-development', 'lifestyle', 6
    UNION ALL SELECT 'Productivity', 'productivity', 'lifestyle', 7

    -- Education
    UNION ALL SELECT 'Schools', 'schools', 'education', 1
    UNION ALL SELECT 'Universities', 'universities', 'education', 2
    UNION ALL SELECT 'Online Learning', 'online-learning', 'education', 3
    UNION ALL SELECT 'Study Abroad', 'study-abroad', 'education', 4
    UNION ALL SELECT 'Student Life', 'student-life', 'education', 5
    UNION ALL SELECT 'Skills & Courses', 'skills-courses', 'education', 6

    -- Gaming
    UNION ALL SELECT 'PC Gaming', 'pc-gaming', 'gaming', 1
    UNION ALL SELECT 'Console Gaming', 'console-gaming', 'gaming', 2
    UNION ALL SELECT 'Mobile Gaming', 'mobile-gaming', 'gaming', 3
    UNION ALL SELECT 'Esports', 'esports', 'gaming', 4
    UNION ALL SELECT 'Video Games', 'video-games', 'gaming', 5
    UNION ALL SELECT 'Game Development', 'game-development', 'gaming', 6

    -- Food & Travel
    UNION ALL SELECT 'Food', 'food', 'food-travel', 1
    UNION ALL SELECT 'Cooking', 'cooking', 'food-travel', 2
    UNION ALL SELECT 'Restaurants', 'restaurants', 'food-travel', 3
    UNION ALL SELECT 'Local Travel', 'local-travel', 'food-travel', 4
    UNION ALL SELECT 'International Travel', 'international-travel', 'food-travel', 5
    UNION ALL SELECT 'Travel Tips', 'travel-tips', 'food-travel', 6

    -- Society & Culture
    UNION ALL SELECT 'Social Issues', 'social-issues', 'society-culture', 1
    UNION ALL SELECT 'Religion', 'religion', 'society-culture', 2
    UNION ALL SELECT 'Traditions', 'traditions', 'society-culture', 3
    UNION ALL SELECT 'Communities', 'communities', 'society-culture', 4
    UNION ALL SELECT 'Ethics', 'ethics', 'society-culture', 5
    UNION ALL SELECT 'Human Rights', 'human-rights', 'society-culture', 6
    UNION ALL SELECT 'History', 'history', 'society-culture', 7
) AS child
INNER JOIN topics AS parent
    ON parent.slug = child.parent_slug
    AND parent.parent_id IS NULL;

COMMIT;