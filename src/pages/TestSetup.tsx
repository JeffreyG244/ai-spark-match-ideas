import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UserCreationTest from '@/components/debug/UserCreationTest';

const TestSetup = () => {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl">System Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Use these tools to test user creation, storage, and profile functionality.
          </p>
        </CardContent>
      </Card>
      
      <UserCreationTest />
    </div>
  );
};

export default TestSetup;