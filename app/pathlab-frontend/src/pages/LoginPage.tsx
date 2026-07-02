import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'PATIENT' | 'USER'>('USER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!email.trim()) errors.email = 'Email is required';
    else if (!emailRegex.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    return errors;
  };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setIsLoading(true);
//   setError('');
//   const errors = validate();
//   if (Object.keys(errors).length > 0) {
//     setFieldErrors(errors);
//     setIsLoading(false);
//     return;
//   }

//   try {
//     const { userType: loggedInType } = await login(email, password, userType);

//     if (loggedInType === 'PATIENT') {
//       navigate('/patient-client', { replace: true });
//     } else if (loggedInType === 'USER') {
//       navigate('/dashboard', { replace: true }); // <-- change this
//     } else {
//       navigate('/dashboard', { replace: true }); // fallback
//     }
//   } catch (error: any) {
//     setError(error.message || 'Login failed. Please try again.');
//   } finally {
//     setIsLoading(false);
//   }
// };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  const errors = validate();
  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    setIsLoading(false);
    return;
  }

  try {
    const { userType: loggedInType } = await login(email, password, userType);

    if (loggedInType === 'PATIENT') {
      navigate('/patient-client', { replace: true });
    } else if (loggedInType === 'USER') {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/dashboard', { replace: true }); // fallback
    }
  } catch (err: any) {
    // 👇 only show friendly error messages
    if (err?.response?.status === 400) {
      setError("Invalid input or user type.");
      // Sonner toast
      import('sonner').then(({ toast }) => {
        toast.error("Invalid input or user type", {
          description: "Please check your email, password, or selected role.",
        });
      });
    } else {
      setError("Invalid input or user type.");
      import('sonner').then(({ toast }) => {
        toast.error("Invalid input or user type", {
          description: "Please check your email, password, or selected role.",
        });
      });
    }
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              PathLab Pro
            </CardTitle>
            <CardDescription>
              Sign in to your account to access the lab management system
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setFieldErrors(prev => ({ ...prev, email: validate().email }))}
                  required
                  disabled={isLoading}
                />
                {fieldErrors.email && <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setFieldErrors(prev => ({ ...prev, password: validate().password }))}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  {fieldErrors.password && <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>User Type</Label>
                <div className="flex gap-3">
                  <Button type="button" variant={userType === 'USER' ? 'default' : 'outline'} onClick={() => setUserType('USER')} disabled={isLoading}>Staff</Button>
                  <Button type="button" variant={userType === 'PATIENT' ? 'default' : 'outline'} onClick={() => setUserType('PATIENT')} disabled={isLoading}>Patient</Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>


              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};