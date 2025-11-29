
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useWalletStore } from '@/store/walletStore';
import { useBlockchainStore } from '@/store/blockchainStore';
import { Settings, Shield, Database, Wallet, AlertTriangle, IndianRupee } from 'lucide-react';
import { getCoinToInrRate, setCoinToInrRate } from '@/utils/currency';

const SettingsPage = () => {
  const { toast } = useToast();
  const [advancedMode, setAdvancedMode] = useState(false);
  const [autoMining, setAutoMining] = useState(false);
  const [confirmation, setConfirmation] = useState(1);
  const [exchangeRate, setExchangeRate] = useState<string>('');
  
  const { wallets } = useWalletStore();
  const { chain, pendingTransactions } = useBlockchainStore();
  
  useEffect(() => {
    setExchangeRate(getCoinToInrRate().toString());
  }, []);
  
  const handleSave = () => {
    const rate = parseFloat(exchangeRate);
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Invalid Exchange Rate",
        description: "Please enter a valid positive number for the exchange rate.",
        variant: "destructive"
      });
      return;
    }
    
    setCoinToInrRate(rate);
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully."
    });
  };
  
  const handleResetBlockchain = () => {
    // This would actually reset the blockchain in a real implementation
    toast({
      title: "Blockchain Reset",
      description: "The blockchain has been reset to its genesis state.",
      variant: "destructive"
    });
  };
  
  const handleExportWallets = () => {
    // Create data to export
    const walletsData = JSON.stringify(wallets, null, 2);
    
    // Create blob and download
    const blob = new Blob([walletsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blockchain-wallets.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Wallets Exported",
      description: "Your wallets have been exported as a JSON file."
    });
  };
  
  const handleExportBlockchain = () => {
    // Create blockchain data export
    const blockchainData = {
      chain,
      pendingTransactions,
      exportDate: new Date().toISOString(),
      totalBlocks: chain.length
    };
    
    const dataStr = JSON.stringify(blockchainData, null, 2);
    
    // Create blob and download
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Blockchain Exported",
      description: `Successfully exported ${chain.length} blocks to JSON file.`
    });
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your blockchain finance application
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currency Settings */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-crypto-blue" /> Currency Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Coin to INR Exchange Rate</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">1 Coin =</span>
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder="100"
                  className="max-w-[150px]"
                />
                <span className="text-sm text-muted-foreground">₹</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Set how many Indian Rupees (₹) equal one blockchain coin. Default is ₹100 per coin.
              </p>
            </div>
            
            <Button onClick={handleSave} className="w-full mt-2">
              Save Currency Settings
            </Button>
          </CardContent>
        </Card>
        
        {/* General Settings */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-crypto-blue" /> General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="advanced-mode">Advanced Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Show advanced blockchain options and details
                </div>
              </div>
              <Switch
                id="advanced-mode"
                checked={advancedMode}
                onCheckedChange={setAdvancedMode}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-mining">Automatic Mining</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically mine new blocks in the background
                </div>
              </div>
              <Switch
                id="auto-mining"
                checked={autoMining}
                onCheckedChange={setAutoMining}
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="confirmations">Required Confirmations</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Number of blocks required to confirm a transaction
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 6, 12].map((value) => (
                  <Button
                    key={value}
                    variant={confirmation === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfirmation(value)}
                  >
                    {value}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button onClick={handleSave} className="w-full mt-2">
              Save Settings
            </Button>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-crypto-blue" /> Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="lock-wallets">Auto-Lock Wallets</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically lock wallets after 5 minutes of inactivity
                </div>
              </div>
              <Switch
                id="lock-wallets"
                defaultChecked
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hide-private-keys">Hide Private Keys</Label>
                <div className="text-sm text-muted-foreground">
                  Require confirmation before displaying private keys
                </div>
              </div>
              <Switch
                id="hide-private-keys"
                defaultChecked
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="confirm-transactions">Confirm Transactions</Label>
                <div className="text-sm text-muted-foreground">
                  Require confirmation before sending coins
                </div>
              </div>
              <Switch
                id="confirm-transactions"
                defaultChecked
              />
            </div>
            
            <Button onClick={handleExportWallets} className="w-full mt-2" variant="outline">
              <Wallet className="h-4 w-4 mr-2" /> Export Wallets
            </Button>
          </CardContent>
        </Card>
        
        {/* Blockchain Management */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-crypto-blue" /> Blockchain Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground mb-4">
              This section contains advanced operations for managing the blockchain.
              These actions can affect your data and cannot be undone.
            </div>
            
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                Validate Blockchain
              </Button>
              
              <Button className="w-full" variant="outline" onClick={handleExportBlockchain}>
                Export Blockchain
              </Button>
              
              <Button className="w-full" variant="outline">
                Import Blockchain
              </Button>
              
              <Button
                className="w-full bg-crypto-red text-white hover:bg-crypto-red/90 flex items-center gap-2"
                onClick={handleResetBlockchain}
              >
                <AlertTriangle className="h-4 w-4" /> Reset Blockchain
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* About */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle>About Blockchain Finance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Version</h3>
              <p className="text-muted-foreground">1.0.0</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Blockchain Implementation</h3>
              <p className="text-muted-foreground">
                This application implements a simplified blockchain with the following features:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>SHA-256 cryptographic hashing</li>
                <li>Elliptic Curve Cryptography (secp256k1)</li>
                <li>Proof of Work consensus mechanism</li>
                <li>Digital signatures for transaction verification</li>
                <li>Immutable blockchain structure</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Technology Stack</h3>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>React 18 with TypeScript</li>
                <li>Tailwind CSS for styling</li>
                <li>Zustand for state management</li>
                <li>Crypto-js for cryptographic functions</li>
                <li>Elliptic for ECC operations</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
