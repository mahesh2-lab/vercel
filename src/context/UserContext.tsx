import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface VercelUser {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface VercelTeam {
  id: string;
  slug: string;
  name: string;
  avatar?: string;
}

export interface ActiveScope {
  id: string;
  type: 'personal' | 'team';
  name: string;
  slug: string;
  avatar?: string;
}

interface UserContextValue {
  user: VercelUser | null;
  teams: VercelTeam[];
  activeScope: ActiveScope | null;
  setActiveScope: (scope: ActiveScope) => void;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  teams: [],
  activeScope: null,
  setActiveScope: () => {},
  loading: true,
  error: null,
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<VercelUser | null>(null);
  const [teams, setTeams] = useState<VercelTeam[]>([]);
  const [activeScope, setActiveScope] = useState<ActiveScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    const token = process.env.EXPO_PUBLIC_VERCEL_TOKEN;
    if (!token) {
      setError('No Vercel Token provided in EXPO_PUBLIC_VERCEL_TOKEN');
      setLoading(false);
      return;
    }

    try {
      const userRes = await fetch('https://api.vercel.com/v2/user', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userRes.ok) {
        throw new Error(`Failed to fetch user profile: ${userRes.statusText}`);
      }

      const userData = await userRes.json();
      const rawUser = userData.user || userData;

      const loadedUser: VercelUser = {
        id: rawUser.id || rawUser.uid,
        username: rawUser.username || rawUser.name || 'user',
        name: rawUser.name || rawUser.username || 'Vercel User',
        email: rawUser.email || '',
        avatar: rawUser.avatar ? `https://vercel.com/api/www/avatar/${rawUser.avatar}` : undefined,
      };

      setUser(loadedUser);

      setActiveScope((currentScope) => {
        if (currentScope) return currentScope;
        return {
          id: loadedUser.id,
          type: 'personal',
          name: loadedUser.username,
          slug: loadedUser.username,
          avatar: loadedUser.avatar,
        };
      });

      const teamsRes = await fetch('https://api.vercel.com/v2/teams', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        const rawTeams = teamsData.teams || [];
        const loadedTeams: VercelTeam[] = rawTeams.map((t: any) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          avatar: t.avatar ? `https://vercel.com/api/www/avatar/${t.avatar}` : undefined,
        }));
        setTeams(loadedTeams);
      }
    } catch (err: any) {
      console.error('Error fetching user context:', err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      await fetchUserData();
    }

    if (isMounted) {
      loadInitial();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchUserData]);

  return (
    <UserContext.Provider
      value={{
        user,
        teams,
        activeScope,
        setActiveScope,
        loading,
        error,
        refreshUser: fetchUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
