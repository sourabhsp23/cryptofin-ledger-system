
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatBot } from "./components/ChatBot";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/WalletPage";
import TransactionsPage from "./pages/TransactionsPage";
import MiningPage from "./pages/MiningPage";
import SendPage from "./pages/SendPage";
import ExplorerPage from "./pages/ExplorerPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useBlockchainStore } from "./store/blockchainStore";
import { useWalletStore } from "./store/walletStore";
import { toast } from "./components/ui/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
    <ThemeProvider defaultTheme="dark" storageKey="blockchain-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><Layout><WalletPage /></Layout></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><Layout><TransactionsPage /></Layout></ProtectedRoute>} />
                <Route path="/mining" element={<ProtectedRoute><Layout><MiningPage /></Layout></ProtectedRoute>} />
                <Route path="/send" element={<ProtectedRoute><Layout><SendPage /></Layout></ProtectedRoute>} />
                <Route path="/explorer" element={<ProtectedRoute><Layout><ExplorerPage /></Layout></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ChatBot />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
