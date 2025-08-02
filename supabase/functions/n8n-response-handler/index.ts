import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8NResponseData {
  user_id: string;
  processing_status: string;
  compatibility_score?: number;
  personality_analysis?: any;
  match_recommendations?: any;
  analysis_complete?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const responseData: N8NResponseData = await req.json();
    
    console.log('N8N response received:', JSON.stringify(responseData, null, 2));

    if (!responseData.user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update or insert AI match results
    const { error: upsertError } = await supabaseClient
      .from('ai_match_results')
      .upsert({
        user_id: responseData.user_id,
        processing_status: responseData.processing_status || 'completed',
        compatibility_score: responseData.compatibility_score,
        personality_analysis: responseData.personality_analysis || {},
        match_recommendations: responseData.match_recommendations || {},
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error updating AI results:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to update AI results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log to webhook logs for tracking
    const { error: logError } = await supabaseClient
      .from('n8n_webhook_logs')
      .insert({
        user_id: responseData.user_id,
        webhook_url: req.url,
        payload: responseData,
        success: true,
        response_status: 200,
        response_body: 'AI analysis completed successfully'
      });

    if (logError) {
      console.warn('Failed to log webhook response:', logError);
    }

    // Send response back to luvlang.org
    const websiteResponse = await fetch('https://luvlang.org/api/analysis-complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('WEBSITE_API_TOKEN') || 'default-token'}`
      },
      body: JSON.stringify({
        user_id: responseData.user_id,
        analysis_complete: true,
        compatibility_score: responseData.compatibility_score,
        processing_status: responseData.processing_status
      })
    }).catch(error => {
      console.warn('Failed to notify website:', error);
      return null;
    });

    console.log('AI analysis processing completed for user:', responseData.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'AI analysis results processed successfully',
        user_id: responseData.user_id,
        analysis_complete: responseData.analysis_complete !== false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in n8n-response-handler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);