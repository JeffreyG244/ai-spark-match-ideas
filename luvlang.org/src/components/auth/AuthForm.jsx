import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthentication } from '@/hooks/useAuthentication';
const AuthForm = ({ mode, onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const { loading, error, signUp, signIn } = useAuthentication();
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (mode === 'signup') {
            await signUp(email, password, confirmPassword, firstName, lastName);
        }
        else {
            await signIn(email, password);
        }
    };
    return (<Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {mode === 'login' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (<div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} maxLength={50}/>
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} maxLength={50}/>
              </div>
            </div>)}
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} maxLength={320}/>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} minLength={6} maxLength={128}/>
          </div>

          {mode === 'signup' && (<div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} minLength={6} maxLength={128}/>
            </div>)}

          {error && (<Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>)}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button type="button" onClick={onToggleMode} className="text-sm text-blue-600 hover:underline" disabled={loading}>
            {mode === 'login'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
          </button>
        </div>
      </CardContent>
    </Card>);
};
export default AuthForm;
