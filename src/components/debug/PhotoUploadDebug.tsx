import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const PhotoUploadDebug = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addDebugInfo = (message: string) => {
    console.log('[PhotoUploadDebug]', message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    addDebugInfo('File input changed');
    
    const files = event.target.files;
    if (!files || files.length === 0) {
      addDebugInfo('No files selected');
      return;
    }

    addDebugInfo(`Selected ${files.length} file(s)`);
    
    if (!user) {
      addDebugInfo('ERROR: No user authenticated');
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to upload photos.',
        variant: 'destructive'
      });
      return;
    }

    addDebugInfo(`User authenticated: ${user.id}`);
    setIsUploading(true);

    try {
      const file = files[0];
      addDebugInfo(`File details: ${file.name}, ${file.type}, ${Math.round(file.size / 1024)}KB`);

      // Test bucket access
      addDebugInfo('Testing bucket access...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        addDebugInfo(`ERROR listing buckets: ${bucketError.message}`);
        return;
      }
      
      const profilePhotoBucket = buckets?.find(b => b.name === 'profile-photos');
      addDebugInfo(`Profile photos bucket: ${profilePhotoBucket ? 'EXISTS' : 'NOT FOUND'}`);

      // Test upload
      const filename = `debug-test/${user.id}/${Date.now()}_${file.name}`;
      addDebugInfo(`Attempting upload with filename: ${filename}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        addDebugInfo(`UPLOAD ERROR: ${uploadError.message}`);
        toast({
          title: 'Upload Failed',
          description: uploadError.message,
          variant: 'destructive'
        });
      } else {
        addDebugInfo(`SUCCESS: File uploaded to ${uploadData?.path}`);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filename);
        
        addDebugInfo(`Public URL: ${publicUrl}`);
        
        toast({
          title: 'Upload Success',
          description: 'Test file uploaded successfully!',
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addDebugInfo(`CATCH ERROR: ${errorMessage}`);
      toast({
        title: 'Unexpected Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Info className="h-5 w-5" />
          Photo Upload Debug Tool
        </CardTitle>
        <p className="text-sm text-gray-600">
          This tool helps diagnose photo upload issues. Use it to test the upload functionality.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Testing Upload...' : 'Test Photo Upload'}
          </Button>
          
          <Button onClick={clearDebugInfo} variant="ghost" size="sm">
            Clear Log
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
          <h4 className="font-medium mb-2">Debug Log:</h4>
          {debugInfo.length === 0 ? (
            <p className="text-gray-500 text-sm">No debug information yet. Click "Test Photo Upload" to start.</p>
          ) : (
            <div className="space-y-1">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs font-mono text-gray-700">
                  {info}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p><strong>User:</strong> {user ? user.id : 'Not authenticated'}</p>
          <p><strong>Auth Status:</strong> {user ? 'Authenticated' : 'Not authenticated'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadDebug;