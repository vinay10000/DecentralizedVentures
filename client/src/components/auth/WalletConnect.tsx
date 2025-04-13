import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserWalletAddress } from '@/firebase/auth';
import { 
  isMetaMaskInstalled, 
  connectMetaMask, 
  getWalletAddress,
  addAccountChangedListener,
  removeAccountChangedListener
} from '@/lib/metamask';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const { user, updateUserData } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Initialize wallet status on component mount
  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    } else {
      // Check if already connected to MetaMask
      checkWalletConnection();
    }
    
    // Add event listener for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setWalletAddress(null);
      } else {
        // User changed account
        setWalletAddress(accounts[0]);
        
        // Update wallet in the database if logged in
        if (user) {
          syncWalletWithDB(accounts[0]);
        }
      }
    };
    
    addAccountChangedListener(handleAccountsChanged);
    
    // Cleanup listener on unmount
    return () => {
      removeAccountChangedListener(handleAccountsChanged);
    };
  }, [user]);

  // Check if wallet is already connected
  const checkWalletConnection = async () => {
    try {
      const address = await getWalletAddress();
      setWalletAddress(address);
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  // Connect to MetaMask
  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: 'MetaMask Not Installed',
        description: 'Please install MetaMask to connect your wallet.',
        variant: 'destructive',
      });
      
      // Open MetaMask installation page
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }
    
    try {
      setIsConnecting(true);
      const address = await connectMetaMask();
      
      if (address) {
        setWalletAddress(address);
        
        // If user is logged in, sync wallet with database
        if (user) {
          await syncWalletWithDB(address);
        }
        
        // Call onConnect callback if provided
        if (onConnect) {
          onConnect(address);
        }
        
        toast({
          title: 'Wallet Connected',
          description: 'Your MetaMask wallet has been successfully connected.',
        });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to MetaMask',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Sync wallet address with Firebase database
  const syncWalletWithDB = async (address: string) => {
    if (!user) return;
    
    try {
      setIsSyncing(true);
      
      // Update user's wallet address in Firestore
      await updateUserWalletAddress(user.uid, address);
      
      // Update local user data
      await updateUserData();
      
      toast({
        title: 'Wallet Synced',
        description: 'Your wallet address has been saved to your profile.',
      });
    } catch (error) {
      console.error('Error syncing wallet with database:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to save your wallet address. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Connection</CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to invest using cryptocurrency
        </CardDescription>
      </CardHeader>
      <CardContent>
        {walletAddress ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" 
                alt="MetaMask" 
                className="w-6 h-6" 
              />
              <span className="font-mono">{formatAddress(walletAddress)}</span>
              <Badge variant="outline" className="ml-2">Connected</Badge>
            </div>
            
            {user && walletAddress !== user.walletAddress && (
              <Button 
                size="sm" 
                onClick={() => syncWalletWithDB(walletAddress)}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync to Profile'}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">
              No wallet connected. Connect your MetaMask wallet to make crypto investments.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {!walletAddress ? (
          <Button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleConnectWallet}
            className="w-full"
          >
            Change Wallet
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WalletConnect;