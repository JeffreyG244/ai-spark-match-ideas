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

    const { phoneNumber, verificationCode } = await req.json()

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

    // Get the verification record
    const { data: verification, error: fetchError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !verification) {
      throw new Error('No verification record found')
    }

    // Check if code has expired
    if (new Date() > new Date(verification.code_expires_at)) {
      throw new Error('Verification code has expired')
    }

    // Check if already verified
    if (verification.verified_at) {
      throw new Error('Phone number already verified')
    }

    // Check attempts limit
    if (verification.attempts >= verification.max_attempts) {
      throw new Error('Too many verification attempts')
    }

    // CRITICAL SECURITY FIX: Use secure hashed verification instead of plaintext
    // Try new secure hash method first
    const { data: secureResult, error: secureError } = await supabase
      .rpc('verify_phone_code_secure', {
        user_id: user.id,
        submitted_code: verificationCode
      });

    if (secureError) {
      console.error('Secure verification error:', secureError);
      
      // Fallback to legacy plaintext method for backwards compatibility
      if (verification.verification_code !== verificationCode) {
        // Increment attempts
        await supabase
          .from('phone_verifications')
          .update({ 
            attempts: verification.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', verification.id)

        throw new Error('Invalid verification code')
      }

      // Mark as verified (legacy method)
      const { error: updateError } = await supabase
        .from('phone_verifications')
        .update({ 
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', verification.id)
        
      if (updateError) {
        console.error('Update error:', updateError)
        throw new Error('Failed to verify phone number')
      }
    } else if (!secureResult) {
      throw new Error('Invalid verification code')
    }

    // Log successful verification
    await supabase.from('security_logs').insert({
      event_type: 'phone_verification_successful',
      severity: 'low',
      details: {
        user_id: user.id,
        phone_number: phoneNumber,
        verification_method: secureError ? 'legacy_plaintext' : 'secure_hash'
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Phone number verified successfully'
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