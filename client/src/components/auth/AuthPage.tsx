import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { FaGoogle } from 'react-icons/fa';
import { signInWithGoogle } from '@/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      toast({
        title: "Success",
        description: "You have successfully signed in with Google",
      });
      setLocation('/investor/dashboard'); // Default to investor dashboard after Google sign-in
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome to StartupVest</CardTitle>
            <CardDescription>
              Connect, invest, and grow with innovative startups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm onSuccess={() => setLocation(window.history.state?.from || '/')} />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm onSuccess={() => setActiveTab('signin')} />
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button" 
              className="w-full" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <FaGoogle className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <div>
              By continuing, you agree to our{' '}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </a>
              .
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
