export function LoginButton() {
  // TODO: Ensure this is available
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID!;

  // TODO: Add state param
  return (
    <a
      href={`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        "http://localhost:8888/auth/callback"
      )}&scope=repo`}
    >
      Login
    </a>
  );
}
