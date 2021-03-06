import { useContext } from "react";

import { AuthContext } from "./AuthProvider";

export default function useGithubToken(): string | null {
  const { token } = useContext(AuthContext);
  return token;
}
