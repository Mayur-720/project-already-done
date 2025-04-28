
import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Input } from '@/components/ui/input';
import { debounce } from 'lodash';
import { searchUsers } from '@/lib/api';

interface UserSearchInputProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  excludeUsers?: string[];
  className?: string;
}

const UserSearchInput: React.FC<UserSearchInputProps> = ({
  onUserSelect,
  placeholder = 'Search users...',
  excludeUsers = [],
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounce search function to avoid excessive API calls
  const debouncedSearch = debounce(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsers(term);
      // Filter out excluded users
      const filteredResults = results.filter(
        (user: User) => !excludeUsers.includes(user._id)
      ) as User[];
      // Need to use "as User[]" here to make TypeScript happy
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, excludeUsers]);

  const handleUserClick = (user: User) => {
    onUserSelect(user);
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
      />

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="px-4 py-2 hover:bg-accent cursor-pointer flex items-center"
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full text-lg mr-3">
                {user.avatarEmoji || '🎭'}
              </div>
              <div>
                <p className="font-medium">{user.anonymousAlias || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md p-4 text-center">
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      )}

      {showResults && searchTerm && !loading && searchResults.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md p-4 text-center">
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
