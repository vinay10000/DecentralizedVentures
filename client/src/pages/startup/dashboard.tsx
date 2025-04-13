import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import StartupDetails from '@/components/startup/StartupDetails';
import TransactionTable from '@/components/investor/TransactionTable';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PlusCircle, DollarSign, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useStartup } from '@/hooks/useStartup';
import { useAuth } from '@/hooks/useAuth';

const StartupDashboard = () => {
  const { user } = useAuth();
  const { startup, stats, transactions, isLoading } = useStartup();
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Group transactions by month and calculate totals
      const monthlyMap: Record<string, number> = {
        'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
        'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
      };
      
      transactions.forEach(transaction => {
        const date = new Date(
          typeof transaction.createdAt === 'string' 
            ? transaction.createdAt 
            : transaction.createdAt.toDate()
        );
        const month = date.toLocaleString('default', { month: 'short' });
        monthlyMap[month] += transaction.amount;
      });
      
      const data = Object.keys(monthlyMap).map(month => ({
        name: month,
        amount: monthlyMap[month]
      }));
      
      setMonthlyData(data);
    }
  }, [transactions]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !startup ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">Welcome to StartupVest</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              You haven't created a startup profile yet. Create your profile to start raising funds and connecting with investors.
            </p>
            <Link href="/startup/create">
              <Button size="lg" className="px-6">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Startup Profile
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                {startup.name} Dashboard
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Manage your startup profile, track investments, and connect with investors.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-md">
                      <DollarSign className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Raised</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(stats.fundingRaised)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(stats.progress)}% of {formatCurrency(stats.fundingGoal)} goal
                    </p>
                    <Progress value={stats.progress} className="h-2 mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-secondary-100 dark:bg-secondary-900 p-3 rounded-md">
                      <Users className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investors</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {stats.investors}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-accent-100 dark:bg-accent-900 p-3 rounded-md">
                      <TrendingUp className="h-6 w-6 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {transactions.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div className="flex items-center">
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-md">
                      <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Stage</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {startup.investmentStage}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/startup/profile">
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <StartupDetails />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Funding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`$${value}`, 'Amount']}
                            labelFormatter={(label) => `Month: ${label}`}
                          />
                          <Bar dataKey="amount" fill="#3E63DD" name="Funding Amount" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionTable 
                  transactions={transactions}
                  title="All Transactions"
                  description="Complete history of investments in your startup"
                  showStartup={false}
                  showInvestor={true}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default StartupDashboard;
