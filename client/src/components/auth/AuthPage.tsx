import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const AuthPage = () => {
  const [location, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isMetaMaskConnecting, setIsMetaMaskConnecting] = useState(false);

  // Extract 'tab' query parameter
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';

  const handleMetaMaskConnect = async () => {
    try {
      setIsMetaMaskConnecting(true);
      setError(null);
      
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install it to continue.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check if any accounts were returned
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in MetaMask and try again.');
      }
      
      // Successfully connected to MetaMask
      // In a real app we'd trigger a wallet sign-in flow here
      console.log('Connected to MetaMask', accounts[0]);
      
      // Redirect to a registration/profile page where the user can complete their profile
      setLocation('/auth/complete-profile?wallet=' + accounts[0]);
      
    } catch (error) {
      console.error('MetaMask connection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect to MetaMask');
    } finally {
      setIsMetaMaskConnecting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">StartupVest</h1>
          <p className="text-gray-500 dark:text-gray-400">Connect, invest, and grow together</p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <SignInForm setError={setError} />
              </TabsContent>
              <TabsContent value="signup">
                <SignUpForm setError={setError} />
              </TabsContent>
            </Tabs>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center" 
                  type="button"
                  onClick={handleMetaMaskConnect}
                  disabled={isMetaMaskConnecting}
                >
                  {isMetaMaskConnecting ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  ) : (
                    <img 
                      src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                      alt="MetaMask" 
                      className="mr-2 h-5 w-5"
                    />
                  )}
                  Connect MetaMask Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;

// Extend Window interface to include ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}