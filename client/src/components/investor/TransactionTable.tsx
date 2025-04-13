import { useState } from 'react';
import { TransactionData } from '@/firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TransactionTableProps {
  transactions: TransactionData[];
  title?: string;
  description?: string;
  showStartup?: boolean;
  showInvestor?: boolean;
  isLoading?: boolean;
}

const TransactionTable = ({ 
  transactions, 
  title = "Recent Transactions", 
  description = "Your transaction history across all startups", 
  showStartup = true, 
  showInvestor = false,
  isLoading = false
}: TransactionTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const transactionsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);
  
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );
  
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleViewDetails = (transaction: TransactionData) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };
  
  // Format date from timestamp or string
  const formatDate = (timestamp: string | any) => {
    if (!timestamp) return 'N/A';
    
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : timestamp.toDate ? timestamp.toDate() : new Date();
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get payment method icon
  const PaymentMethodIcon = ({ method }: { method: string }) => {
    if (method === 'metamask') {
      return (
        <svg className="h-5 w-5 mr-1 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
          <path d="M6.5 12.5L8 14L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.5 9L12 14.5L9 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    } else if (method === 'upi') {
      return (
        <svg className="h-5 w-5 mr-1 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 13H15M12 10V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    return null;
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {showStartup && <TableHead>Startup</TableHead>}
                    {showInvestor && <TableHead>Investor</TableHead>}
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      {showStartup && (
                        <TableCell>
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.startupName}</div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      
                      {showInvestor && (
                        <TableCell>
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.investorName}</div>
                            </div>
                          </div>
                        </TableCell>
                      )}
                      
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center">
                          <PaymentMethodIcon method={transaction.method} />
                          <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">{transaction.method}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(transaction.createdAt)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDetails(transaction)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
            </div>
          )}
        </CardContent>
        
        {transactions.length > transactionsPerPage && (
          <CardFooter className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{(currentPage - 1) * transactionsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * transactionsPerPage, transactions.length)}</span> of <span className="font-medium">{transactions.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Transaction Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Detailed information about this transaction.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-500 dark:text-gray-400">Transaction ID:</span>
                <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                  {selectedTransaction.transactionId || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(selectedTransaction.amount)}
                </span>
              </div>
              
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-500 dark:text-gray-400">Payment Method:</span>
                <span className="font-medium text-gray-900 dark:text-white capitalize">
                  {selectedTransaction.method}
                </span>
              </div>
              
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span>{getStatusBadge(selectedTransaction.status)}</span>
              </div>
              
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDate(selectedTransaction.createdAt)}
                </span>
              </div>
              
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-500 dark:text-gray-400">Startup:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedTransaction.startupName}
                </span>
              </div>
              
              <div className="flex justify-between pb-2 border-b">
                <span className="text-gray-500 dark:text-gray-400">Investor:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedTransaction.investorName}
                </span>
              </div>
              
              {selectedTransaction.walletAddress && (
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500 dark:text-gray-400">Wallet Address:</span>
                  <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                    {selectedTransaction.walletAddress}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TransactionTable;
