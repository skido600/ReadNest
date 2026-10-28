"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name?: string;
  email: string;
  role: "user" | "admin";
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  //  ONLY read from localStorage here
  useEffect(() => {
    const stored = localStorage.getItem("data");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
