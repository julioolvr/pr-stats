import { Route, RouteProps, Redirect } from "react-router-dom";

import useIsUserLoggedIn from "./useIsUserLoggedIn";

export default function PrivateRoute(props: RouteProps) {
  const token = useIsUserLoggedIn();

  if (token) {
    return <Route {...props} />;
  } else {
    return <Redirect to="/login" />;
  }
}
