import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StartupData, StartupDocument, StartupUpdate, getStartupStats, getStartupByFounderId, getStartupDocuments } from '@/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { FileText, Edit, Plus, ArrowUpRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface StartupDetailsProps {
  startupId?: string;
}

const StartupDetails = ({ startupId }: StartupDetailsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startup, setStartup] = useState<StartupData | null>(null);
  const [stats, setStats] = useState({
    fundingRaised: 0,
    fundingGoal: 0,
    progress: 0,
    investors: 0,
    totalTransactions: 0
  });
  const [documents, setDocuments] = useState<StartupDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newUpdate, setNewUpdate] = useState('');
  const [updates, setUpdates] = useState<StartupUpdate[]>([]);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // If startupId is provided, use it directly
        // Otherwise, fetch the startup by the founder's ID
        let fetchedStartup: StartupData | null = null;
        
        if (startupId) {
          // Fetch startup by ID logic
          // fetchedStartup = await getStartupById(startupId);
        } else if (user) {
          fetchedStartup = await getStartupByFounderId(user.uid);
        }
        
        if (fetchedStartup) {
          setStartup(fetchedStartup);
          
          // Fetch additional startup data
          const [startupStats, startupDocs] = await Promise.all([
            getStartupStats(fetchedStartup.id as string),
            getStartupDocuments(fetchedStartup.id as string)
          ]);
          
          setStats(startupStats);
          setDocuments(startupDocs);
          
          // Fetch updates logic
          // const fetchedUpdates = await getStartupUpdates(fetchedStartup.id as string);
          // setUpdates(fetchedUpdates);
        }
      } catch (error) {
        console.error('Error fetching startup data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load startup data',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [startupId, user, toast]);

  const handleAddUpdate = async () => {
    if (!startup?.id || !newUpdate.trim()) return;
    
    try {
      // Add update logic
      // const addedUpdate = await addStartupUpdate({
      //   startupId: startup.id,
      //   message: newUpdate.trim()
      // });
      
      // setUpdates([addedUpdate, ...updates]);
      setNewUpdate('');
      setShowUpdateDialog(false);
      
      toast({
        title: 'Update Posted',
        description: 'Your update has been posted successfully'
      });
    } catch (error) {
      console.error('Error adding update:', error);
      toast({
        title: 'Error',
        description: 'Failed to post update',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!startup) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Startup Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven't created a startup profile yet.
            </p>
            <Button>Create Startup Profile</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            {startup.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {startup.industry} • {startup.investmentStage}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button size="sm" onClick={() => setShowUpdateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Post Update
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Startup Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{startup.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Investment Pitch</h3>
                    <p className="text-gray-600 dark:text-gray-400">{startup.pitch}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-3">Funding Progress</h3>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatCurrency(stats.fundingRaised)} raised
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatCurrency(stats.fundingGoal)} goal
                      </span>
                    </div>
                    <Progress value={stats.progress} className="h-2 mb-3" />
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Progress: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.round(stats.progress)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Investors: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {stats.investors}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">UPI ID</h4>
                      <p className="text-gray-900 dark:text-white">{startup.upiId}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">UPI QR Code</h4>
                      <div className="mt-2 bg-white p-2 rounded-md inline-block">
                        <img 
                          src={startup.qrCodeUrl} 
                          alt="UPI QR Code" 
                          className="h-32 w-32 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Placeholder for recent transactions */}
                  <div className="text-center py-4">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      View all transactions
                    </p>
                    <Button variant="outline" size="sm">
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Transactions Page
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Startup Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="border rounded-lg p-4 flex items-center hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded">
                        <FileText className="h-5 w-5 text-primary-500 dark:text-primary-400" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{doc.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {doc.type.charAt(0).toUpperCase() + doc.type.slice(1).replace(/([A-Z])/g, ' $1')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No documents uploaded yet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="updates" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Startup Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <div key={update.id} className="border rounded-lg p-4">
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {update.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {typeof update.createdAt === 'string' 
                          ? new Date(update.createdAt).toLocaleString() 
                          : update.createdAt.toDate().toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No updates posted yet.
                  </p>
                  <Button onClick={() => setShowUpdateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Update
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Post Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Post Startup Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share news, milestones, or important information with your investors.
            </p>
            <Textarea
              placeholder="What's new with your startup?"
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUpdate} disabled={!newUpdate.trim()}>
                Post Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartupDetails;
