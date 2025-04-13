import { useState } from 'react';
import { Link } from 'wouter';
import Sidebar from '@/components/layout/Sidebar';
import InvestorDashboard from '@/components/investor/InvestorDashboard';

const InvestorDashboardPage = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-dark-300 transition-colors">
        <InvestorDashboard />
      </main>
    </div>
  );
};

export default InvestorDashboardPage;
