import { Route, Switch } from "react-router-dom";

import Config from "config/Config";
import PrivateRoute from "auth/PrivateRoute";

import { AuthHandler } from "auth/AuthHandler";
import Login from "pages/Login";
import PrStats from "pages/PrStats";

function App() {
  return (
    <Config>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/auth/callback" component={AuthHandler} />
        <PrivateRoute path="/:owner/:repository" component={PrStats} />
      </Switch>
    </Config>
  );
}

export default App;
