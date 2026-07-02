import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { authApi } from '@/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const ResetPasswordPage: React.FC = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    if (!token) {
      setIsLoading(false);
      setError('Missing token');
      return;
    }
    if (password.length < 8) {
      setIsLoading(false);
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setIsLoading(false);
      setError('Passwords do not match');
      return;
    }
    try {
      const resp = await authApi.resetPassword({ token, newPassword: password });
      setSuccess(resp.message || 'Password updated');
      setTimeout(()=> navigate('/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)} required disabled={isLoading} />
              </div>
              {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
              {success && (<Alert><AlertDescription>{success}</AlertDescription></Alert>)}
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading? 'Updating...' : 'Update Password'}</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;


