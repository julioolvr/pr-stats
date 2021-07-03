import { Octokit } from "octokit";
import * as dateFns from "date-fns";

export default async function getTimeToMerge({
  owner,
  repo,
  count,
  token,
}: Options): Promise<Result> {
  const prs = await listPrs({ owner, repo, count, token });

  if (prs.length === 0) {
    return {
      stats: {
        average: 0,
        p50: 0,
        p75: 0,
        p90: 0,
        p99: 0,
      },
      prs: [],
    };
  }

  const prsMetrics = prs.map((pr) => {
    // TODO: Don't count weekends
    // TODO: Maybe even make working days configurable somehow to account for
    // holidays
    const hoursUntilMerge = dateFns.differenceInHours(
      pr.mergedAt,
      pr.reviewRequestedDate
    );

    return {
      number: pr.number,
      title: pr.title,
      hoursUntilMerge,
    };
  });

  prsMetrics.sort((a, b) => a.hoursUntilMerge - b.hoursUntilMerge);
  const hours = prsMetrics.map((pr) => pr.hoursUntilMerge);

  const average = hours.reduce((a, b) => a + b, 0) / prsMetrics.length;
  const p50 = percentile(hours, 50);
  const p75 = percentile(hours, 75);
  const p90 = percentile(hours, 90);
  const p99 = percentile(hours, 99);

  return {
    prs: prsMetrics,
    stats: { average, p50, p75, p90, p99 },
  };
}

type Options = {
  owner: string;
  repo: string;
  count: number;
  token: string;
};

type Result = {
  stats: {
    average: number;
    p50: number;
    p75: number;
    p90: number;
    p99: number;
  };
  prs: {
    number: number;
    title: string;
    hoursUntilMerge: number;
  }[];
};

async function listPrs({ owner, repo, count, token }: ListPrsOptions) {
  const githubClient = new Octokit();

  // TODO: Think about how it should work when a PR goes back and forth
  // multiple times between draft and not draft.
  // TODO: Can I assume ConvertToDraft and ReadyForReview will always
  // come in pairs?
  const response = await githubClient.graphql<{
    repository: {
      pullRequests: {
        edges: [{ node: PullRequestResponse }];
      };
    };
  }>(
    `
    query GetPullRequests($owner: String!, $repo: String!, $count: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequests(last: $count, states: MERGED) {
          edges {
            node {
              number
              title
              createdAt
              mergedAt
              timelineItems(last: 1, itemTypes: [READY_FOR_REVIEW_EVENT]) {
                edges {
                  node {
                    ... on ReadyForReviewEvent {
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
    {
      count,
      owner,
      repo,
      headers: {
        authorization: `bearer ${token}`,
      },
    }
  );

  return response.repository.pullRequests.edges.map((edge) =>
    parsePrResponse(edge.node)
  );
}

type ListPrsOptions = {
  owner: string;
  repo: string;
  count: number;
  token: string;
};

type PullRequestResponse = {
  number: number;
  title: string;
  createdAt: string;
  mergedAt: string;
  timelineItems: [
    {
      edges: [
        {
          node: {
            createdAt: string;
          };
        }
      ];
    }
  ];
};

type PullRequest = {
  number: number;
  title: string;
  createdAt: Date;
  mergedAt: Date;
  reviewRequestedDate: Date;
};

function parsePrResponse(pr: PullRequestResponse): PullRequest {
  // The assumption here is that if a PR either never had a `ReadyForReview`
  // event then it wasn't created as a draft. Then we care about the PR's
  // createdAt date.
  // If the PR _has_ a ReadyForReview event, the GraphQL query will return the
  // last one, and for now that's the one we care about to know how long it took
  // since _then_ until merge.
  const reviewRequestedDate = dateFns.parseISO(
    pr.timelineItems[0]?.edges[0]?.node?.createdAt ?? pr.createdAt
  );

  return {
    number: pr.number,
    title: pr.title,
    createdAt: dateFns.parseISO(pr.createdAt),
    mergedAt: dateFns.parseISO(pr.mergedAt),
    reviewRequestedDate,
  };
}

function percentile(data: number[], percentile: number) {
  const index = (data.length * percentile) / 100;

  if (Number.isInteger(index)) {
    return (data[index - 1] + data[index]) / 2;
  } else {
    return data[Math.ceil(index) - 1];
  }
}
