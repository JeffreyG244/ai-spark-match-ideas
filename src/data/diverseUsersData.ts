
export interface DiverseUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  genderPreference: string;
  location: string;
  occupation: string;
  education: string;
  lifestyle: string;
  relationshipGoals: string;
  bio: string;
  values: string;
  lifeGoals: string;
  greenFlags: string;
  dealBreakers: string;
  interests: string[];
  photos: string[];
}

export const diverseUsersData: DiverseUser[] = [
  // Female Professionals
  {
    firstName: 'Sophia',
    lastName: 'Chen',
    email: 'sophia.chen@example.com',
    password: 'SecurePass123!',
    age: 32,
    gender: 'Female',
    genderPreference: 'Male',
    location: 'San Francisco, CA',
    occupation: 'Software Engineering Manager',
    education: 'Master\'s in Computer Science',
    lifestyle: 'Active',
    relationshipGoals: 'Long-term relationship',
    bio: 'Tech leader passionate about innovation and work-life balance. Love hiking, cooking, and exploring new restaurants.',
    values: 'Authenticity, growth mindset, and meaningful relationships.',
    lifeGoals: 'Build impactful technology and find my life partner.',
    greenFlags: 'Great communication, emotional intelligence, and ambition.',
    dealBreakers: 'Dishonesty, lack of ambition, and poor work ethic.',
    interests: ['Technology', 'Hiking', 'Cooking', 'Travel', 'Photography'],
    photos: [
      'https://images.unsplash.com/photo-1494790108755-2616c2b10db8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Isabella',
    lastName: 'Rodriguez',
    email: 'isabella.rodriguez@example.com',
    password: 'SecurePass123!',
    age: 29,
    gender: 'Female',
    genderPreference: 'Male',
    location: 'Austin, TX',
    occupation: 'Marketing Director',
    education: 'MBA',
    lifestyle: 'Social',
    relationshipGoals: 'Marriage',
    bio: 'Creative marketing professional who loves art, wine tasting, and weekend getaways.',
    values: 'Creativity, family, and adventure.',
    lifeGoals: 'Build a successful marketing agency and start a family.',
    greenFlags: 'Creativity, loyalty, and great sense of humor.',
    dealBreakers: 'Lack of ambition, dishonesty, and negativity.',
    interests: ['Marketing', 'Art', 'Wine', 'Travel', 'Photography'],
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Emma',
    lastName: 'Thompson',
    email: 'emma.thompson@example.com',
    password: 'SecurePass123!',
    age: 35,
    gender: 'Female',
    genderPreference: 'Male',
    location: 'Seattle, WA',
    occupation: 'Doctor',
    education: 'Medical Degree',
    lifestyle: 'Balanced',
    relationshipGoals: 'Long-term relationship',
    bio: 'Physician dedicated to helping others while maintaining a fulfilling personal life.',
    values: 'Compassion, integrity, and balance.',
    lifeGoals: 'Make a difference in healthcare and build a loving family.',
    greenFlags: 'Empathy, intelligence, and dedication.',
    dealBreakers: 'Selfishness, lack of respect, and dishonesty.',
    interests: ['Medicine', 'Yoga', 'Reading', 'Volunteering', 'Nature'],
    photos: [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Olivia',
    lastName: 'Kim',
    email: 'olivia.kim@example.com',
    password: 'SecurePass123!',
    age: 31,
    gender: 'Female',
    genderPreference: 'Male',
    location: 'New York, NY',
    occupation: 'Financial Analyst',
    education: 'CPA',
    lifestyle: 'Professional',
    relationshipGoals: 'Serious dating',
    bio: 'Finance professional who enjoys theater, fine dining, and weekend escapes to the Hamptons.',
    values: 'Success, loyalty, and sophistication.',
    lifeGoals: 'Advance in finance and find someone to share life\'s adventures.',
    greenFlags: 'Intelligence, ambition, and good conversation.',
    dealBreakers: 'Lack of drive, poor financial habits, and immaturity.',
    interests: ['Finance', 'Theater', 'Fine Dining', 'Travel', 'Art'],
    photos: [
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Ava',
    lastName: 'Johnson',
    email: 'ava.johnson@example.com',
    password: 'SecurePass123!',
    age: 33,
    gender: 'Female',
    genderPreference: 'Male',
    location: 'Denver, CO',
    occupation: 'Architect',
    education: 'Master\'s in Architecture',
    lifestyle: 'Active',
    relationshipGoals: 'Long-term relationship',
    bio: 'Creative architect who loves designing sustainable buildings and exploring the outdoors.',
    values: 'Creativity, sustainability, and authenticity.',
    lifeGoals: 'Design buildings that make a positive impact and find my soulmate.',
    greenFlags: 'Creativity, environmental consciousness, and passion.',
    dealBreakers: 'Lack of vision, wastefulness, and closed-mindedness.',
    interests: ['Architecture', 'Sustainability', 'Hiking', 'Design', 'Photography'],
    photos: [
      'https://images.unsplash.com/photo-1580489944761-15a19d674c3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  // Male Professionals
  {
    firstName: 'Alexander',
    lastName: 'Williams',
    email: 'alexander.williams@example.com',
    password: 'SecurePass123!',
    age: 34,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'Boston, MA',
    occupation: 'Investment Banker',
    education: 'MBA from Harvard',
    lifestyle: 'Professional',
    relationshipGoals: 'Marriage',
    bio: 'Investment banker who works hard and plays harder. Love sailing, fine wine, and good company.',
    values: 'Excellence, integrity, and success.',
    lifeGoals: 'Build wealth and find someone special to share it with.',
    greenFlags: 'Ambition, intelligence, and loyalty.',
    dealBreakers: 'Laziness, dishonesty, and lack of goals.',
    interests: ['Finance', 'Sailing', 'Wine', 'Travel', 'Golf'],
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'James',
    lastName: 'Miller',
    email: 'james.miller@example.com',
    password: 'SecurePass123!',
    age: 36,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'Chicago, IL',
    occupation: 'Tech Entrepreneur',
    education: 'Master\'s in Engineering',
    lifestyle: 'Innovative',
    relationshipGoals: 'Long-term relationship',
    bio: 'Serial entrepreneur building the next big thing. Love innovation, travel, and deep conversations.',
    values: 'Innovation, courage, and authenticity.',
    lifeGoals: 'Build a unicorn startup and find my life partner.',
    greenFlags: 'Vision, passion, and emotional intelligence.',
    dealBreakers: 'Fear of change, negativity, and lack of curiosity.',
    interests: ['Technology', 'Entrepreneurship', 'Travel', 'Innovation', 'Fitness'],
    photos: [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1519085760753-af0119f825cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    password: 'SecurePass123!',
    age: 38,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'Los Angeles, CA',
    occupation: 'Film Producer',
    education: 'Film School Graduate',
    lifestyle: 'Creative',
    relationshipGoals: 'Serious dating',
    bio: 'Hollywood producer creating meaningful content. Love cinema, art, and exploring LA\'s culture.',
    values: 'Creativity, storytelling, and passion.',
    lifeGoals: 'Produce award-winning films and find someone who shares my passion.',
    greenFlags: 'Creativity, passion, and good taste.',
    dealBreakers: 'Lack of appreciation for art, superficiality, and negativity.',
    interests: ['Film', 'Art', 'Culture', 'Travel', 'Photography'],
    photos: [
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Daniel',
    lastName: 'Davis',
    email: 'daniel.davis@example.com',
    password: 'SecurePass123!',
    age: 40,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'Miami, FL',
    occupation: 'Real Estate Developer',
    education: 'Business Degree',
    lifestyle: 'Luxury',
    relationshipGoals: 'Marriage',
    bio: 'Real estate mogul who enjoys the finer things in life. Love boating, fine dining, and travel.',
    values: 'Success, family, and enjoying life.',
    lifeGoals: 'Build a real estate empire and start a family.',
    greenFlags: 'Success-driven, family-oriented, and generous.',
    dealBreakers: 'Gold-digging, dishonesty, and lack of class.',
    interests: ['Real Estate', 'Boating', 'Fine Dining', 'Travel', 'Luxury'],
    photos: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Christopher',
    lastName: 'Wilson',
    email: 'christopher.wilson@example.com',
    password: 'SecurePass123!',
    age: 35,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'Portland, OR',
    occupation: 'Consultant',
    education: 'Master\'s in Business',
    lifestyle: 'Balanced',
    relationshipGoals: 'Long-term relationship',
    bio: 'Strategic consultant helping companies grow. Love hiking, craft beer, and meaningful conversations.',
    values: 'Growth, balance, and authenticity.',
    lifeGoals: 'Help businesses succeed and build a meaningful relationship.',
    greenFlags: 'Intelligence, balance, and genuine interest in others.',
    dealBreakers: 'Dishonesty, lack of ambition, and poor communication.',
    interests: ['Consulting', 'Hiking', 'Craft Beer', 'Business', 'Nature'],
    photos: [
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  }
];
