import { Octokit } from "octokit";

export default async function searchRepositories({
  term,
  token,
  count,
}: SearchRepositoriesOptions): Promise<Result> {
  const githubClient = new Octokit();

  console.log("searching repositories...", term, count, token);

  const response = await githubClient.graphql<{
    search: {
      edges: [{ node: RepositoryResponse }];
    };
  }>(
    `
    query SearchRepositories($term: String!, $count: Int!) {
      search(type: REPOSITORY, query: $term, first: $count) {
        edges {
          node {
            __typename

            ... on Repository {
              nameWithOwner
              name
              owner {
                login
              }
            }
          }
        }
      }
    }
  `,
    {
      count,
      term,
      headers: {
        authorization: `bearer ${token}`,
      },
    }
  );

  console.log({ response });

  return {
    matches: response.search.edges.map((edge) =>
      parseRepositoryResponse(edge.node)
    ),
  };
}

type SearchRepositoriesOptions = {
  term: string;
  token: string;
  count: number;
};

type Result = {
  matches: Repository[];
};

type Repository = {
  nameWithOwner: string;
  name: string;
  owner: string;
};

type RepositoryResponse = {
  nameWithOwner: string;
  name: string;
  owner: {
    login: string;
  };
};

function parseRepositoryResponse(
  repositoryResponse: RepositoryResponse
): Repository {
  return {
    nameWithOwner: repositoryResponse.nameWithOwner,
    name: repositoryResponse.name,
    owner: repositoryResponse.owner.login,
  };
}
