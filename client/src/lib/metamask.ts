import { ethers } from "ethers";

export interface MetaMaskTransaction {
  from: string;
  to: string;
  value: string; // Value in wei
  data?: string;
}

export interface MetaMaskProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, listener: (...args: any[]) => void) => void;
  removeListener: (eventName: string, listener: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: MetaMaskProvider;
  }
}

export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && window.ethereum !== undefined && window.ethereum.isMetaMask === true;
};

export const connectWallet = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  try {
    const accounts = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length === 0) {
      throw new Error("No accounts found. Please check your MetaMask configuration.");
    }

    return accounts[0]; // Return the connected wallet address
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw error;
  }
};

export const getWalletAddress = async (): Promise<string | null> => {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum!.request({
      method: "eth_accounts",
    });

    if (accounts.length === 0) {
      return null;
    }

    return accounts[0];
  } catch (error) {
    console.error("Error getting wallet address:", error);
    return null;
  }
};

export const sendTransaction = async (
  to: string,
  amount: string, // Amount in ETH
  onSuccess?: (transactionHash: string) => void,
  onError?: (error: Error) => void
): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  try {
    // Convert ETH to Wei
    const valueInWei = ethers.utils.parseEther(amount).toString();

    // Prepare transaction
    const transaction: MetaMaskTransaction = {
      from: await getWalletAddress() as string,
      to,
      value: valueInWei,
    };

    // Send transaction
    const transactionHash = await window.ethereum!.request({
      method: "eth_sendTransaction",
      params: [transaction],
    });

    if (onSuccess) {
      onSuccess(transactionHash);
    }

    return transactionHash;
  } catch (error: any) {
    console.error("Error sending transaction:", error);
    
    if (onError) {
      onError(error);
    }
    
    throw error;
  }
};

export const listenForAccountChanges = (
  onAccountsChanged: (accounts: string[]) => void
): (() => void) => {
  if (!isMetaMaskInstalled()) {
    return () => {};
  }

  const handleAccountsChanged = (accounts: string[]) => {
    onAccountsChanged(accounts);
  };

  window.ethereum!.on("accountsChanged", handleAccountsChanged);

  // Return a function to remove the listener
  return () => {
    window.ethereum!.removeListener("accountsChanged", handleAccountsChanged);
  };
};

export const getEthToUsdRate = async (): Promise<number> => {
  try {
    // This is a simplified example. In production, you'd use a real price oracle
    // or API like CoinGecko or CryptoCompare
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await response.json();
    return data.ethereum.usd;
  } catch (error) {
    console.error("Error fetching ETH to USD rate:", error);
    // Fallback to a reasonable recent value if the API fails
    return 3500;
  }
};

export const convertUsdToEth = async (usdAmount: number): Promise<number> => {
  const ethToUsdRate = await getEthToUsdRate();
  return usdAmount / ethToUsdRate;
};

export const convertEthToUsd = async (ethAmount: number): Promise<number> => {
  const ethToUsdRate = await getEthToUsdRate();
  return ethAmount * ethToUsdRate;
};

export const estimateGasFee = async (): Promise<string> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed.");
  }

  try {
    // Get current gas price
    const gasPrice = await window.ethereum!.request({
      method: "eth_gasPrice",
    });

    // Convert from hex to decimal (wei)
    const gasPriceInWei = parseInt(gasPrice, 16);

    // Estimate gas for a typical ETH transfer (21000 gas units)
    const gasLimit = 21000;
    const gasFeeInWei = gasPriceInWei * gasLimit;

    // Convert to ETH with 6 decimal places
    const gasFeeInEth = ethers.utils.formatEther(gasFeeInWei.toString());
    return parseFloat(gasFeeInEth).toFixed(6);
  } catch (error) {
    console.error("Error estimating gas fee:", error);
    return "0.003"; // Fallback to a reasonable recent value
  }
};
