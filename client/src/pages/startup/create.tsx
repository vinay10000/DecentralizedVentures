import { useState } from 'react';
import { useLocation } from 'wouter';
import Sidebar from '@/components/layout/Sidebar';
import StartupForm from '@/components/startup/StartupForm';
import { StartupData } from '@/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const CreateStartup = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSuccess = (startup: StartupData) => {
    toast({
      title: 'Startup Created',
      description: 'Your startup profile has been created successfully!',
    });
    setLocation('/startup/dashboard');
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Create Startup Profile</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Complete your startup profile to start connecting with investors.
            </p>
          </div>

          <StartupForm onSuccess={handleSuccess} />
        </div>
      </main>
    </div>
  );
};

export default CreateStartup;
