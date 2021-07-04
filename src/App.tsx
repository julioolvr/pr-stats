import { BrowserRouter as Router, Route } from "react-router-dom";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { QueryParamProvider } from "use-query-params";
import { BarChart, Bar, LabelList } from "recharts";
import { ChakraProvider } from "@chakra-ui/react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
} from "@chakra-ui/react";

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
        <ChakraProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <PrListTest />
              <LoginButton />

              <Route path="/auth/callback" component={AuthHandler} />
            </QueryClientProvider>
          </AuthProvider>
        </ChakraProvider>
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
    return <Spinner />;
  }

  console.log(query.data);

  return (
    <Box>
      <Table>
        <Thead>
          <Tr>
            <Th>Number of PRs</Th>
            <Th>Total number of hours to merge</Th>
            <Th>Average</Th>
            <Th>P50</Th>
            <Th>P75</Th>
            <Th>P90</Th>
            <Th>P99</Th>
          </Tr>
        </Thead>

        <Tbody>
          <Tr>
            <Td>{query.data.prs.length}</Td>
            <Td>
              {query.data.prs
                .map((pr) => pr.hoursUntilMerge)
                .reduce((a, b) => a + b, 0)}
            </Td>
            <Td>{query.data.stats.average}</Td>
            <Td>{query.data.stats.p50}</Td>
            <Td>{query.data.stats.p75}</Td>
            <Td>{query.data.stats.p90}</Td>
            <Td>{query.data.stats.p99}</Td>
          </Tr>
        </Tbody>
      </Table>

      <BarChart data={query.data.prs} width={730} height={250}>
        <Bar dataKey="hoursUntilMerge" fill="#8884d8">
          <LabelList dataKey="title" position="insideTop" angle={45} />
        </Bar>
      </BarChart>
    </Box>
  );
}
