
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

// Remove the server import
// import "./server/startServer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    },
  }
});

const App = () => {
  useEffect(() => {
    // Initialize blockchain data when the app starts
    console.log("App initialized");
  }, []);

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
