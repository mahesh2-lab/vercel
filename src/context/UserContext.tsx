import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { hydrateToken, getToken, clearToken } from "../lib/token-storage";

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
  logout: () => Promise<void>;
  token: string | null;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  teams: [],
  activeScope: null,
  setActiveScope: () => {},
  loading: true,
  error: null,
  refreshUser: async () => {},
  logout: async () => {},
  token: null,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<VercelUser | null>(null);
  const [teams, setTeams] = useState<VercelTeam[]>([]);
  const [activeScope, setActiveScope] = useState<ActiveScope | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const fetchUserData = useCallback(async (currentToken: string | null) => {
    if (!currentToken) {
      setUser(null);
      setTeams([]);
      setError("Please enter a Vercel token to continue.");
      setLoading(false);
      return;
    }

    try {
      const authHeader = { Authorization: `Bearer ${currentToken}` };
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
        setError(null);
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
      } else {
        setError("Invalid token or unauthorized.");
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
      setError("Failed to fetch user data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getToken(); // read live value, not stale React state

    setTokenState(currentToken);
    setLoading(true);
    await fetchUserData(currentToken);
  }, [fetchUserData]);

  const logout = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
    setTeams([]);
    setActiveScope(null);
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedToken = await hydrateToken();
      setTokenState(storedToken);
      await fetchUserData(storedToken);
    };
    init();
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
        refreshUser,
        logout,
        token,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}

