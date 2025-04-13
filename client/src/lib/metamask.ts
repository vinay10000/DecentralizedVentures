import { ethers } from 'ethers';

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && 
    typeof window.ethereum !== 'undefined' && 
    window.ethereum.isMetaMask;
};

/**
 * Convert USD amount to ETH
 * Note: In a production environment, this would use a real price feed like Chainlink
 */
export const convertUsdToEth = async (usdAmount: number): Promise<number> => {
  try {
    // For demonstration purposes, we're using a static exchange rate
    // In a real application, you would fetch this from an API
    const ethPriceInUsd = 2500; // Example: 1 ETH = $2500 USD
    return usdAmount / ethPriceInUsd;
  } catch (error) {
    console.error('Error converting USD to ETH:', error);
    throw error;
  }
};

/**
 * Estimate gas fee for a transaction
 * Note: In a production environment, this would use the actual network conditions
 */
export const estimateGasFee = async (): Promise<string> => {
  try {
    if (!isMetaMaskInstalled()) {
      return '0.003'; // Default gas fee estimate in ETH
    }
    
    const provider = getProvider();
    
    if (!provider) {
      return '0.003';
    }
    
    // Get current gas price
    const gasPrice = await provider.getFeeData();
    
    // Calculate gas fee for a typical ETH transfer (21000 gas units)
    if (gasPrice.gasPrice) {
      const gasFee = ethers.formatEther(gasPrice.gasPrice * BigInt(21000));
      return gasFee;
    }
    
    return '0.003'; // Fallback estimate
  } catch (error) {
    console.error('Error estimating gas fee:', error);
    return '0.003'; // Fallback estimate on error
  }
};

/**
 * Get the current Ethereum provider
 */
export const getProvider = (): ethers.BrowserProvider | null => {
  if (!isMetaMaskInstalled()) {
    return null;
  }
  
  return new ethers.BrowserProvider(window.ethereum);
};

/**
 * Connect to MetaMask
 */
export const connectMetaMask = async (): Promise<string | null> => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }
    
    const provider = getProvider();
    
    if (!provider) {
      throw new Error('Failed to get Ethereum provider');
    }
    
    // Request account access
    const accounts = await provider.send('eth_requestAccounts', []);
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
};

/**
 * Get user's wallet address
 */
export const getWalletAddress = async (): Promise<string | null> => {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }
    
    const provider = getProvider();
    
    if (!provider) {
      return null;
    }
    
    const accounts = await provider.send('eth_accounts', []);
    
    if (accounts.length === 0) {
      return null;
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
};

/**
 * Get Ethereum network chain ID
 */
export const getChainId = async (): Promise<string | null> => {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }
    
    const provider = getProvider();
    
    if (!provider) {
      return null;
    }
    
    const { chainId } = await provider.getNetwork();
    
    return chainId.toString();
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
};

/**
 * Get ETH balance in wallet
 */
export const getBalance = async (address: string): Promise<string | null> => {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }
    
    const provider = getProvider();
    
    if (!provider) {
      return null;
    }
    
    const balance = await provider.getBalance(address);
    
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return null;
  }
};

/**
 * Send ETH to an address
 */
export const sendTransaction = async (
  to: string,
  amount: string,
  onHash?: (hash: string) => void
): Promise<string> => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }
    
    const provider = getProvider();
    
    if (!provider) {
      throw new Error('Failed to get Ethereum provider');
    }
    
    const signer = await provider.getSigner();
    
    // Convert amount from ETH to wei
    const amountWei = ethers.parseEther(amount);
    
    // Prepare transaction
    const tx = {
      to,
      value: amountWei
    };
    
    // Send transaction
    const transaction = await signer.sendTransaction(tx);
    
    // If a callback for tx hash is provided, call it
    if (onHash) {
      onHash(transaction.hash);
    }
    
    // Wait for transaction to be mined
    const receipt = await transaction.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed');
    }
    
    return transaction.hash;
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw error;
  }
};

// Add event listener for account changes
export const addAccountChangedListener = (callback: (accounts: string[]) => void) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  
  window.ethereum.on('accountsChanged', callback);
};

// Add event listener for chain changes
export const addChainChangedListener = (callback: (chainId: string) => void) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  
  window.ethereum.on('chainChanged', callback);
};

// Remove event listener for account changes
export const removeAccountChangedListener = (callback: (accounts: string[]) => void) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  
  window.ethereum.removeListener('accountsChanged', callback);
};

// Remove event listener for chain changes
export const removeChainChangedListener = (callback: (chainId: string) => void) => {
  if (!isMetaMaskInstalled()) {
    return;
  }
  
  window.ethereum.removeListener('chainChanged', callback);
};

// Add Ethereum interface to Window
declare global {
  interface Window {
    ethereum?: {
      isMetaMask: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: any) => void;
      removeListener: (event: string, callback: any) => void;
    };
  }
}