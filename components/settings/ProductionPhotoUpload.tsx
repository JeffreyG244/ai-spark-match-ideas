import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Camera, 
  Upload, 
  X, 
  Star, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  RefreshCw,
  Settings,
  Info
} from 'lucide-react';

interface UploadState {
  isUploading: boolean;
  progress: number;
  currentFile: string | null;
  error: string | null;
}

interface StorageHealth {
  bucketExists: boolean;
  canRead: boolean;
  canWrite: boolean;
  lastChecked: number;
  checking: boolean;
}

const ProductionPhotoUpload = () => {
  const { user } = useAuth();
  const { profileData, isLoading, updateProfileField, saveProfile } = useEnhancedProfileData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    currentFile: null,
    error: null
  });
  
  const [storageHealth, setStorageHealth] = useState<StorageHealth>({
    bucketExists: false,
    canRead: false,
    canWrite: false,
    lastChecked: 0,
    checking: false
  });

  const photos = profileData.photo_urls || [];
  const maxPhotos = 6;
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const bucketName = 'profile-photos';

  // Comprehensive storage health check
  const checkStorageHealth = useCallback(async () => {
    if (!user || storageHealth.checking) return;
    
    setStorageHealth(prev => ({ ...prev, checking: true }));
    
    try {
      const health: Partial<StorageHealth> = {
        bucketExists: false,
        canRead: false,
        canWrite: false,
        lastChecked: Date.now(),
        checking: false
      };
      
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (!listError && buckets) {
        health.bucketExists = buckets.some(b => b.name === bucketName);
      }
      
      if (health.bucketExists) {
        // Test read permissions
        try {
          const { data: files, error: readError } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 });
          health.canRead = !readError;
        } catch {
          health.canRead = false;
        }
        
        // Test write permissions with a minimal upload
        try {
          const testData = new Uint8Array(1);
          const testFilename = `test/${user.id}/health-check-${Date.now()}.tmp`;
          
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(testFilename, testData, {
              contentType: 'application/octet-stream',
              upsert: false
            });
          
          if (!uploadError) {
            health.canWrite = true;
            // Clean up test file
            await supabase.storage.from(bucketName).remove([testFilename]);
          }
        } catch {
          health.canWrite = false;
        }
      }
      
      setStorageHealth(prev => ({ ...prev, ...health }));
      
    } catch (error) {
      console.error('Storage health check failed:', error);
      setStorageHealth(prev => ({
        ...prev,
        bucketExists: false,
        canRead: false,
        canWrite: false,
        lastChecked: Date.now(),
        checking: false
      }));
    }
  }, [user, bucketName, storageHealth.checking]);

  // Validate file before upload
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      };
    }
    
    // Check file size
    if (file.size > maxFileSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `File too large (${sizeMB}MB). Maximum size: ${maxSizeMB}MB`
      };
    }
    
    // Check if it's actually an image by trying to load it
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ valid: true });
      img.onerror = () => resolve({ 
        valid: false, 
        error: 'Invalid image file or corrupted data' 
      });
      img.src = URL.createObjectURL(file);
    }) as any;
  }, [allowedTypes, maxFileSize]);

  // Upload files with progress tracking
  const uploadFiles = useCallback(async (files: FileList) => {
    if (!user || !storageHealth.canWrite) {
      toast({
        title: 'Upload Not Available',
        description: 'Photo upload is currently unavailable. Please try again later.',
        variant: 'destructive'
      });
      return;
    }

    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Too Many Photos',
        description: `You can only have up to ${maxPhotos} photos total.`,
        variant: 'destructive'
      });
      return;
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      currentFile: null,
      error: null
    });

    const newPhotoUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const progressBase = (i / totalFiles) * 100;
        
        setUploadState(prev => ({
          ...prev,
          currentFile: file.name,
          progress: progressBase
        }));

        // Validate file
        const validation = await validateFile(file);
        if (!validation.valid) {
          toast({
            title: 'Invalid File',
            description: `${file.name}: ${validation.error}`,
            variant: 'destructive'
          });
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${user.id}/${timestamp}_${randomId}.${fileExt}`;

        // Upload with retry logic
        let uploadSuccess = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!uploadSuccess && retryCount < maxRetries) {
          try {
            const { data, error } = await supabase.storage
              .from(bucketName)
              .upload(filename, file, {
                contentType: file.type,
                upsert: false,
                duplex: 'half'
              });

            if (error) {
              throw error;
            }

            // Verify upload by checking if file exists
            const { data: checkData, error: checkError } = await supabase.storage
              .from(bucketName)
              .list(user.id, {
                search: filename.split('/')[1]
              });

            if (checkError || !checkData?.length) {
              throw new Error('Upload verification failed');
            }

            // Generate public URL
            const { data: { publicUrl } } = supabase.storage
              .from(bucketName)
              .getPublicUrl(filename);

            newPhotoUrls.push(publicUrl);
            uploadSuccess = true;

            setUploadState(prev => ({
              ...prev,
              progress: progressBase + ((1 / totalFiles) * 100)
            }));

          } catch (error: any) {
            retryCount++;
            console.error(`Upload attempt ${retryCount} failed:`, error);
            
            if (retryCount >= maxRetries) {
              toast({
                title: 'Upload Failed',
                description: `${file.name}: ${error.message || 'Upload failed after multiple attempts'}`,
                variant: 'destructive'
              });
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
      }

      // Update profile with new photos
      if (newPhotoUrls.length > 0) {
        const updatedPhotos = [...photos, ...newPhotoUrls];
        updateProfileField('photo_urls', updatedPhotos);
        
        const saveResult = await saveProfile(false);
        if (saveResult?.success) {
          toast({
            title: 'Photos Uploaded Successfully',
            description: `${newPhotoUrls.length} photo(s) have been added to your profile.`
          });
        } else {
          toast({
            title: 'Save Warning',
            description: 'Photos uploaded but profile save may have failed. Please refresh and check.',
            variant: 'destructive'
          });
        }
      }

    } catch (error: any) {
      console.error('Upload process failed:', error);
      setUploadState(prev => ({
        ...prev,
        error: error.message || 'Upload process failed'
      }));
      toast({
        title: 'Upload Error',
        description: 'An unexpected error occurred during upload.',
        variant: 'destructive'
      });
    } finally {
      setUploadState({
        isUploading: false,
        progress: 0,
        currentFile: null,
        error: null
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [user, photos, storageHealth.canWrite, maxPhotos, validateFile, updateProfileField, saveProfile, bucketName]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    uploadFiles(files);
  }, [uploadFiles]);

  // Remove photo
  const removePhoto = useCallback(async (index: number) => {
    if (uploadState.isUploading) return;
    
    const updatedPhotos = photos.filter((_, i) => i !== index);
    updateProfileField('photo_urls', updatedPhotos);
    
    const saveResult = await saveProfile(false);
    if (saveResult?.success) {
      toast({
        title: 'Photo Removed',
        description: 'Photo has been removed from your profile.'
      });
    }
  }, [photos, updateProfileField, saveProfile, uploadState.isUploading]);

  // Set primary photo
  const setPrimaryPhoto = useCallback(async (index: number) => {
    if (uploadState.isUploading || index === 0) return;
    
    const updatedPhotos = [...photos];
    const [selectedPhoto] = updatedPhotos.splice(index, 1);
    updatedPhotos.unshift(selectedPhoto);
    
    updateProfileField('photo_urls', updatedPhotos);
    
    const saveResult = await saveProfile(false);
    if (saveResult?.success) {
      toast({
        title: 'Primary Photo Updated',
        description: 'This photo will now appear first on your profile.'
      });
    }
  }, [photos, updateProfileField, saveProfile, uploadState.isUploading]);

  // Check storage health on mount and periodically
  useEffect(() => {
    if (user) {
      checkStorageHealth();
      // Recheck every 5 minutes
      const interval = setInterval(checkStorageHealth, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, checkStorageHealth]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span className="text-white">Loading photo manager...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Storage status indicator
  const getStorageStatus = () => {
    if (storageHealth.checking) {
      return { icon: Loader2, color: 'text-blue-400', message: 'Checking storage...', spinning: true };
    }
    if (!storageHealth.bucketExists) {
      return { icon: AlertTriangle, color: 'text-red-400', message: 'Storage bucket missing' };
    }
    if (!storageHealth.canWrite) {
      return { icon: AlertTriangle, color: 'text-yellow-400', message: 'Upload permissions unavailable' };
    }
    return { icon: CheckCircle, color: 'text-green-400', message: 'Storage ready' };
  };

  const storageStatus = getStorageStatus();

  return (
    <Card className="bg-gradient-to-br from-purple-600/90 to-pink-600/80 backdrop-blur-sm border-purple-400/50 hover:border-pink-300/70 transition-all duration-300 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Photo Manager</CardTitle>
              <p className="text-white/80 text-sm">
                Upload and manage your profile photos ({photos.length}/{maxPhotos})
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {storageStatus.spinning ? (
                <storageStatus.icon className={`w-4 h-4 ${storageStatus.color} animate-spin`} />
              ) : (
                <storageStatus.icon className={`w-4 h-4 ${storageStatus.color}`} />
              )}
              <span className={`text-xs ${storageStatus.color}`}>
                {storageStatus.message}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={checkStorageHealth}
              disabled={storageHealth.checking}
              className="text-white hover:bg-white/10 p-1"
            >
              <RefreshCw className={`w-3 h-3 ${storageHealth.checking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Storage Warning */}
        {(!storageHealth.bucketExists || !storageHealth.canWrite) && (
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-100 font-medium text-sm">Storage Configuration Required</p>
              <p className="text-yellow-200/80 text-xs mt-1">
                {!storageHealth.bucketExists 
                  ? 'The profile-photos storage bucket needs to be created in Supabase Dashboard.'
                  : 'Upload permissions are not properly configured. Please check RLS policies.'
                }
              </p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-blue-100 text-sm font-medium">
                Uploading {uploadState.currentFile}...
              </span>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
            <p className="text-blue-200/80 text-xs mt-1">
              {Math.round(uploadState.progress)}% complete
            </p>
          </div>
        )}

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden bg-white/10 group"
              >
                <img
                  src={url}
                  alt={`Profile ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.background = 'linear-gradient(45deg, #6b7280, #4b5563)';
                    target.alt = 'Image failed to load';
                  }}
                />
                
                {/* Primary indicator */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}
                
                {/* Photo actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPrimaryPhoto(index)}
                      disabled={uploadState.isUploading}
                      className="text-xs"
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                    disabled={uploadState.isUploading}
                    className="p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Section */}
        {photos.length < maxPhotos && storageHealth.canWrite && (
          <div className="space-y-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState.isUploading || !storageHealth.canWrite}
              className="w-full bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadState.isUploading ? 'Uploading...' : 'Add Photos'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(',')}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
            <div className="text-white/80 text-xs">
              <p className="font-medium mb-1">Photo Guidelines:</p>
              <ul className="space-y-1">
                <li>• Upload 1-{maxPhotos} high-quality photos (max {(maxFileSize / (1024 * 1024)).toFixed(0)}MB each)</li>
                <li>• Supported formats: {allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}</li>
                <li>• First photo becomes your primary profile picture</li>
                {photos.length === 0 && <li>• Start by uploading your best photo!</li>}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionPhotoUpload;