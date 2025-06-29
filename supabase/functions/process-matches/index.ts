
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const webhookData = await req.json();
    console.log('Processing matchmaking request:', webhookData);

    const { user_id, profile_data, matchmaking_request } = webhookData;

    if (!matchmaking_request) {
      console.log('No matchmaking request in webhook data');
      return new Response(JSON.stringify({ success: true, message: 'Profile updated without matchmaking' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all potential matches from the database
    const { data: allProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('user_id, bio, values, life_goals, interests, photos, personality_answers')
      .neq('user_id', user_id);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!allProfiles || allProfiles.length === 0) {
      console.log('No other profiles found for matching');
      return new Response(JSON.stringify({ success: true, matches: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${allProfiles.length} potential matches for user ${user_id}`);

    const currentUser = matchmaking_request;
    const matches = [];

    // Process each potential match
    for (const profile of allProfiles) {
      const compatibility = calculateCompatibility(currentUser, profile);
      
      console.log(`Compatibility with ${profile.user_id}: ${compatibility.score}%`);
      
      if (compatibility.score > 30) { // Only include matches above 30% compatibility
        matches.push({
          user_id: user_id,
          matched_user_id: profile.user_id,
          compatibility_score: compatibility.score,
          match_reason: compatibility.reason,
          created_at: new Date().toISOString()
        });
      }
    }

    // Sort by compatibility score and take top 10
    matches.sort((a, b) => b.compatibility_score - a.compatibility_score);
    const topMatches = matches.slice(0, 10);

    console.log(`Found ${topMatches.length} compatible matches for user ${user_id}`);

    // Clear existing matches for this user
    await supabase
      .from('user_matches')
      .delete()
      .eq('user1_id', user_id);

    await supabase
      .from('user_matches')
      .delete()
      .eq('user2_id', user_id);

    // Insert new matches
    if (topMatches.length > 0) {
      // Convert to user_matches table format (ensuring consistent user ordering)
      const matchRecords = topMatches.map(match => ({
        user1_id: user_id < match.matched_user_id ? user_id : match.matched_user_id,
        user2_id: user_id < match.matched_user_id ? match.matched_user_id : user_id,
        compatibility_score: match.compatibility_score,
        matched_at: new Date().toISOString(),
        is_active: true
      }));

      const { error: insertError } = await supabase
        .from('user_matches')
        .insert(matchRecords);

      if (insertError) {
        console.error('Error inserting matches:', insertError);
        throw insertError;
      }

      console.log(`Successfully inserted ${matchRecords.length} matches for user ${user_id}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      matches_found: topMatches.length,
      message: `Found ${topMatches.length} compatible matches`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing matches:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateCompatibility(user: any, profile: any): { score: number; reason: string } {
  let score = 0;
  const reasons = [];

  console.log('Calculating compatibility between:', user.user_id, 'and', profile.user_id);
  console.log('User data:', JSON.stringify(user, null, 2));
  console.log('Profile data:', JSON.stringify(profile, null, 2));

  // Extract profile data with defaults
  const profilePersonality = profile.personality_answers || {};
  const profileAge = parseInt(profilePersonality.age) || 30;
  const profileGender = profilePersonality.gender || 'Not specified';
  const profileLocation = profilePersonality.location || 'Unknown';
  const profileInterests = profile.interests || [];
  const profileValues = profile.values || '';
  const profileGoals = profilePersonality.relationship_goals || profile.life_goals || '';

  console.log('Extracted profile data:', {
    age: profileAge,
    gender: profileGender,
    location: profileLocation,
    interests: profileInterests,
    values: profileValues,
    goals: profileGoals
  });

  // 1. Age compatibility (part of preference alignment - 30%)
  const ageCompatible = profileAge >= user.preferences.age_range.min && 
                       profileAge <= user.preferences.age_range.max;
  if (ageCompatible) {
    score += 15;
    reasons.push(`compatible age (${profileAge})`);
    console.log('Age compatible: +15 points');
  } else {
    console.log(`Age incompatible: ${profileAge} not in range ${user.preferences.age_range.min}-${user.preferences.age_range.max}`);
  }

  // 2. Gender preference compatibility (part of preference alignment - 30%)
  const genderCompatible = user.preferences.gender === 'Any' || 
                          user.preferences.gender === profileGender;
  if (genderCompatible) {
    score += 15;
    reasons.push('gender preference match');
    console.log('Gender compatible: +15 points');
  } else {
    console.log(`Gender incompatible: looking for ${user.preferences.gender}, found ${profileGender}`);
  }

  // 3. Shared interests (30%)
  if (user.interests && user.interests.length > 0 && profileInterests.length > 0) {
    const sharedInterests = user.interests.filter((interest: string) => 
      profileInterests.includes(interest)
    );
    const interestScore = Math.min((sharedInterests.length / Math.max(user.interests.length, 1)) * 30, 30);
    score += interestScore;
    if (sharedInterests.length > 0) {
      reasons.push(`${sharedInterests.length} shared interests (${sharedInterests.slice(0, 2).join(', ')})`);
      console.log(`Shared interests: +${interestScore} points for ${sharedInterests.length} matches`);
    }
  } else {
    console.log('No interests data available for comparison');
  }

  // 4. Values alignment (20%)
  if (user.values && profileValues) {
    const userValues = user.values.toLowerCase();
    const otherValues = profileValues.toLowerCase();
    const commonValueWords = ['family', 'career', 'travel', 'health', 'growth', 'honesty', 'loyalty', 'adventure', 'success', 'balance'];
    let valueMatches = 0;
    
    commonValueWords.forEach(word => {
      if (userValues.includes(word) && otherValues.includes(word)) {
        valueMatches++;
      }
    });
    
    const valueScore = Math.min((valueMatches / commonValueWords.length) * 20, 20);
    score += valueScore;
    if (valueMatches > 0) {
      reasons.push('shared values');
      console.log(`Values alignment: +${valueScore} points for ${valueMatches} matches`);
    }
  } else {
    console.log('No values data available for comparison');
  }

  // 5. Relationship goals alignment (part of values - 20%)
  if (user.relationship_goals && profileGoals) {
    const goalsCompatible = user.relationship_goals.toLowerCase().includes(profileGoals.toLowerCase()) ||
                           profileGoals.toLowerCase().includes(user.relationship_goals.toLowerCase());
    if (goalsCompatible) {
      score += 10;
      reasons.push('similar relationship goals');
      console.log('Relationship goals compatible: +10 points');
    }
  } else {
    console.log('No relationship goals data available for comparison');
  }

  // 6. Location proximity (20%) - simplified for now
  const locationScore = profileLocation !== 'Unknown' ? 20 : 10;
  score += locationScore;
  if (profileLocation !== 'Unknown') {
    reasons.push(`nearby location (${profileLocation})`);
    console.log(`Location bonus: +${locationScore} points`);
  }

  const finalScore = Math.min(Math.round(score), 100);
  const reasonText = reasons.length > 0 
    ? `You both ${reasons.slice(0, 3).join(', ')}`
    : 'Potential compatibility based on profile analysis';

  console.log(`Final compatibility score: ${finalScore}%`);
  console.log(`Match reason: ${reasonText}`);

  return {
    score: finalScore,
    reason: reasonText
  };
}
