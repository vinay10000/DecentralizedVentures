import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ChatInterface from '@/components/chat/ChatInterface';

const InvestorMessages = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Messages</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">Chat with startup founders about their projects.</p>
          </div>

          <div className="h-[calc(100vh-12rem)]">
            <ChatInterface />
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvestorMessages;
