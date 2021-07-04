import { Box } from "@chakra-ui/react";
import AsyncSelect from "react-select/async";
import { useHistory } from "react-router-dom";

import useGithubToken from "auth/useGithubToken";
import searchRepositories from "modules/searchRepositories";

const COUNT = 10;

export default function Header() {
  // TODO: Create a strict version of this hook that redirects to login if the
  // token isn't present (or some other kind of handling, maybe just throwing
  // an error).
  const token = useGithubToken()!;
  const history = useHistory();

  async function loadOptions(inputValue: string) {
    const results = await searchRepositories({
      term: inputValue,
      token,
      count: COUNT,
    });

    return results.matches.map((result) => ({
      label: result.nameWithOwner,
      value: result,
    }));
  }

  return (
    <Box as="header">
      <AsyncSelect
        loadOptions={loadOptions}
        onChange={(value) =>
          value && history.push(`/${value.value.owner}/${value.value.name}`)
        }
      />
    </Box>
  );
}
