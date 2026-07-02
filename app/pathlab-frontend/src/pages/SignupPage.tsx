import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

export const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">PathLab Pro</CardTitle>
            <CardDescription>Select how you want to sign up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border rounded-lg p-6 text-center space-y-3">
                <h3 className="font-semibold text-lg">Register a User</h3>
                <p className="text-sm text-muted-foreground">Create a User with an admin account</p>
                <Link to="/register">
                  <Button variant="secondary" className="w-full">Continue</Button>
                </Link>
              </div>
              <div className="border rounded-lg p-6 text-center space-y-3">
                <h3 className="font-semibold text-lg">Register a Patient</h3>
                <p className="text-sm text-muted-foreground">Create a patient account</p>
                <Link to="/register/patient">
                  <Button variant="default" className="w-full">Continue</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;


