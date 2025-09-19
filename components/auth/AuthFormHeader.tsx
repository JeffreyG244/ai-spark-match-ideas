
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/ui/logo';

interface AuthFormHeaderProps {
  title?: string;
}

const AuthFormHeader = ({ title = "Welcome Back to Luvlang!" }: AuthFormHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <Logo size="sm" showText={false} />
        {title}
      </CardTitle>
    </CardHeader>
  );
};

export default AuthFormHeader;
