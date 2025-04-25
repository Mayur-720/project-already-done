
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BroadcastForm from './BroadcastForm';
import BroadcastHistory from './BroadcastHistory';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for admins
  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-700 hover:bg-purple-800 text-white"
      >
        <ShieldCheck className="mr-2 h-4 w-4" />
        {isOpen ? 'Close Admin' : 'Admin Panel'}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-xl w-11/12 max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-purple-500 mr-2" />
                <h2 className="text-xl font-bold">Admin Panel</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>×</Button>
            </div>

            <div className="p-4">
              <Tabs defaultValue="broadcast">
                <TabsList className="w-full">
                  <TabsTrigger value="broadcast" className="flex-1">Broadcast Messages</TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">Message History</TabsTrigger>
                </TabsList>
                <TabsContent value="broadcast" className="pt-4">
                  <BroadcastForm />
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                  <BroadcastHistory />
                </TabsContent>
              </Tabs>
            </div>

            <div className="p-4 border-t bg-muted/30">
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>Admin actions are logged and monitored.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
