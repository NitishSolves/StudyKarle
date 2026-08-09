import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-container mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
