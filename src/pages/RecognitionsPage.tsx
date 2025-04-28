
import React from 'react';
import AppShell from '@/components/layout/AppShell';
import RecognitionModal from '@/components/recognition/RecognitionModal';

const RecognitionsPage: React.FC = () => {
  // We're just rendering the RecognitionModal as a full page
  return (
    <AppShell>
      <div className="container mx-auto py-8">
        <RecognitionModal open={true} onOpenChange={() => {}} />
      </div>
    </AppShell>
  );
};

export default RecognitionsPage;
