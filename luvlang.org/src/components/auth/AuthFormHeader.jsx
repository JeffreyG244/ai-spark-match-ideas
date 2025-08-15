import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
const AuthFormHeader = ({ title = "Welcome Back to Luvlang!" }) => {
    return (<CardHeader>
      <CardTitle className="flex items-center gap-2">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Heart className="h-6 w-6 text-white fill-white"/>
        </div>
        {title}
      </CardTitle>
    </CardHeader>);
};
export default AuthFormHeader;
