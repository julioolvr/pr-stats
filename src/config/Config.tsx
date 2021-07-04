import { BrowserRouter as Router, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { QueryParamProvider } from "use-query-params";
import { ChakraProvider } from "@chakra-ui/react";

import AuthProvider from "../auth/AuthProvider";

const queryClient = new QueryClient();

export default function Config({ children }: Props) {
  return (
    <Router>
      <QueryParamProvider ReactRouterRoute={Route}>
        <ChakraProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </AuthProvider>
        </ChakraProvider>
      </QueryParamProvider>
    </Router>
  );
}

type Props = {
  children: React.ReactNode;
};
