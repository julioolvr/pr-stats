import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Octokit } from "octokit";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";

import AuthProvider from "./auth/AuthProvider";
import LoginButton from "./auth/LoginButton";
import getTimeToMerge from "./modules/timeToMerge";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <div>hi</div>
          <PrListTest />
          <LoginButton />
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

const OWNER = "julioolvr";
const REPO = "slack-estimation";
const COUNT = 10;

function PrListTest() {
  const query = useQuery(["prs", OWNER, REPO, COUNT], () =>
    getTimeToMerge({ owner: OWNER, repo: REPO, count: COUNT })
  );

  return <div>Data!</div>;
}
