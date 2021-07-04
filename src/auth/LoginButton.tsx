import { Button } from "@chakra-ui/react";

export function LoginButton() {
  // TODO: Ensure this is available
  const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID!;

  // TODO: Add state param
  return (
    <Button
      as="a"
      href={`https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        `${window.location.origin}/auth/callback`
      )}&scope=repo`}
    >
      Login
    </Button>
  );
}
