import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type Profile = {
  id: string;
  handle: string;
  sport: string;
  level: string;
};

type ProfileContextValue = {
  profile: Profile | null | undefined;
  setProfile: (p: Profile | null) => void;
  refreshProfile: () => void;
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: undefined,
  setProfile: () => {},
  refreshProfile: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  const fetchProfile = () => {
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
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
