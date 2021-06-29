import { BrowserRouter as Router, Route } from "react-router-dom";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { QueryParamProvider } from "use-query-params";

import AuthProvider from "./auth/AuthProvider";
import { LoginButton } from "./auth/LoginButton";
import { AuthHandler } from "./auth/AuthHandler";
import { useGithubToken } from "./auth/useGithubToken";
import getTimeToMerge from "./modules/timeToMerge";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryParamProvider ReactRouterRoute={Route}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <PrListTest />
            <LoginButton />

            <Route path="/auth/callback" component={AuthHandler} />
          </QueryClientProvider>
        </AuthProvider>
      </QueryParamProvider>
    </Router>
  );
}

export default App;

const OWNER = "julioolvr";
const REPO = "slack-estimation";
const COUNT = 10;

function PrListTest() {
  const token = useGithubToken();

  const query = useQuery<any, Error>(
    ["prs", OWNER, REPO, COUNT, token],
    async () =>
      await getTimeToMerge({
        owner: OWNER,
        repo: REPO,
        count: COUNT,
        token: token!,
      }),
    { enabled: !!token }
  );

  return <div>Data! {query.data && JSON.stringify(query.data, null, 2)}</div>;
}
