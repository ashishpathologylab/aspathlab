import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { authApi } from '@/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'PATIENT' | 'USER'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const resp = await authApi.forgotPassword({ email, userType });
      setSuccess(resp.message || 'If the email exists, a reset link has been sent.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label>User Type</Label>
                <div className="flex gap-3">
                  <Button type="button" variant={userType==='USER'?'default':'outline'} onClick={()=>setUserType('USER')} disabled={isLoading}>Staff</Button>
                  <Button type="button" variant={userType==='PATIENT'?'default':'outline'} onClick={()=>setUserType('PATIENT')} disabled={isLoading}>Patient</Button>
                </div>
              </div>
              {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
              {success && (<Alert><AlertDescription>{success}</AlertDescription></Alert>)}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading? 'Sending...' : 'Send Reset Link'}</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;


