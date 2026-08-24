import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authClient } from '../lib/auth-client';
import { setVercelToken, hydrateVercelToken, getCachedVercelToken } from '../lib/vercel-token';

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
  session: any;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  teams: [],
  activeScope: null,
  setActiveScope: () => {},
  loading: true,
  error: null,
  refreshUser: async () => {},
  session: null,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [user, setUser] = useState<VercelUser | null>(null);
  const [teams, setTeams] = useState<VercelTeam[]>([]);
  const [activeScope, setActiveScope] = useState<ActiveScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch the Vercel OAuth access token from our server API and cache it. */
  const fetchAndCacheToken = useCallback(async (): Promise<string | null> => {
    // Try in-memory cache first (fast path)
    const cached = getCachedVercelToken();
    if (cached) return cached;

    // Try SecureStore (survives app restarts)
    const hydrated = await hydrateVercelToken();
    if (hydrated) return hydrated;

    // If user is logged in, request token from the server
    if (session?.user) {
      try {
        const baseURL =
          process.env.EXPO_PUBLIC_SERVER_URL ||
          process.env.EXPO_PUBLIC_AUTH_URL ||
          'https://vercel-app-nine-omega.vercel.app';
        const res = await authClient.getCookie().then((cookie) =>
          fetch(`${baseURL}/api/vercel/token`, {
            headers: cookie ? { Cookie: cookie } : {},
          })
        );
        if (res.ok) {
          const data = await res.json();
          if (data.accessToken) {
            await setVercelToken(data.accessToken);
            return data.accessToken;
          }
        }
      } catch (err) {
        console.error('Failed to fetch Vercel token from server:', err);
      }
    }

    return null;
  }, [session]);

  const fetchUserData = useCallback(async () => {
    if (session?.user) {
      // Map session user immediately so the UI isn't blocked
      const sessionUser: VercelUser = {
        id: session.user.id,
        username: session.user.name || session.user.email?.split('@')[0] || 'user',
        name: session.user.name || 'Vercel User',
        email: session.user.email || '',
        avatar: session.user.image || undefined,
      };
      setUser(sessionUser);
      setActiveScope((current) => current || {
        id: sessionUser.id,
        type: 'personal',
        name: sessionUser.username,
        slug: sessionUser.username,
        avatar: sessionUser.avatar,
      });
    }

    const token = await fetchAndCacheToken();

    if (!token) {
      if (!session?.user) {
        setError('Sign in with Vercel to continue.');
      }
      setLoading(false);
      return;
    }

    try {
      const [userRes, teamsRes] = await Promise.all([
        fetch('https://api.vercel.com/v2/user', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
        fetch('https://api.vercel.com/v2/teams', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }),
      ]);

      if (userRes.ok) {
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
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        const rawTeams = teamsData.teams || [];
        setTeams(rawTeams.map((t: any) => ({
          id: t.id,
          slug: t.slug,
          name: t.name,
          avatar: t.avatar ? `https://vercel.com/api/www/avatar/${t.avatar}` : undefined,
        })));
      }
    } catch (err: any) {
      console.error('Error fetching user context:', err);
      if (!session?.user) {
        setError(err.message || 'Failed to authenticate');
      }
    } finally {
      setLoading(false);
    }
  }, [session, fetchAndCacheToken]);

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
        loading: loading || isSessionPending,
        error,
        refreshUser: fetchUserData,
        session,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}

