import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { phoneNumber } = await req.json()

    // Get the user from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Set expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store verification record in database
    const { error: dbError } = await supabase
      .from('phone_verifications')
      .upsert({
        user_id: user.id,
        phone_number: phoneNumber,
        verification_code: verificationCode,
        code_expires_at: expiresAt,
        attempts: 0,
        verified_at: null
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save verification code')
    }

    // In a real implementation, you would send SMS here using Twilio, AWS SNS, etc.
    // For demo purposes, we'll just log the code
    console.log(`SMS Verification Code for ${phoneNumber}: ${verificationCode}`)

    // For demo purposes, return the code in development
    const isDevelopment = Deno.env.get('SUPABASE_URL')?.includes('localhost') || 
                         Deno.env.get('ENVIRONMENT') === 'development'

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verification code sent successfully',
        // Only return code in development for testing
        ...(isDevelopment && { verificationCode })
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        success: false 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})