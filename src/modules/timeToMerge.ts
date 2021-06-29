import { Octokit } from "octokit";
import * as dateFns from "date-fns";

export default async function getTimeToMerge({
  owner,
  repo,
  count,
  token,
}: Options) {
  return await listPrs({ owner, repo, count, token });
}

type Options = {
  owner: string;
  repo: string;
  count: number;
  token: string;
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
        pullRequests(last: $count, states: CLOSED) {
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
