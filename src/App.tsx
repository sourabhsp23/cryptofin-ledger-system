
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/WalletPage";
import TransactionsPage from "./pages/TransactionsPage";
import MiningPage from "./pages/MiningPage";
import SendPage from "./pages/SendPage";
import ExplorerPage from "./pages/ExplorerPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useBlockchainStore } from "./store/blockchainStore";
import { useWalletStore } from "./store/walletStore";
import { toast } from "./components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.log("Query error:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to blockchain server. Using local data instead.",
          variant: "destructive"
        });
      }
    },
  }
});

const App = () => {
  const { refreshBlockchain } = useBlockchainStore();
  const { initializeWallet } = useWalletStore();

  useEffect(() => {
    // Initialize wallet and blockchain data when the app starts
    console.log("App initialized");
    initializeWallet();
    
    // Try to refresh blockchain data, but handle the error gracefully
    refreshBlockchain().catch(e => {
      console.error("Error refreshing blockchain:", e);
      toast({
        title: "Server Connection Failed",
        description: "Working with local blockchain data only. Some features may be limited.",
        variant: "destructive"
      });
    });
  }, [refreshBlockchain, initializeWallet]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/wallet" element={<Layout><WalletPage /></Layout>} />
            <Route path="/transactions" element={<Layout><TransactionsPage /></Layout>} />
            <Route path="/mining" element={<Layout><MiningPage /></Layout>} />
            <Route path="/send" element={<Layout><SendPage /></Layout>} />
            <Route path="/explorer" element={<Layout><ExplorerPage /></Layout>} />
            <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
