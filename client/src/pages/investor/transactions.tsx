import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TransactionTable from '@/components/investor/TransactionTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TransactionData, getUserTransactions } from '@/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

const InvestorTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const fetchedTransactions = await getUserTransactions(user.uid, 'investor');
        setTransactions(fetchedTransactions);
        setFilteredTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, methodFilter, dateFilter, transactions]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Apply method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.method === methodFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const pastDate = new Date();

      switch (dateFilter) {
        case 'today':
          pastDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          pastDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          pastDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          pastDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(
          typeof transaction.createdAt === 'string' 
            ? transaction.createdAt 
            : transaction.createdAt.toDate()
        );
        return transactionDate >= pastDate;
      });
    }

    setFilteredTransactions(filtered);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">My Investment Transactions</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Track and manage all your startup investments.</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filter Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="method-filter">Payment Method</Label>
                  <Select
                    value={methodFilter}
                    onValueChange={setMethodFilter}
                  >
                    <SelectTrigger id="method-filter">
                      <SelectValue placeholder="All Methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="metamask">MetaMask</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date-filter">Time Period</Label>
                  <Select
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <SelectTrigger id="date-filter">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Last 24 Hours</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <TransactionTable
            transactions={filteredTransactions}
            title="Investment Transactions"
            description="Complete history of your investments across all startups"
            showStartup={true}
            showInvestor={false}
            isLoading={loading}
          />
        </div>
      </main>
    </div>
  );
};

export default InvestorTransactions;
