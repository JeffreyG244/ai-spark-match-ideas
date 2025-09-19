import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MembershipLevel } from '@/hooks/useMembershipBadge';

interface MembershipRestrictedMessageProps {
  userLevel: MembershipLevel;
  recipientLevel: MembershipLevel;
  canSendMessage: boolean;
  permissionMessage?: string;
}

const MembershipRestrictedMessage: React.FC<MembershipRestrictedMessageProps> = ({
  userLevel,
  recipientLevel,
  canSendMessage,
  permissionMessage
}) => {
  const navigate = useNavigate();

  if (canSendMessage) return null;

  const getIcon = () => {
    if (userLevel === 'basic' || userLevel === 'premium') {
      return <Lock className="w-8 h-8 text-amber-500" />;
    }
    return <Shield className="w-8 h-8 text-blue-500" />;
  };

  const getTitle = () => {
    if (userLevel === 'basic' || userLevel === 'premium') {
      return 'Upgrade Required to Message';
    }
    return 'Messaging Restrictions';
  };

  const getDescription = () => {
    if (userLevel === 'basic' || userLevel === 'premium') {
      return (
        <>
          As a {userLevel === 'basic' ? 'Basic' : 'Standard'} member, you can only send messages to Executive and C-Suite members. 
          {recipientLevel === 'executive' || recipientLevel === 'c_suite' 
            ? ' This member is available for messaging!'
            : ' Upgrade to Executive or C-Suite to message all members.'
          }
        </>
      );
    }
    return permissionMessage || 'Unable to send message at this time.';
  };

  const getUpgradeText = () => {
    if (userLevel === 'basic') return 'Upgrade to Executive';
    if (userLevel === 'premium') return 'Upgrade to Executive';
    return 'Learn More';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-slate-50 to-purple-50 border-purple-200 text-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 bg-white rounded-full shadow-lg">
          {getIcon()}
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            {getTitle()}
          </h3>
          <p className="text-slate-600 text-sm leading-relaxed mb-4">
            {getDescription()}
          </p>
        </div>

        {(userLevel === 'basic' || userLevel === 'premium') && (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-amber-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Unlock unlimited messaging</span>
              <Sparkles className="w-4 h-4" />
            </div>
            
            <Button 
              onClick={() => navigate('/membership')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Crown className="w-4 h-4 mr-2" />
              {getUpgradeText()}
            </Button>
          </div>
        )}

        <div className="text-xs text-slate-500 mt-2">
          Current plan: {userLevel === 'basic' ? 'Basic' : userLevel === 'premium' ? 'Standard' : userLevel === 'executive' ? 'Executive' : 'C-Suite Premium'}
        </div>
      </div>
    </Card>
  );
};

export default MembershipRestrictedMessage;