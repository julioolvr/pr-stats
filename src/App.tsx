import { Route, Switch } from "react-router-dom";

import Config from "config/Config";
import PrivateRoute from "auth/PrivateRoute";

import { AuthHandler } from "auth/AuthHandler";
import Login from "pages/Login";
import PrStats from "pages/PrStats";
import Header from "ui/Header";

function App() {
  return (
    <Config>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/auth/callback" component={AuthHandler} />

        <PrivateRoute>
          <Header />

          <Switch>
            <PrivateRoute path="/:owner/:repository" component={PrStats} />
          </Switch>
        </PrivateRoute>
      </Switch>
    </Config>
  );
}

export default App;
