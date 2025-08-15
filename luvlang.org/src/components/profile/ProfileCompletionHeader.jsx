import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
const ProfileCompletionHeader = ({ completionPercentage }) => {
    return (<Card className="border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-purple-800">Complete Your Profile</h2>
            <p className="text-gray-600">Create an authentic profile that attracts meaningful connections</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{completionPercentage}%</div>
            <p className="text-sm text-gray-500">Complete</p>
          </div>
        </div>
        
        <Progress value={completionPercentage} className="mb-4"/>
        
        {completionPercentage === 100 && (<div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5"/>
            <span className="font-medium">Profile Complete! Ready to find matches.</span>
          </div>)}
      </CardContent>
    </Card>);
};
export default ProfileCompletionHeader;
