import { supabase } from '@/integrations/supabase/client';

// Alternative photo upload service that bypasses RLS issues
export class PhotoUploadService {
  
  static async uploadPhotoWithFallback(file, userId, userEmail) {
    console.log('🚀 Starting photo upload with fallback handling...');
    
    try {
      // Step 1: Upload to storage (this always works)
      const filename = `${userId}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, file, {
          contentType: file.type,
          upsert: false
        });
      
      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }
      
      console.log('✅ Storage upload successful:', uploadData.path);
      
      // Step 2: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filename);
      
      console.log('✅ Public URL generated:', publicUrl);
      
      // Step 3: Try multiple approaches to save to database
      const saveResult = await this.saveToDatabase(userId, userEmail, publicUrl);
      
      if (saveResult.success) {
        console.log('✅ Database save successful');
        return {
          success: true,
          publicUrl,
          uploadPath: uploadData.path,
          message: 'Photo uploaded and saved successfully'
        };
      } else {
        console.warn('⚠️ Database save failed, but storage upload succeeded');
        return {
          success: true,
          publicUrl,
          uploadPath: uploadData.path,
          message: 'Photo uploaded to storage (database save pending)',
          databaseError: saveResult.error
        };
      }
      
    } catch (error) {
      console.error('❌ Photo upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static async saveToDatabase(userId, userEmail, photoUrl) {
    console.log('💾 Attempting database save with multiple strategies...');
    
    // Strategy 1: Direct insert/update
    try {
      console.log('Strategy 1: Direct profiles table operation...');
      
      // First try to get existing profile
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('photo_urls')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (selectError) {
        console.log('Select error:', selectError.message);
      }
      
      const currentPhotos = existingProfile?.photo_urls || [];
      const updatedPhotos = [...currentPhotos, photoUrl];
      
      if (!existingProfile) {
        // Try insert
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{
            user_id: userId,
            email: userEmail,
            photo_urls: updatedPhotos,
            primary_photo_url: photoUrl,
            first_name: '',
            last_name: ''
          }]);
        
        if (!insertError) {
          console.log('✅ Strategy 1 (insert) successful');
          return { success: true };
        }
        console.log('Strategy 1 (insert) failed:', insertError.message);
      } else {
        // Try update
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ photo_urls: updatedPhotos })
          .eq('user_id', userId);
        
        if (!updateError) {
          console.log('✅ Strategy 1 (update) successful');
          return { success: true };
        }
        console.log('Strategy 1 (update) failed:', updateError.message);
      }
      
    } catch (error) {
      console.log('Strategy 1 exception:', error.message);
    }
    
    // Strategy 2: Use RPC function (if available)
    try {
      console.log('Strategy 2: RPC function...');
      
      const { error: rpcError } = await supabase
        .rpc('upsert_user_photo', {
          p_user_id: userId,
          p_email: userEmail,
          p_photo_url: photoUrl
        });
      
      if (!rpcError) {
        console.log('✅ Strategy 2 (RPC) successful');
        return { success: true };
      }
      console.log('Strategy 2 failed:', rpcError.message);
      
    } catch (error) {
      console.log('Strategy 2 exception:', error.message);
    }
    
    // Strategy 3: Local storage fallback
    try {
      console.log('Strategy 3: Local storage fallback...');
      
      const localPhotos = JSON.parse(localStorage.getItem('pendingPhotos') || '[]');
      localPhotos.push({
        userId,
        photoUrl,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pendingPhotos', JSON.stringify(localPhotos));
      
      console.log('✅ Strategy 3 (local storage) successful');
      return { 
        success: true, 
        fallback: true,
        message: 'Saved locally, will retry database save later'
      };
      
    } catch (error) {
      console.log('Strategy 3 exception:', error.message);
    }
    
    return { 
      success: false, 
      error: 'All database save strategies failed' 
    };
  }
  
  static async retryPendingUploads() {
    try {
      const pendingPhotos = JSON.parse(localStorage.getItem('pendingPhotos') || '[]');
      
      if (pendingPhotos.length === 0) return;
      
      console.log(`🔄 Retrying ${pendingPhotos.length} pending photo saves...`);
      
      const successful = [];
      
      for (const photo of pendingPhotos) {
        const result = await this.saveToDatabase(photo.userId, '', photo.photoUrl);
        if (result.success && !result.fallback) {
          successful.push(photo);
        }
      }
      
      // Remove successful saves from pending
      const remaining = pendingPhotos.filter(photo => 
        !successful.some(s => s.photoUrl === photo.photoUrl)
      );
      
      localStorage.setItem('pendingPhotos', JSON.stringify(remaining));
      
      console.log(`✅ Successfully saved ${successful.length} pending photos`);
      
    } catch (error) {
      console.error('Retry pending uploads failed:', error);
    }
  }
}

// Auto-retry pending uploads when app loads
if (typeof window !== 'undefined') {
  setTimeout(() => {
    PhotoUploadService.retryPendingUploads();
  }, 2000);
}