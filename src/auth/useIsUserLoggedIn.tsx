import useGithubToken from "./useGithubToken";

export default function useIsUserLoggedIn(): boolean {
  return useGithubToken() !== null;
}
