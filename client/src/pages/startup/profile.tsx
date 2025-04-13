import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import DocumentViewer from '@/components/common/DocumentViewer';
import { useStartup } from '@/hooks/useStartup';
import { Edit, Plus, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

const StartupProfile = () => {
  const { startup, stats, documents, isLoading } = useStartup();
  const [activeTab, setActiveTab] = useState('overview');

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Startup Profile Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  You haven't created a startup profile yet.
                </p>
                <Link href="/startup/create">
                  <Button>Create Startup Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        <div className="space-y-6">
          {/* Cover image and basic info */}
          <div className="relative rounded-lg overflow-hidden">
            <div className="aspect-[3/1] bg-gray-200 dark:bg-gray-800">
              {startup.coverImageUrl ? (
                <img 
                  src={startup.coverImageUrl} 
                  alt={`${startup.name} cover`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400">No cover image</p>
                </div>
              )}
            </div>
            
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button variant="outline" size="sm" className="bg-white/90 dark:bg-dark-100/90">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button size="sm" className="bg-primary-500/90 hover:bg-primary-600/90">
                <Plus className="h-4 w-4 mr-2" />
                Post Update
              </Button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-end space-x-4">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800">
                  <AvatarImage src={startup.logoUrl} alt={startup.name} />
                  <AvatarFallback className="text-2xl">
                    {startup.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-heading font-bold text-white">{startup.name}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                      {startup.investmentStage}
                    </Badge>
                    <Badge variant="outline" className="bg-white/20 text-white">
                      {startup.industry}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Funding progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Funding Progress</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {formatCurrency(stats.fundingRaised)} raised of {formatCurrency(stats.fundingGoal)} goal
                  </p>
                </div>
                <div className="mt-2 md:mt-0 text-right">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {Math.round(stats.progress)}% Funded
                  </Badge>
                </div>
              </div>
              <Progress value={stats.progress} className="h-2 mb-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{stats.investors} Investors</span>
                <span className="text-gray-500 dark:text-gray-400">{stats.totalTransactions} Transactions</span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="payment">Payment Info</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {startup.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Investment Pitch</h3>
                      <p className="text-gray-600 dark:text-gray-300">{startup.pitch}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Description</h3>
                      <p className="text-gray-600 dark:text-gray-300">{startup.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-6">
              <DocumentViewer documents={documents} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>
                    This information is shared with investors when they make a UPI payment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">UPI ID</h3>
                      <p className="text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-dark-200 rounded-md border">
                        {startup.upiId}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">UPI QR Code</h3>
                      <div className="bg-white p-4 inline-block rounded-md border">
                        {startup.qrCodeUrl ? (
                          <img 
                            src={startup.qrCodeUrl} 
                            alt="UPI QR Code" 
                            className="h-40 w-40 object-contain"
                          />
                        ) : (
                          <div className="h-40 w-40 flex items-center justify-center border border-dashed rounded">
                            <p className="text-gray-400">No QR code available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StartupProfile;
