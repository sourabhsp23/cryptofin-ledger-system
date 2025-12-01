
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Wallet, Activity, Cpu, Send, 
  Database, Settings, Menu, X, Sun, Moon, LogOut, User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/walletStore';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const { currentWallet } = useWalletStore();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link 
        to={to} 
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive && "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
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
          "bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen flex flex-col shadow-lg dark:shadow-none",
          isOpen ? "w-64" : "w-16",
          "md:relative fixed z-40",
          !isOpen && !isOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary shadow-sm flex items-center justify-center text-primary-foreground font-bold">
              BF
            </div>
            {isOpen && <span className="font-semibold text-sidebar-foreground">Blockchain Finance</span>}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
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
        
        {/* User Profile & Wallet information */}
        {isOpen && (
          <div className="border-t border-sidebar-border">
            {user && (
              <div className="p-4 bg-sidebar-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-sidebar-foreground truncate">
                      {user.user_metadata?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={signOut}
                  variant="outline" 
                  size="sm"
                  className="w-full justify-start gap-2 text-xs"
                >
                  <LogOut size={14} />
                  Sign Out
                </Button>
              </div>
            )}
            {currentWallet && (
              <div className="p-4 bg-sidebar-accent/20">
                <div className="text-xs text-muted-foreground mb-1">Current Wallet</div>
                <div className="font-mono text-sm truncate text-sidebar-foreground">{currentWallet.publicKey.substring(0, 20)}...</div>
                <div className="mt-1 font-semibold text-sidebar-foreground">{currentWallet.balance} Coins</div>
              </div>
            )}
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
