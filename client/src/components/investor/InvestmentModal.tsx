import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { StartupData } from '@/firebase/firestore';
import { createTransaction } from '@/firebase/firestore';
import { convertUSDToINR, validateUPITransactionId } from '@/lib/upi';
import { convertUsdToEth, sendTransaction, estimateGasFee, isMetaMaskInstalled } from '@/lib/metamask';

interface InvestmentModalProps {
  startup: StartupData;
  isOpen: boolean;
  onClose: () => void;
}

const InvestmentModal = ({ startup, isOpen, onClose }: InvestmentModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState<'metamask' | 'upi'>('metamask');
  const [amount, setAmount] = useState<string>('1000');
  const [ethAmount, setEthAmount] = useState<string>('0');
  const [inrAmount, setInrAmount] = useState<string>('0');
  const [gasFee, setGasFee] = useState<string>('0.003');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Check if MetaMask is installed
  const [metaMaskAvailable, setMetaMaskAvailable] = useState<boolean>(false);
  
  useEffect(() => {
    setMetaMaskAvailable(isMetaMaskInstalled());
    
    const calculateEthAmount = async () => {
      try {
        if (amount) {
          const eth = await convertUsdToEth(parseFloat(amount));
          setEthAmount(eth.toFixed(4));
          
          const gas = await estimateGasFee();
          setGasFee(gas);
        }
      } catch (error) {
        console.error('Error calculating ETH amount:', error);
      }
    };
    
    const calculateInrAmount = async () => {
      try {
        if (amount) {
          const inr = await convertUSDToINR(parseFloat(amount));
          setInrAmount(inr.toString());
        }
      } catch (error) {
        console.error('Error calculating INR amount:', error);
      }
    };
    
    if (isOpen) {
      calculateEthAmount();
      calculateInrAmount();
    }
  }, [isOpen, amount]);
  
  const resetForm = () => {
    setAmount('1000');
    setTransactionId('');
    setPaymentMethod('metamask');
    setIsSubmitting(false);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to invest.",
        variant: "destructive",
      });
      return;
    }
    
    if (!startup.id) {
      toast({
        title: "Error",
        description: "Invalid startup information.",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid investment amount.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (paymentMethod === 'metamask') {
        if (!metaMaskAvailable) {
          toast({
            title: "MetaMask Not Found",
            description: "Please install MetaMask to continue with this payment method.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Create transaction record first with pending status
        const transaction = await createTransaction({
          investorId: user.uid,
          investorName: user.displayName || 'Anonymous',
          startupId: startup.id,
          startupName: startup.name,
          amount: parseFloat(amount),
          method: 'metamask',
          status: 'pending',
        });
        
        // Send the actual blockchain transaction
        await sendTransaction(
          user.walletAddress as string, // Using user's wallet as startup address for demo
          ethAmount,
          async (txHash) => {
            // On success, update transaction status
            await createTransaction({
              investorId: user.uid,
              investorName: user.displayName || 'Anonymous',
              startupId: startup.id,
              startupName: startup.name,
              amount: parseFloat(amount),
              method: 'metamask',
              status: 'completed',
              transactionId: txHash,
              walletAddress: user.walletAddress,
            });
            
            toast({
              title: "Investment Successful",
              description: "Your investment has been processed successfully.",
            });
            
            handleClose();
          },
          (error) => {
            console.error('Transaction error:', error);
            toast({
              title: "Transaction Failed",
              description: error.message || "There was an error processing your transaction.",
              variant: "destructive",
            });
            setIsSubmitting(false);
          }
        );
      } else if (paymentMethod === 'upi') {
        // Validate UPI transaction ID
        if (!validateUPITransactionId(transactionId)) {
          toast({
            title: "Invalid Transaction ID",
            description: "Please enter a valid UPI transaction ID.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // Create transaction record
        await createTransaction({
          investorId: user.uid,
          investorName: user.displayName || 'Anonymous',
          startupId: startup.id,
          startupName: startup.name,
          amount: parseFloat(amount),
          method: 'upi',
          status: 'completed',
          transactionId: transactionId,
        });
        
        toast({
          title: "Investment Recorded",
          description: "Your UPI investment has been recorded successfully.",
        });
        
        handleClose();
      }
    } catch (error: any) {
      console.error('Investment error:', error);
      toast({
        title: "Investment Failed",
        description: error.message || "There was an error processing your investment.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invest in {startup.name}</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to invest in {startup.name}. Your investment will help {startup.pitch?.substring(0, 100)}...
          </DialogDescription>
        </DialogHeader>
        
        <div className="mb-5">
          <div className="w-full bg-gray-200 dark:bg-dark-400 rounded-full h-2.5 mb-2">
            <div 
              className="bg-primary-500 h-2.5 rounded-full" 
              style={{ width: `${Math.min(100, (startup.fundingRaised / startup.fundingGoal) * 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>${startup.fundingRaised.toLocaleString()} raised</span>
            <span>${startup.fundingGoal.toLocaleString()} goal</span>
          </div>
        </div>
        
        {/* Payment Method Selection */}
        <div className="mb-6">
          <Label>Select Payment Method</Label>
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={(value) => setPaymentMethod(value as 'metamask' | 'upi')} 
            className="mt-2 space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="metamask" 
                id="metamask" 
                disabled={!metaMaskAvailable}
              />
              <Label htmlFor="metamask" className="flex items-center cursor-pointer">
                <svg className="h-6 w-6 mr-2 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M6.5 12.5L8 14L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.5 9L12 14.5L9 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                MetaMask
                {!metaMaskAvailable && (
                  <span className="text-sm text-red-500 ml-2">(Not installed)</span>
                )}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="upi" id="upi" />
              <Label htmlFor="upi" className="flex items-center cursor-pointer">
                <svg className="h-6 w-6 mr-2 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 13H15M12 10V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                UPI
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        {/* MetaMask Form */}
        {paymentMethod === 'metamask' && (
          <div className="mb-6 space-y-4">
            <div>
              <Label htmlFor="amount">Investment Amount (USD)</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                </div>
                <Input
                  type="number"
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-dark-200 rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Equivalent ETH:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">≈ {ethAmount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gas Fee (estimated):</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">≈ {gasFee} ETH</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>By investing, you agree to the Terms & Conditions and have reviewed all startup documentation.</p>
            </div>
          </div>
        )}
        
        {/* UPI Form */}
        {paymentMethod === 'upi' && (
          <div className="mb-6 space-y-4">
            <div>
              <Label htmlFor="upi-amount">Investment Amount (INR)</Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₹</span>
                </div>
                <Input
                  type="number"
                  id="upi-amount"
                  value={inrAmount}
                  onChange={(e) => {
                    setInrAmount(e.target.value);
                    // Roughly convert back to USD for tracking
                    setAmount((parseFloat(e.target.value) / 75).toFixed(2));
                  }}
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Approximately ${amount} USD</p>
            </div>
            
            <div>
              <Label>Scan QR Code</Label>
              <div className="bg-white dark:bg-dark-200 p-4 rounded-md flex justify-center">
                <img 
                  src={startup.qrCodeUrl} 
                  alt="UPI QR Code"
                  className="h-48 w-48 object-contain"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="upi-id">Startup UPI ID</Label>
              <div className="flex mt-1">
                <Input
                  type="text"
                  id="upi-id"
                  value={startup.upiId}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  className="ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(startup.upiId);
                    toast({
                      title: "Copied!",
                      description: "UPI ID copied to clipboard",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="transaction-id">Transaction ID (After Payment)</Label>
              <Input
                type="text"
                id="transaction-id"
                placeholder="Enter transaction ID after payment"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>1. Scan QR code or use UPI ID to make payment in your banking app</p>
              <p>2. Enter the transaction ID or reference number from your payment</p>
              <p>3. Click "Confirm Investment" to complete your investment</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm Investment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentModal;
