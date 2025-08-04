import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎯 Professional match trigger started')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parse the request body
    const body = await req.json()
    console.log('📥 Received payload:', body)

    const { userId, preferences, timestamp } = body

    // Fetch active professional users for matching
    const { data: professionals, error: fetchError } = await supabaseClient
      .from('users')
      .select(`
        id, 
        first_name, 
        last_name, 
        job_title, 
        company, 
        industry, 
        city, 
        age, 
        bio,
        interests,
        photos
      `)
      .eq('is_active', true)
      .not('id', 'eq', userId || 'null')
      .limit(50)

    if (fetchError) {
      console.error('❌ Error fetching professionals:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch professionals',
          details: fetchError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`✅ Found ${professionals?.length || 0} active professionals`)

    // Generate AI-powered matches (mock algorithm for now)
    const matches = professionals?.map(professional => ({
      user_id: userId,
      matched_user_id: professional.id,
      compatibility_score: Math.floor(Math.random() * 25) + 75, // 75-100%
      match_reasons: [
        'Professional compatibility',
        'Industry alignment', 
        'Geographic proximity',
        'Shared career goals'
      ],
      status: 'pending',
      created_at: new Date().toISOString()
    })) || []

    // Insert matches into executive_matches table
    if (matches.length > 0) {
      const { data: insertedMatches, error: insertError } = await supabaseClient
        .from('executive_matches')
        .insert(matches.slice(0, 5)) // Limit to top 5 matches
        .select()

      if (insertError) {
        console.error('❌ Error creating matches:', insertError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create matches',
            details: insertError.message
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log(`✅ Created ${insertedMatches?.length || 0} executive matches`)
    }

    // Generate daily matches for the user
    const dailyMatches = professionals?.slice(0, 3).map(professional => ({
      user_id: userId,
      recommended_user_id: professional.id,
      recommendation_score: Math.floor(Math.random() * 25) + 75,
      recommendation_reasons: [
        'Executive leadership style match',
        'Industry expertise alignment',
        'Professional networking potential'
      ],
      professional_highlight: `${professional.job_title} at ${professional.company}`,
      ai_confidence: Math.floor(Math.random() * 15) + 85,
      date: new Date().toISOString().split('T')[0]
    })) || []

    // Insert daily matches
    if (dailyMatches.length > 0) {
      const { error: dailyError } = await supabaseClient
        .from('daily_matches')
        .insert(dailyMatches)

      if (dailyError) {
        console.warn('⚠️ Error creating daily matches:', dailyError)
      } else {
        console.log(`✅ Created ${dailyMatches.length} daily matches`)
      }
    }

    // Response for N8N webhook
    const response = {
      success: true,
      message: 'Professional matching completed successfully',
      data: {
        executiveMatches: matches.length,
        dailyMatches: dailyMatches.length,
        timestamp: new Date().toISOString(),
        userId: userId
      },
      // N8N can use this data for further processing
      webhook_response: {
        professionals_found: professionals?.length || 0,
        matches_created: matches.length,
        top_match_score: matches.length > 0 ? Math.max(...matches.map(m => m.compatibility_score)) : null
      }
    }

    console.log('🎉 Professional matching trigger completed successfully')

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('💥 Professional match trigger error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})