import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
const ProfileSaveButton = ({ onSave, isSaving }) => {
    return (<div className="sticky bottom-4">
      <Card className="border-purple-200 bg-white/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <Button onClick={onSave} disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
            {isSaving ? (<>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving Profile...
              </>) : (<>
                <Save className="h-5 w-5 mr-2"/>
                Save Complete Profile
              </>)}
          </Button>
        </CardContent>
      </Card>
    </div>);
};
export default ProfileSaveButton;
