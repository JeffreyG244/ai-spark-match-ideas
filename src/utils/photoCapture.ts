
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import { supabase } from '@/integrations/supabase/client';

export const capturePhotoFromVideo = async (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<Blob> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create image blob'));
    }, 'image/jpeg', 0.85);
  });
};

export const uploadPhotoToStorage = async (
  userId: string,
  photoCount: number,
  blob: Blob
): Promise<string> => {
  const timestamp = Date.now();
  const filename = `${userId}/${timestamp}_photo_${photoCount + 1}.jpg`;

  console.log('📤 Uploading to profile-photos bucket:', filename);

  const { error: uploadError } = await supabase.storage
    .from('profile-photos')
    .upload(filename, blob, {
      contentType: 'image/jpeg'
    });

  if (uploadError) {
    console.error('❌ Upload error:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profile-photos')
    .getPublicUrl(filename);

  console.log('✅ Photo uploaded successfully:', publicUrl);
  return publicUrl;
};

export const updateUserProfile = async (userId: string, email: string, newPhotoUrl: string) => {
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('photo_urls')
    .eq('user_id', userId)
    .maybeSingle();

  const currentPhotos = currentProfile?.photo_urls || [];
  const updatedPhotos = [...currentPhotos, newPhotoUrl];

  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      email: email,
      photo_urls: updatedPhotos,
      updated_at: new Date().toISOString()
    });

  if (updateError) throw updateError;
};
