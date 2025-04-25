
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useWalletStore } from '@/store/walletStore';
import { useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const initializeWallet = useWalletStore(state => state.initializeWallet);
  
  useEffect(() => {
    // Initialize blockchain and wallet on app startup
    initializeWallet();
  }, [initializeWallet]);
  
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
