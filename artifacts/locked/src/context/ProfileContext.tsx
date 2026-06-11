import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type Profile = { id: string; handle: string; sport: string; level: string };

type ProfileContextValue = {
  profile: Profile | null | undefined;
  setProfile: (p: Profile | null) => void;
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: undefined,
  setProfile: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    setProfile(undefined);
    supabase
      .from("profiles")
      .select("id, handle, sport, level")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data ?? null));
  }, [user?.id]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
