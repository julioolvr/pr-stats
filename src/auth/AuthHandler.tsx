import { useContext, useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import { StringParam, useQueryParam } from "use-query-params";
import axios from "axios";

import { AuthContext } from "./AuthProvider";

export function AuthHandler() {
  const { token, setToken } = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const [code] = useQueryParam("code", StringParam);

  // TODO: Use react-query
  useEffect(() => {
    const cancelToken = axios.CancelToken.source();

    // TODO: Type the response
    // TODO: Check `state` to prevent CSRF
    axios
      .get("/.netlify/functions/get-github-token", {
        params: { code },
        cancelToken: cancelToken.token,
      })
      .then((response) => {
        setToken(response.data.token);
      })
      .catch((error) => setError(error.message));

    return () => cancelToken.cancel();
  }, [setToken, code]);

  if (token) {
    return <Redirect to="/" />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Logging in...</div>;
}
