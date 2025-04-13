import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatCard from '@/components/common/StatCard';
import StartupCard from '@/components/startup/StartupCard';
import TransactionTable from '@/components/investor/TransactionTable';
import { ArrowRight } from 'lucide-react';
import { useInvestor } from '@/hooks/useInvestor';
import { StartupData, TransactionData } from '@/firebase/firestore';
import { useNavigateToChat } from '@/hooks/useChat';

const COLORS = ['#3E63DD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const InvestorDashboard = () => {
  const { 
    stats, 
    recentTransactions, 
    recentInvestments, 
    trendingStartups,
    isLoading,
  } = useInvestor();
  
  const navigate = useNavigateToChat();
  
  // Sample data for charts (replace with actual data in production)
  const [investmentDistribution, setInvestmentDistribution] = useState<any[]>([]);
  const [monthlyInvestments, setMonthlyInvestments] = useState<any[]>([]);
  
  useEffect(() => {
    if (recentInvestments.length > 0) {
      // Create investment distribution by industry
      const distribution: Record<string, number> = {};
      
      recentInvestments.forEach(startup => {
        const industry = startup.industry;
        if (distribution[industry]) {
          distribution[industry] += 1;
        } else {
          distribution[industry] = 1;
        }
      });
      
      const distributionData = Object.keys(distribution).map(industry => ({
        name: industry,
        value: distribution[industry]
      }));
      
      setInvestmentDistribution(distributionData);
      
      // Create monthly investment data
      if (recentTransactions.length > 0) {
        const monthlyData: Record<string, number> = {
          'Jan': 0, 'Feb': 0, 'Mar': 0, 'Apr': 0, 'May': 0, 'Jun': 0,
          'Jul': 0, 'Aug': 0, 'Sep': 0, 'Oct': 0, 'Nov': 0, 'Dec': 0
        };
        
        recentTransactions.forEach(transaction => {
          const date = new Date(
            typeof transaction.createdAt === 'string' 
              ? transaction.createdAt 
              : transaction.createdAt.toDate()
          );
          const month = date.toLocaleString('default', { month: 'short' });
          monthlyData[month] += transaction.amount;
        });
        
        const chartData = Object.keys(monthlyData).map(month => ({
          name: month,
          amount: monthlyData[month]
        }));
        
        setMonthlyInvestments(chartData);
      }
    }
  }, [recentInvestments, recentTransactions]);
  
  const handleChatClick = (startupId: string, startupName: string) => {
    navigate(startupId, startupName);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Investor Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Invested"
          value={`$${stats.totalInvested?.toLocaleString() || '0'}`}
          icon={<svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>}
          change="11.5%"
          changeText="this month"
          changeDirection="up"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="Active Investments"
          value={stats.activeInvestments?.toString() || '0'}
          icon={<svg className="h-6 w-6 text-secondary-600 dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>}
          change="3"
          changeText="new this month"
          changeDirection="up"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="ROI"
          value="23.4%"
          icon={<svg className="h-6 w-6 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>}
          change="5.2%"
          changeText="increase"
          changeDirection="up"
          isLoading={isLoading}
        />
        
        <StatCard 
          title="New Startups"
          value={trendingStartups.length.toString() || '0'}
          icon={<svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>}
          change="8"
          changeText="this week"
          changeDirection="up"
          isLoading={isLoading}
        />
      </div>
      
      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">My Investments</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Monthly Investments</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyInvestments}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`$${value}`, 'Amount']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="amount" fill="#3E63DD" name="Investment Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Investment Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investmentDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {investmentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Trending Startups */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">Trending Startups</h2>
              <Link href="/investor/discover">
                <Button variant="ghost" className="text-primary-600 dark:text-primary-400">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
                    <CardContent className="p-5 space-y-3">
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/2 rounded"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
                      <div className="flex justify-between">
                        <div className="bg-gray-200 dark:bg-gray-700 h-8 w-1/3 rounded"></div>
                        <div className="bg-gray-200 dark:bg-gray-700 h-8 w-1/3 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : trendingStartups.length > 0 ? (
                trendingStartups.slice(0, 3).map((startup) => (
                  <StartupCard 
                    key={startup.id} 
                    startup={startup} 
                    onChatClick={handleChatClick} 
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No trending startups found.</p>
                  <Link href="/investor/discover">
                    <Button>Discover Startups</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Transactions */}
          <TransactionTable 
            transactions={recentTransactions.slice(0, 5)} 
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="investments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="h-96 animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-lg"></div>
                  <CardContent className="p-5 space-y-3">
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/2 rounded"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 w-full rounded"></div>
                    <div className="flex justify-between">
                      <div className="bg-gray-200 dark:bg-gray-700 h-8 w-1/3 rounded"></div>
                      <div className="bg-gray-200 dark:bg-gray-700 h-8 w-1/3 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : recentInvestments.length > 0 ? (
              recentInvestments.map((startup) => (
                <StartupCard 
                  key={startup.id} 
                  startup={startup} 
                  onChatClick={handleChatClick}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't invested in any startups yet.</p>
                <Link href="/investor/discover">
                  <Button>Start Investing</Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionTable 
            transactions={recentTransactions}
            title="All Transactions"
            description="Complete history of your investments"
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorDashboard;
