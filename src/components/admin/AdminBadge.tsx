
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AdminBadge: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
          <ShieldCheck className="h-3 w-3 mr-1" />
          Admin
        </TooltipTrigger>
        <TooltipContent>
          <p>You have admin privileges</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AdminBadge;
