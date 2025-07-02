
interface UserProfile {
  id: string;
  bio: string;
  interests: string[];
  values: string;
  lifeGoals: string;
  age?: number;
  location?: string;
  personalityAnswers?: Record<string, string>;
}

interface MatchScore {
  userId: string;
  totalScore: number;
  interestScore: number;
  valueScore: number;
  personalityScore: number;
  proximityScore: number;
}

export const calculateCompatibilityScore = (
  user1: UserProfile,
  user2: UserProfile
): MatchScore => {
  let totalScore = 0;
  let interestScore = 0;
  let valueScore = 0;
  let personalityScore = 0;
  let proximityScore = 0;

  // Interest compatibility (30% weight)
  if (user1.interests && user2.interests) {
    const commonInterests = user1.interests.filter(interest => 
      user2.interests.includes(interest)
    );
    interestScore = (commonInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 100;
  }

  // Values compatibility (25% weight)
  if (user1.values && user2.values) {
    const value1Words = user1.values.toLowerCase().split(/\s+/);
    const value2Words = user2.values.toLowerCase().split(/\s+/);
    const commonValues = value1Words.filter(word => 
      value2Words.includes(word) && word.length > 3
    );
    valueScore = (commonValues.length / Math.max(value1Words.length, value2Words.length)) * 100;
  }

  // Life goals compatibility (25% weight)
  if (user1.lifeGoals && user2.lifeGoals) {
    const goals1Words = user1.lifeGoals.toLowerCase().split(/\s+/);
    const goals2Words = user2.lifeGoals.toLowerCase().split(/\s+/);
    const commonGoals = goals1Words.filter(word => 
      goals2Words.includes(word) && word.length > 3
    );
    personalityScore = (commonGoals.length / Math.max(goals1Words.length, goals2Words.length)) * 100;
  }

  // Age compatibility (10% weight)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    proximityScore = Math.max(0, 100 - (ageDiff * 10)); // Decreases by 10 points per year difference
  }

  // Location proximity (10% weight) - simplified for now
  if (user1.location && user2.location) {
    proximityScore = user1.location === user2.location ? 100 : 50;
  }

  // Calculate weighted total
  totalScore = (
    (interestScore * 0.30) + 
    (valueScore * 0.25) + 
    (personalityScore * 0.25) + 
    (proximityScore * 0.20)
  );

  return {
    userId: user2.id,
    totalScore: Math.round(totalScore),
    interestScore: Math.round(interestScore),
    valueScore: Math.round(valueScore),
    personalityScore: Math.round(personalityScore),
    proximityScore: Math.round(proximityScore)
  };
};

export const generateDailyMatches = (
  currentUser: UserProfile,
  allUsers: UserProfile[],
  excludeUserIds: string[] = [],
  maxMatches: number = 10
): MatchScore[] => {
  const eligibleUsers = allUsers.filter(user => 
    user.id !== currentUser.id && 
    !excludeUserIds.includes(user.id)
  );

  const matches = eligibleUsers
    .map(user => calculateCompatibilityScore(currentUser, user))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, maxMatches);

  return matches;
};

export const getMatchInsights = (matchScore: MatchScore): string[] => {
  const insights: string[] = [];

  if (matchScore.interestScore > 70) {
    insights.push("You share many common interests!");
  }
  
  if (matchScore.valueScore > 70) {
    insights.push("Your values align strongly.");
  }
  
  if (matchScore.personalityScore > 70) {
    insights.push("You have similar life goals.");
  }
  
  if (matchScore.proximityScore > 80) {
    insights.push("You're in the same area!");
  }

  if (matchScore.totalScore > 80) {
    insights.push("This could be a great match!");
  } else if (matchScore.totalScore > 60) {
    insights.push("You have good compatibility potential.");
  }

  return insights;
};
