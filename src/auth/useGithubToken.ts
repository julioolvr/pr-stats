import { useContext } from "react";

import { AuthContext } from "./AuthProvider";

export function useGithubToken(): string | null {
  const { token } = useContext(AuthContext);
  return token;
}
