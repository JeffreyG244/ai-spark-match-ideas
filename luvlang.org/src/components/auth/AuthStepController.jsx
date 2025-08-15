import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthFormHeader from './AuthFormHeader';
import ProfileManager from '@/components/ProfileManager';
const AuthStepController = ({ onBackToAuth }) => {
    return (<Card className="w-full max-w-4xl mx-auto">
      <AuthFormHeader title="Complete Your Luvlang Profile"/>
      <CardContent>
        <div className="mb-4">
          <Button variant="ghost" onClick={onBackToAuth} className="mb-4">
            ← Back to Authentication
          </Button>
        </div>
        <ProfileManager />
      </CardContent>
    </Card>);
};
export default AuthStepController;
