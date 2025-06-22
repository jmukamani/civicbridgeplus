import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import OfflineStatus from './OfflineStatus';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

const MainLayout = () => {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <OfflineStatus isOnline={isOnline} />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;