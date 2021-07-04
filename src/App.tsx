import { BrowserRouter as Router, Route } from "react-router-dom";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { QueryParamProvider } from "use-query-params";
import { BarChart, Bar, YAxis, LabelList } from "recharts";

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

  const query = useQuery(
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

  if (!query.data || query.isLoading) {
    return <div>Loading...</div>;
  }

  console.log(query.data);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Number of PRs</th>
            <th>Total number of hours to merge</th>
            <th>Average</th>
            <th>P50</th>
            <th>P75</th>
            <th>P90</th>
            <th>P99</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>{query.data.prs.length}</td>
            <td>
              {query.data.prs
                .map((pr) => pr.hoursUntilMerge)
                .reduce((a, b) => a + b, 0)}
            </td>
            <td>{query.data.stats.average}</td>
            <td>{query.data.stats.p50}</td>
            <td>{query.data.stats.p75}</td>
            <td>{query.data.stats.p90}</td>
            <td>{query.data.stats.p99}</td>
          </tr>
        </tbody>
      </table>

      <BarChart data={query.data.prs} width={730} height={250}>
        <Bar dataKey="hoursUntilMerge" fill="#8884d8">
          <LabelList dataKey="title" position="insideTop" angle={45} />
        </Bar>
      </BarChart>
    </div>
  );
}
