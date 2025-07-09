-- Add 80 more diverse professional seed profiles to reach 100 total

INSERT INTO public.dating_profiles (
  id, user_id, first_name, last_name, email, age, gender, bio, city, state, postal_code,
  interests, photo_urls, visible, created_at, updated_at
) VALUES 
-- Additional Female Professionals (40 more)
(gen_random_uuid(), gen_random_uuid(), 'Sophia', 'Williams', 'sophia.williams@example.com', 28, 'Female', 'Software architect passionate about building scalable systems. Love rock climbing, reading sci-fi novels, and exploring new coffee shops. Seeking someone who values both intellectual conversations and outdoor adventures.', 'Seattle', 'WA', '98101', ARRAY['Technology', 'Rock Climbing', 'Reading', 'Coffee', 'Hiking'], ARRAY['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Isabella', 'Martinez', 'isabella.martinez@example.com', 33, 'Female', 'Marketing executive with a passion for digital innovation. Enjoy wine tasting, art galleries, and weekend getaways. Looking for an ambitious partner who appreciates the finer things in life.', 'Miami', 'FL', '33101', ARRAY['Marketing', 'Wine', 'Art', 'Travel', 'Photography'], ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Olivia', 'Taylor', 'olivia.taylor@example.com', 29, 'Female', 'Pediatric nurse who loves making a difference in children lives. Passionate about fitness, cooking healthy meals, and volunteering. Seeking someone with a big heart and zest for life.', 'Phoenix', 'AZ', '85001', ARRAY['Healthcare', 'Fitness', 'Cooking', 'Volunteering', 'Running'], ARRAY['https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Emma', 'Anderson', 'emma.anderson@example.com', 31, 'Female', 'Financial analyst by day, salsa dancer by night. Love analyzing market trends and expressing myself through dance. Looking for someone who can match my energy and ambition.', 'Denver', 'CO', '80201', ARRAY['Finance', 'Dancing', 'Travel', 'Fitness', 'Music'], ARRAY['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Ava', 'Thomas', 'ava.thomas@example.com', 34, 'Female', 'Senior UX designer creating beautiful digital experiences. Enjoy painting, visiting museums, and trying new restaurants. Seeking a creative soul who appreciates art and good conversation.', 'Portland', 'OR', '97201', ARRAY['Design', 'Art', 'Museums', 'Food', 'Travel'], ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Mia', 'Jackson', 'mia.jackson@example.com', 27, 'Female', 'Environmental lawyer fighting for climate justice. Love hiking, sustainable living, and outdoor photography. Looking for someone who shares my passion for protecting our planet.', 'Portland', 'OR', '97202', ARRAY['Law', 'Environment', 'Hiking', 'Photography', 'Sustainability'], ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Charlotte', 'White', 'charlotte.white@example.com', 30, 'Female', 'Product manager at a Fortune 500 company. Passionate about innovation, yoga, and world travel. Seeking an intellectually curious partner for adventures around the globe.', 'San Diego', 'CA', '92101', ARRAY['Product Management', 'Yoga', 'Travel', 'Innovation', 'Languages'], ARRAY['https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Amelia', 'Harris', 'amelia.harris@example.com', 32, 'Female', 'Veterinarian with a deep love for animals. Enjoy horseback riding, camping, and animal rescue work. Looking for a kind-hearted person who loves animals as much as I do.', 'Nashville', 'TN', '37201', ARRAY['Veterinary', 'Animals', 'Horseback Riding', 'Camping', 'Volunteering'], ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Harper', 'Clark', 'harper.clark@example.com', 26, 'Female', 'Biomedical researcher working on breakthrough treatments. Love rock climbing, science museums, and cooking international cuisine. Seeking someone who appreciates both intellect and adventure.', 'Boston', 'MA', '02101', ARRAY['Research', 'Science', 'Rock Climbing', 'Cooking', 'Travel'], ARRAY['https://images.unsplash.com/photo-1594736797933-d0f06ba4e356?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Evelyn', 'Lewis', 'evelyn.lewis@example.com', 35, 'Female', 'Corporate communications director with a flair for storytelling. Enjoy theater, wine tasting, and writing. Looking for someone who appreciates good stories and deeper connections.', 'Atlanta', 'GA', '30301', ARRAY['Communications', 'Theater', 'Wine', 'Writing', 'Culture'], ARRAY['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Abigail', 'Robinson', 'abigail.robinson@example.com', 29, 'Female', 'Data scientist turning numbers into insights. Passionate about machine learning, hiking, and board games. Seeking a logical yet fun-loving partner for intellectual adventures.', 'Seattle', 'WA', '98102', ARRAY['Data Science', 'Machine Learning', 'Hiking', 'Board Games', 'Technology'], ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Emily', 'Walker', 'emily.walker@example.com', 31, 'Female', 'Architect designing sustainable buildings. Love sketching, traveling to see great architecture, and cycling. Looking for someone who appreciates good design and environmental consciousness.', 'San Francisco', 'CA', '94101', ARRAY['Architecture', 'Design', 'Travel', 'Cycling', 'Sustainability'], ARRAY['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Elizabeth', 'Young', 'elizabeth.young@example.com', 33, 'Female', 'Investment banker with a passion for financial markets. Enjoy skiing, fine dining, and art collecting. Seeking an ambitious partner who appreciates both work and play.', 'New York', 'NY', '10001', ARRAY['Finance', 'Skiing', 'Fine Dining', 'Art', 'Investing'], ARRAY['https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Sofia', 'Allen', 'sofia.allen@example.com', 28, 'Female', 'Public health researcher focused on health equity. Love community organizing, cooking, and salsa dancing. Looking for someone who cares about making a positive social impact.', 'Washington', 'DC', '20001', ARRAY['Public Health', 'Community Work', 'Cooking', 'Dancing', 'Social Justice'], ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Avery', 'King', 'avery.king@example.com', 30, 'Female', 'Consulting director helping companies transform. Passionate about strategy, tennis, and international travel. Seeking an intellectually stimulating partner for global adventures.', 'Chicago', 'IL', '60601', ARRAY['Consulting', 'Strategy', 'Tennis', 'Travel', 'Languages'], ARRAY['https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Ella', 'Wright', 'ella.wright@example.com', 27, 'Female', 'Renewable energy engineer building a sustainable future. Love outdoor adventures, photography, and environmental activism. Looking for someone who shares my vision for a better world.', 'Austin', 'TX', '73301', ARRAY['Engineering', 'Renewable Energy', 'Photography', 'Activism', 'Outdoors'], ARRAY['https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Scarlett', 'Lopez', 'scarlett.lopez@example.com', 32, 'Female', 'Tech startup founder disrupting the fintech space. Enjoy rock climbing, meditation, and angel investing. Seeking an entrepreneurial spirit who understands the startup life.', 'San Francisco', 'CA', '94102', ARRAY['Entrepreneurship', 'Fintech', 'Rock Climbing', 'Meditation', 'Investing'], ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Grace', 'Hill', 'grace.hill@example.com', 34, 'Female', 'Senior software engineer at a leading tech company. Passionate about AI, yoga, and sustainable living. Looking for someone who values both innovation and mindfulness.', 'Seattle', 'WA', '98103', ARRAY['Software Engineering', 'AI', 'Yoga', 'Sustainability', 'Technology'], ARRAY['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Chloe', 'Green', 'chloe.green@example.com', 26, 'Female', 'Marketing strategist specializing in brand development. Love creative writing, art galleries, and wine tasting. Seeking a creative and cultured partner for meaningful connections.', 'Los Angeles', 'CA', '90001', ARRAY['Marketing', 'Writing', 'Art', 'Wine', 'Creativity'], ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Victoria', 'Adams', 'victoria.adams@example.com', 29, 'Female', 'Physician assistant in emergency medicine. Passionate about healthcare, marathon running, and travel. Looking for someone who can handle my demanding schedule and adventurous spirit.', 'Houston', 'TX', '77001', ARRAY['Healthcare', 'Running', 'Travel', 'Emergency Medicine', 'Fitness'], ARRAY['https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400'], true, now(), now()),

-- Additional Male Professionals (40 more) 
(gen_random_uuid(), gen_random_uuid(), 'Alexander', 'Baker', 'alexander.baker@example.com', 30, 'Male', 'Software engineering manager building the next generation of apps. Love coding, mountain biking, and craft beer brewing. Seeking someone who appreciates both technology and outdoor adventures.', 'Austin', 'TX', '73302', ARRAY['Software Engineering', 'Mountain Biking', 'Brewing', 'Technology', 'Outdoors'], ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Benjamin', 'Gonzalez', 'benjamin.gonzalez@example.com', 32, 'Male', 'Investment portfolio manager with a passion for financial markets. Enjoy sailing, golf, and fine dining. Looking for an intelligent partner who appreciates the finer things in life.', 'Miami', 'FL', '33102', ARRAY['Finance', 'Sailing', 'Golf', 'Fine Dining', 'Investing'], ARRAY['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Lucas', 'Nelson', 'lucas.nelson@example.com', 28, 'Male', 'Marketing director at a top advertising agency. Passionate about creative campaigns, surfing, and photography. Seeking a creative soul who shares my love for art and ocean adventures.', 'San Diego', 'CA', '92102', ARRAY['Marketing', 'Surfing', 'Photography', 'Creativity', 'Ocean'], ARRAY['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Henry', 'Carter', 'henry.carter@example.com', 34, 'Male', 'Corporate lawyer specializing in mergers and acquisitions. Love tennis, wine collecting, and classical music. Looking for an intellectually stimulating partner who appreciates culture.', 'New York', 'NY', '10002', ARRAY['Law', 'Tennis', 'Wine', 'Classical Music', 'Culture'], ARRAY['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Owen', 'Mitchell', 'owen.mitchell@example.com', 31, 'Male', 'Product manager at a unicorn startup. Passionate about innovation, rock climbing, and international travel. Seeking an adventurous partner for exploring the world together.', 'San Francisco', 'CA', '94103', ARRAY['Product Management', 'Rock Climbing', 'Travel', 'Innovation', 'Startups'], ARRAY['https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Sebastian', 'Perez', 'sebastian.perez@example.com', 29, 'Male', 'Data scientist turning big data into business insights. Love hiking, craft cocktails, and board game nights. Looking for someone who enjoys both intellectual challenges and fun.', 'Denver', 'CO', '80202', ARRAY['Data Science', 'Hiking', 'Cocktails', 'Board Games', 'Analytics'], ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Jack', 'Roberts', 'jack.roberts@example.com', 33, 'Male', 'Architect designing award-winning sustainable buildings. Passionate about green design, cycling, and urban photography. Seeking someone who appreciates innovative design and environmental consciousness.', 'Portland', 'OR', '97203', ARRAY['Architecture', 'Sustainability', 'Cycling', 'Photography', 'Design'], ARRAY['https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Connor', 'Turner', 'connor.turner@example.com', 27, 'Male', 'Management consultant helping Fortune 500 companies transform. Love strategy games, skiing, and wine tasting. Looking for an ambitious partner who enjoys intellectual conversations.', 'Chicago', 'IL', '60602', ARRAY['Consulting', 'Strategy', 'Skiing', 'Wine', 'Business'], ARRAY['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Hunter', 'Phillips', 'hunter.phillips@example.com', 35, 'Male', 'Senior research scientist developing breakthrough medical treatments. Enjoy marathon running, science museums, and cooking gourmet meals. Seeking someone who values both intellect and health.', 'Boston', 'MA', '02102', ARRAY['Research', 'Science', 'Running', 'Cooking', 'Health'], ARRAY['https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Adrian', 'Campbell', 'adrian.campbell@example.com', 30, 'Male', 'Tech entrepreneur building AI-powered solutions. Passionate about machine learning, rock climbing, and angel investing. Looking for someone who understands the startup grind and loves adventure.', 'Seattle', 'WA', '98104', ARRAY['Entrepreneurship', 'AI', 'Rock Climbing', 'Investing', 'Technology'], ARRAY['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Caleb', 'Parker', 'caleb.parker@example.com', 26, 'Male', 'Financial analyst with expertise in sustainable investing. Love environmental activism, hiking, and craft beer. Seeking someone who cares about making a positive impact on the world.', 'Portland', 'OR', '97204', ARRAY['Finance', 'Sustainability', 'Hiking', 'Craft Beer', 'Activism'], ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Liam', 'Evans', 'liam.evans@example.com', 32, 'Male', 'Creative director at a leading digital agency. Passionate about brand storytelling, surfing, and film photography. Looking for a creative partner who appreciates art and ocean adventures.', 'Los Angeles', 'CA', '90002', ARRAY['Creative Direction', 'Surfing', 'Photography', 'Film', 'Branding'], ARRAY['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Wyatt', 'Edwards', 'wyatt.edwards@example.com', 28, 'Male', 'Biomedical engineer developing next-gen medical devices. Enjoy rock climbing, science fiction, and craft cocktails. Seeking an intellectually curious partner who loves both science and adventure.', 'Denver', 'CO', '80203', ARRAY['Biomedical Engineering', 'Rock Climbing', 'Science Fiction', 'Cocktails', 'Innovation'], ARRAY['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Nathan', 'Collins', 'nathan.collins@example.com', 31, 'Male', 'Strategy consultant working with tech startups. Love strategic thinking, tennis, and international cuisine. Looking for an ambitious partner who enjoys exploring new cultures and ideas.', 'Austin', 'TX', '73303', ARRAY['Strategy', 'Consulting', 'Tennis', 'International Cuisine', 'Travel'], ARRAY['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Ethan', 'Stewart', 'ethan.stewart@example.com', 34, 'Male', 'Senior software architect building scalable cloud infrastructure. Passionate about distributed systems, mountain biking, and homebrewing. Seeking someone who appreciates both technology and craftsmanship.', 'Seattle', 'WA', '98105', ARRAY['Software Architecture', 'Mountain Biking', 'Homebrewing', 'Cloud Technology', 'Craftsmanship'], ARRAY['https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Mason', 'Sanchez', 'mason.sanchez@example.com', 29, 'Male', 'Investment banker focused on sustainable finance. Enjoy sailing, wine appreciation, and environmental conservation. Looking for someone who values both financial success and environmental responsibility.', 'Miami', 'FL', '33103', ARRAY['Investment Banking', 'Sailing', 'Wine', 'Conservation', 'Sustainability'], ARRAY['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Logan', 'Morris', 'logan.morris@example.com', 27, 'Male', 'Product designer creating beautiful user experiences. Love design thinking, photography, and coffee culture. Seeking a creative soul who appreciates good design and meaningful conversations.', 'San Francisco', 'CA', '94104', ARRAY['Product Design', 'Photography', 'Coffee', 'Creativity', 'UX Design'], ARRAY['https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Isaac', 'Rogers', 'isaac.rogers@example.com', 33, 'Male', 'Renewable energy project manager building a sustainable future. Passionate about clean tech, outdoor adventures, and environmental policy. Looking for someone who shares my vision for a better world.', 'Denver', 'CO', '80204', ARRAY['Renewable Energy', 'Clean Technology', 'Outdoor Adventures', 'Environmental Policy', 'Sustainability'], ARRAY['https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Leo', 'Reed', 'leo.reed@example.com', 30, 'Male', 'Data engineering lead building next-gen analytics platforms. Love data visualization, craft beer brewing, and board games. Seeking someone who enjoys both intellectual puzzles and good company.', 'Austin', 'TX', '73304', ARRAY['Data Engineering', 'Data Visualization', 'Brewing', 'Board Games', 'Analytics'], ARRAY['https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400'], true, now(), now()),

(gen_random_uuid(), gen_random_uuid(), 'Zachary', 'Cook', 'zachary.cook@example.com', 26, 'Male', 'Marketing technology specialist optimizing digital campaigns. Passionate about martech, rock climbing, and live music. Looking for someone who appreciates both creativity and technical innovation.', 'Nashville', 'TN', '37202', ARRAY['Marketing Technology', 'Rock Climbing', 'Live Music', 'Digital Marketing', 'Innovation'], ARRAY['https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400'], true, now(), now());

-- Insert corresponding compatibility answers for all new profiles
INSERT INTO public.compatibility_answers (user_id, answers) 
SELECT 
    dp.user_id,
    jsonb_build_object(
        'age', dp.age::text,
        'gender', dp.gender,
        'location', dp.city || ', ' || dp.state,
        'city', dp.city,
        'state', dp.state,
        'postal_code', dp.postal_code,
        'relationship_goals', 'Long-term relationship',
        'partner_age_min', (GREATEST(dp.age - 8, 18))::text,
        'partner_age_max', (LEAST(dp.age + 12, 65))::text,
        'partner_gender', CASE 
            WHEN dp.gender = 'Male' THEN 'Female'
            WHEN dp.gender = 'Female' THEN 'Male'
            ELSE 'Any'
        END,
        'max_distance', '50',
        'occupation', COALESCE(dp.interests[1], 'Professional'),
        'education', 'College Graduate',
        'lifestyle', 'Active',
        'deal_breakers', 'Dishonesty, lack of ambition',
        'smoking', 'never',
        'drinking', 'socially',
        'exercise', 'few_times_week',
        'interests', array_to_string(dp.interests, ', ')
    )
FROM public.dating_profiles dp
WHERE dp.email LIKE '%@example.com'
    AND dp.user_id NOT IN (SELECT user_id FROM public.compatibility_answers);