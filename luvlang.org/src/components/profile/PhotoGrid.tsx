
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Star } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface PhotoGridProps {
  photos: Photo[];
  onRemovePhoto: (photoId: string) => void;
  onSetPrimaryPhoto: (photoId: string) => void;
}

const PhotoGrid = ({ photos, onRemovePhoto, onSetPrimaryPhoto }: PhotoGridProps) => {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={photo.url}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Primary Badge */}
          {photo.isPrimary && (
            <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Star className="h-3 w-3" />
              Main
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            {!photo.isPrimary && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onSetPrimaryPhoto(photo.id)}
                className="text-xs"
              >
                <Star className="h-3 w-3 mr-1" />
                Make Main
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onRemovePhoto(photo.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
