import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
const ProfileHeader = ({ completionPercentage }) => {
    return (<CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-purple-600"/>
            Secure Profile Manager
          </CardTitle>
          <CardDescription>
            Connected to database with enterprise-grade security
          </CardDescription>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{completionPercentage}%</div>
          <Badge className="bg-purple-100 text-purple-800">Complete</Badge>
        </div>
      </div>
    </CardHeader>);
};
export default ProfileHeader;
