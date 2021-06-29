import React, { useState, createContext } from "react";

type AuthContextType = {
  token: string | null;
  setToken: (token: string) => void;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export default function AuthProvider({ children }: Props) {
  const [token, setToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

type Props = {
  children: React.ReactNode;
};
