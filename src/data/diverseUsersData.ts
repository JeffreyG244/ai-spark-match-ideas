
export interface DiverseUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary';
  genderPreference: 'Male' | 'Female' | 'Any';
  location: string;
  bio: string;
  values: string;
  lifeGoals: string;
  greenFlags: string;
  interests: string[];
  photos: string[];
  occupation: string;
  education: string;
  lifestyle: string;
  relationshipGoals: string;
  dealBreakers: string;
}

export const diverseUsersData: DiverseUser[] = [
  // Professional Women (25)
  {
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@example.com",
    password: "SecurePass123!",
    age: 32,
    gender: "Female",
    genderPreference: "Male",
    location: "San Francisco, CA",
    bio: "Marketing Director at a tech startup. I love hiking on weekends, trying new restaurants, and practicing yoga. Looking for someone who shares my passion for adventure and personal growth.",
    values: "Authenticity, Growth, Adventure, Family",
    lifeGoals: "Build a meaningful career, travel the world, start a family",
    greenFlags: "Great communicator, emotionally intelligent, ambitious",
    interests: ["Hiking", "Yoga", "Cooking", "Travel", "Photography"],
    photos: [
      "https://images.unsplash.com/photo-1494790108755-2616c2b10db8?w=400",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
    ],
    occupation: "Marketing Director",
    education: "MBA",
    lifestyle: "Active",
    relationshipGoals: "Long-term relationship",
    dealBreakers: "Dishonesty, lack of ambition"
  },
  {
    firstName: "Emma",
    lastName: "Rodriguez",
    email: "emma.rodriguez@example.com",
    password: "SecurePass123!",
    age: 29,
    gender: "Female",
    genderPreference: "Male",
    location: "Austin, TX",
    bio: "Software Engineer who loves building innovative products. When I'm not coding, you'll find me rock climbing or exploring local coffee shops. Seeking someone who values both intellect and fun.",
    values: "Innovation, Balance, Curiosity, Loyalty",
    lifeGoals: "Lead a tech team, maintain work-life balance, build lasting relationships",
    greenFlags: "Problem solver, supportive, has hobbies outside work",
    interests: ["Rock Climbing", "Coffee", "Technology", "Reading", "Gaming"],
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400"
    ],
    occupation: "Software Engineer",
    education: "Computer Science Degree",
    lifestyle: "Active",
    relationshipGoals: "Long-term relationship",
    dealBreakers: "Poor communication, lack of respect"
  },
  {
    firstName: "Jessica",
    lastName: "Thompson",
    email: "jessica.thompson@example.com",
    password: "SecurePass123!",
    age: 34,
    gender: "Female",
    genderPreference: "Male",
    location: "Chicago, IL",
    bio: "Corporate lawyer with a passion for justice and equality. I enjoy wine tasting, art galleries, and volunteering. Looking for an intellectually stimulating partner who shares my values.",
    values: "Justice, Equality, Intelligence, Compassion",
    lifeGoals: "Make partner at firm, contribute to social causes, find true love",
    greenFlags: "Intellectually curious, socially conscious, well-read",
    interests: ["Wine", "Art", "Volunteering", "Politics", "Theater"],
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
    ],
    occupation: "Corporate Lawyer",
    education: "Law Degree",
    lifestyle: "Professional",
    relationshipGoals: "Marriage",
    dealBreakers: "Closed-mindedness, lack of empathy"
  },
  {
    firstName: "Ashley",
    lastName: "Kim",
    email: "ashley.kim@example.com",
    password: "SecurePass123!",
    age: 31,
    gender: "Female",
    genderPreference: "Male",
    location: "Seattle, WA",
    bio: "Product Manager who loves turning ideas into reality. Passionate about sustainability, outdoor adventures, and good food. Seeking someone who's environmentally conscious and loves exploring.",
    values: "Sustainability, Innovation, Adventure, Health",
    lifeGoals: "Launch my own eco-friendly company, hike major trails, build a green home",
    greenFlags: "Environmentally conscious, adventurous spirit, health-focused",
    interests: ["Hiking", "Sustainability", "Food", "Camping", "Cycling"],
    photos: [
      "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400"
    ],
    occupation: "Product Manager",
    education: "Business Degree",
    lifestyle: "Eco-conscious",
    relationshipGoals: "Long-term partnership",
    dealBreakers: "Environmental indifference, couch potato lifestyle"
  },
  {
    firstName: "Rachel",
    lastName: "Davis",
    email: "rachel.davis@example.com",
    password: "SecurePass123!",
    age: 28,
    gender: "Female",
    genderPreference: "Male",
    location: "Boston, MA",
    bio: "Medical resident specializing in pediatrics. I'm passionate about helping children and families. In my free time, I love reading, running, and trying new restaurants with friends.",
    values: "Compassion, Excellence, Learning, Family",
    lifeGoals: "Become a top pediatrician, work internationally, raise healthy kids",
    greenFlags: "Caring nature, dedicated professional, great with kids",
    interests: ["Medicine", "Running", "Reading", "Restaurants", "Travel"],
    photos: [
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
      "https://images.unsplash.com/photo-1594736797933-d0f06ba4e356?w=400"
    ],
    occupation: "Medical Resident",
    education: "Medical Degree",
    lifestyle: "Health-focused",
    relationshipGoals: "Long-term relationship",
    dealBreakers: "Lack of empathy, unreliable"
  },

  // Professional Men (25)
  {
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@example.com",
    password: "SecurePass123!",
    age: 33,
    gender: "Male",
    genderPreference: "Female",
    location: "New York, NY",
    bio: "Investment banker who believes in working hard and playing harder. I enjoy fitness, traveling, and trying new cuisines. Looking for someone who's ambitious, fun, and ready for adventure.",
    values: "Success, Family, Adventure, Integrity",
    lifeGoals: "Build wealth, travel extensively, start a family",
    greenFlags: "Ambitious, generous, good sense of humor",
    interests: ["Finance", "Fitness", "Travel", "Food", "Sports"],
    photos: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
    ],
    occupation: "Investment Banker",
    education: "MBA",
    lifestyle: "High-achiever",
    relationshipGoals: "Marriage",
    dealBreakers: "Laziness, financial irresponsibility"
  },
  {
    firstName: "David",
    lastName: "Miller",
    email: "david.miller@example.com",
    password: "SecurePass123!",
    age: 30,
    gender: "Male",
    genderPreference: "Female",
    location: "Los Angeles, CA",
    bio: "Creative Director at an advertising agency. I'm passionate about storytelling, design, and making meaningful connections. Love surfing, film photography, and weekend getaways.",
    values: "Creativity, Authenticity, Connection, Growth",
    lifeGoals: "Start my own agency, create impactful campaigns, find my soulmate",
    greenFlags: "Creative thinker, emotionally available, adventurous",
    interests: ["Design", "Surfing", "Photography", "Film", "Art"],
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
    ],
    occupation: "Creative Director",
    education: "Design Degree",
    lifestyle: "Creative",
    relationshipGoals: "Deep connection",
    dealBreakers: "Lack of creativity, negative attitude"
  },
  {
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@example.com",
    password: "SecurePass123!",
    age: 35,
    gender: "Male",
    genderPreference: "Female",
    location: "Denver, CO",
    bio: "Tech entrepreneur who founded two successful startups. I love skiing, mountain biking, and building innovative solutions. Seeking a partner who's independent, intelligent, and shares my love for the outdoors.",
    values: "Innovation, Independence, Adventure, Excellence",
    lifeGoals: "Build a unicorn startup, climb major peaks, find an equal partner",
    greenFlags: "Visionary, supportive, loves nature",
    interests: ["Entrepreneurship", "Skiing", "Mountain Biking", "Technology", "Hiking"],
    photos: [
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
    ],
    occupation: "Tech Entrepreneur",
    education: "Engineering Degree",
    lifestyle: "Outdoor enthusiast",
    relationshipGoals: "Equal partnership",
    dealBreakers: "Dependence, indoor-only lifestyle"
  },
  {
    firstName: "Christopher",
    lastName: "Brown",
    email: "christopher.brown@example.com",
    password: "SecurePass123!",
    age: 32,
    gender: "Male",
    genderPreference: "Female",
    location: "Miami, FL",
    bio: "Management consultant who helps companies transform. I'm passionate about problem-solving, fitness, and exploring new cultures. Looking for someone who's intellectually curious and loves to travel.",
    values: "Excellence, Curiosity, Health, Culture",
    lifeGoals: "Become a partner, visit all continents, build a multicultural family",
    greenFlags: "Analytical mind, culturally aware, physically active",
    interests: ["Consulting", "Fitness", "Travel", "Languages", "Culture"],
    photos: [
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400"
    ],
    occupation: "Management Consultant",
    education: "MBA",
    lifestyle: "Global citizen",
    relationshipGoals: "Long-term partnership",
    dealBreakers: "Close-mindedness, sedentary lifestyle"
  },
  {
    firstName: "Robert",
    lastName: "Garcia",
    email: "robert.garcia@example.com",
    password: "SecurePass123!",
    age: 29,
    gender: "Male",
    genderPreference: "Female",
    location: "Phoenix, AZ",
    bio: "Cardiologist who's dedicated to saving lives. I enjoy golf, cooking, and spending time with family. Seeking someone who values health, family, and building a meaningful life together.",
    values: "Health, Family, Service, Stability",
    lifeGoals: "Establish a practice, volunteer internationally, raise healthy children",
    greenFlags: "Caring professional, family-oriented, stable",
    interests: ["Medicine", "Golf", "Cooking", "Family", "Health"],
    photos: [
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
    ],
    occupation: "Cardiologist",
    education: "Medical Degree",
    lifestyle: "Health-focused",
    relationshipGoals: "Marriage and family",
    dealBreakers: "Unhealthy habits, commitment issues"
  }
];
