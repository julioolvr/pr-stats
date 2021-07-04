import { RouteComponentProps } from "react-router-dom";
import { useQuery } from "react-query";
import { BarChart, Bar, LabelList } from "recharts";
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

import useGithubToken from "../auth/useGithubToken";
import getTimeToMerge from "../modules/timeToMerge";

const COUNT = 10;

export default function PrListTest({
  match,
}: RouteComponentProps<{ owner: string; repository: string }>) {
  const token = useGithubToken();

  const query = useQuery(
    ["prs", match.params.owner, match.params.repository, COUNT, token],
    async () =>
      await getTimeToMerge({
        owner: match.params.owner,
        repo: match.params.repository,
        count: COUNT,
        token: token!,
      }),
    { enabled: !!token }
  );

  if (!query.data || query.isLoading) {
    return <Spinner />;
  }

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
