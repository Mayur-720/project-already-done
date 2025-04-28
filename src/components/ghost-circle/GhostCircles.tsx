import React, { useEffect, useState } from 'react';
import { getMyGhostCircles } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import GhostCircleCard from './GhostCircleCard';
import CreateGhostCircleModal from './CreateGhostCircleModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader } from 'lucide-react';
import CircleFeedView from './CircleFeedView';

const GhostCircles: React.FC = () => {
  const [circles, setCircles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchGhostCircles = async () => {
      try {
        const data = await getMyGhostCircles();
        
        if (data && Array.isArray(data)) {
          setCircles(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching ghost circles:', error);
        setIsLoading(false);
      }
    };

    fetchGhostCircles();
  }, []);

  const handleSelectCircle = (circleId: string) => {
    setSelectedCircleId(circleId);
  };

  const handleBackToCircles = () => {
    setSelectedCircleId(null);
  };

  const renderCircles = () => {
    if (circles && Array.isArray(circles) && circles.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {circles.map(circle => (
            <GhostCircleCard 
              key={circle._id} 
              circle={circle} 
              onSelect={handleSelectCircle} 
            />
          ))}
        </div>
      );
    }
    
    return (
      <div className="text-center text-gray-500">
        <p>No ghost circles found. Create one to get started!</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <Loader className="h-12 w-12 animate-spin text-purple-500" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8">
        {selectedCircleId ? (
          <CircleFeedView circleId={selectedCircleId} onBack={handleBackToCircles} />
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">My Ghost Circles</h1>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/80 glow-effect">
                <Plus className="mr-2 h-4 w-4" />
                Create Circle
              </Button>
            </div>
            {renderCircles()}
            <CreateGhostCircleModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
          </>
        )}
      </div>
    </AppShell>
  );
};

export default GhostCircles;
