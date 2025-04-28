
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';
import ProfileComponent from '@/components/user/ProfileComponent';
import { Loader } from 'lucide-react';

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <Loader className="h-12 w-12 animate-spin text-purple-500" />
        </div>
      </AppShell>
    );
  }

  if (error || !userData) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-xl font-bold text-red-500">Error loading profile</h2>
            <p>Unable to fetch user data. Please try again later.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ProfileComponent userId={userId} user={userData} />
    </AppShell>
  );
};

export default ProfilePage;
