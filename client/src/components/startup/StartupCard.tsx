import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Download, MessageSquare } from 'lucide-react';
import { StartupData } from '@/firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InvestmentModal from '@/components/investor/InvestmentModal';

interface StartupCardProps {
  startup: StartupData;
  showInvestButton?: boolean;
  onChatClick?: (startupId: string, startupName: string) => void;
}

const StartupCard = ({ startup, showInvestButton = true, onChatClick }: StartupCardProps) => {
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [showDocumentsDialog, setShowDocumentsDialog] = useState(false);

  const {
    id,
    name,
    description,
    pitch,
    industry,
    investmentStage,
    fundingGoal,
    fundingRaised,
    investors,
    coverImageUrl,
  } = startup;

  // Calculate funding progress
  const fundingProgress = fundingGoal > 0 ? Math.round((fundingRaised / fundingGoal) * 100) : 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const handleInvestClick = () => {
    setShowInvestModal(true);
  };

  const handleViewDocuments = () => {
    setShowDocumentsDialog(true);
  };

  const handleChatClick = () => {
    if (onChatClick && id) {
      onChatClick(id, name);
    }
  };

  return (
    <>
      <Card className="bg-white dark:bg-dark-100 rounded-lg shadow-sm overflow-hidden transition-colors transform transition-transform hover:scale-[1.02]">
        <div className="relative h-48">
          <img 
            className="w-full h-full object-cover" 
            src={coverImageUrl || "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
            alt={name} 
          />
          <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
            {investmentStage}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center mb-2">
            <Badge variant="outline" className="bg-accent-100 dark:bg-accent-900 text-accent-800 dark:text-accent-300">
              {industry}
            </Badge>
            <Badge variant="outline" className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
              {fundingProgress}% Funded
            </Badge>
          </div>
          <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white mb-1">{name}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
            {pitch || description}
          </p>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Funding Goal</p>
              <p className="text-md font-semibold text-gray-900 dark:text-white">{formatCurrency(fundingGoal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Raised So Far</p>
              <p className="text-md font-semibold text-gray-900 dark:text-white">{formatCurrency(fundingRaised)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Investors</p>
              <p className="text-md font-semibold text-gray-900 dark:text-white">{investors}</p>
            </div>
          </div>
          <Progress value={fundingProgress} className="w-full h-2 mb-4" />
          <div className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 p-0 h-auto"
              onClick={handleViewDocuments}
            >
              View Documents
              <Download className="ml-1 w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {onChatClick && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="inline-flex items-center px-3 py-1.5"
                  onClick={handleChatClick}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              )}
              {showInvestButton && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="inline-flex items-center px-3 py-1.5 border border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-dark-200 hover:bg-primary-50 dark:hover:bg-dark-300"
                  onClick={handleInvestClick}
                >
                  Invest Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Documents Dialog */}
      <Dialog open={showDocumentsDialog} onOpenChange={setShowDocumentsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{name} Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
              <h4 className="font-medium mb-1">Pitch Deck</h4>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Pitch Deck
              </Button>
            </div>
            <div className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
              <h4 className="font-medium mb-1">Financial Report</h4>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Financial Report
              </Button>
            </div>
            <div className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
              <h4 className="font-medium mb-1">Investor Agreement</h4>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Investor Agreement
              </Button>
            </div>
            <div className="p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
              <h4 className="font-medium mb-1">Risk Disclosure</h4>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download Risk Disclosure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Investment Modal */}
      {startup.id && (
        <InvestmentModal 
          startup={startup} 
          isOpen={showInvestModal} 
          onClose={() => setShowInvestModal(false)} 
        />
      )}
    </>
  );
};

export default StartupCard;
