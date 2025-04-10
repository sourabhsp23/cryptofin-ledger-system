
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Wallet, Activity, Cpu, Send, 
  Database, Settings, Menu, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlockchainStore } from '../store/blockchainStore';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const currentWallet = useBlockchainStore(state => state.currentWallet);
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to} 
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-crypto-surfaceLight",
          isActive && "bg-crypto-surfaceLight text-crypto-blue"
        )}
      >
        <Icon size={20} />
        {isOpen && <span>{label}</span>}
      </Link>
    );
  };
  
  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </Button>
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-crypto-dark border-r border-border/40 transition-all duration-300 h-screen flex flex-col",
          isOpen ? "w-64" : "w-16",
          "md:relative fixed z-40",
          !isOpen && !isOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-crypto-blue flex items-center justify-center text-white font-bold">
              BF
            </div>
            {isOpen && <span className="font-semibold">Blockchain Finance</span>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/" icon={Home} label="Dashboard" />
          <NavItem to="/wallet" icon={Wallet} label="Wallet" />
          <NavItem to="/transactions" icon={Activity} label="Transactions" />
          <NavItem to="/mining" icon={Cpu} label="Mining" />
          <NavItem to="/send" icon={Send} label="Send" />
          <NavItem to="/explorer" icon={Database} label="Explorer" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </nav>
        
        {/* Wallet information */}
        {currentWallet && isOpen && (
          <div className="p-4 border-t border-border/40">
            <div className="text-xs text-muted-foreground mb-1">Current Wallet</div>
            <div className="font-mono text-sm truncate">{currentWallet.publicKey.substring(0, 20)}...</div>
            <div className="mt-1 font-semibold">{currentWallet.balance} Coins</div>
          </div>
        )}
      </aside>
      
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;
