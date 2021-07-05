import { RouteComponentProps } from "react-router-dom";
import { useQuery } from "react-query";
import { BarChart, Bar, LabelList } from "recharts";
import {
  Spinner,
  Heading,
  Text,
  Container,
  Stack,
  SimpleGrid,
  Box,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

import useGithubToken from "auth/useGithubToken";
import getTimeToMerge from "modules/timeToMerge";

const COUNT = 10;
const NUMBER_FORMAT = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

export default function PrListTest({
  match,
}: RouteComponentProps<{ owner: string; repository: string }>) {
  const token = useGithubToken();
  const { owner, repository } = match.params;

  const query = useQuery(
    ["prs", owner, repository, COUNT, token],
    async () =>
      await getTimeToMerge({
        owner: owner,
        repo: repository,
        count: COUNT,
        token: token!,
      }),
    { enabled: !!token }
  );

  if (!query.data || query.isLoading) {
    return <Spinner />;
  }

  return (
    <Container>
      <Stack>
        <Heading>
          <Text fontSize="xl" color="gray.600">
            {owner}
          </Text>
          {repository}
        </Heading>

        <SimpleGrid columns={2} spacing={4}>
          {/*
            TODO: This is actually the number of PRs fetched and used for the
            calculation, make that more clear.
          */}
          <StatBox title="Number of PRs" number={query.data.prs.length} />
          <StatBox
            title="Total number of hours until merge"
            number={query.data.prs
              .map((pr) => pr.hoursUntilMerge)
              .reduce((a, b) => a + b, 0)}
          />
          <StatBox
            title="Average hours until merge per PR"
            number={query.data.stats.average}
          />
          <StatBox title="p50" number={query.data.stats.p50} />
          <StatBox title="p75" number={query.data.stats.p75} />
          <StatBox title="p90" number={query.data.stats.p90} />
          <StatBox title="p99" number={query.data.stats.p99} />
        </SimpleGrid>

        <BarChart data={query.data.prs} width={730} height={250}>
          <Bar dataKey="hoursUntilMerge" fill="#8884d8">
            <LabelList dataKey="title" position="insideTop" angle={45} />
          </Bar>
        </BarChart>
      </Stack>
    </Container>
  );
}

function StatBox({ title, number }: { title: string; number: number }) {
  return (
    <Box py={2} px={3} borderWidth={1} borderColor="gray.200" borderRadius="md">
      <Stat>
        <StatLabel color="gray.500">{title}</StatLabel>
        <StatNumber>{NUMBER_FORMAT.format(number)}</StatNumber>
      </Stat>
    </Box>
  );
}
