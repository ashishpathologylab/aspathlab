import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { authApi } from '@/api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const VerifyEmailPage: React.FC = () => {
  const query = useQuery();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const token = query.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing token');
      return;
    }
    (async () => {
      setStatus('verifying');
      try {
        const resp = await authApi.verifyEmail(token);
        setStatus('success');
        setMessage(resp?.message || 'Email verified successfully');
      } catch (err: any) {
        setStatus('error');
        setMessage(err?.message || 'Verification failed');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Email Verification</CardTitle>
            <CardDescription>We are verifying your email address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'verifying' && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />}
            {status !== 'verifying' && (
              <Alert variant={status === 'success' ? undefined : 'destructive'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Link to="/login"><Button className="w-full">Go to Login</Button></Link>
              <Link to="/"><Button variant="outline" className="w-full">Home</Button></Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;


