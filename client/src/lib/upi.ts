// UPI transaction handling
export interface UPIDetails {
  id: string;
  name: string;
  qrCode: string;
}

export interface UPITransactionRequest {
  amount: number;
  transactionId: string;
  description?: string;
  startupId: string;
  startupName: string;
  investorId: string;
  investorName: string;
}

// Function to validate UPI transaction ID
export const validateUPITransactionId = (transactionId: string): boolean => {
  // UPI Transaction IDs usually follow some pattern
  // This is a simplified validation - in a real app, you might want to check against a list of valid prefixes
  // or implement a more robust validation
  
  if (!transactionId || transactionId.length < 8) {
    return false;
  }
  
  // Check if the transaction ID matches common patterns
  // For example, UPI IDs often start with specific prefixes and have alphanumeric characters
  const regex = /^[a-zA-Z0-9]{8,}$/;
  return regex.test(transactionId);
};

// Function to format UPI amount to INR with commas
export const formatAmountToINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Function to convert USD to INR
export const convertUSDToINR = async (amountUSD: number): Promise<number> => {
  try {
    // In a production app, you'd use a real forex API
    // This is a simplified example
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    const exchangeRate = data.rates.INR || 75; // Fallback rate if API fails
    
    return Math.round(amountUSD * exchangeRate);
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback to an approximate rate if the API fails
    return Math.round(amountUSD * 75);
  }
};

// Function to generate a UPI payment URL
export const generateUPIPaymentURL = (
  upiId: string, 
  amount: number, 
  transactionNote: string, 
  payeeName: string
): string => {
  // Format the URL according to UPI deep link specifications
  const encodedNote = encodeURIComponent(transactionNote);
  const encodedName = encodeURIComponent(payeeName);
  
  return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
};

// Function to copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};
