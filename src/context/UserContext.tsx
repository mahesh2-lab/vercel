import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authClient } from "../lib/auth-client";
import {
  getCachedVercelToken,
  hydrateVercelToken,
  setVercelToken,
} from "../lib/vercel-token";

const SERVER_URL = "https://vercel-app-nine-omega.vercel.app";

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
  type: "personal" | "team";
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
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [user, setUser] = useState<VercelUser | null>(null);
  const [teams, setTeams] = useState<VercelTeam[]>([]);
  const [activeScope, setActiveScope] = useState<ActiveScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pre-hydrate token from SecureStore once at mount so returning users
  // get an instant in-memory cache hit instead of blocking on an async read.
  useEffect(() => {
    hydrateVercelToken();
  }, []);

  // Stable — no deps that change. Server returns 401 if unauthenticated.
  const fetchToken = useCallback(async (): Promise<string | null> => {
    const cached = getCachedVercelToken();

    if (cached) return cached;

    try {
      const cookie = await authClient.getCookie();

      const res = await fetch(`${SERVER_URL}/api/vercel/token`, {
        headers: cookie ? { Cookie: cookie } : {},
      });

      if (res.ok) {
        const { accessToken } = await res.json();
        if (accessToken) {
          console.log(accessToken);

          await setVercelToken(accessToken);
          return accessToken;
        }
      }
    } catch (err) {
      console.error("Failed to fetch Vercel token:", err);
    }
    return null;
  }, []); // stable

  const fetchUserData = useCallback(async () => {
    if (!session?.user) {
      setUser(null);
      setTeams([]);
      setError("Sign in with Vercel to continue.");
      setLoading(false);
      return;
    }

    setError(null);

    // Paint UI immediately from session so the user sees their name/avatar
    // before the Vercel API responds.
    const sessionUser: VercelUser = {
      id: session.user.id,
      username:
        session.user.name || session.user.email?.split("@")[0] || "user",
      name: session.user.name || "Vercel User",
      email: session.user.email || "",
      avatar: session.user.image || undefined,
    };
    setUser(sessionUser);
    setActiveScope(
      (cur) =>
        cur || {
          id: sessionUser.id,
          type: "personal",
          name: sessionUser.username,
          slug: sessionUser.username,
          avatar: sessionUser.avatar,
        },
    );

    const token = await fetchToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const authHeader = { Authorization: `Bearer ${token}` };
      const [userRes, teamsRes] = await Promise.all([
        fetch("https://api.vercel.com/v2/user", { headers: authHeader }),
        fetch("https://api.vercel.com/v2/teams", { headers: authHeader }),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        const raw = userData.user ?? userData;
        const loadedUser: VercelUser = {
          id: raw.id || raw.uid,
          username: raw.username || raw.name || "user",
          name: raw.name || raw.username || "Vercel User",
          email: raw.email || "",
          avatar: raw.avatar
            ? `https://vercel.com/api/www/avatar/${raw.avatar}`
            : undefined,
        };
        setUser(loadedUser);
        setActiveScope(
          (cur) =>
            cur || {
              id: loadedUser.id,
              type: "personal",
              name: loadedUser.username,
              slug: loadedUser.username,
              avatar: loadedUser.avatar,
            },
        );
      }

      if (teamsRes.ok) {
        const { teams: raw = [] } = await teamsRes.json();
        setTeams(
          raw.map((t: any) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            avatar: t.avatar
              ? `https://vercel.com/api/www/avatar/${t.avatar}`
              : undefined,
          })),
        );
      }
    } catch (err: any) {
      console.error("UserContext fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [session, fetchToken]); // fetchToken is stable, so only session triggers rebuilds

  // Don't run until session has resolved — prevents a spurious run with null session
  const prevSessionRef = useRef<any>(undefined);
  useEffect(() => {
    if (isSessionPending) return;
    // Skip if session reference didn't meaningfully change
    if (prevSessionRef.current === session) return;
    prevSessionRef.current = session;
    fetchUserData();
  }, [session, isSessionPending, fetchUserData]);

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
