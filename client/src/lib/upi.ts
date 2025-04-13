/**
 * Generate UPI payment URL
 * 
 * @param upiId The UPI ID to make payment to
 * @param amount The amount to pay
 * @param reference Optional reference/transaction ID
 * @param description Optional payment description
 * @returns A UPI deep link URL
 */
export const generateUpiUrl = (
  upiId: string,
  amount: number,
  reference?: string,
  description: string = 'Investment'
): string => {
  // Encode parameters
  const params = new URLSearchParams();
  params.append('pa', upiId);
  params.append('pn', 'StartupVest');
  params.append('am', amount.toString());
  params.append('cu', 'INR');
  params.append('tn', description);
  
  if (reference) {
    params.append('tr', reference);
  }
  
  // Return UPI URL
  return `upi://pay?${params.toString()}`;
};

/**
 * Convert USD to INR
 * 
 * Note: In a production environment, this would use a real exchange rate API
 * 
 * @param usdAmount Amount in USD
 * @returns Equivalent amount in INR
 */
export const convertUSDToINR = async (usdAmount: number): Promise<number> => {
  try {
    // For demonstration purposes, we're using a static exchange rate
    // In a real application, you would fetch this from an API
    const exchangeRate = 75; // Example: 1 USD = 75 INR
    return usdAmount * exchangeRate;
  } catch (error) {
    console.error('Error converting USD to INR:', error);
    return usdAmount * 75; // Fallback to static conversion
  }
};

/**
 * Validate UPI transaction ID format
 * 
 * @param transactionId The UPI transaction ID to validate
 * @returns True if the transaction ID format is valid, false otherwise
 */
export const validateUPITransactionId = (transactionId: string): boolean => {
  if (!transactionId || transactionId.trim().length === 0) {
    return false;
  }
  
  // Basic validation: UPI transaction IDs are usually 12+ characters
  // and may contain alphanumeric characters, hyphens, or underscores
  const upiTxIdRegex = /^[a-zA-Z0-9_-]{12,}$/;
  return upiTxIdRegex.test(transactionId.trim());
};

/**
 * Generate QR code data URL from UPI URL
 * 
 * Note: In a real production application, this would likely use a QR code
 * generation library like qrcode.js, but for simplicity and demonstration
 * purposes, we're using an external service here.
 * 
 * @param upiUrl The UPI payment URL
 * @param size The size of the QR code in pixels
 * @returns A promise that resolves to a QR code image URL
 */
export const generateQrCodeUrl = (upiUrl: string, size: number = 200): string => {
  // Encode the UPI URL
  const encodedUpiUrl = encodeURIComponent(upiUrl);
  
  // Generate a QR code using a public API
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUpiUrl}`;
};

/**
 * Function to validate UPI ID format
 * 
 * @param upiId The UPI ID to validate
 * @returns True if the UPI ID is valid, false otherwise
 */
export const isValidUpiId = (upiId: string): boolean => {
  // Simple UPI ID validation regex
  // Format: username@provider
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
};

/**
 * Detect if the device supports UPI apps
 * 
 * @returns True if UPI apps are likely available, false otherwise
 */
export const isUpiSupported = (): boolean => {
  // Check if the device is a mobile device 
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Currently can only detect mobile OS, not specific UPI app support
  return isMobile;
};