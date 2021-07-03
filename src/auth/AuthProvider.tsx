import React, { useState, createContext } from "react";
import createPersistedState from "use-persisted-state";

// Localstorage is not the best place to store a token because it could be
// picked up by XSS attacks. So:
// TODO: Put the token on an HttpOnly cookie, and create a Netlify function that
// acts as a proxy to Github's API.
const useTokenState = createPersistedState("AUTH_TOKEN");

type AuthContextType = {
  token: string | null;
  setToken: (token: string) => void;
};

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export default function AuthProvider({ children }: Props) {
  const [token, setToken] = useTokenState<string | null>(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

type Props = {
  children: React.ReactNode;
};
