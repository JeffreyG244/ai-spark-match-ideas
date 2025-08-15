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

    const formData = await req.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file) {
      throw new Error('No file provided')
    }

    if (!documentType) {
      throw new Error('Document type is required')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.')
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.')
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExtension}`

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload file')
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName)

    // Save verification document record
    const { data: documentData, error: documentError } = await supabase
      .from('verification_documents')
      .insert({
        user_id: user.id,
        document_type: documentType,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        verification_status: 'pending'
      })
      .select()
      .single()

    if (documentError) {
      console.error('Document record error:', documentError)
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('verification-documents')
        .remove([fileName])
      
      throw new Error('Failed to save document record')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document uploaded successfully',
        document: documentData
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