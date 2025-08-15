import { supabase } from '@/integrations/supabase/client';

export const datingProfiles = [
  // Male Profiles (25)
  {
    first_name: "Alex",
    last_name: "Rodriguez",
    age: 28,
    gender: "Male",
    city: "New York",
    state: "NY",
    bio: "Software engineer who loves hiking and cooking. Always up for trying new restaurants or exploring hidden gems in the city.",
    interests: ["Hiking", "Cooking", "Photography", "Travel", "Coffee"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "Someone who loves adventure and has a great sense of humor",
    photo_urls: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"],
    email: "alex.rodriguez.dating@example.com"
  },
  {
    first_name: "Michael",
    last_name: "Chen",
    age: 32,
    gender: "Male",
    city: "San Francisco",
    state: "CA",
    bio: "Tech entrepreneur with a passion for sustainable living. Weekends find me at farmers markets or planning my next startup idea.",
    interests: ["Sustainability", "Entrepreneurship", "Rock Climbing", "Yoga", "Wine Tasting"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An independent, eco-conscious woman who shares my values",
    photo_urls: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"],
    email: "michael.chen.dating@example.com"
  },
  {
    first_name: "David",
    last_name: "Thompson",
    age: 26,
    gender: "Male",
    city: "Austin",
    state: "TX",
    bio: "Musician by night, marketing manager by day. Love live music, tacos, and long conversations over craft beer.",
    interests: ["Music", "Guitar", "Live Concerts", "Craft Beer", "Food Trucks"],
    relationship_goals: "Casual dating",
    partner_preferences: "Someone who appreciates good music and isn't afraid to dance",
    photo_urls: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"],
    email: "david.thompson.dating@example.com"
  },
  {
    first_name: "James",
    last_name: "Wilson",
    age: 35,
    gender: "Male",
    city: "Chicago",
    state: "IL",
    bio: "Financial advisor who values work-life balance. Passionate about fitness, reading, and weekend getaways to Michigan.",
    interests: ["Fitness", "Reading", "Travel", "Basketball", "Investing"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A driven woman who values personal growth and communication",
    photo_urls: ["https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face"],
    email: "james.wilson.dating@example.com"
  },
  {
    first_name: "Ryan",
    last_name: "Murphy",
    age: 29,
    gender: "Male",
    city: "Denver",
    state: "CO",
    bio: "Outdoor enthusiast and graphic designer. If I'm not skiing in winter, I'm hiking in summer. Love dogs and good design.",
    interests: ["Skiing", "Hiking", "Design", "Dogs", "Photography"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An active, creative soul who loves the outdoors as much as I do",
    photo_urls: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face"],
    email: "ryan.murphy.dating@example.com"
  },
  {
    first_name: "Carlos",
    last_name: "Santos",
    age: 31,
    gender: "Male",
    city: "Miami",
    state: "FL",
    bio: "Bilingual architect who loves salsa dancing and beach volleyball. Family-oriented and always planning the next adventure.",
    interests: ["Salsa Dancing", "Beach Volleyball", "Architecture", "Travel", "Cooking"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "Someone who values family and loves to dance and travel",
    photo_urls: ["https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face"],
    email: "carlos.santos.dating@example.com"
  },
  {
    first_name: "Brandon",
    last_name: "Lee",
    age: 27,
    gender: "Male",
    city: "Seattle",
    state: "WA",
    bio: "Coffee roaster and part-time writer. Love exploring new neighborhoods, trying local breweries, and rainy day reading sessions.",
    interests: ["Coffee", "Writing", "Craft Beer", "Reading", "Urban Exploration"],
    relationship_goals: "Casual dating",
    partner_preferences: "Someone who appreciates good coffee and meaningful conversations",
    photo_urls: ["https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=face"],
    email: "brandon.lee.dating@example.com"
  },
  {
    first_name: "Kevin",
    last_name: "Johnson",
    age: 33,
    gender: "Male",
    city: "Boston",
    state: "MA",
    bio: "History professor who loves trivia nights and exploring historical sites. Also a weekend warrior on the tennis court.",
    interests: ["History", "Tennis", "Trivia", "Museums", "Travel"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An intelligent, curious woman who enjoys learning new things",
    photo_urls: ["https://images.unsplash.com/photo-1502764613149-7f1d229e230f?w=400&h=400&fit=crop&crop=face"],
    email: "kevin.johnson.dating@example.com"
  },
  {
    first_name: "Marcus",
    last_name: "Davis",
    age: 30,
    gender: "Male",
    city: "Atlanta",
    state: "GA",
    bio: "Physical therapist with a love for helping others. Enjoy morning runs, cooking healthy meals, and Sunday football.",
    interests: ["Running", "Healthy Cooking", "Football", "Fitness", "Volunteering"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A caring, health-conscious woman who shares my values",
    photo_urls: ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face"],
    email: "marcus.davis.dating@example.com"
  },
  {
    first_name: "Daniel",
    last_name: "Kim",
    age: 25,
    gender: "Male",
    city: "Los Angeles",
    state: "CA",
    bio: "Film student and aspiring director. Love indie movies, street photography, and discovering new bands before they're cool.",
    interests: ["Film", "Photography", "Music", "Art", "Filmmaking"],
    relationship_goals: "Casual dating",
    partner_preferences: "A creative spirit who appreciates art and good cinema",
    photo_urls: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face"],
    email: "daniel.kim.dating@example.com"
  },
  {
    first_name: "Noah",
    last_name: "Anderson",
    age: 34,
    gender: "Male",
    city: "Portland",
    state: "OR",
    bio: "Environmental scientist and weekend farmer. Passionate about sustainability, local food, and building a better future.",
    interests: ["Environment", "Gardening", "Sustainable Living", "Hiking", "Local Food"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "Someone who cares about the planet and enjoys simple pleasures",
    photo_urls: ["https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&h=400&fit=crop&crop=face"],
    email: "noah.anderson.dating@example.com"
  },
  {
    first_name: "Tyler",
    last_name: "Brown",
    age: 28,
    gender: "Male",
    city: "Nashville",
    state: "TN",
    bio: "Country music producer who loves live shows and discovering new talent. Also enjoy barbecue, bourbon, and good company.",
    interests: ["Country Music", "Live Music", "Barbecue", "Bourbon", "Nashville"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A music lover who appreciates authenticity and good times",
    photo_urls: ["https://images.unsplash.com/photo-1507038732509-8b4d5fdfacc6?w=400&h=400&fit=crop&crop=face"],
    email: "tyler.brown.dating@example.com"
  },
  {
    first_name: "Jacob",
    last_name: "Martinez",
    age: 26,
    gender: "Male",
    city: "Phoenix",
    state: "AZ",
    bio: "Desert lover and solar energy engineer. Enjoy rock climbing, stargazing, and exploring Arizona's natural beauty.",
    interests: ["Rock Climbing", "Stargazing", "Solar Energy", "Desert Hiking", "Camping"],
    relationship_goals: "Casual dating",
    partner_preferences: "An adventurous woman who loves the outdoors and clear skies",
    photo_urls: ["https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=400&fit=crop&crop=face"],
    email: "jacob.martinez.dating@example.com"
  },
  {
    first_name: "Ethan",
    last_name: "Taylor",
    age: 32,
    gender: "Male",
    city: "Philadelphia",
    state: "PA",
    bio: "Lawyer with a passion for social justice. Love cheesesteaks, Eagles games, and heated debates about everything.",
    interests: ["Social Justice", "Football", "Debate", "Local Food", "Reading"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An intelligent, passionate woman who stands up for her beliefs",
    photo_urls: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"],
    email: "ethan.taylor.dating@example.com"
  },
  {
    first_name: "Luke",
    last_name: "Garcia",
    age: 29,
    gender: "Male",
    city: "San Diego",
    state: "CA",
    bio: "Marine biologist who spends days studying ocean life. Love surfing, beach volleyball, and fish tacos by the pier.",
    interests: ["Marine Biology", "Surfing", "Beach Volleyball", "Ocean Conservation", "Tacos"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "Someone who loves the ocean and cares about marine conservation",
    photo_urls: ["https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=face"],
    email: "luke.garcia.dating@example.com"
  },
  {
    first_name: "Andrew",
    last_name: "White",
    age: 31,
    gender: "Male",
    city: "Washington",
    state: "DC",
    bio: "Policy analyst who believes in making a difference. Enjoy museums, political discussions, and weekend trips to Virginia wine country.",
    interests: ["Politics", "Museums", "Wine Tasting", "Policy", "Current Events"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An educated, socially aware woman who enjoys deep conversations",
    photo_urls: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"],
    email: "andrew.white.dating@example.com"
  },
  {
    first_name: "Connor",
    last_name: "Moore",
    age: 27,
    gender: "Male",
    city: "Detroit",
    state: "MI",
    bio: "Automotive engineer with a love for classic cars. Enjoy hockey games, craft beer, and rebuilding vintage engines.",
    interests: ["Classic Cars", "Hockey", "Craft Beer", "Engineering", "Vintage Restoration"],
    relationship_goals: "Casual dating",
    partner_preferences: "Someone who appreciates craftsmanship and isn't afraid to get their hands dirty",
    photo_urls: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face"],
    email: "connor.moore.dating@example.com"
  },
  {
    first_name: "Ian",
    last_name: "Clark",
    age: 30,
    gender: "Male",
    city: "Minneapolis",
    state: "MN",
    bio: "Data scientist who loves solving puzzles. Enjoy winter sports, board games, and finding the best coffee shops in the Twin Cities.",
    interests: ["Data Science", "Winter Sports", "Board Games", "Coffee", "Puzzles"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A smart, analytical woman who enjoys intellectual challenges",
    photo_urls: ["https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&crop=face"],
    email: "ian.clark.dating@example.com"
  },
  {
    first_name: "Jordan",
    last_name: "Lewis",
    age: 26,
    gender: "Male",
    city: "Salt Lake City",
    state: "UT",
    bio: "Adventure guide who lives for the mountains. Love skiing, mountain biking, and sharing Utah's incredible outdoor playground.",
    interests: ["Skiing", "Mountain Biking", "Adventure Tourism", "Outdoor Photography", "Camping"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An adventure-loving woman who enjoys mountain life",
    photo_urls: ["https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face"],
    email: "jordan.lewis.dating@example.com"
  },
  {
    first_name: "Mason",
    last_name: "Walker",
    age: 33,
    gender: "Male",
    city: "Las Vegas",
    state: "NV",
    bio: "Event coordinator who knows how to have a good time. Love live entertainment, trying new restaurants, and weekend desert adventures.",
    interests: ["Event Planning", "Live Entertainment", "Desert Adventures", "Fine Dining", "Travel"],
    relationship_goals: "Casual dating",
    partner_preferences: "Someone who enjoys the excitement of city life and good entertainment",
    photo_urls: ["https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=face"],
    email: "mason.walker.dating@example.com"
  },
  {
    first_name: "Logan",
    last_name: "Hall",
    age: 28,
    gender: "Male",
    city: "New Orleans",
    state: "LA",
    bio: "Jazz musician and music teacher. Love the culture, food, and music of NOLA. Always ready for a good festival or street performance.",
    interests: ["Jazz Music", "Teaching", "New Orleans Culture", "Festivals", "Creole Cuisine"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A music lover who appreciates culture and good food",
    photo_urls: ["https://images.unsplash.com/photo-1502764613149-7f1d229e230f?w=400&h=400&fit=crop&crop=face"],
    email: "logan.hall.dating@example.com"
  },
  {
    first_name: "Blake",
    last_name: "Allen",
    age: 25,
    gender: "Male",
    city: "Charlotte",
    state: "NC",
    bio: "Banking professional with Southern charm. Love NASCAR, barbecue, and weekend trips to the Blue Ridge Mountains.",
    interests: ["NASCAR", "Barbecue", "Mountain Hiking", "Banking", "Southern Culture"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A sweet, genuine woman who appreciates Southern hospitality",
    photo_urls: ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face"],
    email: "blake.allen.dating@example.com"
  },
  {
    first_name: "Hunter",
    last_name: "Young",
    age: 31,
    gender: "Male",
    city: "Kansas City",
    state: "MO",
    bio: "Barbecue pitmaster and food blogger. Passionate about authentic flavors, Chiefs football, and sharing great meals with great people.",
    interests: ["Barbecue", "Food Blogging", "Football", "Cooking", "Local Food Scene"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A foodie who appreciates good barbecue and football Sundays",
    photo_urls: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face"],
    email: "hunter.young.dating@example.com"
  },
  {
    first_name: "Cole",
    last_name: "King",
    age: 29,
    gender: "Male",
    city: "Tampa",
    state: "FL",
    bio: "Marine veteran turned personal trainer. Love fitness challenges, beach workouts, and helping others reach their goals.",
    interests: ["Fitness", "Military", "Beach Sports", "Personal Training", "Goal Setting"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A strong, motivated woman who values fitness and personal growth",
    photo_urls: ["https://images.unsplash.com/photo-1489980557514-251d61e3eeb6?w=400&h=400&fit=crop&crop=face"],
    email: "cole.king.dating@example.com"
  },
  {
    first_name: "Cameron",
    last_name: "Wright",
    age: 32,
    gender: "Male",
    city: "Sacramento",
    state: "CA",
    bio: "Government employee who loves public service. Enjoy river rafting, wine country trips, and exploring California's diverse landscapes.",
    interests: ["Public Service", "River Rafting", "Wine Tasting", "California Nature", "Civic Engagement"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "Someone who values community service and California living",
    photo_urls: ["https://images.unsplash.com/photo-1507038732509-8b4d5fdfacc6?w=400&h=400&fit=crop&crop=face"],
    email: "cameron.wright.dating@example.com"
  },

  // Female Profiles (25)
  {
    first_name: "Emma",
    last_name: "Johnson",
    age: 27,
    gender: "Female",
    city: "New York",
    state: "NY",
    bio: "Marketing creative who loves brunch, Broadway shows, and weekend escapes to the Hamptons. Always planning the next adventure.",
    interests: ["Theater", "Brunch", "Marketing", "Travel", "Art"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An ambitious guy who can keep up with city life and loves culture",
    photo_urls: ["https://images.unsplash.com/photo-1494790108755-2616b612b182?w=400&h=400&fit=crop&crop=face"],
    email: "emma.johnson.dating@example.com"
  },
  {
    first_name: "Sophia",
    last_name: "Davis",
    age: 25,
    gender: "Female",
    city: "Los Angeles",
    state: "CA",
    bio: "Yoga instructor and wellness blogger. Love sunrise hikes, green smoothies, and spreading positive vibes wherever I go.",
    interests: ["Yoga", "Wellness", "Hiking", "Healthy Living", "Meditation"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A mindful, health-conscious man who values personal growth",
    photo_urls: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"],
    email: "sophia.davis.dating@example.com"
  },
  {
    first_name: "Olivia",
    last_name: "Miller",
    age: 29,
    gender: "Female",
    city: "Chicago",
    state: "IL",
    bio: "Nurse with a big heart for helping others. Love deep dish pizza, Cubs games, and cozy nights watching Netflix.",
    interests: ["Healthcare", "Baseball", "Netflix", "Deep Dish Pizza", "Volunteering"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A kind, genuine man who values compassion and loyalty",
    photo_urls: ["https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face"],
    email: "olivia.miller.dating@example.com"
  },
  {
    first_name: "Isabella",
    last_name: "Garcia",
    age: 31,
    gender: "Female",
    city: "Miami",
    state: "FL",
    bio: "Fashion designer with Latin roots. Love salsa dancing, art deco architecture, and creating beautiful things that make people feel confident.",
    interests: ["Fashion Design", "Salsa Dancing", "Art", "Latin Culture", "Architecture"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A passionate man who appreciates art, culture, and family values",
    photo_urls: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"],
    email: "isabella.garcia.dating@example.com"
  },
  {
    first_name: "Ava",
    last_name: "Brown",
    age: 26,
    gender: "Female",
    city: "Austin",
    state: "TX",
    bio: "Food blogger who eats her way through Austin's amazing food scene. Love live music, food trucks, and discovering hidden gems.",
    interests: ["Food Blogging", "Live Music", "Food Trucks", "Austin Culture", "Photography"],
    relationship_goals: "Casual dating",
    partner_preferences: "A foodie musician who knows the best taco spots in town",
    photo_urls: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face"],
    email: "ava.brown.dating@example.com"
  },
  {
    first_name: "Mia",
    last_name: "Wilson",
    age: 28,
    gender: "Female",
    city: "Seattle",
    state: "WA",
    bio: "Environmental lawyer fighting for our planet. Love hiking in the Cascades, indie coffee shops, and rainy day book marathons.",
    interests: ["Environmental Law", "Hiking", "Coffee", "Reading", "Sustainability"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An environmentally conscious man who loves the Pacific Northwest",
    photo_urls: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face"],
    email: "mia.wilson.dating@example.com"
  },
  {
    first_name: "Charlotte",
    last_name: "Moore",
    age: 30,
    gender: "Female",
    city: "Boston",
    state: "MA",
    bio: "History PhD student who loves uncovering stories from the past. Enjoy museum visits, bookstore browsing, and Freedom Trail walks.",
    interests: ["History", "Museums", "Books", "Academic Research", "Boston"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An intelligent, curious man who enjoys learning and deep conversations",
    photo_urls: ["https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face"],
    email: "charlotte.moore.dating@example.com"
  },
  {
    first_name: "Amelia",
    last_name: "Taylor",
    age: 24,
    gender: "Female",
    city: "Denver",
    state: "CO",
    bio: "Adventure photographer capturing Colorado's beauty. Love skiing, mountain biking, and chasing golden hour light in the Rockies.",
    interests: ["Photography", "Skiing", "Mountain Biking", "Adventure", "Nature"],
    relationship_goals: "Casual dating",
    partner_preferences: "An outdoor enthusiast who loves adventure and beautiful landscapes",
    photo_urls: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face"],
    email: "amelia.taylor.dating@example.com"
  },
  {
    first_name: "Harper",
    last_name: "Anderson",
    age: 32,
    gender: "Female",
    city: "San Francisco",
    state: "CA",
    bio: "Tech startup founder building the future. Love innovation, weekend wine country trips, and finding the best dim sum in Chinatown.",
    interests: ["Technology", "Entrepreneurship", "Wine", "Innovation", "Dim Sum"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An ambitious, forward-thinking man who shares my entrepreneurial spirit",
    photo_urls: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"],
    email: "harper.anderson.dating@example.com"
  },
  {
    first_name: "Evelyn",
    last_name: "Thomas",
    age: 27,
    gender: "Female",
    city: "Nashville",
    state: "TN",
    bio: "Country music songwriter with a voice and stories to tell. Love honky-tonk bars, songwriting sessions, and authentic Southern cuisine.",
    interests: ["Country Music", "Songwriting", "Nashville", "Southern Culture", "Storytelling"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A music lover who appreciates authenticity and good storytelling",
    photo_urls: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face"],
    email: "evelyn.thomas.dating@example.com"
  },
  {
    first_name: "Abigail",
    last_name: "Jackson",
    age: 29,
    gender: "Female",
    city: "Portland",
    state: "OR",
    bio: "Craft beer sommelier and local food advocate. Love brewery tours, farmers markets, and keeping Portland weird.",
    interests: ["Craft Beer", "Local Food", "Farmers Markets", "Portland Culture", "Sustainability"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A local food enthusiast who appreciates Portland's unique culture",
    photo_urls: ["https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop&crop=face"],
    email: "abigail.jackson.dating@example.com"
  },
  {
    first_name: "Emily",
    last_name: "White",
    age: 26,
    gender: "Female",
    city: "Atlanta",
    state: "GA",
    bio: "Event planner who loves bringing people together. Enjoy Southern hospitality, peach everything, and planning unforgettable experiences.",
    interests: ["Event Planning", "Southern Culture", "Hospitality", "Peach Cobbler", "Celebrations"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A social, family-oriented man who appreciates Southern charm",
    photo_urls: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face"],
    email: "emily.white.dating@example.com"
  },
  {
    first_name: "Madison",
    last_name: "Harris",
    age: 25,
    gender: "Female",
    city: "San Diego",
    state: "CA",
    bio: "Marine biology graduate student studying ocean conservation. Love surfing at dawn, fish tacos, and protecting our blue planet.",
    interests: ["Marine Biology", "Surfing", "Ocean Conservation", "Research", "Beach Life"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An ocean lover who cares about marine conservation",
    photo_urls: ["https://images.unsplash.com/photo-1494790108755-2616b612b182?w=400&h=400&fit=crop&crop=face"],
    email: "madison.harris.dating@example.com"
  },
  {
    first_name: "Elizabeth",
    last_name: "Martin",
    age: 33,
    gender: "Female",
    city: "Washington",
    state: "DC",
    bio: "Political journalist covering Capitol Hill. Love press briefings, museum galas, and weekend escapes to Virginia wine country.",
    interests: ["Journalism", "Politics", "Museums", "Wine", "Current Events"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An intelligent, well-informed man who enjoys political discussions",
    photo_urls: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"],
    email: "elizabeth.martin.dating@example.com"
  },
  {
    first_name: "Victoria",
    last_name: "Thompson",
    age: 28,
    gender: "Female",
    city: "Philadelphia",
    state: "PA",
    bio: "Art curator with a passion for contemporary works. Love gallery openings, cheesesteaks, and discovering emerging artists.",
    interests: ["Art Curation", "Contemporary Art", "Gallery Events", "Philadelphia", "Emerging Artists"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A cultured man who appreciates art and Philadelphia's rich history",
    photo_urls: ["https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face"],
    email: "victoria.thompson.dating@example.com"
  },
  {
    first_name: "Grace",
    last_name: "Lee",
    age: 30,
    gender: "Female",
    city: "Phoenix",
    state: "AZ",
    bio: "Desert landscape architect creating sustainable outdoor spaces. Love hiking Camelback, desert sunsets, and innovative design.",
    interests: ["Landscape Architecture", "Desert Hiking", "Sustainable Design", "Sunsets", "Innovation"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An environmentally conscious man who loves desert landscapes",
    photo_urls: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"],
    email: "grace.lee.dating@example.com"
  },
  {
    first_name: "Chloe",
    last_name: "Clark",
    age: 24,
    gender: "Female",
    city: "Minneapolis",
    state: "MN",
    bio: "Social media manager who loves connecting people online and offline. Enjoy winter festivals, lake summers, and Minnesota nice vibes.",
    interests: ["Social Media", "Winter Sports", "Lake Activities", "Festivals", "Community Building"],
    relationship_goals: "Casual dating",
    partner_preferences: "A social, winter-loving guy who enjoys Minnesota's unique culture",
    photo_urls: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face"],
    email: "chloe.clark.dating@example.com"
  },
  {
    first_name: "Scarlett",
    last_name: "Lewis",
    age: 31,
    gender: "Female",
    city: "Las Vegas",
    state: "NV",
    bio: "Casino marketing manager who knows Vegas inside and out. Love high-energy entertainment, fine dining, and desert adventures.",
    interests: ["Entertainment Marketing", "Fine Dining", "Desert Adventures", "Las Vegas", "Live Shows"],
    relationship_goals: "Casual dating",
    partner_preferences: "An exciting man who enjoys the Vegas lifestyle and good entertainment",
    photo_urls: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face"],
    email: "scarlett.lewis.dating@example.com"
  },
  {
    first_name: "Zoey",
    last_name: "Walker",
    age: 27,
    gender: "Female",
    city: "Salt Lake City",
    state: "UT",
    bio: "Outdoor gear designer creating products for mountain adventures. Love backcountry skiing, rock climbing, and Utah's incredible landscapes.",
    interests: ["Outdoor Gear Design", "Backcountry Skiing", "Rock Climbing", "Mountain Adventures", "Product Design"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "An adventurous man who loves mountain sports and outdoor gear",
    photo_urls: ["https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=face"],
    email: "zoey.walker.dating@example.com"
  },
  {
    first_name: "Luna",
    last_name: "Hall",
    age: 26,
    gender: "Female",
    city: "New Orleans",
    state: "LA",
    bio: "Jazz vocalist keeping NOLA music traditions alive. Love street performances, beignets, and the magic of French Quarter nights.",
    interests: ["Jazz Music", "Vocals", "New Orleans Culture", "Street Performance", "French Quarter"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A music lover who appreciates NOLA culture and live performance",
    photo_urls: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face"],
    email: "luna.hall.dating@example.com"
  },
  {
    first_name: "Stella",
    last_name: "Allen",
    age: 29,
    gender: "Female",
    city: "Charlotte",
    state: "NC",
    bio: "Southern belle working in finance with modern values. Love NASCAR weekends, mountain getaways, and balancing tradition with progress.",
    interests: ["Finance", "NASCAR", "Mountain Trips", "Southern Traditions", "Modern Values"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A gentleman who respects Southern values but embraces modern thinking",
    photo_urls: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"],
    email: "stella.allen.dating@example.com"
  },
  {
    first_name: "Hazel",
    last_name: "Young",
    age: 25,
    gender: "Female",
    city: "Kansas City",
    state: "MO",
    bio: "BBQ competition judge with a refined palate. Love Chiefs football, local breweries, and finding the perfect burnt ends.",
    interests: ["BBQ Judging", "Football", "Local Breweries", "Food Competitions", "Kansas City"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A BBQ lover who appreciates good food and football Sundays",
    photo_urls: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=face"],
    email: "hazel.young.dating@example.com"
  },
  {
    first_name: "Aurora",
    last_name: "King",
    age: 32,
    gender: "Female",
    city: "Tampa",
    state: "FL",
    bio: "Fitness influencer promoting healthy lifestyles. Love beach workouts, smoothie bowls, and inspiring others to reach their potential.",
    interests: ["Fitness Influencing", "Beach Workouts", "Healthy Eating", "Motivation", "Social Media"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A fit, motivated man who values health and personal development",
    photo_urls: ["https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop&crop=face"],
    email: "aurora.king.dating@example.com"
  },
  {
    first_name: "Savannah",
    last_name: "Wright",
    age: 28,
    gender: "Female",
    city: "Sacramento",
    state: "CA",
    bio: "Government policy analyst working on California's future. Love wine country weekends, river rafting, and making positive change.",
    interests: ["Policy Analysis", "Wine Country", "River Rafting", "California Politics", "Public Service"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A socially conscious man who cares about California's future",
    photo_urls: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop&crop=face"],
    email: "savannah.wright.dating@example.com"
  },
  {
    first_name: "Brooklyn",
    last_name: "Scott",
    age: 30,
    gender: "Female",
    city: "Detroit",
    state: "MI",
    bio: "Urban revitalization specialist helping rebuild Motor City. Love Red Wings hockey, craft cocktails, and Detroit's comeback story.",
    interests: ["Urban Planning", "Hockey", "Craft Cocktails", "Detroit History", "Community Development"],
    relationship_goals: "Long-term relationship",
    partner_preferences: "A man who believes in Detroit's potential and loves hockey",
    photo_urls: ["https://images.unsplash.com/photo-1494790108755-2616b612b182?w=400&h=400&fit=crop&crop=face"],
    email: "brooklyn.scott.dating@example.com"
  }
];

export const seedDatingProfiles = async (): Promise<{ success: boolean; message: string; count?: number }> => {
  try {
    console.log('Starting to seed dating profiles...');
    
    // Check if profiles already exist
    const { data: existingProfiles, error: checkError } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    if (checkError) {
      console.error('Error checking existing profiles:', checkError);
      return { success: false, message: 'Failed to check existing profiles' };
    }

    if (existingProfiles && existingProfiles.length >= 40) {
      console.log(`Database already has ${existingProfiles.length} dating profiles`);
      return { 
        success: true, 
        message: `Database already has ${existingProfiles.length} dating profiles`,
        count: existingProfiles.length
      };
    }

    console.log(`Creating ${datingProfiles.length} new dating profiles...`);

    // Insert profiles in batches to avoid timeout
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < datingProfiles.length; i += batchSize) {
      const batch = datingProfiles.slice(i, i + batchSize).map((profile, index) => ({
        id: `dating-profile-${profile.first_name.toLowerCase()}-${profile.last_name.toLowerCase()}-${Date.now()}-${index}`,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        age: profile.age,
        gender: profile.gender,
        city: profile.city,
        state: profile.state,
        bio: profile.bio,
        interests: profile.interests,
        photos: profile.photo_urls,
        date_of_birth: new Date(Date.now() - (profile.age * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { data, error } = await supabase
        .from('users')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        // Continue with other batches even if one fails
      } else {
        insertedCount += data?.length || 0;
        console.log(`Successfully inserted batch ${i / batchSize + 1}: ${data?.length || 0} profiles`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (insertedCount > 0) {
      console.log(`Successfully seeded ${insertedCount} dating profiles!`);
      return { 
        success: true, 
        message: `Successfully seeded ${insertedCount} realistic dating profiles for your platform!`,
        count: insertedCount
      };
    } else {
      return { 
        success: false, 
        message: 'Failed to insert any profiles due to database errors' 
      };
    }

  } catch (error) {
    console.error('Error seeding dating profiles:', error);
    return { 
      success: false, 
      message: `Failed to seed profiles: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};