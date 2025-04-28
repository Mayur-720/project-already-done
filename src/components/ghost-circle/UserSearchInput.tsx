import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { User } from '@/types';
import { searchUsers } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface UserSearchInputProps {
  onSelectUser: (username: string) => void;
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({ onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch users',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  const handleSelect = (username: string) => {
    onSelectUser(username);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div>
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {isLoading && <div>Loading...</div>}
      {searchResults.length > 0 && (
        <ul>
          {searchResults.map((user) => (
            <li key={user._id} onClick={() => handleSelect(user.username)}>
              {user.username}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearchInput;
