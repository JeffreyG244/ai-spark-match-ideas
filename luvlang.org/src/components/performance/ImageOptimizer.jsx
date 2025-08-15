import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
const ImageOptimizer = ({ onImageOptimized, maxWidth = 800, maxHeight = 600, quality = 0.8, acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'] }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const fileInputRef = useRef(null);
    const optimizeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    const aspectRatio = width / height;
                    if (width > height) {
                        width = Math.min(width, maxWidth);
                        height = width / aspectRatio;
                    }
                    else {
                        height = Math.min(height, maxHeight);
                        width = height * aspectRatio;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (blob) {
                        const optimizedFile = new File([blob], file.name, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(optimizedFile);
                    }
                    else {
                        reject(new Error('Failed to optimize image'));
                    }
                }, 'image/webp', quality);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    };
    const handleFileSelect = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0)
            return;
        const file = files[0];
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
            toast({
                title: 'Invalid File Type',
                description: `Please select a valid image file (${acceptedTypes.join(', ')})`,
                variant: 'destructive'
            });
            return;
        }
        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            toast({
                title: 'File Too Large',
                description: 'Please select an image smaller than 10MB',
                variant: 'destructive'
            });
            return;
        }
        setIsOptimizing(true);
        try {
            const optimizedFile = await optimizeImage(file);
            const originalSize = (file.size / 1024 / 1024).toFixed(2);
            const optimizedSize = (optimizedFile.size / 1024 / 1024).toFixed(2);
            const savings = ((1 - optimizedFile.size / file.size) * 100).toFixed(1);
            toast({
                title: 'Image Optimized',
                description: `Reduced from ${originalSize}MB to ${optimizedSize}MB (${savings}% savings)`,
            });
            onImageOptimized(optimizedFile, file);
        }
        catch (error) {
            console.error('Image optimization failed:', error);
            toast({
                title: 'Optimization Failed',
                description: 'Failed to optimize image. Using original file.',
                variant: 'destructive'
            });
        }
        finally {
            setIsOptimizing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    return (<div>
      <input ref={fileInputRef} type="file" accept={acceptedTypes.join(',')} onChange={handleFileSelect} className="hidden"/>
      
      <Button onClick={() => fileInputRef.current?.click()} disabled={isOptimizing} className="w-full">
        {isOptimizing ? (<>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            Optimizing...
          </>) : (<>
            <ImageIcon className="mr-2 h-4 w-4"/>
            Select & Optimize Image
          </>)}
      </Button>
    </div>);
};
export default ImageOptimizer;
