
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
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.johnson@example.com',
    password: 'SecurePass123!',
    age: 28,
    gender: 'Female',
    genderPreference: 'Male',
    location: 'New York, NY',
    occupation: 'Software Engineer',
    education: 'Master\'s Degree',
    lifestyle: 'Active',
    relationshipGoals: 'Long-term relationship',
    bio: 'Loves hiking, coding, and trying new restaurants.',
    values: 'Honesty, adventure, and personal growth.',
    lifeGoals: 'To build a successful tech startup and travel the world.',
    greenFlags: 'Good communication, empathy, and a sense of humor.',
    dealBreakers: 'Dishonesty, lack of ambition, and poor hygiene.',
    interests: ['Hiking', 'Coding', 'Restaurants', 'Travel', 'Tech'],
    photos: [
      'https://images.unsplash.com/photo-1503023345310-154ca61232ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1544005279-0c4455130636?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob.smith@example.com',
    password: 'SecurePass123!',
    age: 34,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'Los Angeles, CA',
    occupation: 'Marketing Manager',
    education: 'Bachelor\'s Degree',
    lifestyle: 'Moderate',
    relationshipGoals: 'Marriage',
    bio: 'Enjoys movies, sports, and spending time with friends.',
    values: 'Family, loyalty, and financial stability.',
    lifeGoals: 'To get married, buy a house, and have children.',
    greenFlags: 'Kindness, reliability, and a good sense of humor.',
    dealBreakers: 'Cheating, excessive drinking, and irresponsibility.',
    interests: ['Movies', 'Sports', 'Friends', 'Travel', 'Reading'],
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1547425260-76bcbf01fe9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1522529599102-193abc13b3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Charlie',
    lastName: 'Brown',
    email: 'charlie.brown@example.com',
    password: 'SecurePass123!',
    age: 40,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'Chicago, IL',
    occupation: 'Teacher',
    education: 'Master\'s Degree',
    lifestyle: 'Relaxed',
    relationshipGoals: 'Companionship',
    bio: 'Loves reading, writing, and spending time outdoors.',
    values: 'Education, creativity, and community.',
    lifeGoals: 'To make a positive impact on the world and live a fulfilling life.',
    greenFlags: 'Intelligence, creativity, and a passion for learning.',
    dealBreakers: 'Ignorance, close-mindedness, and a lack of empathy.',
    interests: ['Reading', 'Writing', 'Outdoors', 'Education', 'Community'],
    photos: [
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1580489944761-15a19d674x?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1519085360753-af0119f825cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Diana',
    lastName: 'Garcia',
    email: 'diana.garcia@example.com',
    password: 'SecurePass123!',
    age: 25,
    gender: 'Female',
    genderPreference: 'Male',
    location: 'Houston, TX',
    occupation: 'Nurse',
    education: 'Bachelor\'s Degree',
    lifestyle: 'Moderate',
    relationshipGoals: 'Serious dating',
    bio: 'Enjoys helping others, traveling, and trying new foods.',
    values: 'Compassion, generosity, and cultural diversity.',
    lifeGoals: 'To make a difference in people\'s lives and experience different cultures.',
    greenFlags: 'Kindness, patience, and a willingness to learn.',
    dealBreakers: 'Selfishness, intolerance, and a lack of respect.',
    interests: ['Helping others', 'Traveling', 'Trying new foods', 'Culture', 'Languages'],
    photos: [
      'https://images.unsplash.com/photo-1595152778340-56dfb5f346cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1589156190881-ebff532139bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1590615526004-3996a9a4ccb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  },
  {
    firstName: 'Ethan',
    lastName: 'Lee',
    email: 'ethan.lee@example.com',
    password: 'SecurePass123!',
    age: 31,
    gender: 'Male',
    genderPreference: 'Female',
    location: 'San Francisco, CA',
    occupation: 'Data Scientist',
    education: 'PhD',
    lifestyle: 'Active',
    relationshipGoals: 'Long-term relationship',
    bio: 'Loves analyzing data, playing sports, and exploring new technologies.',
    values: 'Innovation, collaboration, and intellectual curiosity.',
    lifeGoals: 'To contribute to scientific advancements and make a positive impact on society.',
    greenFlags: 'Intelligence, ambition, and a good sense of humor.',
    dealBreakers: 'Stupidity, laziness, and a lack of curiosity.',
    interests: ['Data science', 'Sports', 'Technology', 'Science', 'Innovation'],
    photos: [
      'https://images.unsplash.com/photo-1624298357597-985e51aed72c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1618043542454-c01539549491?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
      'https://images.unsplash.com/photo-1508214751196-bcfd6ca6ac9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
    ]
  }
];
