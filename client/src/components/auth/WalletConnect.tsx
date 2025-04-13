import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { connectWallet, getWalletAddress, listenForAccountChanges } from '@/lib/metamask';
import { AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { updateUserWalletAddress } from '@/firebase/auth';

interface WalletConnectProps {
  onSuccess?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

const WalletConnect = ({ onSuccess, onSkip, showSkip = true }: WalletConnectProps) => {
  const { user, updateUserData } = useAuth();
  const { toast } = useToast();
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
  
  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask) {
      setMetaMaskInstalled(true);
      
      // Check if wallet is already connected
      const checkWalletConnection = async () => {
        const address = await getWalletAddress();
        setWalletAddress(address);
      };
      
      checkWalletConnection();
      
      // Listen for account changes
      const unsubscribe = listenForAccountChanges((accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, []);
  
  // Check if user already has a wallet connected
  useEffect(() => {
    if (user && user.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);
  
  const handleConnectWallet = async () => {
    if (!metaMaskInstalled) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask browser extension to connect your wallet.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsConnecting(true);
      const address = await connectWallet();
      setWalletAddress(address);
      
      // Update user data in Firebase if user is authenticated
      if (user && user.uid) {
        await updateUserWalletAddress(user.uid, address);
        await updateUserData(); // Refresh user data in context
      }
      
      toast({
        title: 'Wallet Connected',
        description: 'Your MetaMask wallet has been successfully connected.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect your wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to enable crypto investments and receive funds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!metaMaskInstalled && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>MetaMask Not Detected</AlertTitle>
            <AlertDescription>
              Please install the{' '}
              <a 
                href="https://metamask.io/download.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                MetaMask browser extension
              </a>{' '}
              to continue.
            </AlertDescription>
          </Alert>
        )}
        
        {walletAddress ? (
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-2" />
              <div>
                <h3 className="font-medium text-green-800 dark:text-green-300">Wallet Connected</h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {`${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 border rounded-lg flex flex-col items-center justify-center space-y-4">
            <Wallet className="h-16 w-16 text-primary-400" />
            <div className="text-center">
              <h3 className="font-medium text-lg mb-1">No Wallet Connected</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Connect your MetaMask wallet to enable crypto transactions
              </p>
              <Button 
                onClick={handleConnectWallet} 
                disabled={isConnecting || !metaMaskInstalled}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-current"></div>
                    Connecting...
                  </>
                ) : (
                  'Connect MetaMask'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {showSkip && (
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
        )}
        {walletAddress && onSuccess && (
          <Button onClick={onSuccess}>
            Continue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WalletConnect;
